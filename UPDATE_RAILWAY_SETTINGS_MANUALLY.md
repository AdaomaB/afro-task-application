# Update Railway Settings Manually - DO THIS NOW

## The Problem

Railway is still using the old health check settings:
- Path: `/health` (should be `/healthz`)
- Timeout: `100` seconds (should be `300`)

The `railway.json` file doesn't automatically update these settings - you need to change them manually in the Railway dashboard.

## Fix It Now (2 minutes)

You already have the Railway settings page open! Here's what to do:

### Step 1: Update Health Check Path

In the Railway settings page you have open:

1. Find the field that says `/health`
2. Click on it to edit
3. Change it to: `/healthz`
4. Press Enter or click outside to save

### Step 2: Update Health Check Timeout

1. Find the field that says `100`
2. Click on it to edit
3. Change it to: `300`
4. Press Enter or click outside to save

### Step 3: Wait for Redeploy

Railway will automatically redeploy with the new settings. Wait 2-3 minutes.

## Alternative: Disable Health Check Temporarily

If the above doesn't work, try disabling the health check entirely:

1. In Railway Settings, scroll down
2. Look for "Health Check" toggle or section
3. Turn it OFF/Disable it
4. Save changes
5. Railway will redeploy

This will allow Railway to accept any response from your app without checking a specific endpoint.

## After Making Changes

### Test the Endpoints:

Once Railway redeploys (2-3 minutes), test:

```bash
curl https://afro-task-production.up.railway.app/healthz
```

Should return: `OK`

```bash
curl https://afro-task-production.up.railway.app/health
```

Should return JSON with status information.

### In Browser:

Visit: `https://afro-task-production.up.railway.app/healthz`

Should show: `OK`

Visit: `https://afro-task-production.up.railway.app/health`

Should show JSON response.

## Why This Happened

Railway has two ways to configure settings:
1. **railway.json file** - Not always automatically applied
2. **Dashboard UI** - Always takes precedence

The dashboard settings override the file settings, so you need to update them manually.

## What to Expect

After updating these settings:
- ✅ Health check will use the simpler `/healthz` endpoint
- ✅ Longer timeout gives Firebase time to initialize
- ✅ Server will pass health checks
- ✅ No more 502 errors
- ✅ Ready to deploy frontend

## If It Still Doesn't Work

Try this nuclear option:

### Option 1: Restart Deployment
1. Railway Dashboard → Deployments tab
2. Click on the latest deployment
3. Click "Restart" or "Redeploy"

### Option 2: Disable Health Check Completely
1. Railway Settings → scroll to Health Check section
2. Toggle it OFF
3. Save and wait for redeploy

### Option 3: Check Recent Logs
1. Railway Dashboard → Deployments tab
2. Click on latest deployment
3. Look for error messages in logs
4. Share any error messages you see

## Quick Checklist

- [ ] Change health check path from `/health` to `/healthz`
- [ ] Change timeout from `100` to `300`
- [ ] Save changes
- [ ] Wait 2-3 minutes for redeploy
- [ ] Test: `curl https://afro-task-production.up.railway.app/healthz`
- [ ] If returns "OK", you're done! ✅
- [ ] If still fails, disable health check entirely

## Next Step

Once the health check passes and you can access the endpoints, proceed with frontend deployment to Vercel.
