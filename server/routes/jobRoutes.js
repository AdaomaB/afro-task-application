import express from 'express';
import { 
  createJob, 
  getJobs, 
  getMyJobs, 
  incrementJobView, 
  getJobById, 
  getJobViewers,
  addJobComment,
  getJobComments,
  likeJobComment
} from '../controllers/jobController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, restrictTo('client'), createJob);
router.get('/', protect, getJobs);
router.get('/my-jobs', protect, restrictTo('client'), getMyJobs);
router.get('/:jobId', protect, getJobById);
router.post('/:jobId/view', protect, incrementJobView);
router.get('/:jobId/viewers', protect, getJobViewers);

// Comment routes
router.post('/:jobId/comments', protect, addJobComment);
router.get('/:jobId/comments', protect, getJobComments);
router.post('/:jobId/comments/:commentId/like', protect, likeJobComment);

export default router;
