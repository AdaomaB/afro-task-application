# Railway Settings Fix - URGENT

## Problem
Your Railway backend is crashing on startup because `FIREBASE_PROJECT_ID` is missing.

## Solution - Add Missing Environment Variable

### Step 1: Go to Railway Dashboard
1. Open your Railway project
2. Click on your backend service
3. Go to the **Variables** tab

### Step 2: Add the Missing Variable
Add this variable:

```
FIREBASE_PROJECT_ID=my-p-2456
```

### Step 3: Railway Will Auto-Redeploy
- Railway automatically redeploys when you add/change variables
- Wait 1-2 minutes for the deployment to complete
- Check the logs - you should see:
  ```
  ✅ Firebase Firestore Connected
  ✅ Firebase Storage Connected
  🚀 Server running on port XXXX
  ```

### Step 4: Verify It's Working
Once deployed, Railway will give you a URL like:
```
https://your-app-name.up.railway.app
```

Test the health endpoint:
```
https://your-app-name.up.railway.app/health
```

You should see:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production",
  "timestamp": "2026-03-06T..."
}
```

## Current Railway Variables (What You Should Have)

Make sure ALL these are set in Railway:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=afro_task_super_secret_jwt_key_2024_change_this_in_production

# Firebase (Environment Variables Method)
FIREBASE_PROJECT_ID=my-p-2456
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-sscw2@my-p-2456.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDRclOJEED7BK9G\npRh4qIwmpmFH3puwwgk+pNlTnsN0Moq0YqCb1zaDNWtsN3Cuucet7xSTmL/UdP9x\n9oLtUTO62zT8EeSvUnInaIvpZy3nvcdogB8v6rdK6TulPX2dFJPZNfrLJiz8r0yj\nLnjQFwPeNF1P0zxImqdtKHtDLkkASFguZ5ulRjYpnF6RD16GGzOAW0gbgSbnPGDH\n/937iQTAVKCvfxWoejLmcEOcj/iTifdRB2D3BiZy7gSmSEqW/HlGOH0ETwd9iI4P\naE2KWoBmIW1jEfWYUauTKoHEJYRgu3uWOexB8JFuipbPBg3poB2L/e9jLBBJ1TBZ\nNbDqRPjfAgMBAAECggEAYh4SRyPvpQhpSgl+gMvIuDR6Xy5INlJ3/TpBuzwlaTJi\nKyYHAmqcFXR5if0g0yGiCvf05j4JI7DZmBw48o73UmJtnGaPgJh5dL+zx5g395e+\nqlRXB94HltbTQ9IeHe+tYXS5s+CC8671kn5rR2R4weg7DHGzDHoy097Ce9LbjP79\nrihQQnB815Fi/ajPbaSbEpXZ8ceD+UubShPYrCM1/mfSDP1Ipm8Y7oFIew3H9q/8\nXRNpDDwxb7mlCiIKNLOnA12QeDY9cz78ifG6JkqsKOLnuREPYjeg16Go3MIzFhVS\nVIQL+y7hmcI6Q0vu0K3gN3SllWZvNvRRZi7lPI12OQKBgQD3bv32j42Fat/mNTrc\n1QIPtAVmf4i2bkVOQWWzsneWNbquHv0yNnSUHFfsZh8Fn1SmIOKSc14vpjS3VbXE\nzHbZDFbsBucbUpT3vG0At7xx0/voYd6vXxdxHC/v/DNEYTCuV7ivcEfeNo0znLNy\n1BKcZxcm7+HWylVa8Dlu/CFheQKBgQDYsqew9fIynD0QUyjtc/HFzW/QNc8sxVTO\nqZ0jz5ImXzoOio8w7pHks5aLxDly5MymRrrnhiJ/uXlcfg2hpcSHVPA9NCqVkNR+\nyir5TjwpLqgtLmM8qDo/rI+gPYzIJyEZ7vD3poFGIpuGMlVjzuzgEcMOl5pzfPGA\n2L79/WAvFwKBgQCs9V37It+HOmzmK6FIynDVbz4zJsT22OADUr13vjHPwyEKI8lT\ndzNIcQOY0M2wjW6LbgNS4egdoK3K1dPojBArqm98L1sPA0v0XDdJwCWu38J/7yHN\nLshhHZX4yC9CBjoUNGd54x+pmjJbuJbLlqinwXwykI4qKWc+2RsclIv06QKBgQC3\nM/vACX71ONALcDMm5aJfF7tTbVq1QDPd8Nowf3nRRSsBRjWfKeNgVlCN45yqPTOj\n1CKKQQYDs9wdzVha9Jm9zJq7M9JY1rRAaU2BrpoAOzjl0dUGYDe2w349/Ct8wFAk\n67T/ut6KXBHel8lHc5ciLQIa4SMsRlKrGxQGCeP6iwKBgQC0+GviYs9RXhrWgUKI\ns6JqIpNOi8AETXgLWlvCro1vJRFlqBds1k6W2Oen1P9ZIGoiTIoDZcxW2Kn+z1y/\nfMtFKsNNLnJKYqdeTavKGDznRDz+VDTIm/ie2oXwEnX6jDtjF433k7naifW4rMwT\nrdTltDAw/3Oz3QGRbBVxXGBCBw==\n-----END PRIVATE KEY-----\n
FIREBASE_STORAGE_BUCKET=my-p-2456.appspot.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=dnpiihfzx
CLOUDINARY_API_KEY=842318194222523
CLOUDINARY_API_SECRET=LQvFnp-lzSoJ9xluI9ZMMP44cIs

# Frontend URL (add this AFTER you deploy frontend to Vercel)
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Why This Happened
The Railway logs showed all other Firebase variables were set correctly, but `FIREBASE_PROJECT_ID` was missing. The Firebase initialization code checks for this variable and crashes the app if it's not found.

## Next Steps After Backend is Running
1. Get your Railway backend URL from Settings → Networking → Generate Domain
2. Deploy frontend to Vercel
3. Update `FRONTEND_URL` on Railway with your Vercel URL
4. Update frontend `.env` with `VITE_API_URL=https://your-railway-url.up.railway.app`
5. Redeploy frontend on Vercel

## Frontend 404 Error
The frontend 404 error you're seeing is because it's trying to connect to a backend that isn't running. Once you add the missing `FIREBASE_PROJECT_ID` and Railway redeploys successfully, the frontend will be able to connect.
