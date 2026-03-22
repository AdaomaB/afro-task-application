# Firestore Index Setup Guide

## Required Indexes

Your application needs composite indexes for certain queries. Follow these steps:

### Option 1: Deploy via Firebase CLI (Recommended)

1. Install Firebase CLI if you haven't:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project (if not done):
```bash
firebase init firestore
```

4. Deploy the indexes:
```bash
firebase deploy --only firestore:indexes
```

This will read the `server/firestore.indexes.json` file and create all required indexes.

### Option 2: Create Manually via Firebase Console

If you see an error like "The query requires an index", Firebase provides a direct link to create it.

**For Profile Views Index:**
1. Click the link in the error message, or go to:
   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes

2. Create a composite index for `profileViews` collection:
   - Collection: `profileViews`
   - Fields:
     - `profileId` (Ascending)
     - `viewedAt` (Ascending)

3. Wait 2-5 minutes for the index to build

### Current Indexes in firestore.indexes.json

1. **jobs** - For fetching client's jobs sorted by date
2. **projects** (clientId) - For client's projects filtered by status
3. **projects** (freelancerId) - For freelancer's projects filtered by status  
4. **profileViews** - For profile view statistics

## Troubleshooting

### Index Build Time
- Small collections: 1-2 minutes
- Large collections: 5-10 minutes
- Very large collections: Up to 30 minutes

### Check Index Status
1. Go to Firebase Console
2. Navigate to Firestore Database > Indexes
3. Check if status shows "Building" or "Enabled"

### Temporary Workaround
The profile views feature has been made optional. If the index isn't ready:
- Dashboard stats will still work
- Profile views will show as 0
- No errors will be thrown

Once the index is created, profile views will start tracking automatically.

## Verification

After deploying indexes, verify they're working:

1. Check Firebase Console - all indexes should show "Enabled"
2. Refresh your application
3. Check browser console - no more index errors
4. Profile views should start counting

## Important Notes

- Indexes are project-wide, not per environment
- Once created, they persist even if you redeploy
- Deleting an index requires manual action in Firebase Console
- Index creation is free, but storage counts toward your quota
