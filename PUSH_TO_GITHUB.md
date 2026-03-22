# 🔐 How to Push to AdaomaB/afro-task

## The Problem
You're currently logged into GitHub as `bspark23`, but you need to push to `AdaomaB/afro-task`.

## Solution: Use Personal Access Token

### Step 1: Create Personal Access Token
1. Go to https://github.com and login as **AdaomaB**
2. Click your profile picture → Settings
3. Scroll down → Developer settings
4. Personal access tokens → Tokens (classic)
5. Click "Generate new token" → "Generate new token (classic)"
6. Give it a name: "Afro Task Deployment"
7. Select scopes: Check **repo** (this gives full control of private repositories)
8. Click "Generate token"
9. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Update Git Remote with Token
Open your terminal and run:

```bash
git remote set-url origin https://YOUR_TOKEN_HERE@github.com/AdaomaB/afro-task.git
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

Example:
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/AdaomaB/afro-task.git
```

### Step 3: Push to GitHub
```bash
git push -u origin main
```

This should work now! ✅

---

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
# Logout current user
gh auth logout

# Login as AdaomaB
gh auth login
# Select: GitHub.com
# Select: HTTPS
# Select: Login with a web browser
# Follow the prompts and login as AdaomaB

# Then push
git push -u origin main
```

---

## Alternative: Use SSH

If you prefer SSH:

### 1. Generate SSH Key (if you don't have one)
```bash
ssh-keygen -t ed25519 -C "adaomab@email.com"
```

### 2. Add SSH Key to GitHub
```bash
# Copy the public key
cat ~/.ssh/id_ed25519.pub
```

1. Go to GitHub.com (logged in as AdaomaB)
2. Settings → SSH and GPG keys
3. New SSH key
4. Paste the key
5. Save

### 3. Change Remote to SSH
```bash
git remote set-url origin git@github.com:AdaomaB/afro-task.git
git push -u origin main
```

---

## After Successful Push

Once pushed, you'll see your code at:
https://github.com/AdaomaB/afro-task

Then follow **RAILWAY_DEPLOYMENT_GUIDE.md** to deploy!

---

## Quick Reference

```bash
# Check current remote
git remote -v

# Update remote with token
git remote set-url origin https://TOKEN@github.com/AdaomaB/afro-task.git

# Push
git push -u origin main

# If you need to add new changes later
git add .
git commit -m "Your message"
git push
```

---

## Need the Token Again?

If you lose the token, you'll need to generate a new one following Step 1 above.

**Security Tip**: Never share your personal access token! It's like a password.
