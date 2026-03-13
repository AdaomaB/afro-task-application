# Deploy Frontend to Vercel - Simple Steps

## Your Railway Backend URL
```
https://afro-task.up.railway.app
```

## Steps to Deploy on Vercel

### 1. Go to Vercel
- Open https://vercel.com
- Sign in with your GitHub account (AdaomaB)

### 2. Import Project
- Click "Add New" → "Project"
- Select your repository: `AdaomaB/afro-task`
- Click "Import"

### 3. Configure Project Settings
Set these in the configuration screen:

**Framework Preset:** Vite

**Root Directory:** `client`

**Build Command:** `npm run build`

**Output Directory:** `dist`

### 4. Add Environment Variables
Click "Environment Variables" and add these:

```
VITE_API_URL=https://afro-task.up.railway.app/api

VITE_FIREBASE_API_KEY=AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY

VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com

VITE_FIREBASE_PROJECT_ID=my-p-2456

VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app

VITE_FIREBASE_MESSAGING_SENDER_ID=138959313797

VITE_FIREBASE_APP_ID=1:138959313797:web:d395fd5f45ed9bf6e442ec
```

### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes for build to complete

### 6. After Deployment
Once deployed, you'll get a Vercel URL like: `https://afro-task.vercel.app`

Then update Railway:
1. Go to Railway → Variables
2. Update `FRONTEND_URL` to your Vercel URL
3. Railway will auto-redeploy

## Done!
Your app will be live at your Vercel URL.
