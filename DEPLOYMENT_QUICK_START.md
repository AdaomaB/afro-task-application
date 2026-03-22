# 🚀 Quick Deployment Guide

## Step 1: Install Dependencies
```bash
cd server
npm install helmet compression
```

## Step 2: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

## Step 3: Deploy Backend on Render

1. Go to https://render.com → New Web Service
2. Connect GitHub repo
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables (see DEPLOYMENT_GUIDE.md)
5. Deploy!

Your API: `https://your-app.onrender.com`

## Step 4: Deploy Frontend on Vercel

```bash
cd client
npm install -g vercel
vercel --prod
```

Or use Vercel Dashboard:
1. Import GitHub repo
2. Root Directory: `client`
3. Framework: Vite
4. Add environment variables
5. Deploy!

Your App: `https://your-app.vercel.app`

## Step 5: Update CORS

On Render, set:
```
FRONTEND_URL=https://your-app.vercel.app
```

## Step 6: Test

- Visit `https://your-app.onrender.com/health`
- Visit `https://your-app.vercel.app`
- Test login, signup, and core features

## Done! 🎉

See DEPLOYMENT_GUIDE.md for detailed instructions.
