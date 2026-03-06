# Firebase Setup Guide for Afro Task

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `afro-task` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location (choose closest to your users)
5. Click "Enable"

## Step 3: Set Firestore Security Rules

In the Firestore console, go to the "Rules" tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users only
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Note: Since we're using custom JWT (not Firebase Auth), you may want to start with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**WARNING**: The above rule allows all access. This is OK for development but MUST be secured before production.

## Step 4: Generate Service Account Key

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Go to the "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" in the confirmation dialog
6. A JSON file will download automatically
7. Rename it to `serviceAccountKey.json`
8. Move it to your `server/` directory

## Step 5: Secure Your Service Account Key

The `serviceAccountKey.json` file contains sensitive credentials. NEVER commit it to Git.

Verify it's in `.gitignore`:
```
serviceAccountKey.json
firebase-service-account.json
```

## Step 6: Update Environment Variables

In your `server/.env` file:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

## Step 7: Test Connection

Start your server:
```bash
cd server
npm run dev
```

You should see:
```
✅ Firebase Firestore Connected
🚀 Server running on port 5000
```

## Firestore Collections Structure

Your Firestore will have the following structure:

```
afro-task (database)
└── users (collection)
    ├── [auto-generated-id] (document)
    │   ├── fullName: "John Doe"
    │   ├── email: "john@example.com"
    │   ├── password: "$2a$12$..." (hashed)
    │   ├── role: "freelancer"
    │   ├── whatsapp: "+234..."
    │   ├── profileImage: "https://res.cloudinary.com/..."
    │   ├── country: "Nigeria"
    │   ├── skillCategory: "Web Development"
    │   └── createdAt: "2024-01-01T00:00:00.000Z"
    └── [another-user-id] (document)
        └── ...
```

## Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
- Make sure the file is in the `server/` directory
- Check the path in `.env` is correct

### Error: "Permission denied"
- Check your Firestore security rules
- For development, you can temporarily allow all access

### Error: "Firebase app already initialized"
- Restart your server
- Make sure you're not initializing Firebase multiple times

## Production Considerations

Before deploying to production:

1. Update Firestore security rules to be more restrictive
2. Store service account key securely (use environment variables or secret managers)
3. Enable Firebase App Check for additional security
4. Set up proper backup strategies
5. Monitor Firestore usage and costs
