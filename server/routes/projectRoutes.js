import express from 'express';
import { 
  getMyProjects, 
  getProjectDetails, 
  completeProject,
  markAsFinished,
  approveCompletion,
  requestRevision,
  updateTaskStatus
} from '../controllers/projectController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getMyProjects);
router.get('/:projectId', protect, getProjectDetails);

// Old endpoint (keep for backward compatibility)
router.patch('/:projectId/complete', protect, restrictTo('client'), completeProject);

// New 2-step completion workflow
router.post('/:projectId/mark-finished', protect, restrictTo('freelancer'), markAsFinished);
router.post('/:projectId/approve', protect, restrictTo('client'), approveCompletion);
router.post('/:projectId/request-revision', protect, restrictTo('client'), requestRevision);
router.put('/:projectId/status', protect, restrictTo('freelancer'), updateTaskStatus);

export default router;
