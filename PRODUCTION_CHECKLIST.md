# Production Deployment Checklist

## Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console.logs in production code (or minimal)
- [ ] Error handling implemented
- [ ] Security middleware added (helmet, compression)
- [ ] CORS configured properly
- [ ] Environment variables configured
- [ ] .gitignore includes sensitive files
- [ ] Dependencies updated and audited (`npm audit`)

### Firebase Setup
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Indexes created and deployed
- [ ] Authentication enabled
- [ ] Service account key downloaded
- [ ] Production domain added to authorized domains

### Cloudinary Setup
- [ ] Account created
- [ ] API credentials obtained
- [ ] Upload presets configured (if needed)

### Testing
- [ ] Authentication works (signup, login, logout)
- [ ] User roles work (freelancer, client, admin)
- [ ] Job posting works
- [ ] Job applications work
- [ ] Projects creation works
- [ ] Messaging system works
- [ ] File uploads work
- [ ] Real-time features work (likes, follows, notifications)
- [ ] Profile updates work
- [ ] Analytics display correctly

## Backend Deployment (Render)

### Setup
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created
- [ ] GitHub repository connected
- [ ] Root directory set to `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`

### Environment Variables
- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] FRONTEND_URL (will update after frontend deployment)
- [ ] JWT_SECRET (strong, 32+ characters)
- [ ] All Firebase variables set
- [ ] All Cloudinary variables set

### Verification
- [ ] Deployment successful
- [ ] Health endpoint works: `/health`
- [ ] API root works: `/`
- [ ] No errors in logs
- [ ] Database connection works

## Frontend Deployment (Vercel)

### Setup
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `client`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] VITE_API_URL (Render backend URL)
- [ ] All Firebase frontend variables set

### Verification
- [ ] Deployment successful
- [ ] Application loads
- [ ] No console errors
- [ ] API calls work
- [ ] Authentication works
- [ ] All pages accessible

## Post-Deployment

### Backend Updates
- [ ] Update FRONTEND_URL on Render with Vercel URL
- [ ] Redeploy backend
- [ ] Verify CORS works

### Firebase Updates
- [ ] Add Vercel domain to authorized domains
- [ ] Verify authentication works from production

### Final Testing
- [ ] Complete user signup flow
- [ ] Complete user login flow
- [ ] Test as freelancer:
  - [ ] View jobs
  - [ ] Apply to job
  - [ ] View applications
  - [ ] Create post
  - [ ] Update profile
  - [ ] Send messages
- [ ] Test as client:
  - [ ] Post job
  - [ ] View applications
  - [ ] Accept application
  - [ ] Create project
  - [ ] Send messages
  - [ ] Complete project
- [ ] Test real-time features:
  - [ ] Likes update immediately
  - [ ] Followers count updates
  - [ ] Notifications appear
  - [ ] Messages appear in real-time
- [ ] Test file uploads:
  - [ ] Profile images
  - [ ] Post media
  - [ ] Portfolio items
  - [ ] Chat files
  - [ ] CVs

### Performance
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Images load properly
- [ ] No memory leaks
- [ ] Mobile responsive

### Security
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] JWT tokens working
- [ ] Firebase rules protecting data
- [ ] No sensitive data exposed
- [ ] CORS properly configured
- [ ] Rate limiting considered

### Monitoring
- [ ] Render logs accessible
- [ ] Vercel logs accessible
- [ ] Firebase usage monitored
- [ ] Cloudinary usage monitored
- [ ] Error tracking set up (optional: Sentry)
- [ ] Analytics set up (optional: Google Analytics)

### Documentation
- [ ] README updated with production URLs
- [ ] API documentation available
- [ ] User guide created (if needed)
- [ ] Admin guide created (if needed)

### Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Environment variables documented
- [ ] Recovery plan documented

## Launch

- [ ] Announce to users
- [ ] Monitor for issues
- [ ] Respond to user feedback
- [ ] Plan for scaling

## Ongoing Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor user reports

### Weekly
- [ ] Review performance metrics
- [ ] Check resource usage
- [ ] Review security alerts

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize database
- [ ] Backup important data
- [ ] Review costs

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Feature planning
- [ ] User feedback review

---

## Emergency Contacts

- Render Support: https://render.com/docs/support
- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support
- Cloudinary Support: https://support.cloudinary.com

---

## Rollback Plan

If deployment fails:

1. **Backend**: Render keeps previous deployments, can rollback from dashboard
2. **Frontend**: Vercel keeps all deployments, can rollback instantly
3. **Database**: Firebase has automatic backups
4. **Files**: Cloudinary keeps all uploads

---

## Success Metrics

Track these after launch:
- [ ] User signups
- [ ] Active users
- [ ] Jobs posted
- [ ] Applications submitted
- [ ] Projects completed
- [ ] Messages sent
- [ ] Error rate
- [ ] Response times
- [ ] User satisfaction

---

## Notes

Add any deployment-specific notes here:

- Backend URL: ___________________________
- Frontend URL: ___________________________
- Deployment Date: ___________________________
- Deployed By: ___________________________
- Issues Encountered: ___________________________
- Resolutions: ___________________________
