import express from 'express';
import { getFreelancerStats, getClientStats, getPendingRequests } from '../controllers/statsController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

router.get('/freelancer', protect, restrictTo('freelancer'), getFreelancerStats);
router.get('/client', protect, restrictTo('client'), getClientStats);
router.get('/pending-requests', protect, getPendingRequests);

export default router;
