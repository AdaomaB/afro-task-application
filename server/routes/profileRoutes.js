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

export default router;
