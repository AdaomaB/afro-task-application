/**
 * Run once to create an admin account:
 *   node server/scripts/createAdmin.js
 */
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });
// If your .env is in server/, change to: dotenv.config();

const ADMIN_EMAIL = 'admin@afrotask.com';   // ← change this
const ADMIN_PASSWORD = 'Admin@1234!';        // ← change this
const ADMIN_NAME = 'AfroTask Admin';
//run this after change 
//cd server && node scripts/createAdmin.js

async function createAdmin() {
  try {
    // Check if already exists
    const existing = await db.collection('users')
      .where('email', '==', ADMIN_EMAIL.toLowerCase())
      .get();

    if (!existing.empty) {
      console.log('✅ Admin already exists:', ADMIN_EMAIL);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const docRef = await db.collection('users').add({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      profileImage: `https://ui-avatars.com/api/?name=Admin&background=00564C&color=fff`,
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Admin created successfully!');
    console.log('   ID:', docRef.id);
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🔐 Login at: /admin/login');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
