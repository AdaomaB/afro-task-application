import { db } from '../config/firebase.js';
import '../config/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import { createNotification } from './notificationController.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId, proposalMessage, proposedBudget, portfolioLink } = req.body;
    const freelancerId = req.user.userId;

    console.log('Apply for job request:', { jobId, freelancerId, role: req.user.role });
    console.log('Has CV file:', !!req.file);

    if (req.user.role !== 'freelancer') {
      console.log('Rejected: Not a freelancer');
      return res.status(403).json({ message: 'Only freelancers can apply for jobs' });
    }

    // Validate required fields
    if (!proposalMessage || !proposedBudget) {
      console.log('Rejected: Missing required fields');
      return res.status(400).json({ message: 'Proposal message and budget are required' });
    }

    // Check if CV file was uploaded
    if (!req.file) {
      console.log('Rejected: No CV file uploaded');
      return res.status(400).json({ message: 'CV upload is required' });
    }

    // Check if already applied
    const existingApp = await db.collection('applications')
      .where('jobId', '==', jobId)
      .where('freelancerId', '==', freelancerId)
      .get();

    if (!existingApp.empty) {
      console.log('Rejected: Already applied');
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Get job details to get clientId
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      console.log('Rejected: Job not found');
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobData = jobDoc.data();

    // Upload CV to Cloudinary
    const file = req.file;
    console.log('Uploading CV to Cloudinary...');
    
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `cvs/${freelancerId}`,
          resource_type: 'raw',
          public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const cvUrl = uploadResult.secure_url;
    console.log('CV uploaded successfully to Cloudinary');

    const applicationData = {
      jobId,
      freelancerId,
      clientId: jobData.clientId,
      proposalMessage,
      proposedBudget,
      cvUrl,
      cvFileName: file.originalname,
      portfolioLink: portfolioLink || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const appRef = await db.collection('applications').add(applicationData);

    // Increment applicants count
    await db.collection('jobs').doc(jobId).update({
      applicantsCount: (jobData.applicantsCount || 0) + 1
    });

    // Create notification for job poster
    await createNotification(jobData.clientId, freelancerId, 'application', { jobId });

    console.log('Application created successfully:', appRef.id);
    res.status(201).json({
      success: true,
      application: { id: appRef.id, ...applicationData }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Failed to apply for job' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const freelancerId = req.user.userId;

    const appsSnapshot = await db.collection('applications')
      .where('freelancerId', '==', freelancerId)
      .get();

    const applications = await Promise.all(appsSnapshot.docs.map(async (doc) => {
      const appData = { id: doc.id, ...doc.data() };
      
      const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
      appData.job = jobDoc.exists ? { id: jobDoc.id, ...jobDoc.data() } : null;

      return appData;
    }));

    // Sort by createdAt in memory
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to client
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists || jobDoc.data().clientId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const appsSnapshot = await db.collection('applications')
      .where('jobId', '==', jobId)
      .get();

    const applications = await Promise.all(appsSnapshot.docs.map(async (doc) => {
      const appData = { id: doc.id, ...doc.data() };
      
      const freelancerDoc = await db.collection('users').doc(appData.freelancerId).get();
      appData.freelancer = freelancerDoc.exists ? {
        uid: appData.freelancerId,
        fullName: freelancerDoc.data().fullName,
        profileImage: freelancerDoc.data().profileImage,
        skillCategory: freelancerDoc.data().skillCategory,
        country: freelancerDoc.data().country
      } : null;

      return appData;
    }));

    // Sort by createdAt in memory
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

export const startChat = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const appDoc = await db.collection('applications').doc(applicationId).get();
    if (!appDoc.exists) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const appData = appDoc.data();
    const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
    
    if (!jobDoc.exists || jobDoc.data().clientId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update application status to chatting
    await db.collection('applications').doc(applicationId).update({ 
      status: 'chatting',
      chattingStartedAt: new Date().toISOString()
    });

    // Create pre-project chat
    const chatData = {
      jobId: appData.jobId,
      applicationId,
      clientId: req.user.userId,
      freelancerId: appData.freelancerId,
      active: true,
      createdAt: new Date().toISOString()
    };

    const chatRef = await db.collection('preProjectChats').add(chatData);

    res.json({ 
      success: true, 
      chatId: chatRef.id,
      message: 'Chat started successfully' 
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ message: 'Failed to start chat' });
  }
};

export const acceptApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const appDoc = await db.collection('applications').doc(applicationId).get();
    if (!appDoc.exists) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const appData = appDoc.data();
    const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
    
    if (!jobDoc.exists || jobDoc.data().clientId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Application must be in chatting status before acceptance
    if (appData.status !== 'chatting') {
      return res.status(400).json({ message: 'Must start chat before accepting application' });
    }

    // Update application status to accepted
    await db.collection('applications').doc(applicationId).update({ 
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    });

    // Create project
    const jobData = jobDoc.data();
    const projectData = {
      jobId: appData.jobId,
      applicationId,
      freelancerId: appData.freelancerId,
      clientId: req.user.userId,
      budget: appData.proposedBudget,
      deadline: jobData.deadline || null,
      status: 'ongoing',
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    const projectRef = await db.collection('projects').add(projectData);

    // Update job status
    await db.collection('jobs').doc(appData.jobId).update({
      status: 'ongoing',
      assignedFreelancerId: appData.freelancerId
    });

    // Move pre-project chat to project chat
    const preChatsSnapshot = await db.collection('preProjectChats')
      .where('applicationId', '==', applicationId)
      .get();

    if (!preChatsSnapshot.empty) {
      const preChatDoc = preChatsSnapshot.docs[0];
      const preChatData = preChatDoc.data();

      // Create project chat with same data
      await db.collection('projectChats').add({
        ...preChatData,
        projectId: projectRef.id,
        active: true,
        migratedFrom: preChatDoc.id,
        migratedAt: new Date().toISOString()
      });

      // Copy all messages from pre-project chat to project chat
      const messagesSnapshot = await db.collection('preProjectChats')
        .doc(preChatDoc.id)
        .collection('messages')
        .get();

      const projectChatRef = await db.collection('projectChats')
        .where('projectId', '==', projectRef.id)
        .get();

      if (!projectChatRef.empty) {
        const projectChatId = projectChatRef.docs[0].id;
        
        for (const msgDoc of messagesSnapshot.docs) {
          await db.collection('projectChats')
            .doc(projectChatId)
            .collection('messages')
            .add(msgDoc.data());
        }
      }

      // Deactivate pre-project chat
      await db.collection('preProjectChats').doc(preChatDoc.id).update({ 
        active: false,
        closedAt: new Date().toISOString()
      });
    }

    // Reject all other applications for this job
    const otherAppsSnapshot = await db.collection('applications')
      .where('jobId', '==', appData.jobId)
      .where('status', 'in', ['pending', 'chatting'])
      .get();

    for (const doc of otherAppsSnapshot.docs) {
      if (doc.id !== applicationId) {
        await db.collection('applications').doc(doc.id).update({ 
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: 'Another candidate was selected'
        });
      }
    }

    res.json({ 
      success: true, 
      projectId: projectRef.id,
      message: 'Application accepted and project created' 
    });
  } catch (error) {
    console.error('Accept application error:', error);
    res.status(500).json({ message: 'Failed to accept application' });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const appDoc = await db.collection('applications').doc(applicationId).get();
    if (!appDoc.exists) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const appData = appDoc.data();
    const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
    
    if (!jobDoc.exists || jobDoc.data().clientId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.collection('applications').doc(applicationId).update({ 
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'Not selected'
    });

    // If there was a pre-project chat, deactivate it
    const preChatsSnapshot = await db.collection('preProjectChats')
      .where('applicationId', '==', applicationId)
      .get();

    if (!preChatsSnapshot.empty) {
      await db.collection('preProjectChats').doc(preChatsSnapshot.docs[0].id).update({ 
        active: false,
        closedAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Failed to reject application' });
  }
};
