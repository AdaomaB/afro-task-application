# Complete Deployment Checklist

## Current Status
- ❌ Backend on Railway: CRASHED (missing FIREBASE_PROJECT_ID)
- ❌ Frontend: Getting 404 errors (can't connect to crashed backend)

## Fix Steps (Do These Now)

### 1. Fix Railway Backend (URGENT - 2 minutes)

Go to Railway Dashboard → Your Service → Variables tab

Add this ONE missing variable:
```
FIREBASE_PROJECT_ID=my-p-2456
```

Railway will auto-redeploy. Wait 1-2 minutes and check logs for:
```
✅ Firebase Firestore Connected
✅ Firebase Storage Connected
🚀 Server running on port 3001
```

### 2. Get Railway Backend URL (1 minute)

Once backend is running:
1. Go to Railway → Settings → Networking
2. Click "Generate Domain"
3. Copy the URL (something like: `https://afro-task-production.up.railway.app`)

### 3. Update Railway FRONTEND_URL (1 minute)

Before deploying frontend, add this to Railway Variables:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

(You'll get the actual Vercel URL in the next step)

### 4. Deploy Frontend to Vercel (5 minutes)

#### Option A: Using Vercel CLI (Recommended)
```bash
cd client
npm install -g vercel
vercel login
vercel
```

Follow prompts:
- Set up and deploy? Yes
- Which scope? Your account
- Link to existing project? No
- Project name? afro-task (or your choice)
- Directory? ./
- Override settings? No

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo: `AdaomaB/afro-task`
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables (see below)
6. Click "Deploy"

### 5. Add Frontend Environment Variables on Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
VITE_API_URL=https://your-railway-url.up.railway.app/api
VITE_FIREBASE_API_KEY=AIzaSyBb1sqr8CjjbN1p2kgOmqcMZpUPg8HuACY
VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-p-2456
VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=138959313797
VITE_FIREBASE_APP_ID=1:138959313797:web:d395fd5f45ed9bf6e442ec
```

Replace `your-railway-url` with your actual Railway URL from Step 2.

### 6. Update Railway FRONTEND_URL (1 minute)

Now that you have your Vercel URL:
1. Go back to Railway → Variables
2. Update `FRONTEND_URL` with your actual Vercel URL
3. Railway will auto-redeploy

### 7. Test Everything (2 minutes)

Test backend health:
```
https://your-railway-url.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "Firestore",
  "environment": "production"
}
```

Test frontend:
```
https://your-app-name.vercel.app
```

Should load the Afro Task welcome page.

## Complete Railway Environment Variables

Here's what should be in Railway Variables tab:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=afro_task_super_secret_jwt_key_2024_change_this_in_production

FIREBASE_PROJECT_ID=my-p-2456
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-sscw2@my-p-2456.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDRclOJEED7BK9G\npRh4qIwmpmFH3puwwgk+pNlTnsN0Moq0YqCb1zaDNWtsN3Cuucet7xSTmL/UdP9x\n9oLtUTO62zT8EeSvUnInaIvpZy3nvcdogB8v6rdK6TulPX2dFJPZNfrLJiz8r0yj\nLnjQFwPeNF1P0zxImqdtKHtDLkkASFguZ5ulRjYpnF6RD16GGzOAW0gbgSbnPGDH\n/937iQTAVKCvfxWoejLmcEOcj/iTifdRB2D3BiZy7gSmSEqW/HlGOH0ETwd9iI4P\naE2KWoBmIW1jEfWYUauTKoHEJYRgu3uWOexB8JFuipbPBg3poB2L/e9jLBBJ1TBZ\nNbDqRPjfAgMBAAECggEAYh4SRyPvpQhpSgl+gMvIuDR6Xy5INlJ3/TpBuzwlaTJi\nKyYHAmqcFXR5if0g0yGiCvf05j4JI7DZmBw48o73UmJtnGaPgJh5dL+zx5g395e+\nqlRXB94HltbTQ9IeHe+tYXS5s+CC8671kn5rR2R4weg7DHGzDHoy097Ce9LbjP79\nrihQQnB815Fi/ajPbaSbEpXZ8ceD+UubShPYrCM1/mfSDP1Ipm8Y7oFIew3H9q/8\nXRNpDDwxb7mlCiIKNLOnA12QeDY9cz78ifG6JkqsKOLnuREPYjeg16Go3MIzFhVS\nVIQL+y7hmcI6Q0vu0K3gN3SllWZvNvRRZi7lPI12OQKBgQD3bv32j42Fat/mNTrc\n1QIPtAVmf4i2bkVOQWWzsneWNbquHv0yNnSUHFfsZh8Fn1SmIOKSc14vpjS3VbXE\nzHbZDFbsBucbUpT3vG0At7xx0/voYd6vXxdxHC/v/DNEYTCuV7ivcEfeNo0znLNy\n1BKcZxcm7+HWylVa8Dlu/CFheQKBgQDYsqew9fIynD0QUyjtc/HFzW/QNc8sxVTO\nqZ0jz5ImXzoOio8w7pHks5aLxDly5MymRrrnhiJ/uXlcfg2hpcSHVPA9NCqVkNR+\nyir5TjwpLqgtLmM8qDo/rI+gPYzIJyEZ7vD3poFGIpuGMlVjzuzgEcMOl5pzfPGA\n2L79/WAvFwKBgQCs9V37It+HOmzmK6FIynDVbz4zJsT22OADUr13vjHPwyEKI8lT\ndzNIcQOY0M2wjW6LbgNS4egdoK3K1dPojBArqm98L1sPA0v0XDdJwCWu38J/7yHN\nLshhHZX4yC9CBjoUNGd54x+pmjJbuJbLlqinwXwykI4qKWc+2RsclIv06QKBgQC3\nM/vACX71ONALcDMm5aJfF7tTbVq1QDPd8Nowf3nRRSsBRjWfKeNgVlCN45yqPTOj\n1CKKQQYDs9wdzVha9Jm9zJq7M9JY1rRAaU2BrpoAOzjl0dUGYDe2w349/Ct8wFAk\n67T/ut6KXBHel8lHc5ciLQIa4SMsRlKrGxQGCeP6iwKBgQC0+GviYs9RXhrWgUKI\ns6JqIpNOi8AETXgLWlvCro1vJRFlqBds1k6W2Oen1P9ZIGoiTIoDZcxW2Kn+z1y/\nfMtFKsNNLnJKYqdeTavKGDznRDz+VDTIm/ie2oXwEnX6jDtjF433k7naifW4rMwT\nrdTltDAw/3Oz3QGRbBVxXGBCBw==\n-----END PRIVATE KEY-----\n
FIREBASE_STORAGE_BUCKET=my-p-2456.appspot.com

CLOUDINARY_CLOUD_NAME=dnpiihfzx
CLOUDINARY_API_KEY=842318194222523
CLOUDINARY_API_SECRET=LQvFnp-lzSoJ9xluI9ZMMP44cIs

FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Troubleshooting

### Backend still crashing?
Check Railway logs for error messages. Most common issues:
- Missing environment variables
- Typo in FIREBASE_PRIVATE_KEY (must include `\n` for newlines)
- Wrong Firebase credentials

### Frontend can't connect to backend?
- Check VITE_API_URL in Vercel environment variables
- Make sure Railway backend is running (check health endpoint)
- Check browser console for CORS errors

### CORS errors?
- Make sure FRONTEND_URL is set correctly on Railway
- Redeploy Railway after updating FRONTEND_URL

## Success Indicators

✅ Railway logs show: "Firebase Firestore Connected"
✅ Railway health endpoint returns 200 OK
✅ Vercel deployment succeeds
✅ Frontend loads without errors
✅ Can login/signup on production site
✅ Can create posts/jobs on production site

## Estimated Total Time: 15 minutes
