# 🚨 RAILWAY SETTINGS - DO THIS NOW

## The Problem
Railway is looking at the root directory (with all the markdown files) instead of the `server/` folder where your Node.js app is.

## ✅ THE FIX (Takes 30 seconds)

### Go to Railway Dashboard and Set Root Directory:

1. **Open Railway**: https://railway.app/dashboard
2. **Click** on your `afro-task` project
3. **Click** on the service (backend)
4. **Click** the **Settings** tab (top navigation)
5. **Scroll down** to find **Root Directory** field
6. **Type**: `server`
7. **Click Save**

Railway will automatically redeploy in 2-3 minutes!

---

## Alternative: Check if Auto-Deploy Worked

I just pushed a `railway.json` config file that should tell Railway to use the `server` directory. 

Check your Railway dashboard:
- If a new deployment started automatically → Wait for it to complete
- If no new deployment → Follow the steps above to set Root Directory manually

---

## After Deployment Succeeds

You'll see in the logs:
```
🚀 Server running on port 5000
📊 Environment: production
```

Then:
1. Go to **Settings** → **Networking** → **Generate Domain**
2. Copy your Railway URL
3. Test: `https://your-url.up.railway.app/health`

---

## Environment Variables

Don't forget to add these in the **Variables** tab:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FRONTEND_URL=https://your-app.vercel.app
```

(Copy these from your local `server/.env` file)

---

## Quick Checklist

- [ ] Set Root Directory to `server` in Railway Settings
- [ ] Add all environment variables
- [ ] Wait for deployment to complete
- [ ] Generate domain
- [ ] Test `/health` endpoint

That's it! 🚀
