# Quick Start After Pulling from GitHub

## The problem
After cloning/pulling, the project won't run because:
1. `node_modules` is not in GitHub (it's in .gitignore)
2. `.env` files are not in GitHub (they contain secrets)

## Fix — run these commands in order

### Step 1: Install backend dependencies
```bash
cd server
npm install
```

### Step 2: Create backend .env file
Create a file called `.env` inside the `server/` folder.
Copy the contents of `server/.env.example` and fill in the real values.

Ask the project owner for:
- JWT_SECRET
- FIREBASE_BASE64_CREDENTIALS (or individual Firebase keys)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

Minimum working `.env` for local dev:
```
PORT=3001
NODE_ENV=development
USE_EMULATOR=false
FRONTEND_URL=http://localhost:5173
JWT_SECRET=any-random-string-for-local-dev
FIREBASE_PROJECT_ID=my-p-2456
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=my-p-2456.appspot.com
CLOUDINARY_CLOUD_NAME=your-value
CLOUDINARY_API_KEY=your-value
CLOUDINARY_API_SECRET=your-value
```

### Step 3: Start the backend
```bash
# still inside server/
npm run dev
```
Backend runs on http://localhost:3001

---

### Step 4: Install frontend dependencies
Open a NEW terminal tab/window:
```bash
cd client
npm install
```

### Step 5: Create frontend .env file
Create a file called `.env.local` inside the `client/` folder.
Copy from `client/.env.example` and fill in values:

```
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=your-value
VITE_FIREBASE_AUTH_DOMAIN=my-p-2456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-p-2456
VITE_FIREBASE_STORAGE_BUCKET=my-p-2456.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=138959313797
VITE_FIREBASE_APP_ID=1:138959313797:web:d395fd5f45ed9bf6e442ec
VITE_USE_EMULATOR=false
```

### Step 6: Start the frontend
```bash
# still inside client/
npm run dev
```
Frontend runs on http://localhost:5173

---

## Summary
You need TWO terminals running at the same time:
- Terminal 1: `cd server && npm run dev`
- Terminal 2: `cd client && npm run dev`

Then open http://localhost:5173 in your browser.

## Common errors

| Error | Fix |
|-------|-----|
| `Cannot find module 'express'` | Run `npm install` inside `server/` |
| `Cannot find module 'react'` | Run `npm install` inside `client/` |
| `Firebase credentials not found` | Create `server/.env` with Firebase keys |
| `VITE_API_URL not defined` | Create `client/.env.local` |
| White screen / blank page | Check browser console for errors, usually missing env vars |
| `CORS error` | Make sure backend is running on port 3001 |
