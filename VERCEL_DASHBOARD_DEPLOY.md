# Deploy Frontend via Vercel Dashboard

## The Issue

Vercel CLI is rejecting deployments because the Git commits have an old email address that doesn't match your current Vercel account.

## Solution: Deploy via Vercel Dashboard

This bypasses the Git author check and is actually easier!

### Step 1: Go to Vercel Dashboard

1. Open your browser
2. Go to: https://vercel.com/new
3. Make sure you're logged in with your current account

### Step 2: Import Your GitHub Repository

1. Click "Import Project" or "Add New" → "Project"
2. Select "Import Git Repository"
3. Find and select: `AdaomaB/afro-task`
4. Click "Import"

### Step 3: Configure the Project

**Important Settings:**

- **Framework Preset:** Vite (should auto-detect)
- **Root Directory:** `client` ← IMPORTANT! Click "Edit" and set this
- **Build Command:** `npm run build` (default is fine)
- **Output Directory:** `dist` (default is fine)
- **Install Command:** `npm install` (default is fine)

### Step 4: Add Environment Variables

Before clicking "Deploy", add these environment variables:

Click "Environment Variables" section and add each one:

```
VITE_API_URL
```
Value:
```
https://afro-task-production.up.railway.app/api
```

```
VITE_FIREBASE_API_KEY
```
Value:
```
AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY
```

```
VITE_FIREBASE_AUTH_DOMAIN
```
Value:
```
my-p-2456.firebaseapp.com
```

```
VITE_FIREBASE_PROJECT_ID
```
Value:
```
my-p-2456
```

```
VITE_FIREBASE_STORAGE_BUCKET
```
Value:
```
my-p-2456.firebasestorage.app
```

```
VITE_FIREBASE_MESSAGING_SENDER_ID
```
Value:
```
138959313797
```

```
VITE_FIREBASE_APP_ID
```
Value:
```
1:138959313797:web:d395fd5f45ed9bf6e442ec
```

**Make sure to select "Production" for all variables!**

### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. Vercel will give you a URL like: `https://afro-task.vercel.app`

### Step 6: Update Railway FRONTEND_URL

Once you have your Vercel URL:

1. Go to Railway Dashboard
2. Click on your backend service
3. Go to Variables tab
4. Add or update:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
5. Railway will auto-redeploy

### Step 7: Test Your Deployment

Visit your Vercel URL and test:
- ✅ Page loads
- ✅ Can access login/signup
- ✅ Can create an account
- ✅ Can login
- ✅ Can create posts/jobs

## Troubleshooting

### Build fails with "Cannot find module"
- Make sure Root Directory is set to `client`
- Check that all environment variables are added

### Frontend loads but can't connect to backend
- Check VITE_API_URL is correct
- Make sure it ends with `/api`
- Check Railway backend is running

### CORS errors
- Make sure FRONTEND_URL is set on Railway
- Must match your Vercel URL exactly
- Include `https://` protocol
- No trailing slash

### Firebase errors
- Double-check all VITE_FIREBASE_* variables
- Make sure there are no typos
- All values should be strings (no quotes needed in Vercel UI)

## Alternative: Use Vercel CLI with --force

If you still want to use CLI, try:

```bash
cd client
vercel --prod --force
```

The `--force` flag might bypass the Git author check.

## Why Dashboard is Better

- No Git author issues
- Easier to manage environment variables
- Better build logs and debugging
- Automatic deployments on future Git pushes
- Can easily rollback deployments

## Expected Result

After successful deployment:
- ✅ Frontend live on Vercel
- ✅ Backend live on Railway
- ✅ Both connected and working
- ✅ Can use the application in production

## Your URLs

**Frontend (Vercel):**
```
https://afro-task.vercel.app (or similar)
```

**Backend (Railway):**
```
https://afro-task-production.up.railway.app
```

**API Endpoint:**
```
https://afro-task-production.up.railway.app/api
```
