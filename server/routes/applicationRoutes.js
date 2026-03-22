import express from 'express';
import { 
  applyForJob, 
  getMyApplications, 
  getJobApplications,
  startChat,
  acceptApplication,
  rejectApplication
} from '../controllers/applicationController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { cvUpload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/', protect, restrictTo('freelancer'), cvUpload.single('cv'), applyForJob);
router.get('/my-applications', protect, restrictTo('freelancer'), getMyApplications);
router.get('/job/:jobId', protect, restrictTo('client'), getJobApplications);
router.post('/:applicationId/start-chat', protect, restrictTo('client'), startChat);
router.post('/:applicationId/accept', protect, restrictTo('client'), acceptApplication);
router.post('/:applicationId/reject', protect, restrictTo('client'), rejectApplication);

export default router;
