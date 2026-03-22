# Fix Vercel API URL

## The Problem

Your Vercel frontend is using the wrong Railway URL:
- ❌ Wrong: `https://afro-task.up.railway.app/api`
- ✅ Correct: `https://afro-task-production.up.railway.app/api`

That's why you're getting "Route not found" errors.

## Fix It Now

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com
2. Click on your `afro-task` project
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Update VITE_API_URL

1. Find the `VITE_API_URL` variable
2. Click the three dots (...) next to it
3. Click "Edit"
4. Change the value to:
   ```
   https://afro-task-production.up.railway.app/api
   ```
5. Make sure it's set for "Production" environment
6. Click "Save"

### Step 3: Redeploy

After updating the environment variable:

1. Go to the **Deployments** tab
2. Click on the latest deployment
3. Click the three dots (...) menu
4. Click "Redeploy"
5. Confirm the redeploy

OR

Simply push a small change to GitHub and Vercel will auto-deploy.

### Step 4: Wait and Test

1. Wait 2-3 minutes for the redeploy to complete
2. Visit: https://afro-task.vercel.app
3. Try logging in or signing up
4. Check browser console (F12) for any errors

## Verify Your Railway URL

To confirm your correct Railway URL:

1. Go to Railway Dashboard
2. Click on your backend service
3. Go to **Settings** → **Networking**
4. Look at the "Public Networking" section
5. Copy the exact domain shown

It should be: `https://afro-task-production.up.railway.app`

## Test Backend Directly

Test these URLs to make sure backend is working:

```bash
# Root endpoint
curl https://afro-task-production.up.railway.app/

# Health check
curl https://afro-task-production.up.railway.app/health

# API test (should return 404 because /api alone doesn't exist)
curl https://afro-task-production.up.railway.app/api
```

The first two should return JSON responses. The third will return "Route not found" which is expected - the API routes are like `/api/auth/login`, not just `/api`.

## After Fixing

Once you update the Vercel environment variable and redeploy:

✅ Frontend will connect to the correct backend
✅ Login/signup will work
✅ All API calls will succeed
✅ No more "Route not found" errors

## Quick Reference

**Correct URLs:**
- Frontend: `https://afro-task.vercel.app`
- Backend: `https://afro-task-production.up.railway.app`
- API Base: `https://afro-task-production.up.railway.app/api`

**Vercel Environment Variable:**
```
VITE_API_URL=https://afro-task-production.up.railway.app/api
```

**Railway Environment Variable:**
```
FRONTEND_URL=https://afro-task.vercel.app
```
