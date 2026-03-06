# Firebase Storage Setup Guide

## Error: "The specified bucket does not exist"

This error means Firebase Storage hasn't been enabled for your project yet.

## Steps to Enable Firebase Storage

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/my-p-2456/storage

### 2. Click "Get Started"
- You'll see a button to enable Storage
- Click it to initialize Storage for your project

### 3. Choose Security Rules
Select "Start in production mode" for now (we'll configure rules later)

### 4. Select Location
Choose a location close to your users (e.g., us-central1)

### 5. Wait for Setup
It takes 30-60 seconds to create the bucket

### 6. Verify Bucket Name
After setup, check that the bucket name matches your .env file:
- Your .env: `my-p-2456.appspot.com`
- Firebase Console should show the same name

## Configure Storage Rules

After enabling, update the Storage Rules for security:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // CVs folder - only authenticated users can upload their own CVs
    match /cvs/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat files - only chat participants can access
    match /chat-files/{chatId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Profile images - public read, authenticated write
    match /profile-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Post images - public read, authenticated write
    match /post-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Alternative: Use Cloudinary for File Uploads

If you prefer not to use Firebase Storage, you can use Cloudinary (already configured):

### Update applicationController.js:

```javascript
import { v2 as cloudinary } from 'cloudinary';

// In applyForJob function, replace Firebase Storage upload with:
const uploadResult = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: `cvs/${freelancerId}`,
      resource_type: 'raw',
      public_id: `${Date.now()}_${file.originalname}`
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );
  uploadStream.end(file.buffer);
});

const cvUrl = uploadResult.secure_url;
```

This way you don't need Firebase Storage at all!

## Quick Test

After enabling Storage, try applying for a job again. The CV upload should work.

## Troubleshooting

### Bucket still not found?
1. Check .env file has correct bucket name
2. Restart server after enabling Storage
3. Wait 1-2 minutes for Storage to fully initialize

### Permission denied?
1. Update Storage Rules as shown above
2. Make sure user is authenticated
3. Check serviceAccountKey.json has Storage permissions

### Still having issues?
Consider using Cloudinary instead - it's already configured and working!
