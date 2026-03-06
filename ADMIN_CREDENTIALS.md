# Admin Dashboard Credentials

## IMPORTANT: Admin Account Must Be Created First

The admin account doesn't exist by default. Follow these steps carefully:

### Step 1: Create Admin Account via Signup

1. Go to signup page: `http://localhost:5173/signup`
2. Fill in the form with these EXACT details:
   - **Full Name**: Admin User
   - **Email**: admin@afrotask.com
   - **Password**: Admin@123456
   - **Confirm Password**: Admin@123456
   - **Role**: Select "Freelancer" or "Client" (we'll change this to admin)
   - **Country**: Any country
   - **Skill Category** (if freelancer): Any category
   - **WhatsApp**: Any number
3. Click "Sign Up"
4. Wait for "Account created successfully!" message

### Step 2: Change Role to Admin in Firestore

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database** (left sidebar)
4. Click on the **users** collection
5. Find the document with email: **admin@afrotask.com**
   - You can use the filter: `email == admin@afrotask.com`
6. Click on the document to open it
7. Find the **role** field
8. Click the pencil icon to edit
9. Change the value from "freelancer" or "client" to **admin** (lowercase, no quotes in the value)
10. Click **Update**

### Step 3: Login as Admin

1. Go to login page: `http://localhost:5173/login`
2. Enter:
   - **Email**: admin@afrotask.com
   - **Password**: Admin@123456
3. Click "Login"
4. You should now be logged in as admin

## Admin Login Credentials (After Setup)

**Email:** admin@afrotask.com  
**Password:** Admin@123456

## Troubleshooting

### "Invalid email or password" Error

This means one of the following:

1. **Account doesn't exist yet**
   - Solution: Complete Step 1 above to create the account

2. **Wrong password**
   - Solution: Make sure you're using exactly: `Admin@123456` (capital A, @ symbol, numbers)

3. **Email typo**
   - Solution: Use exactly: `admin@afrotask.com` (all lowercase)

4. **Account exists but password is different**
   - Solution: Reset password in Firebase Authentication:
     - Go to Firebase Console → Authentication
     - Find admin@afrotask.com
     - Click the 3 dots → Reset password
     - Or delete the user and create again

### How to Verify Account Exists

1. Go to Firebase Console
2. Click **Authentication** (left sidebar)
3. Look for **admin@afrotask.com** in the users list
4. If it exists, check Firestore to verify the role is "admin"

### How to Reset Everything

If you want to start fresh:

1. **Delete from Authentication**:
   - Firebase Console → Authentication
   - Find admin@afrotask.com
   - Click 3 dots → Delete user

2. **Delete from Firestore**:
   - Firebase Console → Firestore Database
   - Find the user document with email admin@afrotask.com
   - Click 3 dots → Delete document

3. **Start over** from Step 1 above

## Admin Dashboard Features

The admin dashboard provides access to:
- User management (view all users, clients, freelancers)
- Job postings moderation
- Project monitoring
- Application oversight
- System statistics and analytics
- Content moderation (posts, reviews)

---

**Last Updated:** March 4, 2026  
**Version:** 1.1
