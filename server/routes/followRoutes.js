import express from 'express';
import { followUser, checkFollowStatus, getFollowStats } from '../controllers/followController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/:userId', protect, followUser);
router.get('/:userId/status', protect, checkFollowStatus);
router.get('/:userId/stats', protect, getFollowStats);

export default router;
