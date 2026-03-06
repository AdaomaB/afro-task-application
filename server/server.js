import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
// Server initialization
import { db } from './config/firebase.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import followRoutes from './routes/followRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import preProjectChatRoutes from './routes/preProjectChatRoutes.js';
import projectChatRoutes from './routes/projectChatRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pre-project-chats', preProjectChatRoutes);
app.use('/api/project-chats', projectChatRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Afro Task API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: 'Firestore',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Log environment check
console.log('🔍 Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', PORT);
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server is listening on 0.0.0.0:${PORT}`);
});
