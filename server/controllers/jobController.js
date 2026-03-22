import { db } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

export const createJob = async (req, res) => {
  try {
    console.log('=== CREATE JOB REQUEST ===');
    console.log('Request body:', req.body);
    
    const { title, description, budgetRange, requiredSkills, projectType, workLocation, deadline } = req.body;
    const clientId = req.user.userId;

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post jobs' });
    }

    const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : JSON.parse(requiredSkills);

    const jobData = {
      clientId,
      title,
      description,
      budgetRange,
      requiredSkills: skillsArray,
      projectType,
      workLocation,
      deadline,
      applicantsCount: 0,
      views: 0,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    console.log('Job data to save:', jobData);

    const jobRef = await db.collection('jobs').add(jobData);
    
    console.log('Job created successfully with ID:', jobRef.id);

    // Send notifications to matching freelancers
    if (skillsArray && skillsArray.length > 0) {
      try {
        // Find freelancers with matching skills
        const freelancersSnapshot = await db.collection('users')
          .where('role', '==', 'freelancer')
          .get();

        const matchingFreelancers = [];
        freelancersSnapshot.forEach(doc => {
          const freelancerData = doc.data();
          const freelancerSkills = freelancerData.skills || [];
          
          // Check if freelancer has any matching skills
          const hasMatch = skillsArray.some(skill => 
            freelancerSkills.some(fSkill => 
              fSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(fSkill.toLowerCase())
            )
          );

          if (hasMatch) {
            matchingFreelancers.push(doc.id);
          }
        });

        // Send notifications to matching freelancers (limit to 50)
        const notificationPromises = matchingFreelancers.slice(0, 50).map(freelancerId =>
          createNotification(freelancerId, clientId, 'job_match', { 
            jobId: jobRef.id,
            jobTitle: title 
          })
        );

        await Promise.all(notificationPromises);
      } catch (notifError) {
        console.error('Failed to send job match notifications:', notifError);
        // Don't fail the job creation if notifications fail
      }
    }

    res.status(201).json({
      success: true,
      job: { id: jobRef.id, ...jobData }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status = 'open', page = 1, limit = 10 } = req.query;

    const jobsSnapshot = await db.collection('jobs')
      .where('status', '==', status)
      .get();

    const jobs = await Promise.all(jobsSnapshot.docs.map(async (doc) => {
      const jobData = { id: doc.id, ...doc.data() };
      
      const clientDoc = await db.collection('users').doc(jobData.clientId).get();
      jobData.client = clientDoc.exists ? {
        fullName: clientDoc.data().fullName,
        companyName: clientDoc.data().companyName,
        profileImage: clientDoc.data().profileImage
      } : null;

      return jobData;
    }));

    // Sort by createdAt in memory
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate in memory
    const startIndex = (page - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = jobs.slice(startIndex, endIndex);

    res.json({ success: true, jobs: paginatedJobs, page: parseInt(page) });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const clientId = req.user.userId;

    const jobsSnapshot = await db.collection('jobs')
      .where('clientId', '==', clientId)
      .get();

    const jobs = jobsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// Increment job view count with unique viewer tracking
export const incrementJobView = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobData = jobDoc.data();
    
    // Don't track if viewing own job
    if (jobData.clientId === userId) {
      return res.json({ success: true, views: jobData.views || 0 });
    }

    // Check if user already viewed this job
    const viewRef = db.collection('jobViews').doc(`${jobId}_${userId}`);
    const viewDoc = await viewRef.get();

    if (viewDoc.exists) {
      // User already viewed this job, don't increment
      return res.json({ success: true, views: jobData.views || 0, alreadyViewed: true });
    }

    // Record the view
    await viewRef.set({
      jobId,
      viewerId: userId,
      viewedAt: new Date().toISOString()
    });

    // Increment view count using transaction
    const result = await db.runTransaction(async (transaction) => {
      const freshJobDoc = await transaction.get(jobRef);
      
      if (!freshJobDoc.exists) {
        throw new Error('Job not found');
      }

      const currentViews = freshJobDoc.data().views || 0;
      const newViews = currentViews + 1;
      
      transaction.update(jobRef, {
        views: newViews
      });
      
      return newViews;
    });

    res.json({ success: true, views: result, newView: true });
  } catch (error) {
    console.error('Increment job view error:', error);
    res.status(500).json({ message: 'Failed to increment view' });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobDoc = await db.collection('jobs').doc(jobId).get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobData = { id: jobDoc.id, ...jobDoc.data() };
    
    // Get client info
    const clientDoc = await db.collection('users').doc(jobData.clientId).get();
    jobData.client = clientDoc.exists ? {
      fullName: clientDoc.data().fullName,
      companyName: clientDoc.data().companyName,
      profileImage: clientDoc.data().profileImage
    } : null;

    res.json({ success: true, job: jobData });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
};

// Get who viewed a job
export const getJobViewers = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    // Verify the user owns this job
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (jobDoc.data().clientId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get all viewers
    const viewsSnapshot = await db.collection('jobViews')
      .where('jobId', '==', jobId)
      .get();

    const viewers = await Promise.all(viewsSnapshot.docs.map(async (doc) => {
      const viewData = doc.data();
      const userDoc = await db.collection('users').doc(viewData.viewerId).get();
      
      return {
        userId: viewData.viewerId,
        viewedAt: viewData.viewedAt,
        user: userDoc.exists ? {
          fullName: userDoc.data().fullName,
          profileImage: userDoc.data().profileImage,
          role: userDoc.data().role
        } : null
      };
    }));

    res.json({ success: true, viewers, totalViews: viewers.length });
  } catch (error) {
    console.error('Get job viewers error:', error);
    res.status(500).json({ message: 'Failed to fetch viewers' });
  }
};

// Add comment to a job
export const addJobComment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const commentData = {
      jobId,
      userId,
      content: content.trim(),
      likes: [],
      createdAt: new Date().toISOString(),
      user: {
        fullName: userData.fullName,
        profileImage: userData.profileImage,
        role: userData.role
      }
    };

    const commentRef = await db.collection('jobs')
      .doc(jobId)
      .collection('comments')
      .add(commentData);

    // Update comment count using transaction
    const jobRef = db.collection('jobs').doc(jobId);
    await db.runTransaction(async (transaction) => {
      const jobDoc = await transaction.get(jobRef);
      if (jobDoc.exists) {
        const currentCount = jobDoc.data().commentsCount || 0;
        transaction.update(jobRef, { commentsCount: currentCount + 1 });
        
        // Create notification if commenting on someone else's job
        const jobClientId = jobDoc.data().clientId;
        if (jobClientId !== userId) {
          await createNotification(jobClientId, userId, 'comment', { jobId });
        }
      }
    });

    res.status(201).json({
      success: true,
      comment: { id: commentRef.id, ...commentData }
    });
  } catch (error) {
    console.error('Add job comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Get comments for a job
export const getJobComments = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const commentsSnapshot = await db.collection('jobs')
      .doc(jobId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Get job comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Like a job comment
export const likeJobComment = async (req, res) => {
  try {
    const { jobId, commentId } = req.params;
    const userId = req.user.userId;

    const commentRef = db.collection('jobs').doc(jobId).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likes = commentDoc.data().likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await commentRef.update({
        likes: likes.filter(id => id !== userId)
      });
    } else {
      await commentRef.update({
        likes: [...likes, userId]
      });
    }

    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error('Like job comment error:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
};
