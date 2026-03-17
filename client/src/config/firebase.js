import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import api from '../services/api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Ensures the client is signed into Firebase Auth using a custom token from the backend.
// Safe to call multiple times — skips if already signed in.
export const ensureFirebaseAuth = async () => {
  if (auth.currentUser) return;
  try {
    const res = await api.get('/auth/firebase-token');
    await signInWithCustomToken(auth, res.data.token);
    console.log('Firebase auth signed in:', auth.currentUser?.uid);
  } catch (err) {
    console.warn('Firebase auth sign-in failed (non-fatal):', err?.message);
  }
};
