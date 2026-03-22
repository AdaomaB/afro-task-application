# Pre-Acceptance Workflow Testing Guide

## Prerequisites
1. Server running on port 5000
2. Client running on port 5173 (or configured port)
3. Firebase project configured
4. At least 2 test accounts:
   - 1 Client account
   - 1 Freelancer account

---

## Test Scenario 1: Complete Application Flow

### Step 1: Freelancer Applies for Job
1. Login as Freelancer
2. Navigate to "Explore Jobs" (`/freelancer/jobs`)
3. Click "Apply" on any open job
4. Fill in the application form:
   - Proposal message: "I am experienced in..."
   - Proposed budget: "$500 - $1000"
   - Upload CV: Select a PDF/DOC/DOCX file
   - Portfolio link (optional): "https://myportfolio.com"
5. Click "Submit Application"
6. ✅ Verify: Success toast appears
7. ✅ Verify: Modal closes
8. Navigate to "My Applications" (`/freelancer/applications`)
9. ✅ Verify: Application appears with status "pending"

### Step 2: Client Reviews Application
1. Login as Client
2. Navigate to "My Jobs" (`/client/jobs`)
3. Click "View Applicants" on the job
4. ✅ Verify: Application appears in modal
5. ✅ Verify: Can see proposal message and budget
6. Click "View Profile"
7. ✅ Verify: Navigates to freelancer's public profile
8. Go back to applicants modal
9. Click "Download CV"
10. ✅ Verify: CV opens in new tab

### Step 3: Client Starts Chat
1. In applicants modal, click "Start Chat"
2. ✅ Verify: Success toast appears
3. ✅ Verify: Navigates to `/pre-project-chat/:applicationId`
4. ✅ Verify: Chat interface loads
5. ✅ Verify: Freelancer name and job title visible in header
6. ✅ Verify: "Accept & Start Project" button visible (client only)

### Step 4: Pre-Project Chat
**As Client:**
1. Type a message: "Hello, I'd like to discuss the project"
2. Click Send
3. ✅ Verify: Message appears on right side (green bubble)
4. Click file upload button (📎)
5. Select a PDF file
6. ✅ Verify: File name appears below input
7. Click Send
8. ✅ Verify: Message with file appears
9. Click "Download" on the file
10. ✅ Verify: File downloads/opens

**As Freelancer:**
1. Login as Freelancer
2. Navigate to "My Applications"
3. ✅ Verify: Application status is "chatting"
4. Click on the application or navigate to `/pre-project-chat/:applicationId`
5. ✅ Verify: Can see client's messages in real-time
6. ✅ Verify: "Accept & Start Project" button NOT visible
7. Type a reply: "Thank you! I'm ready to start"
8. Click Send
9. ✅ Verify: Message appears on right side

**Back to Client:**
1. ✅ Verify: Freelancer's message appears automatically (real-time)
2. ✅ Verify: No page refresh needed

### Step 5: Client Accepts Application
1. As Client, in the chat, click "Accept & Start Project"
2. ✅ Verify: Confirmation dialog appears
3. Click "OK"
4. ✅ Verify: Success toast appears
5. ✅ Verify: Navigates to `/project/:projectId`
6. ✅ Verify: Project workspace loads

### Step 6: Project Workspace Verification
**Left Panel:**
1. ✅ Verify: Project title displayed
2. ✅ Verify: Status badge shows "ongoing"
3. ✅ Verify: Budget displayed
4. ✅ Verify: Start date displayed
5. ✅ Verify: Freelancer info displayed (name, profile image, country)
6. ✅ Verify: Contact Information section visible
7. ✅ Verify: Email displayed with mailto: link
8. ✅ Verify: WhatsApp displayed with wa.me link
9. ✅ Verify: "Mark as Completed" button visible (client only)

**Right Panel:**
1. ✅ Verify: All previous chat messages visible
2. ✅ Verify: Messages migrated from pre-project chat
3. Type a new message
4. ✅ Verify: Message sends successfully
5. Upload a file
6. ✅ Verify: File uploads and displays

**As Freelancer:**
1. Navigate to "My Projects" → "Ongoing" (`/freelancer/projects/ongoing`)
2. ✅ Verify: Project appears in list
3. Click "Open Workspace"
4. ✅ Verify: Navigates to project workspace
5. ✅ Verify: Contact information visible (client email and WhatsApp)
6. ✅ Verify: Can see all messages
7. ✅ Verify: "Mark as Completed" button NOT visible
8. Send a message
9. ✅ Verify: Client sees it in real-time

### Step 7: Other Applications Auto-Rejected
1. Login as another Freelancer (if available)
2. Check if they had applied to the same job
3. Navigate to "My Applications"
4. ✅ Verify: Their application status is "rejected"
5. ✅ Verify: Rejection reason: "Another candidate was selected"

### Step 8: Complete Project
1. Login as Client
2. Navigate to project workspace
3. Click "Mark as Completed"
4. ✅ Verify: Confirmation dialog appears
5. Click "OK"
6. ✅ Verify: Success toast appears
7. ✅ Verify: Status badge changes to "completed"
8. Navigate to "My Projects" → "Completed"
9. ✅ Verify: Project appears in completed list

---

## Test Scenario 2: Reject Application

### Step 1: Apply
1. Freelancer applies for a job (follow Step 1 from Scenario 1)

### Step 2: Reject Without Chat
1. Login as Client
2. Navigate to "My Jobs"
3. Click "View Applicants"
4. Click "Reject" (without starting chat)
5. ✅ Verify: Success toast appears
6. ✅ Verify: Application status changes to "rejected"
7. ✅ Verify: Application removed from pending list

### Step 3: Freelancer View
1. Login as Freelancer
2. Navigate to "My Applications"
3. ✅ Verify: Application status is "rejected"

---

## Test Scenario 3: Reject After Chat

### Step 1: Start Chat
1. Client starts chat with freelancer
2. Exchange a few messages

### Step 2: Reject
1. Go back to "My Jobs"
2. Click "View Applicants"
3. ✅ Verify: Application status is "chatting"
4. Click "Reject"
5. ✅ Verify: Success toast appears
6. ✅ Verify: Application status changes to "rejected"

### Step 3: Chat Deactivated
1. Try to access the pre-project chat URL
2. ✅ Verify: Chat is marked as inactive (or shows error)

---

## Test Scenario 4: File Upload Validation

### CV Upload
1. Try to upload a .txt file as CV
2. ✅ Verify: Error message appears
3. Try to upload a file > 10MB
4. ✅ Verify: Error message appears
5. Upload a valid PDF
6. ✅ Verify: Upload succeeds

### Chat File Upload
1. In chat, try to upload a .exe file
2. ✅ Verify: Error or file type not accepted
3. Upload a valid PDF
4. ✅ Verify: Upload succeeds
5. Upload a valid image
6. ✅ Verify: Upload succeeds
7. Upload a valid ZIP
8. ✅ Verify: Upload succeeds

---

## Test Scenario 5: Real-Time Sync

### Two Browser Windows
1. Open two browser windows
2. Login as Client in Window 1
3. Login as Freelancer in Window 2
4. Navigate both to the same pre-project chat
5. Send a message from Window 1
6. ✅ Verify: Message appears in Window 2 immediately (no refresh)
7. Send a message from Window 2
8. ✅ Verify: Message appears in Window 1 immediately
9. Upload a file from Window 1
10. ✅ Verify: File appears in Window 2 immediately

---

## Test Scenario 6: Security & Access Control

### Unauthorized Access
1. Login as Freelancer A
2. Get the application ID of Freelancer B's application
3. Try to access `/pre-project-chat/{freelancerB_applicationId}`
4. ✅ Verify: Access denied or error
5. Try to access a project that doesn't belong to you
6. ✅ Verify: Access denied or error

### Role Restrictions
1. Login as Freelancer
2. Try to access `/client/jobs`
3. ✅ Verify: Redirected or access denied
4. Login as Client
5. Try to access `/freelancer/applications`
6. ✅ Verify: Redirected or access denied

---

## Test Scenario 7: Contact Unlock Logic

### Before Acceptance
1. Start a pre-project chat
2. ✅ Verify: No contact information visible in chat interface

### After Acceptance
1. Accept the application
2. Navigate to project workspace
3. ✅ Verify: Contact information section visible
4. ✅ Verify: Email and WhatsApp displayed
5. Click email link
6. ✅ Verify: Opens email client
7. Click WhatsApp link
8. ✅ Verify: Opens WhatsApp web/app

---

## Test Scenario 8: Navigation Flow

### Complete Journey
1. Start at Freelancer Dashboard
2. Navigate to Explore Jobs
3. Apply for a job
4. Navigate to My Applications
5. ✅ Verify: Application visible
6. Switch to Client account
7. Navigate to My Jobs
8. View Applicants
9. Start Chat
10. ✅ Verify: URL is `/pre-project-chat/:applicationId`
11. Accept Application
12. ✅ Verify: URL is `/project/:projectId`
13. Navigate to My Projects → Ongoing
14. Click "Open Workspace"
15. ✅ Verify: URL is `/project/:projectId`
16. ✅ Verify: Same project loads

---

## Performance Tests

### Message Load Time
1. Send 50 messages in a chat
2. Refresh the page
3. ✅ Verify: Messages load within 2 seconds
4. ✅ Verify: Pagination works (limit 50 messages)

### File Upload Speed
1. Upload a 5MB PDF
2. ✅ Verify: Upload completes within 10 seconds
3. ✅ Verify: File URL is accessible

### Real-Time Latency
1. Send a message
2. ✅ Verify: Appears in other window within 1 second

---

## Edge Cases

### Duplicate Application
1. Apply for a job
2. Try to apply again for the same job
3. ✅ Verify: Error message: "You have already applied for this job"

### Accept Without Chat
1. Try to accept an application with status "pending"
2. ✅ Verify: Error message: "Must start chat before accepting application"

### Deleted Job
1. Delete a job that has applications
2. ✅ Verify: Applications still accessible
3. ✅ Verify: Job data shows as null or deleted

---

## Browser Compatibility

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Mobile Responsiveness

Test on mobile devices:
- [ ] Application form
- [ ] Chat interface
- [ ] Project workspace
- [ ] File upload
- [ ] Navigation

---

## Error Handling

### Network Errors
1. Disconnect internet
2. Try to send a message
3. ✅ Verify: Error toast appears
4. Reconnect internet
5. ✅ Verify: Message sends successfully

### Invalid Data
1. Submit application with empty fields
2. ✅ Verify: Validation errors appear
3. Try to upload invalid file type
4. ✅ Verify: Error message appears

---

## Checklist Summary

- [ ] Freelancer can apply with CV
- [ ] Client can review applications
- [ ] Client can download CV
- [ ] Client can start chat
- [ ] Pre-project chat works in real-time
- [ ] File upload/download works
- [ ] Client can accept application
- [ ] Project is created on acceptance
- [ ] Chat migrates to project chat
- [ ] Contact info unlocks after acceptance
- [ ] Other applications auto-rejected
- [ ] Client can mark project as completed
- [ ] Security rules enforced
- [ ] Real-time sync works globally
- [ ] No mock data used

---

## Reporting Issues

If any test fails, report with:
1. Test scenario number
2. Step number
3. Expected behavior
4. Actual behavior
5. Browser/device
6. Screenshots/console errors
