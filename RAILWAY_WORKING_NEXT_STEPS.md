# Railway Backend is Working! 🎉

## Current Status
✅ Backend is running successfully on Railway
✅ Firebase connected
✅ Server listening on port 8080

## Why You See "Application failed to respond"

When you visit `afro-task-production.up.railway.app` in your browser, you're accessing the root path `/`. 

Your server IS working, but you need to:

### Option 1: Test the Correct Endpoints

Try these URLs in your browser:

1. **Health Check:**
   ```
   https://afro-task-production.up.railway.app/health
   ```
   Should return: `{"status":"healthy","database":"Firestore",...}`

2. **API Root:**
   ```
   https://afro-task-production.up.railway.app/
   ```
   Should return: `{"message":"Afro Task API","version":"1.0.0","status":"running"}`

3. **Test an API endpoint:**
   ```
   https://afro-task-production.up.railway.app/api/auth/test
   ```

### Option 2: Check Railway Settings

The "Application failed to respond" error usually means:

1. **Railway is checking the wrong path** - Go to Railway → Settings → Healthcheck Path
   - Make sure it's set to `/health` (not just `/`)
   - Or disable healthcheck if it's causing issues

2. **Railway hasn't generated a public domain yet** - Go to Railway → Settings → Networking
   - Click "Generate Domain" if you haven't already
   - The domain should be active

## Next Steps - Deploy Frontend

Now that your backend is working, let's deploy the frontend:

### 1. Get Your Railway URL

Your Railway backend URL is:
```
https://afro-task-production.up.railway.app
```

### 2. Deploy to Vercel

#### Quick Deploy (5 minutes):

```bash
cd client
npm install -g vercel
vercel login
vercel
```

When prompted:
- Project name: `afro-task` (or your choice)
- Framework: Vite (auto-detected)
- Build command: `npm run build` (default)
- Output directory: `dist` (default)

#### Add Environment Variables in Vercel:

After deployment, go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:

```
VITE_API_URL=https://afro-task-production.up.railway.app/api
VITE_FIREBASE_API_KEY=AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY
VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-p-2456
VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=138959313797
VITE_FIREBASE_APP_ID=1:138959313797:web:d395fd5f45ed9bf6e442ec
```

Then redeploy: `vercel --prod`

### 3. Update Railway FRONTEND_URL

Once you have your Vercel URL (e.g., `https://afro-task.vercel.app`):

1. Go to Railway → Variables
2. Update or add:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
3. Railway will auto-redeploy

## Testing Your Deployment

### Test Backend:
```bash
curl https://afro-task-production.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production",
  "timestamp": "2026-03-06T..."
}
```

### Test Frontend:
Visit your Vercel URL and try:
- Login/Signup
- Create a post
- Browse jobs

## Troubleshooting

### If backend still shows "failed to respond":
1. Check Railway logs for errors
2. Verify healthcheck path is `/health` in Railway settings
3. Try accessing `/health` endpoint directly in browser

### If frontend can't connect to backend:
1. Check CORS - make sure `FRONTEND_URL` is set on Railway
2. Check browser console for errors
3. Verify `VITE_API_URL` in Vercel environment variables

### If you get CORS errors:
1. Make sure `FRONTEND_URL` on Railway matches your Vercel URL exactly
2. Include the protocol (`https://`)
3. Don't include trailing slash

## You're Almost Done! 🚀

Backend: ✅ Running on Railway
Frontend: ⏳ Ready to deploy to Vercel

Total time remaining: ~10 minutes
