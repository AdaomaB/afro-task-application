# 🚂 Railway Deployment Guide - Afro Task

## Quick Setup for Railway

Railway is easier than Render! Here's how to deploy your backend.

---

## Step 1: Push to New GitHub Repo

You need to authenticate with the AdaomaB GitHub account first.

### Option A: Using GitHub CLI
```bash
gh auth login
# Select: GitHub.com
# Select: HTTPS
# Authenticate with web browser
# Login as AdaomaB
```

### Option B: Using Git Credential Manager
```bash
# Remove old credentials
git credential-manager erase https://github.com

# Then push (it will ask for new credentials)
git push -u origin main
```

### Option C: Using Personal Access Token
1. Go to GitHub.com and login as AdaomaB
2. Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token with `repo` scope
4. Copy the token
5. Use this command:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/AdaomaB/afro-task.git
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway

### 2.1 Sign Up / Login
1. Go to https://railway.app
2. Sign up with GitHub (use AdaomaB account)
3. Authorize Railway

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select `AdaomaB/afro-task`
4. Railway will detect it's a Node.js project

### 2.3 Configure Service
1. Click on the deployed service
2. Go to "Settings" tab
3. Set these:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.4 Add Environment Variables
1. Go to "Variables" tab
2. Click "Raw Editor"
3. Paste this (update with your actual values):

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app

# JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Firebase Configuration (from your server/.env file)
FIREBASE_PROJECT_ID=my-p-2456
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@my-p-2456.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your-client-cert-url

# Cloudinary Configuration (from your server/.env file)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Click "Update Variables"

### 2.5 Deploy
Railway will automatically deploy! Wait 2-5 minutes.

### 2.6 Get Your URL
1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Your API will be at: `https://your-app.up.railway.app`

### 2.7 Test Backend
Visit: `https://your-app.up.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production",
  "timestamp": "2024-..."
}
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Update API URL
Before deploying frontend, note your Railway URL from above.

### 3.2 Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
cd client
npm install -g vercel
vercel login
vercel
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import `AdaomaB/afro-task` from GitHub
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables on Vercel
```env
VITE_API_URL=https://your-app.up.railway.app/api

# Firebase (from your client/.env file)
VITE_FIREBASE_API_KEY=AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY
VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-p-2456
VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3.4 Deploy
Click "Deploy" and wait 2-5 minutes.

---

## Step 4: Update CORS

After both are deployed:

1. Go to Railway Dashboard → Your Project → Variables
2. Update `FRONTEND_URL` to your Vercel URL
3. Click "Update Variables" (Railway will redeploy automatically)

---

## Railway vs Render Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| Free Tier | $5 credit/month | Free with sleep |
| Deploy Speed | ⚡ Faster | Slower |
| Setup | Easier | More steps |
| Auto-deploy | ✅ Yes | ✅ Yes |
| Custom domains | ✅ Yes | ✅ Yes |
| Logs | ✅ Real-time | ✅ Real-time |

---

## Railway Pricing

- **Free**: $5 credit/month (enough for testing)
- **Hobby**: $5/month (500 hours)
- **Pro**: $20/month (unlimited)

Your app will likely use ~$3-5/month on the free tier.

---

## Troubleshooting

### GitHub Push Failed (403 Error)
You're logged in as the wrong GitHub account. Solutions:
1. Use GitHub CLI: `gh auth login`
2. Use personal access token in URL
3. Clear git credentials and re-authenticate

### Railway Build Failed
- Check logs in Railway dashboard
- Verify `server` is set as root directory
- Ensure all environment variables are set

### CORS Errors
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- No trailing slash in URLs

### Firebase Connection Issues
- Check all Firebase variables are set correctly
- Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters

---

## Quick Commands Summary

```bash
# 1. Authenticate with GitHub (as AdaomaB)
gh auth login

# 2. Push to new repo
git push -u origin main

# 3. Deploy on Railway (use dashboard)
# - Connect GitHub
# - Select repo
# - Set root directory to 'server'
# - Add environment variables
# - Deploy!

# 4. Deploy on Vercel
cd client
vercel --prod

# 5. Update CORS on Railway
# - Update FRONTEND_URL variable
# - Done!
```

---

## Your URLs (Fill in after deployment)

- **Backend (Railway)**: https://_____________________.up.railway.app
- **Frontend (Vercel)**: https://_____________________.vercel.app
- **Health Check**: https://_____________________.up.railway.app/health

---

## Railway Dashboard

After deployment, you can:
- View logs in real-time
- Monitor resource usage
- See deployment history
- Manage environment variables
- Set up custom domains

Access: https://railway.app/dashboard

---

## Success Checklist

After deployment:
- [ ] Backend health endpoint works
- [ ] Frontend loads without errors
- [ ] User can register
- [ ] User can login
- [ ] Jobs can be posted
- [ ] Applications work
- [ ] Messages send/receive
- [ ] Files upload successfully
- [ ] Real-time features work
- [ ] Mobile responsive
- [ ] No CORS errors

---

## Need Help?

1. Railway Docs: https://docs.railway.app
2. Railway Discord: https://discord.gg/railway
3. Check logs in Railway dashboard
4. Verify all environment variables

---

## Railway is Ready! 🚂

Your application is configured for Railway deployment. Just:
1. Push to GitHub (as AdaomaB)
2. Deploy on Railway
3. Deploy on Vercel
4. Update CORS
5. Test!

**Total time: ~15 minutes** ⚡

Railway is faster and easier than Render!
