# 🔑 Simple GitHub Authentication - Step by Step

## The Problem
You're logged in as `bspark23` but need to push to `AdaomaB/afro-task`.

## The Solution (2 minutes)

### Step 1: Get a Personal Access Token

1. Open your web browser
2. Go to: **https://github.com**
3. **Login as AdaomaB** (NOT bspark23)
4. Click your **profile picture** (top right corner)
5. Click **Settings**
6. Scroll down the left sidebar
7. Click **Developer settings** (at the very bottom)
8. Click **Personal access tokens**
9. Click **Tokens (classic)**
10. Click the green button **Generate new token**
11. Click **Generate new token (classic)**

### Step 2: Configure the Token

1. **Note**: Type `Afro Task Deploy`
2. **Expiration**: Select `No expiration` (or 90 days)
3. **Select scopes**: Check the box for **repo** ✅
   - This gives full control of private repositories
4. Scroll down
5. Click the green button **Generate token**

### Step 3: Copy the Token

You'll see a token that looks like:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT**: Copy this token NOW! You won't be able to see it again.

### Step 4: Use the Token in Terminal

Open your terminal (PowerShell) and run these commands:

**Replace `YOUR_TOKEN_HERE` with the token you just copied:**

```bash
git remote set-url origin https://YOUR_TOKEN_HERE@github.com/AdaomaB/afro-task.git
```

**Example (with a fake token):**
```bash
git remote set-url origin https://ghp_1234567890abcdefghijklmnop@github.com/AdaomaB/afro-task.git
```

### Step 5: Push to GitHub

```bash
git push -u origin main
```

**Done!** ✅ Your code is now on GitHub at: https://github.com/AdaomaB/afro-task

---

## Alternative: Use GitHub Desktop (If you have it)

1. Open GitHub Desktop
2. File → Options → Accounts
3. Sign out of current account
4. Sign in with AdaomaB account
5. Go back to your terminal and run: `git push -u origin main`

---

## Alternative: Clear Git Credentials

If you want to be prompted for credentials:

```bash
# Clear stored credentials
git credential-manager erase https://github.com

# Then try to push (it will ask for username and password)
git push -u origin main
```

When prompted:
- **Username**: AdaomaB
- **Password**: Use the Personal Access Token (NOT your GitHub password)

---

## Troubleshooting

### "I lost the token"
Generate a new one following Step 1-3 above.

### "Still getting 403 error"
Make sure:
1. You're logged into GitHub as AdaomaB (not bspark23)
2. The token has `repo` scope checked
3. You copied the entire token including `ghp_`
4. No spaces in the command

### "Token doesn't work"
- Make sure the token hasn't expired
- Make sure you selected the `repo` scope when creating it
- Try generating a new token

---

## Quick Reference

```bash
# Format:
git remote set-url origin https://TOKEN@github.com/AdaomaB/afro-task.git

# Then push:
git push -u origin main
```

---

## Security Note

- Never share your personal access token
- It's like a password
- If someone gets it, they can access your repositories
- You can delete tokens anytime from GitHub settings

---

## After Successful Push

Once pushed successfully, you can:
1. View your code at: https://github.com/AdaomaB/afro-task
2. Deploy on Railway (follow RAILWAY_DEPLOYMENT_GUIDE.md)
3. Deploy on Vercel

---

## Need Help?

If you're still stuck, you can:
1. Try the GitHub Desktop method
2. Use SSH keys instead (see PUSH_TO_GITHUB.md)
3. Ask AdaomaB to add bspark23 as a collaborator to the repo

---

That's it! Just get the token and run the two commands. 🚀
