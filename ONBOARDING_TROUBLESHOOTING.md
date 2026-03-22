# Onboarding System Troubleshooting Guide

## Issue: White Screen on Freelancer Onboarding

### Problem
The FreelancerOnboarding page was showing a white screen due to JSX structure errors.

### Root Cause
1. `AnimatePresence` wrapper was causing rendering issues
2. Adjacent JSX elements without proper wrapper
3. Complex animation structure conflicting with conditional rendering

### Solution Applied
1. Removed `AnimatePresence` import and wrapper
2. Removed `motion.div` wrappers around each step
3. Simplified to basic conditional rendering: `{currentStep === X && <div>...</div>}`
4. Kept only the progress bar animation which works fine

### Files Fixed
- `client/src/pages/FreelancerOnboarding.jsx`

---

## How to Test

### 1. Start the Application
```bash
# Terminal 1 - Start server
cd server
npm start

# Terminal 2 - Start client
cd client
npm run dev
```

### 2. Test Freelancer Onboarding
1. Go to `http://localhost:5173/signup/freelancer`
2. Fill in signup form
3. Submit
4. Should redirect to `/freelancer/onboarding`
5. Should see Step 1: Professional Information form
6. Fill in all fields and click "Next Step"
7. Continue through all 5 steps
8. Upload intro video in Step 5
9. Click "Complete Onboarding"
10. Should redirect to `/freelancer/feed`

### 3. Test Client Onboarding
1. Go to `http://localhost:5173/signup/client`
2. Fill in signup form
3. Submit
4. Should redirect to `/client/onboarding`
5. Should see Step 1: Company Information form
6. Fill in all fields and click "Next Step"
7. Continue through all 3 steps
8. Click "Complete Profile"
9. Should redirect to `/client/feed`

---

## Common Issues & Solutions

### Issue: "Failed to fetch profile status"
**Cause**: Backend not running or API endpoint not working
**Solution**: 
1. Check if server is running on port 5000
2. Check browser console for API errors
3. Verify `/api/onboarding/status` endpoint exists

### Issue: "Failed to save" on any step
**Cause**: Backend validation failing or missing fields
**Solution**:
1. Check browser console for error details
2. Verify all required fields are filled
3. Check server logs for validation errors

### Issue: Video upload fails
**Cause**: File too large or wrong format
**Solution**:
1. Ensure video is less than 100MB
2. Use MP4, MOV, or AVI format
3. Check Cloudinary credentials in `.env`

### Issue: Profile completion widget not showing
**Cause**: Profile already 100% complete or API error
**Solution**:
1. Check browser console for errors
2. Verify `/api/onboarding/status` returns correct data
3. Widget auto-hides when profile is 100% complete

### Issue: Cannot apply to jobs
**Cause**: Profile not completed or no intro video
**Solution**:
1. Complete all onboarding steps
2. Upload introduction video
3. Verify profile completion is 100%

---

## API Endpoints

### Check Profile Status
```
GET /api/onboarding/status
Authorization: Bearer <token>

Response:
{
  success: true,
  profileCompleted: boolean,
  profileCompletionPercentage: number,
  profileStrength: 'basic' | 'professional' | 'elite',
  missingFields: string[]
}
```

### Update Professional Info (Step 1)
```
PUT /api/onboarding/professional-info
Authorization: Bearer <token>

Body:
{
  professionalTitle: string,
  yearsOfExperience: number,
  bio: string (min 150 chars),
  languages: string,
  availability: string,
  hourlyRate: number (optional)
}
```

### Update Skills (Step 2)
```
PUT /api/onboarding/skills
Authorization: Bearer <token>

Body:
{
  skills: string[]
}
```

### Update Social Links (Step 3)
```
PUT /api/onboarding/social-links
Authorization: Bearer <token>

Body:
{
  linkedin: string (required),
  github: string,
  portfolio: string,
  behance: string,
  dribbble: string,
  instagram: string
}
```

### Upload Intro Video (Step 5)
```
POST /api/onboarding/intro-video
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
{
  video: File (max 100MB)
}
```

### Update Hiring Preferences (Client)
```
PUT /api/onboarding/hiring-preferences
Authorization: Bearer <token>

Body:
{
  lookingFor: string,
  budgetRange: string,
  experienceLevel: string,
  projectDuration: string,
  location: string
}
```

### Complete Onboarding
```
POST /api/onboarding/complete
Authorization: Bearer <token>

Response:
{
  success: true,
  message: string,
  profileStrength: string
}
```

---

## Browser Console Debugging

### Check for Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common errors:
   - "Failed to fetch" - Backend not running
   - "401 Unauthorized" - Token expired, login again
   - "400 Bad Request" - Validation error, check fields
   - "500 Internal Server Error" - Server error, check logs

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests (red)
5. Click on request to see details
6. Check Response tab for error message

---

## Server Logs

### Check Server Console
Look for these messages:
- `✅ Firebase Firestore Connected` - Database connected
- `✅ Firebase Storage Connected` - Storage connected
- `🚀 Server running on port 5000` - Server started

### Common Server Errors
- `Error: Only image files are allowed` - Wrong file type
- `Error: File too large` - File exceeds size limit
- `Error: Bio must be at least 150 characters` - Validation error
- `Error: LinkedIn profile is required` - Missing required field

---

## Quick Fixes

### Reset Onboarding Progress
If you need to test onboarding again:
1. Go to Firebase Console
2. Open Firestore Database
3. Find your user document
4. Delete these fields:
   - `profileCompleted`
   - `profileCompletionPercentage`
   - `professionalTitle`
   - `skills`
   - `introVideoUrl`
5. Refresh browser
6. Should redirect to onboarding

### Skip Onboarding (Testing Only)
**NOT RECOMMENDED FOR PRODUCTION**
1. Go to Firebase Console
2. Find your user document
3. Set `profileCompleted: true`
4. Set `profileCompletionPercentage: 100`
5. Refresh browser

---

## Production Checklist

Before deploying to production:
- [ ] Test complete freelancer onboarding flow
- [ ] Test complete client onboarding flow
- [ ] Test video upload with large files
- [ ] Test profile completion widget
- [ ] Test apply button protection
- [ ] Test redirect after login
- [ ] Verify all API endpoints work
- [ ] Check error messages are user-friendly
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify Cloudinary uploads work
- [ ] Check Firestore data structure
- [ ] Test profile strength calculation
- [ ] Verify missing fields detection

---

## Support

If issues persist:
1. Check all files are saved
2. Restart both server and client
3. Clear browser cache
4. Check `.env` files have correct values
5. Verify Firebase credentials
6. Check Cloudinary credentials
7. Review server logs for errors
8. Check browser console for errors

---

**Last Updated**: March 4, 2026  
**Status**: ✅ All Issues Resolved
