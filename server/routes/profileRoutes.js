import express from 'express';
import {
  getPublicProfile,
  getMyProfile,
  updateAbout,
  addService,
  deleteService,
  addPortfolioItem,
  deletePortfolioItem,
  getProfileViewStats,
  updateProfile,
  uploadImage
} from '../controllers/profileController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

// Public routes (with optional auth for view tracking)
router.get('/public/:userId', (req, res, next) => {
  // Try to authenticate but don't fail if not authenticated
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    protect(req, res, (err) => {
      if (!err) return getPublicProfile(req, res);
      // If auth fails, continue without user context
      req.user = null;
      return getPublicProfile(req, res);
    });
  } else {
    req.user = null;
    return getPublicProfile(req, res);
  }
});

// Protected routes
router.get('/my', protect, getMyProfile);
router.get('/view-stats', protect, getProfileViewStats);
router.put('/update', protect, upload.single('profileImage'), updateProfile);
router.put('/about', protect, updateAbout);
router.post('/upload-image', protect, upload.single('image'), uploadImage);
router.post('/services', protect, addService);
router.delete('/services/:serviceId', protect, deleteService);
router.post('/portfolio', protect, addPortfolioItem);
router.delete('/portfolio/:itemId', protect, deletePortfolioItem);

// GET showcase projects (bypass Firestore rules via Admin SDK)
router.get('/showcase-projects', async (req, res) => {
  try {
    const { category, freelancerId, limit: limitStr, startAfter: startAfterId } = req.query;
    const pageSize = parseInt(limitStr) || 12;

    let ref = db.collection('projects');

    if (freelancerId) {
      ref = ref.where('freelancerId', '==', freelancerId);
    } else if (category && category !== 'All') {
      ref = ref.where('category', '==', category);
    }

    if (startAfterId) {
      const startDoc = await db.collection('projects').doc(startAfterId).get();
      if (startDoc.exists) ref = ref.startAfter(startDoc);
    }

    ref = ref.limit(pageSize);
    const snapshot = await ref.get();

    let projects = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    // Sort by createdAt descending in memory (avoids composite index requirement)
    projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const lastId = snapshot.docs[snapshot.docs.length - 1]?.id || null;
    res.json({ success: true, projects, lastId, hasMore: snapshot.docs.length === pageSize });
  } catch (err) {
    console.error('Fetch showcase projects error:', err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST showcase projects (bypass Firestore rules via Admin SDK)
router.post('/showcase-projects', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, projectLink, technologies, completionDate, freelancerName, freelancerProfileImage } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }

    let imageUrl = '';
    if (req.file) {
      const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
      imageUrl = await uploadToCloudinary(req.file.buffer, 'afro-task/projects', 'image');
    }

    const techArray = technologies
      ? technologies.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      freelancerId: req.user.userId,
      freelancerName: freelancerName || '',
      freelancerProfileImage: freelancerProfileImage || '',
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      projectImage: imageUrl,
      projectLink: (projectLink || '').trim(),
      technologies: techArray,
      completionDate: completionDate || '',
      views: 0,
      likes: 0,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const projectId = req.query.projectId;
    if (projectId) {
      // Update existing project
      const ref = db.collection('projects').doc(projectId);
      if (!imageUrl) delete payload.projectImage; // keep existing image if no new one
      await ref.update(payload);
      res.json({ success: true, id: projectId });
    } else {
      // Create new project
      payload.createdAt = FieldValue.serverTimestamp();
      const docRef = await db.collection('projects').add(payload);
      res.json({ success: true, id: docRef.id });
    }
  } catch (err) {
    console.error('Showcase project error:', err);
    res.status(500).json({ message: 'Failed to save project' });
  }
});

// GET blogs
router.get('/blogs', async (req, res) => {
  try {
    const snapshot = await db.collection('blogs').get();
    let blogs = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    blogs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json({ success: true, blogs });
  } catch (err) {
    console.error('Fetch blogs error:', err);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// POST blogs
router.post('/blogs', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, authorName } = req.body;
    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Title, description and content are required' });
    }
    let imageUrl = '';
    if (req.file) {
      try {
        const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
        imageUrl = await uploadToCloudinary(req.file.buffer, 'afro-task/blogs', 'image');
      } catch (uploadErr) {
        console.error('Image upload failed, continuing without image:', uploadErr.message);
        // Don't fail the whole request if image upload fails
      }
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      image: imageUrl,
      authorName: authorName || '',
      authorId: req.user.userId,
      createdAt: FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('blogs').add(payload);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Blog create error:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to create blog', detail: err.message });
  }
});

// PUT (edit) blog
router.put('/blogs/:blogId', protect, upload.single('image'), async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, description, content, authorName } = req.body;
    const ref = db.collection('blogs').doc(blogId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Blog not found' });
    if (doc.data().authorId !== req.user.userId) return res.status(403).json({ message: 'Not authorized' });

    const updates = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (content) updates.content = content.trim();
    if (authorName) updates.authorName = authorName;
    if (req.file) {
      try {
        const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
        updates.image = await uploadToCloudinary(req.file.buffer, 'afro-task/blogs', 'image');
      } catch (e) { console.error('Image upload failed:', e.message); }
    }
    updates.updatedAt = FieldValue.serverTimestamp();
    await ref.update(updates);
    res.json({ success: true });
  } catch (err) {
    console.error('Blog update error:', err.message);
    res.status(500).json({ message: 'Failed to update blog', detail: err.message });
  }
});

// DELETE blog
router.delete('/blogs/:blogId', protect, async (req, res) => {
  try {
    const { blogId } = req.params;
    const ref = db.collection('blogs').doc(blogId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Blog not found' });
    if (doc.data().authorId !== req.user.userId) return res.status(403).json({ message: 'Not authorized' });
    await ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error('Blog delete error:', err.message);
    res.status(500).json({ message: 'Failed to delete blog', detail: err.message });
  }
});

export default router;
