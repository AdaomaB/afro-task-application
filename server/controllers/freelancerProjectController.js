import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// Create a new freelancer showcase project
export const createFreelancerProject = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      projectTitle,
      projectDescription,
      category,
      customCategory,
      projectLink,
      technologies,
      completionDate,
    } = req.body;

    if (!projectTitle || !projectDescription || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    // Get freelancer profile info
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = userDoc.data();

    // Get freelancer rating
    let freelancerRating = 0;
    let reviewCount = 0;
    try {
      const reviewsSnap = await db.collection('reviews').where('freelancerId', '==', userId).get();
      reviewCount = reviewsSnap.size;
      if (reviewCount > 0) {
        const total = reviewsSnap.docs.reduce((sum, d) => sum + (d.data().rating || 0), 0);
        freelancerRating = total / reviewCount;
      }
    } catch (_) {}

    // Upload project image if provided
    let projectImage = '';
    if (req.file) {
      projectImage = await uploadToCloudinary(req.file.buffer, 'afro-task/freelancer-projects', 'image');
    }

    const finalCategory = category === 'Others' && customCategory ? customCategory : category;

    const techArray = technologies
      ? technologies.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const projectData = {
      freelancerId: userId,
      freelancerName: userData.fullName || '',
      freelancerProfileImage: userData.profileImage || '',
      freelancerRating,
      reviewCount,
      freelancerBio: userData.bio || '',
      freelancerLocation: userData.country || '',
      freelancerSkills: userData.skills || [],
      projectTitle,
      projectDescription,
      category: finalCategory,
      projectImage,
      projectLink: projectLink || '',
      technologies: techArray,
      completionDate: completionDate || '',
      views: 0,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('freelancer_projects').add(projectData);

    res.status(201).json({
      success: true,
      project: { id: docRef.id, ...projectData },
    });
  } catch (error) {
    console.error('Create freelancer project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

// Get all freelancer showcase projects (public, for Explore page)
export const getFreelancerProjects = async (req, res) => {
  try {
    const { category, freelancerId, limit: limitParam = 50 } = req.query;

    let query = db.collection('freelancer_projects');

    if (freelancerId) {
      query = query.where('freelancerId', '==', freelancerId);
    }
    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }

    const snap = await query.limit(Number(limitParam)).get();
    const projects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt desc in memory
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get freelancer projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// Get a single freelancer project
export const getFreelancerProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const doc = await db.collection('freelancer_projects').doc(projectId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Increment views
    await doc.ref.update({ views: (doc.data().views || 0) + 1 });

    res.json({ success: true, project: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Get freelancer project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

// Update a freelancer showcase project
export const updateFreelancerProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const doc = await db.collection('freelancer_projects').doc(projectId).get();
    if (!doc.exists) return res.status(404).json({ message: 'Project not found' });
    if (doc.data().freelancerId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const {
      projectTitle,
      projectDescription,
      category,
      customCategory,
      projectLink,
      technologies,
      completionDate,
    } = req.body;

    const updateData = { updatedAt: new Date().toISOString() };
    if (projectTitle) updateData.projectTitle = projectTitle;
    if (projectDescription) updateData.projectDescription = projectDescription;
    if (category) {
      updateData.category = category === 'Others' && customCategory ? customCategory : category;
    }
    if (projectLink !== undefined) updateData.projectLink = projectLink;
    if (technologies !== undefined) {
      updateData.technologies = technologies.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (completionDate !== undefined) updateData.completionDate = completionDate;

    if (req.file) {
      updateData.projectImage = await uploadToCloudinary(
        req.file.buffer,
        'afro-task/freelancer-projects',
        'image'
      );
    }

    await doc.ref.update(updateData);
    res.json({ success: true, message: 'Project updated' });
  } catch (error) {
    console.error('Update freelancer project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

// Delete a freelancer showcase project
export const deleteFreelancerProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const doc = await db.collection('freelancer_projects').doc(projectId).get();
    if (!doc.exists) return res.status(404).json({ message: 'Project not found' });
    if (doc.data().freelancerId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await doc.ref.delete();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete freelancer project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};
