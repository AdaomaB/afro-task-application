import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db;
let bucket;

try {
  const serviceAccount = JSON.parse(
    readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  db = admin.firestore();
  bucket = admin.storage().bucket();
  console.log('✅ Firebase Firestore Connected');
  console.log('✅ Firebase Storage Connected');
} catch (error) {
  console.error('❌ Firebase Initialization Error:', error.message);
  process.exit(1);
}

export { db, admin, bucket };
