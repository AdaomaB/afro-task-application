import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { admin } from '../config/firebase.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Generate Firebase custom token for client-side Firestore auth
router.get('/firebase-token', protect, async (req, res) => {
  try {
    const token = await admin.auth().createCustomToken(req.user.userId);
    res.json({ token });
  } catch (err) {
    console.error('Firebase token error:', err);
    res.status(500).json({ message: 'Failed to generate Firebase token' });
  }
});

export default router;
