import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db;
let bucket;

try {
  let serviceAccount;

  // Option 1: Base64-encoded full service account JSON (best for Hostinger)
  if (process.env.FIREBASE_BASE64_CREDENTIALS) {
    const decoded = Buffer.from(process.env.FIREBASE_BASE64_CREDENTIALS, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
    console.log('🔧 Using Firebase credentials from FIREBASE_BASE64_CREDENTIALS');
  }
  // Option 2: Individual env vars (Railway, Render, Vercel)
  else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    // Use environment variables (for Railway, Render, etc.)
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Strip surrounding quotes if present (common Railway/Vercel paste issue)
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // Replace literal \n with actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };
    console.log('🔧 Using Firebase credentials from environment variables');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    // Use service account file (for local development)
    serviceAccount = JSON.parse(
      readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
    console.log('🔧 Using Firebase credentials from service account file');
  } else {
    throw new Error('Firebase credentials not found. Set FIREBASE_BASE64_CREDENTIALS (recommended for Hostinger), or FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID, or FIREBASE_SERVICE_ACCOUNT_PATH.');
  }

  // Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  db = admin.firestore();
  bucket = admin.storage().bucket();

  // Connect to Firestore emulator ONLY when USE_EMULATOR=true
  if (process.env.USE_EMULATOR === 'true') {
    db.settings({ host: 'localhost:8080', ssl: false });
    console.log('🔧 Firestore connected to LOCAL EMULATOR (localhost:8080)');
  } else {
    // 👇 ADDED THIS LINE TO FORCE HTTP/REST AND BYPASS gRPC SSL ERRORS 👇
    db.settings({ preferRest: true });
    
    console.log('✅ Firebase Firestore Connected (production)');
  }

  console.log('✅ Firebase Storage Connected');
} catch (error) {
  console.error('❌ Firebase Initialization Error:', error.message);
  console.error('Stack:', error.stack);
  
  // Cleaned up debug info
  console.log('Debug Info:');
  console.log('- FIREBASE_BASE64_CREDENTIALS:', process.env.FIREBASE_BASE64_CREDENTIALS ? 'Set' : 'Missing');
  console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
  console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing');
  console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `Set (${process.env.FIREBASE_PRIVATE_KEY.substring(0, 50)}...)` : 'Missing');
  console.log('- FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing');
  
  process.exit(1);
}

export { db, admin, bucket };