import express from 'express';
import { getMyChats, createChat, uploadFile } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/my-chats', protect, getMyChats);
router.post('/create', protect, createChat);
router.post('/upload-file', protect, upload.single('file'), uploadFile);

export default router;
