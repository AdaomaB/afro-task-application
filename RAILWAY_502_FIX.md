# Railway 502 Error Fix

## What Was Wrong

The 502 "Application failed to respond" error meant Railway's proxy couldn't connect to your application, even though the server was starting. This can happen when:

1. The server doesn't properly bind to the host/port
2. The health check times out before the server is ready
3. The health check endpoint is too complex

## What I Fixed

### 1. Improved Server Startup
- Added explicit HOST binding to `0.0.0.0`
- Added server error handling
- Added graceful shutdown handling
- Added more detailed startup logging

### 2. Added Simpler Health Check
- Created `/healthz` endpoint that just returns "OK"
- Kept `/health` for detailed status
- Railway now uses the simpler `/healthz` endpoint

### 3. Increased Health Check Timeout
- Changed from 100 seconds to 300 seconds
- Gives Firebase more time to initialize
- Prevents premature timeout failures

## Changes Pushed to GitHub

The following files were updated and pushed:
- `server/server.js` - Better server startup and error handling
- `server/railway.json` - Updated health check configuration

## Railway Will Auto-Redeploy

Railway is connected to your GitHub repo and will automatically:
1. Detect the new commit
2. Rebuild the application
3. Redeploy with the new configuration

**Wait 2-3 minutes** for the deployment to complete.

## How to Monitor the Deployment

### In Railway Dashboard:

1. Go to your Railway project
2. Click on your backend service
3. Go to **Deployments** tab
4. You should see a new deployment starting
5. Click on it to see live logs

### What to Look For in Logs:

✅ Good signs:
```
✅ Firebase Firestore Connected
✅ Firebase Storage Connected
🚀 Server running on port 8080
🌐 Server is listening on 0.0.0.0:8080
✅ Server ready to accept connections
```

❌ Bad signs:
```
❌ Server error: [error message]
❌ Firebase Initialization Error
Error: EADDRINUSE (port already in use)
```

## Test After Deployment

Once the new deployment is complete (2-3 minutes), test these endpoints:

### Test 1: Simple Health Check
```bash
curl https://afro-task-production.up.railway.app/healthz
```

Expected: `OK`

### Test 2: Detailed Health Check
```bash
curl https://afro-task-production.up.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production",
  "timestamp": "2026-03-06T...",
  "uptime": 123.456
}
```

### Test 3: API Root
```bash
curl https://afro-task-production.up.railway.app/
```

Expected:
```json
{
  "message": "Afro Task API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test 4: Browser
Visit in browser:
```
https://afro-task-production.up.railway.app/health
```

Should show JSON response, not an error page.

## If It Still Doesn't Work

### Check Railway Logs
Look for specific error messages in the deployment logs.

### Common Issues:

**Issue: Port binding error**
```
Error: listen EADDRINUSE: address already in use
```
Solution: Railway should handle this automatically. If not, restart the deployment.

**Issue: Firebase initialization fails**
```
❌ Firebase Initialization Error
```
Solution: Check that all Firebase environment variables are still set correctly.

**Issue: Health check still timing out**
```
Healthcheck failed after 300s
```
Solution: There might be a code error preventing the server from starting. Check logs for errors.

### Manual Railway Configuration

If automatic deployment doesn't work, manually configure in Railway:

1. Go to Settings → Deploy
2. Set **Start Command:** `node server.js`
3. Set **Health Check Path:** `/healthz`
4. Set **Health Check Timeout:** 300

## What Changed in the Code

### server.js - Before:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### server.js - After:
```javascript
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server ready to accept connections`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### railway.json - Before:
```json
{
  "healthcheckPath": "/health",
  "healthcheckTimeout": 100
}
```

### railway.json - After:
```json
{
  "healthcheckPath": "/healthz",
  "healthcheckTimeout": 300
}
```

## Timeline

- ✅ Changes committed and pushed to GitHub
- ⏳ Railway auto-deployment in progress (2-3 minutes)
- ⏳ Test endpoints after deployment
- ⏳ Deploy frontend once backend is confirmed working

## Next Steps

1. **Wait 2-3 minutes** for Railway to redeploy
2. **Check Railway logs** to confirm successful startup
3. **Test the endpoints** using curl or browser
4. **If working:** Proceed with frontend deployment
5. **If not working:** Check logs and report specific error messages

## Expected Result

After this fix, you should be able to:
- ✅ Access `https://afro-task-production.up.railway.app/healthz` and get "OK"
- ✅ Access `https://afro-task-production.up.railway.app/health` and get JSON
- ✅ Access `https://afro-task-production.up.railway.app/` and get API info
- ✅ No more 502 errors
- ✅ Ready to deploy frontend
