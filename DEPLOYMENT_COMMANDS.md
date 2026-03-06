# Git Deployment Commands for LR7 Community Bot

## Initial Setup (Already Done)

You've already initialized the Git repository with:
```bash
git init
```

## Push to GitHub - Step by Step

### Step 1: Add All Files
```bash
git add .
```

### Step 2: Commit Changes
```bash
git commit -m "Initial commit - LR7 Community Bot with Render deployment"
```

### Step 3: Set Main Branch
```bash
git branch -M main
```

### Step 4: Add Remote Repository
```bash
git remote add origin https://github.com/Dhairya5607Y/dcbot.git
```

### Step 5: Push to GitHub
```bash
git push -u origin main
```

If the repository already has content and you get an error, use:
```bash
git push -u origin main --force
```

## All Commands in One Block (Copy & Paste)

```bash
git add .
git commit -m "Initial commit - LR7 Community Bot with Render deployment"
git branch -M main
git remote add origin https://github.com/Dhairya5607Y/dcbot.git
git push -u origin main
```

## Future Updates

After making changes to your bot, use these commands to push updates:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## Common Git Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Discard All Local Changes
```bash
git reset --hard HEAD
```

### Pull Latest Changes
```bash
git pull origin main
```

## Troubleshooting

### If Remote Already Exists
```bash
git remote remove origin
git remote add origin https://github.com/Dhairya5607Y/dcbot.git
```

### If Push is Rejected
```bash
git pull origin main --rebase
git push origin main
```

Or force push (use with caution):
```bash
git push -u origin main --force
```

### If You Need to Change Commit Message
```bash
git commit --amend -m "New commit message"
git push --force
```

## Deploy to Render.com After Push

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `dcbot` repository
5. Configure:
   - Name: `lr7-community-bot`
   - Build Command: `npm install`
   - Start Command: `node index.js`
6. Add environment variables (see RENDER_DEPLOYMENT.md)
7. Click "Create Web Service"

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Check current status |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit with message |
| `git push` | Push to remote |
| `git pull` | Pull from remote |
| `git log` | View commit history |
| `git branch` | List branches |
| `git checkout -b name` | Create new branch |

---

**Repository URL:** https://github.com/Dhairya5607Y/dcbot
**Deployment Guide:** See RENDER_DEPLOYMENT.md
**Quick Start:** See QUICKSTART.md
