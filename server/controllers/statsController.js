import { db } from '../config/firebase.js';

// Get freelancer dashboard stats
export const getFreelancerStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all user posts
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();

    // Calculate total views and likes from posts
    let totalViews = 0;
    let totalLikes = 0;
    const posts = postsSnapshot.docs.map(doc => doc.data());
    
    posts.forEach(post => {
      totalViews += post.views || 0;
      totalLikes += (post.likes || []).length;
    });

    // Get active jobs (applications with pending status)
    const activeApplicationsSnapshot = await db.collection('applications')
      .where('freelancerId', '==', userId)
      .where('status', '==', 'pending')
      .get();

    // Get completed jobs
    const completedProjectsSnapshot = await db.collection('projects')
      .where('freelancerId', '==', userId)
      .where('status', '==', 'completed')
      .get();

    // Get ongoing projects
    const ongoingProjectsSnapshot = await db.collection('projects')
      .where('freelancerId', '==', userId)
      .where('status', '==', 'in_progress')
      .get();

    // Get followers count
    const followersSnapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();

    // Get following count
    const followingSnapshot = await db.collection('follows')
      .where('followerId', '==', userId)
      .get();

    // Get profile views
    const profileViewsSnapshot = await db.collection('profileViews')
      .where('profileId', '==', userId)
      .get();

    // Calculate average rating
    const reviewsSnapshot = await db.collection('reviews')
      .where('freelancerId', '==', userId)
      .get();
    
    let averageRating = 0;
    if (reviewsSnapshot.size > 0) {
      const totalRating = reviewsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
      averageRating = (totalRating / reviewsSnapshot.size).toFixed(1);
    }

    res.json({
      success: true,
      stats: {
        totalPosts: postsSnapshot.size,
        totalViews,
        totalLikes,
        activeJobs: activeApplicationsSnapshot.size,
        completedJobs: completedProjectsSnapshot.size,
        ongoingProjects: ongoingProjectsSnapshot.size,
        followersCount: followersSnapshot.size,
        followingCount: followingSnapshot.size,
        profileViews: profileViewsSnapshot.size,
        averageRating: parseFloat(averageRating),
        totalReviews: reviewsSnapshot.size
      }
    });
  } catch (error) {
    console.error('Get freelancer stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// Get client dashboard stats
export const getClientStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all jobs posted by client
    const jobsSnapshot = await db.collection('jobs')
      .where('clientId', '==', userId)
      .get();

    // Calculate total views and applicants from jobs
    let totalJobViews = 0;
    let totalApplicants = 0;
    const jobs = jobsSnapshot.docs.map(doc => doc.data());
    
    jobs.forEach(job => {
      totalJobViews += job.views || 0;
      totalApplicants += job.applicantsCount || 0;
    });

    // Get active jobs
    const activeJobsSnapshot = await db.collection('jobs')
      .where('clientId', '==', userId)
      .where('status', '==', 'open')
      .get();

    // Get completed jobs
    const completedJobsSnapshot = await db.collection('jobs')
      .where('clientId', '==', userId)
      .where('status', '==', 'closed')
      .get();

    // Get ongoing projects
    const ongoingProjectsSnapshot = await db.collection('projects')
      .where('clientId', '==', userId)
      .where('status', '==', 'in_progress')
      .get();

    // Get completed projects
    const completedProjectsSnapshot = await db.collection('projects')
      .where('clientId', '==', userId)
      .where('status', '==', 'completed')
      .get();

    // Get all user posts
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();

    // Calculate total post views
    let totalPostViews = 0;
    const posts = postsSnapshot.docs.map(doc => doc.data());
    posts.forEach(post => {
      totalPostViews += post.views || 0;
    });

    // Get followers count
    const followersSnapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();

    // Get following count
    const followingSnapshot = await db.collection('follows')
      .where('followerId', '==', userId)
      .get();

    // Get profile views
    const profileViewsSnapshot = await db.collection('profileViews')
      .where('profileId', '==', userId)
      .get();

    res.json({
      success: true,
      stats: {
        totalJobsPosted: jobsSnapshot.size,
        activeJobs: activeJobsSnapshot.size,
        completedJobs: completedJobsSnapshot.size,
        totalApplicants,
        totalJobViews,
        ongoingProjects: ongoingProjectsSnapshot.size,
        completedProjects: completedProjectsSnapshot.size,
        totalPosts: postsSnapshot.size,
        totalPostViews,
        followersCount: followersSnapshot.size,
        followingCount: followingSnapshot.size,
        profileViews: profileViewsSnapshot.size
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// Get pending requests (applications for freelancers, or applications to client's jobs)
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let pendingRequests = [];

    if (userRole === 'freelancer') {
      // Get applications made by freelancer that are pending
      const applicationsSnapshot = await db.collection('applications')
        .where('freelancerId', '==', userId)
        .where('status', '==', 'pending')
        .get();

      pendingRequests = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
        const appData = { id: doc.id, ...doc.data() };
        
        // Get job details
        const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
        if (jobDoc.exists) {
          appData.job = { id: jobDoc.id, ...jobDoc.data() };
        }
        
        return appData;
      }));
    } else if (userRole === 'client') {
      // Get all jobs by client
      const jobsSnapshot = await db.collection('jobs')
        .where('clientId', '==', userId)
        .get();

      const jobIds = jobsSnapshot.docs.map(doc => doc.id);

      // Get all pending applications for these jobs
      if (jobIds.length > 0) {
        const applicationsPromises = jobIds.map(jobId =>
          db.collection('applications')
            .where('jobId', '==', jobId)
            .where('status', '==', 'pending')
            .get()
        );

        const applicationsSnapshots = await Promise.all(applicationsPromises);
        
        for (const snapshot of applicationsSnapshots) {
          const apps = await Promise.all(snapshot.docs.map(async (doc) => {
            const appData = { id: doc.id, ...doc.data() };
            
            // Get freelancer details
            const freelancerDoc = await db.collection('users').doc(appData.freelancerId).get();
            if (freelancerDoc.exists) {
              appData.freelancer = { id: freelancerDoc.id, ...freelancerDoc.data() };
            }
            
            // Get job details
            const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
            if (jobDoc.exists) {
              appData.job = { id: jobDoc.id, ...jobDoc.data() };
            }
            
            return appData;
          }));
          
          pendingRequests.push(...apps);
        }
      }
    }

    res.json({
      success: true,
      pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
};
