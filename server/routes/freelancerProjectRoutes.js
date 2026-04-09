import express from 'express';
import {
  createFreelancerProject,
  getFreelancerProjects,
  getFreelancerProjectById,
  updateFreelancerProject,
  deleteFreelancerProject,
} from '../controllers/freelancerProjectController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Public - anyone can browse
router.get('/', getFreelancerProjects);
router.get('/:projectId', getFreelancerProjectById);

// Protected - freelancers only
router.post('/', protect, restrictTo('freelancer'), upload.single('projectImage'), createFreelancerProject);
router.put('/:projectId', protect, restrictTo('freelancer'), upload.single('projectImage'), updateFreelancerProject);
router.delete('/:projectId', protect, restrictTo('freelancer'), deleteFreelancerProject);

export default router;
