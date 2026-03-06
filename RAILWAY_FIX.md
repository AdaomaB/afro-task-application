# 🔧 Railway Deployment Fix

## The Problem

Railway couldn't detect how to build your app because it was looking at the root directory instead of the `server` folder.

## ✅ What I Fixed

1. Created `server/nixpacks.toml` - Tells Railway how to build the Node.js app
2. Pushed the fix to GitHub

## What You Need to Do in Railway Dashboard

### Option 1: Set Root Directory (RECOMMENDED)

1. Go to your Railway project
2. Click on the service
3. Go to **Settings** tab
4. Find **Service Settings** section
5. Set **Root Directory** to: `server`
6. Click **Save**
7. Railway will automatically redeploy

### Option 2: Redeploy

If you already set the root directory:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**

---

## The Fix Explained

I created a `nixpacks.toml` file that tells Railway:
- Use Node.js 20
- Run `npm install` to install dependencies
- Run `npm start` to start the server

---

## After Railway Redeploys

1. Wait 2-3 minutes for deployment
2. Check the logs - you should see:
   ```
   🚀 Server running on port 5000
   📊 Environment: production
   ```
3. Go to **Settings** → **Networking** → **Generate Domain**
4. Test your API: `https://your-app.up.railway.app/health`

---

## Expected Response

When you visit the health endpoint, you should see:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production",
  "timestamp": "2024-..."
}
```

---

## If It Still Fails

### Check These:

1. **Root Directory is set to `server`**
   - Settings → Service Settings → Root Directory: `server`

2. **Environment Variables are set**
   - Variables tab → Make sure all variables from `server/.env` are added

3. **Check the logs**
   - Deployments tab → Click on deployment → View logs
   - Look for error messages

### Common Issues:

**"Cannot find module"**
- Make sure all dependencies are in `server/package.json`
- Railway should run `npm install` automatically

**"Firebase error"**
- Check all `FIREBASE_*` environment variables are set
- Make sure `FIREBASE_PRIVATE_KEY` includes the `\n` characters

**"Port already in use"**
- Make sure `PORT` environment variable is set to `5000`
- Railway will override this with its own port

---

## Quick Checklist

- [ ] Root Directory set to `server` in Railway Settings
- [ ] All environment variables added
- [ ] Deployment successful (check logs)
- [ ] Domain generated
- [ ] Health endpoint returns success

---

## Next Steps

Once Railway is working:
1. Copy your Railway URL
2. Deploy frontend on Vercel (use Railway URL as `VITE_API_URL`)
3. Update `FRONTEND_URL` on Railway with Vercel URL
4. Test your app!

---

## Need Help?

Check the Railway logs for specific error messages. The logs will tell you exactly what's wrong.

**Railway Dashboard**: https://railway.app/dashboard
