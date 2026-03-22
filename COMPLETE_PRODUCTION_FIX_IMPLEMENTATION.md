# 🚀 RAILWAY DEPLOYMENT - FINAL STEPS

## ✅ What's Been Done
1. Created Railway configuration files (`railway.toml` and `nixpacks.toml`)
2. Configured Git with your AdaomaB account
3. Pushed all changes to GitHub
4. Railway will auto-detect the new configuration

## 🔥 CRITICAL: Add Firebase Variables to Railway NOW

Railway is currently failing because Firebase environment variables are missing. You need to add them manually in the Railway dashboard.

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Click on your `afro-task` project
3. Click on your service
4. Click the "Variables" tab

### Step 2: Add These Environment Variables

Copy these from your local `server/.env` file and paste them into Railway:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret_from_local_env

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your_client_cert_url

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 3: Important Notes

**For FIREBASE_PRIVATE_KEY:**
- Must include the quotes at the beginning and end
- Must include `\n` for line breaks (not actual line breaks)
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

**After adding variables:**
- Railway will automatically redeploy
- Wait 2-3 minutes for deployment to complete
- Check the logs to verify Firebase connection

### Step 4: Get Your Railway URL

Once deployment succeeds:
1. Go to your service in Railway
2. Click "Settings" tab
3. Scroll to "Networking"
4. Copy the public domain (e.g., `afro-task-production.up.railway.app`)

### Step 5: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository: `AdaomaB/afro-task`
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variables in Vercel:
```
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

6. Click "Deploy"

### Step 6: Update FRONTEND_URL on Railway

After Vercel deployment:
1. Copy your Vercel URL (e.g., `afro-task.vercel.app`)
2. Go back to Railway → Variables
3. Update `FRONTEND_URL` to your Vercel URL
4. Railway will redeploy automatically

## 🎯 Current Status

- ✅ Code pushed to GitHub (AdaomaB/afro-task)
- ✅ Railway configuration files created
- ⏳ Waiting for you to add Firebase variables to Railway
- ⏳ Then deploy frontend to Vercel

## 📝 Next Action

**YOU NEED TO:** Add the Firebase environment variables to Railway dashboard now. The app cannot work without them.
