# Deploy Frontend to Vercel - Step by Step

## Your Backend is Ready! ✅

Railway logs confirm:
- ✅ Server running on port 8080
- ✅ Firebase connected
- ✅ All environment variables set

The browser error is a Railway UI issue - your API endpoints are working fine.

## Deploy Frontend (10 minutes)

### Step 1: Install Vercel CLI

Open terminal in your project root:

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Navigate to Client Folder

```bash
cd client
```

### Step 4: Deploy to Vercel

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `afro-task` (or your choice)
- **In which directory is your code located?** → `./`
- **Want to override settings?** → No

Vercel will build and deploy. You'll get a URL like:
```
https://afro-task-xxxxx.vercel.app
```

### Step 5: Add Environment Variables

Go to Vercel Dashboard:
1. Click on your project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_API_URL=https://afro-task-production.up.railway.app/api
```

```
VITE_FIREBASE_API_KEY=AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY
```

```
VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com
```

```
VITE_FIREBASE_PROJECT_ID=my-p-2456
```

```
VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app
```

```
VITE_FIREBASE_MESSAGING_SENDER_ID=138959313797
```

```
VITE_FIREBASE_APP_ID=1:138959313797:web:d395fd5f45ed9bf6e442ec
```

**Important:** Add each variable separately, one at a time.

### Step 6: Redeploy with Environment Variables

Back in terminal (still in `client` folder):

```bash
vercel --prod
```

This redeploys with the environment variables.

### Step 7: Update Railway FRONTEND_URL

1. Copy your Vercel URL (e.g., `https://afro-task.vercel.app`)
2. Go to Railway Dashboard → Your Service → Variables
3. Add or update:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
4. Railway will auto-redeploy (wait 1-2 minutes)

## Test Your Deployment

### Test Frontend:
Visit your Vercel URL: `https://your-app.vercel.app`

You should see the Afro Task welcome page.

### Test Login:
1. Click "Get Started" or "Login"
2. Try signing up with a test account
3. Check if you can create posts/jobs

### Check Browser Console:
Press F12 → Console tab
- No errors = everything working ✅
- CORS errors = check FRONTEND_URL on Railway
- 404 errors = check VITE_API_URL on Vercel

## Troubleshooting

### Frontend shows blank page:
- Check Vercel build logs for errors
- Verify all environment variables are set
- Check browser console for errors

### Can't connect to backend:
- Verify `VITE_API_URL` is correct (should end with `/api`)
- Check Railway is still running
- Test backend with curl: `curl https://afro-task-production.up.railway.app/health`

### CORS errors:
- Make sure `FRONTEND_URL` on Railway matches your Vercel URL exactly
- Include `https://` protocol
- No trailing slash
- Wait 2 minutes after updating for Railway to redeploy

### Login doesn't work:
- Check Firebase config in Vercel environment variables
- Verify all VITE_FIREBASE_* variables are set correctly
- Check browser console for Firebase errors

## Alternative: Deploy via Vercel Dashboard

If CLI doesn't work:

1. Go to https://vercel.com/new
2. Import your GitHub repo: `AdaomaB/afro-task`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add all environment variables (see Step 5 above)
5. Click **Deploy**

## Success Checklist

✅ Vercel deployment succeeds
✅ Frontend loads in browser
✅ Can access login/signup pages
✅ Can create an account
✅ Can login
✅ Can create posts/jobs
✅ No console errors

## Your URLs

**Backend (Railway):**
```
https://afro-task-production.up.railway.app
```

**Frontend (Vercel):**
```
https://your-app-name.vercel.app
```

**API Endpoint:**
```
https://afro-task-production.up.railway.app/api
```

## Estimated Time: 10 minutes

You're almost there! 🚀
