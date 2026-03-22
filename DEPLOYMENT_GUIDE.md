# Afro Task - Production Deployment Guide

## 🚀 Complete Deployment Guide for Render (Backend) + Vercel (Frontend)

---

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Firebase project with Firestore enabled
- Cloudinary account for file uploads

---

## Part 1: Prepare Your Code

### 1.1 Install New Dependencies

```bash
cd server
npm install helmet compression
```

### 1.2 Update Environment Variables

The application is now configured to use environment variables. Make sure your local `.env` files are set up correctly.

---

## Part 2: Backend Deployment on Render

### 2.1 Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for production deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/afro-task.git
git branch -M main
git push -u origin main
```

### 2.2 Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `afro-task-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select "Free" for testing or "Starter" for production

### 2.3 Set Environment Variables on Render

Go to "Environment" tab and add these variables:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Firebase Admin SDK (from serviceAccountKey.json)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Make sure to preserve the `\n` characters in the private key
- Get these values from your `serviceAccountKey.json` file

### 2.4 Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Wait for deployment to complete (5-10 minutes)
4. Your API will be available at: `https://your-app-name.onrender.com`

### 2.5 Test Backend

Visit these URLs to verify:
- `https://your-app-name.onrender.com/` - Should return API info
- `https://your-app-name.onrender.com/health` - Should return health status

---

## Part 3: Frontend Deployment on Vercel

### 3.1 Prepare Frontend

Create `.env.production` in the `client` folder:

```env
VITE_API_URL=https://your-app-name.onrender.com/api

# Firebase Config (from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3.2 Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? afro-task
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables (same as `.env.production` above)

6. Click "Deploy"

### 3.3 Update Backend CORS

After deploying frontend, update the `FRONTEND_URL` environment variable on Render:

1. Go to Render Dashboard → Your Service → Environment
2. Update `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`
3. Save changes (this will trigger a redeploy)

---

## Part 4: Firebase Configuration

### 4.1 Update Firebase Security Rules

Make sure your Firestore rules are production-ready:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.authorId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'client';
      allow update, delete: if request.auth != null && resource.data.clientId == request.auth.uid;
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if request.auth != null && 
        (resource.data.freelancerId == request.auth.uid || 
         resource.data.clientId == request.auth.uid);
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'freelancer';
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if request.auth != null && 
        (resource.data.freelancerId == request.auth.uid || 
         resource.data.clientId == request.auth.uid);
      allow write: if request.auth != null && 
        (resource.data.freelancerId == request.auth.uid || 
         resource.data.clientId == request.auth.uid);
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
    
    // Other collections
    match /follows/{followId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

Deploy these rules:
```bash
firebase deploy --only firestore:rules
```

### 4.2 Create Firestore Indexes

Deploy the indexes:
```bash
firebase deploy --only firestore:indexes
```

### 4.3 Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Add your production domain to authorized domains:
   - `your-app.vercel.app`

---

## Part 5: Post-Deployment Verification

### 5.1 Test Backend Endpoints

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Test authentication
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Test user registration
3. Test user login
4. Test creating a post
5. Test job posting (for clients)
6. Test job application (for freelancers)
7. Test messaging system
8. Test file uploads
9. Test real-time features (likes, follows, notifications)

### 5.3 Monitor Logs

**Render Logs:**
- Go to Render Dashboard → Your Service → Logs
- Monitor for any errors

**Vercel Logs:**
- Go to Vercel Dashboard → Your Project → Deployments → View Function Logs

---

## Part 6: Troubleshooting

### Common Issues

**1. CORS Errors**
- Make sure `FRONTEND_URL` on Render matches your Vercel URL exactly
- Check that CORS is properly configured in `server.js`

**2. Firebase Connection Issues**
- Verify all Firebase environment variables are set correctly
- Check that private key includes `\n` characters
- Ensure Firebase project has Firestore enabled

**3. File Upload Issues**
- Verify Cloudinary credentials are correct
- Check that file size limits are appropriate

**4. Authentication Issues**
- Verify JWT_SECRET is set and consistent
- Check Firebase Authentication is enabled
- Verify authorized domains include your Vercel domain

**5. Database Queries Failing**
- Check Firestore indexes are deployed
- Verify security rules allow the operations
- Check user permissions

### Performance Optimization

**Backend (Render):**
- Upgrade to paid plan for better performance
- Enable auto-scaling if needed
- Monitor response times

**Frontend (Vercel):**
- Vercel automatically optimizes builds
- Use Vercel Analytics for monitoring
- Enable caching where appropriate

---

## Part 7: Maintenance

### Regular Tasks

1. **Monitor Logs**: Check Render and Vercel logs regularly
2. **Update Dependencies**: Keep packages up to date
3. **Backup Database**: Firebase automatically backs up, but export important data periodically
4. **Monitor Costs**: Check Render, Vercel, Firebase, and Cloudinary usage
5. **Security Updates**: Apply security patches promptly

### Updating the Application

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Render and Vercel will automatically redeploy
```

---

## Part 8: Environment Variables Checklist

### Backend (Render)

- [ ] NODE_ENV
- [ ] PORT
- [ ] FRONTEND_URL
- [ ] JWT_SECRET
- [ ] FIREBASE_PROJECT_ID
- [ ] FIREBASE_PRIVATE_KEY_ID
- [ ] FIREBASE_PRIVATE_KEY
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] FIREBASE_CLIENT_ID
- [ ] FIREBASE_AUTH_URI
- [ ] FIREBASE_TOKEN_URI
- [ ] FIREBASE_AUTH_PROVIDER_CERT_URL
- [ ] FIREBASE_CLIENT_CERT_URL
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET

### Frontend (Vercel)

- [ ] VITE_API_URL
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_FIREBASE_MEASUREMENT_ID

---

## Part 9: Production URLs

After deployment, you'll have:

- **Backend API**: `https://your-app-name.onrender.com`
- **Frontend**: `https://your-app.vercel.app`
- **Health Check**: `https://your-app-name.onrender.com/health`

---

## Support

If you encounter issues:

1. Check the logs on Render and Vercel
2. Verify all environment variables are set correctly
3. Test endpoints individually
4. Check Firebase Console for any errors
5. Review Cloudinary dashboard for upload issues

---

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Monitor for suspicious activity** - Check logs for unusual patterns
5. **Use HTTPS only** - Both Render and Vercel provide this automatically
6. **Implement rate limiting** - Consider adding rate limiting middleware
7. **Regular backups** - Export Firestore data periodically

---

## Success! 🎉

Your Afro Task application is now live and ready for users!

**Next Steps:**
1. Share your application URL with users
2. Monitor performance and user feedback
3. Plan for scaling as user base grows
4. Consider adding analytics (Google Analytics, Mixpanel, etc.)
5. Set up error tracking (Sentry, LogRocket, etc.)
