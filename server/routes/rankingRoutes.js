import express from 'express';
import {
  updateFreelancerRanking,
  getTopFreelancers,
  getRecommendedFreelancers,
  getRecommendedJobs,
  getFreelancersByCategory
} from '../controllers/rankingController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Update freelancer ranking score
router.post('/update/:userId', protect, updateFreelancerRanking);

// Get top freelancers
router.get('/top-freelancers', getTopFreelancers);

// Get recommended freelancers for a job
router.get('/recommended-freelancers/:jobId', getRecommendedFreelancers);

// Get recommended jobs for a freelancer
router.get('/recommended-jobs', protect, getRecommendedJobs);

// Get freelancers by category/skill
router.get('/category/:category', getFreelancersByCategory);

export default router;
