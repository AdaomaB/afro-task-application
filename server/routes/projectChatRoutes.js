import express from 'express';
import {
  getProjectChat,
  getProjectChatMessages,
  sendProjectMessage,
  markProjectMessagesAsRead
} from '../controllers/projectChatController.js';
import { protect } from '../middlewares/auth.js';
import { chatFileUpload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/project/:projectId', protect, getProjectChat);
router.get('/:chatId/messages', protect, getProjectChatMessages);
router.post('/:chatId/messages', protect, chatFileUpload.single('file'), sendProjectMessage);
router.post('/:chatId/mark-read', protect, markProjectMessagesAsRead);

export default router;
