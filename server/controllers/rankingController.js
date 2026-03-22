import { db } from '../config/firebase.js';

// Calculate freelancer ranking score
export const calculateRankingScore = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'freelancer') {
      return 0;
    }

    const userData = userDoc.data();

    // 1. Completed Projects (30%)
    const completedProjectsSnapshot = await db.collection('projects')
      .where('freelancerId', '==', userId)
      .where('status', '==', 'completed')
      .get();
    const completedProjects = completedProjectsSnapshot.size;

    // 2. Average Rating (30%)
    const reviewsSnapshot = await db.collection('reviews')
      .where('freelancerId', '==', userId)
      .get();
    
    let averageRating = 0;
    if (reviewsSnapshot.size > 0) {
      const totalRating = reviewsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
      averageRating = totalRating / reviewsSnapshot.size;
    }

    // 3. Profile Completion (10%)
    const requiredFields = ['fullName', 'email', 'professionalTitle', 'bio', 'skills', 'country', 'hourlyRate'];
    const completedFields = requiredFields.filter(field => userData[field] && 
      (Array.isArray(userData[field]) ? userData[field].length > 0 : userData[field].toString().trim() !== '')
    ).length;
    const profileCompletion = (completedFields / requiredFields.length) * 100;

    // 4. Response Rate (10%) - placeholder for now
    const responseRate = userData.responseRate || 80; // Default 80%

    // 5. Post Engagement (10%)
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();
    
    let postEngagement = 0;
    postsSnapshot.docs.forEach(doc => {
      const postData = doc.data();
      postEngagement += (postData.views || 0) + (postData.likes?.length || 0);
    });

    // 6. Followers (10%)
    const followersSnapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();
    const followers = followersSnapshot.size;

    // Calculate ranking score
    const rankingScore = 
      (completedProjects * 3) + 
      (averageRating * 20) + 
      (profileCompletion * 0.5) + 
      (responseRate * 0.5) + 
      (postEngagement * 0.05) + 
      (followers * 0.3);

    // Update user document
    await db.collection('users').doc(userId).update({
      rankingScore: Math.round(rankingScore * 100) / 100,
      lastRankingUpdate: new Date().toISOString()
    });

    return rankingScore;
  } catch (error) {
    console.error('Calculate ranking error:', error);
    return 0;
  }
};

// Update ranking for a freelancer
export const updateFreelancerRanking = async (req, res) => {
  try {
    const { userId } = req.params;
    const score = await calculateRankingScore(userId);
    
    res.json({ success: true, rankingScore: score });
  } catch (error) {
    console.error('Update ranking error:', error);
    res.status(500).json({ message: 'Failed to update ranking' });
  }
};

// Get top freelancers
export const getTopFreelancers = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;

    let query = db.collection('users')
      .where('role', '==', 'freelancer');

    // Filter by category if provided
    if (category) {
      query = query.where('skills', 'array-contains', category);
    }

    const freelancersSnapshot = await query.get();

    // Get all freelancers and sort by ranking score
    const freelancers = freelancersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0))
      .slice(0, parseInt(limit));

    // Enrich with additional data
    const enrichedFreelancers = await Promise.all(freelancers.map(async (freelancer) => {
      // Get completed projects count
      const projectsSnapshot = await db.collection('projects')
        .where('freelancerId', '==', freelancer.id)
        .where('status', '==', 'completed')
        .get();

      // Get average rating
      const reviewsSnapshot = await db.collection('reviews')
        .where('freelancerId', '==', freelancer.id)
        .get();
      
      let averageRating = 0;
      if (reviewsSnapshot.size > 0) {
        const totalRating = reviewsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
        averageRating = totalRating / reviewsSnapshot.size;
      }

      return {
        ...freelancer,
        completedProjects: projectsSnapshot.size,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviewsSnapshot.size
      };
    }));

    res.json({ success: true, freelancers: enrichedFreelancers });
  } catch (error) {
    console.error('Get top freelancers error:', error);
    res.status(500).json({ message: 'Failed to fetch top freelancers' });
  }
};

// Get recommended freelancers for a job
export const getRecommendedFreelancers = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 20 } = req.query;

    // Get job details
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobData = jobDoc.data();
    const requiredSkills = jobData.requiredSkills || [];

    if (requiredSkills.length === 0) {
      return res.json({ success: true, freelancers: [] });
    }

    // Get freelancers with matching skills
    const freelancersSnapshot = await db.collection('users')
      .where('role', '==', 'freelancer')
      .get();

    // Filter and calculate match percentage
    const matchedFreelancers = freelancersSnapshot.docs
      .map(doc => {
        const freelancerData = doc.data();
        const freelancerSkills = freelancerData.skills || [];
        
        // Calculate match percentage
        const matchingSkills = requiredSkills.filter(skill => 
          freelancerSkills.some(fSkill => 
            fSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(fSkill.toLowerCase())
          )
        );
        
        const matchPercentage = requiredSkills.length > 0 
          ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
          : 0;

        return {
          id: doc.id,
          ...freelancerData,
          matchPercentage,
          matchingSkills
        };
      })
      .filter(f => f.matchPercentage > 0)
      .sort((a, b) => {
        // Sort by match percentage first, then by ranking score
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        return (b.rankingScore || 0) - (a.rankingScore || 0);
      })
      .slice(0, parseInt(limit));

    res.json({ success: true, freelancers: matchedFreelancers });
  } catch (error) {
    console.error('Get recommended freelancers error:', error);
    res.status(500).json({ message: 'Failed to fetch recommended freelancers' });
  }
};

// Get recommended jobs for a freelancer
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    // Get freelancer skills
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const freelancerSkills = userDoc.data().skills || [];

    if (freelancerSkills.length === 0) {
      return res.json({ success: true, jobs: [] });
    }

    // Get all open jobs
    const jobsSnapshot = await db.collection('jobs')
      .where('status', '==', 'open')
      .get();

    // Filter and calculate match percentage
    const matchedJobs = await Promise.all(jobsSnapshot.docs
      .map(async (doc) => {
        const jobData = doc.data();
        const requiredSkills = jobData.requiredSkills || [];
        
        // Calculate match percentage
        const matchingSkills = freelancerSkills.filter(skill => 
          requiredSkills.some(rSkill => 
            rSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(rSkill.toLowerCase())
          )
        );
        
        const matchPercentage = requiredSkills.length > 0 
          ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
          : 0;

        // Get client info
        const clientDoc = await db.collection('users').doc(jobData.clientId).get();
        const clientData = clientDoc.exists ? {
          fullName: clientDoc.data().fullName,
          companyName: clientDoc.data().companyName,
          profileImage: clientDoc.data().profileImage
        } : null;

        return {
          id: doc.id,
          ...jobData,
          client: clientData,
          matchPercentage,
          matchingSkills
        };
      })
    );

    // Filter jobs with match > 0 and sort
    const filteredJobs = matchedJobs
      .filter(j => j.matchPercentage > 0)
      .sort((a, b) => {
        // Sort by match percentage first, then by date
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, parseInt(limit));

    res.json({ success: true, jobs: filteredJobs });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch recommended jobs' });
  }
};

// Get freelancers by category
export const getFreelancersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 5 } = req.query;

    const freelancersSnapshot = await db.collection('users')
      .where('role', '==', 'freelancer')
      .where('skills', 'array-contains', category)
      .get();

    const freelancers = freelancersSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0))
      .slice(0, parseInt(limit));

    res.json({ success: true, freelancers, category });
  } catch (error) {
    console.error('Get freelancers by category error:', error);
    res.status(500).json({ message: 'Failed to fetch freelancers' });
  }
};
