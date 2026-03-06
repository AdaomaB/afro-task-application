# 🚀 DEPLOY NOW - Final Steps

## ✅ What's Done

Your code is successfully pushed to: **https://github.com/AdaomaB/afro-task**

Now let's deploy it!

---

## Step 1: Deploy Backend on Railway (10 minutes)

### 1.1 Go to Railway
Visit: **https://railway.app**

### 1.2 Sign Up / Login
- Click "Login"
- Choose "Login with GitHub"
- Use the **AdaomaB** GitHub account
- Authorize Railway

### 1.3 Create New Project
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. You'll see your repositories
4. Select **"AdaomaB/afro-task"**
5. Railway will start deploying automatically

### 1.4 Configure the Service
1. Click on the service card that appears
2. Click "Settings" tab
3. Scroll to "Service Settings"
4. Set **Root Directory**: `server`
5. Set **Start Command**: `npm start` (should be auto-detected)
6. Click "Save"

### 1.5 Add Environment Variables
1. Click "Variables" tab
2. Click "RAW Editor" button
3. Copy and paste this (update with YOUR actual values from `server/.env`):

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

FIREBASE_PROJECT_ID=my-p-2456
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-server-env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@my-p-2456.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-from-server-env
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your-client-cert-url-from-server-env

CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

**IMPORTANT**: 
- Open your local `server/.env` file
- Copy the EXACT values from there
- For `FIREBASE_PRIVATE_KEY`, keep the quotes and `\n` characters

4. Click "Update Variables"
5. Railway will automatically redeploy

### 1.6 Get Your Railway URL
1. Go to "Settings" tab
2. Scroll to "Networking" section
3. Click "Generate Domain"
4. Your API URL will be something like: `https://afro-task-production.up.railway.app`
5. **COPY THIS URL** - you'll need it for Vercel!

### 1.7 Test Your Backend
Visit: `https://your-railway-url.up.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production",
  "timestamp": "2024-..."
}
```

✅ **Backend is live!**

---

## Step 2: Deploy Frontend on Vercel (5 minutes)

### 2.1 Go to Vercel
Visit: **https://vercel.com**

### 2.2 Sign Up / Login
- Click "Sign Up" or "Login"
- Choose "Continue with GitHub"
- Use the **AdaomaB** GitHub account
- Authorize Vercel

### 2.3 Import Project
1. Click "Add New..." → "Project"
2. You'll see your GitHub repositories
3. Find **"AdaomaB/afro-task"**
4. Click "Import"

### 2.4 Configure Project
1. **Framework Preset**: Select "Vite"
2. **Root Directory**: Click "Edit" and type `client`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)

### 2.5 Add Environment Variables
Click "Environment Variables" section and add these:

**Name**: `VITE_API_URL`
**Value**: `https://your-railway-url.up.railway.app/api` (use YOUR Railway URL from Step 1.6)

Then add these (copy from your local `client/.env` file):

```
VITE_FIREBASE_API_KEY=AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY
VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-p-2456
VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 2.6 Deploy
1. Click "Deploy"
2. Wait 2-5 minutes
3. Vercel will show you the deployment progress
4. Once done, you'll get a URL like: `https://afro-task.vercel.app`

✅ **Frontend is live!**

---

## Step 3: Update CORS (2 minutes)

Now that both are deployed, update the backend to allow your frontend:

1. Go back to **Railway Dashboard**
2. Click on your project
3. Click "Variables" tab
4. Find `FRONTEND_URL`
5. Update it to your Vercel URL: `https://afro-task.vercel.app` (use YOUR actual URL)
6. Click "Update Variables"
7. Railway will automatically redeploy (wait 1-2 minutes)

✅ **CORS configured!**

---

## Step 4: Test Your Live Application! 🎉

### 4.1 Visit Your App
Go to your Vercel URL: `https://your-app.vercel.app`

### 4.2 Test These Features
- [ ] Sign up a new user
- [ ] Login
- [ ] Create a post (if freelancer)
- [ ] Post a job (if client)
- [ ] Upload profile image
- [ ] Send a message
- [ ] Check if real-time features work

### 4.3 Check for Errors
- Open browser console (F12)
- Look for any red errors
- If you see CORS errors, double-check Step 3

---

## Your Live URLs

Fill these in after deployment:

- **GitHub**: https://github.com/AdaomaB/afro-task ✅
- **Backend (Railway)**: https://_____________________.up.railway.app
- **Frontend (Vercel)**: https://_____________________.vercel.app
- **Health Check**: https://_____________________.up.railway.app/health

---

## Troubleshooting

### Railway Build Failed
- Check logs in Railway dashboard
- Verify `server` is set as root directory
- Make sure all environment variables are set
- Check that `FIREBASE_PRIVATE_KEY` includes `\n` characters

### Vercel Build Failed
- Check logs in Vercel dashboard
- Verify `client` is set as root directory
- Make sure `VITE_API_URL` is set correctly

### CORS Errors in Browser
- Make sure `FRONTEND_URL` on Railway matches your Vercel URL exactly
- No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
- Wait 1-2 minutes after updating for Railway to redeploy

### Firebase Errors
- Check all Firebase variables are set correctly
- Make sure you copied them exactly from your local `.env` files

### Images Not Uploading
- Check Cloudinary variables are set correctly
- Test by uploading a profile image

---

## Railway Pricing

Railway gives you **$5 free credit per month**. Your app will likely use:
- ~$3-5/month for the backend
- First month is FREE with the $5 credit

If you need more, upgrade to:
- **Hobby Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month (unlimited)

---

## Vercel Pricing

Vercel is **FREE** for personal projects with:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- 100GB bandwidth/month

---

## What's Next?

### Monitor Your App
- **Railway Logs**: https://railway.app/dashboard → Your Project → Logs
- **Vercel Logs**: https://vercel.com/dashboard → Your Project → Deployments

### Custom Domain (Optional)
Both Railway and Vercel support custom domains:
- Buy a domain (e.g., from Namecheap, GoDaddy)
- Add it in Railway/Vercel settings
- Update DNS records

### Add More Features
Your app is live! Now you can:
- Add payment integration (Stripe)
- Add email notifications
- Add more analytics
- Improve UI/UX based on user feedback

---

## Need Help?

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Railway Discord**: https://discord.gg/railway
- **Check logs** in both dashboards

---

## Success Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] CORS updated
- [ ] Health endpoint works
- [ ] Can sign up new user
- [ ] Can login
- [ ] Can create posts/jobs
- [ ] Can upload images
- [ ] Messages work
- [ ] No console errors

---

## 🎉 Congratulations!

Your Afro Task platform is now LIVE and ready for users!

**Total deployment time: ~20 minutes**

Share your app with users and start getting feedback! 🚀

---

## Quick Reference

```bash
# If you need to update code later:
git add .
git commit -m "Your update message"
git push

# Railway and Vercel will auto-deploy!
```

---

**You did it!** Your full-stack application is now in production! 🎊
