import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db;
let bucket;

try {
  let serviceAccount;

  // 1. Check for Base64 encoded environment variable (Production/Railway/Render)
  if (process.env.FIREBASE_BASE64_CREDENTIALS) {
    const decodedKey = Buffer.from(process.env.FIREBASE_BASE64_CREDENTIALS, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decodedKey);
    console.log('🔧 Using Firebase credentials from Base64 environment variable');
  } 
  // 2. Fallback to local file (Local Development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    serviceAccount = JSON.parse(
      readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
    console.log('🔧 Using Firebase credentials from service account file');
  } 
  // 3. Throw error if neither is found
  else {
    throw new Error('Firebase credentials not found. Set FIREBASE_BASE64_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH.');
  }

  // Initialize Firebase (The JSON object already has the project ID, email, and private key inside it!)
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
    console.log('✅ Firebase Firestore Connected (production)');
  }

  console.log('✅ Firebase Storage Connected');
} catch (error) {
  console.error('❌ Firebase Initialization Error:', error.message);
  console.error('Stack:', error.stack);
  
  // Cleaned up debug info
  console.log('Debug Info:');
  console.log('- FIREBASE_BASE64_CREDENTIALS:', process.env.FIREBASE_BASE64_CREDENTIALS ? 'Set' : 'Missing');
  console.log('- FIREBASE_SERVICE_ACCOUNT_PATH:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? 'Set' : 'Missing');
  console.log('- FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing');
  
  process.exit(1);
}

export { db, admin, bucket };
