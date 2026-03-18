import express from 'express';
import {
  getPreProjectChat,
  getChatMessages,
  sendMessage,
  markAsRead,
  getMyPreProjectChats,
  createDirectChat
} from '../controllers/preProjectChatController.js';
import { protect } from '../middlewares/auth.js';
import { chatFileUpload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/my-chats', protect, getMyPreProjectChats);
router.post('/create-direct', protect, createDirectChat);
router.get('/application/:applicationId', protect, getPreProjectChat);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/:chatId/messages', protect, chatFileUpload.single('file'), sendMessage);
router.post('/:chatId/mark-read', protect, markAsRead);

export default router;
