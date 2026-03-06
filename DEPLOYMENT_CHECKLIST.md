# LR7 Community Bot - Deployment Checklist

Print this or keep it open while deploying!

---

## ☐ Part 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit - LR7 Community Bot"
git branch -M main
git remote add origin https://github.com/Dhairya5607Y/dcbot.git
git push -u origin main --force
```

- [ ] Code pushed successfully
- [ ] Verified at: https://github.com/Dhairya5607Y/dcbot

---

## ☐ Part 2: Discord Bot Setup

### Create Application
- [ ] Go to https://discord.com/developers/applications
- [ ] Click "New Application"
- [ ] Name: "LR7 Community Bot"

### Get Bot Token
- [ ] Click "Bot" → "Add Bot"
- [ ] Click "Reset Token" (if needed)
- [ ] **Copy Token:** `_________________________________`

### Enable Intents
- [ ] ✅ Presence Intent
- [ ] ✅ Server Members Intent
- [ ] ✅ Message Content Intent
- [ ] Click "Save Changes"

### Get Application ID
- [ ] Click "General Information"
- [ ] **Copy Application ID:** `_________________________________`

### Invite Bot
- [ ] OAuth2 → URL Generator
- [ ] Select: `bot` + `applications.commands`
- [ ] Select: `Administrator`
- [ ] Copy URL and invite to server
- [ ] Bot is in server: ✅

---

## ☐ Part 3: MongoDB Setup

### Create Cluster
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Wait for cluster to be ready

### Create User
- [ ] Database Access → Add New Database User
- [ ] **Username:** `_________________________________`
- [ ] **Password:** `_________________________________`
- [ ] Privileges: "Read and write to any database"

### Network Access
- [ ] Network Access → Add IP Address
- [ ] Allow Access from Anywhere (0.0.0.0/0)

### Get Connection String
- [ ] Database → Connect → Connect your application
- [ ] **Connection String:** 
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
- [ ] Replace username and password
- [ ] **Final URI:** `_________________________________`

---

## ☐ Part 4: Get Discord IDs

### Enable Developer Mode
- [ ] Discord Settings → Advanced → Developer Mode

### Get IDs
- [ ] Right-click your profile → Copy User ID
- [ ] **Owner ID:** `_________________________________`
- [ ] Right-click server icon → Copy Server ID
- [ ] **Main Guild ID:** `_________________________________`

---

## ☐ Part 5: Deploy to Render

### Create Service
- [ ] Go to https://render.com
- [ ] New + → Web Service
- [ ] Connect GitHub
- [ ] Select "dcbot" repository

### Configure Service
- [ ] **Name:** `lr7-community-bot`
- [ ] **Region:** (choose closest)
- [ ] **Branch:** `main`
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `node index.js`
- [ ] **Instance Type:** Free

### Add Environment Variables

Click "Advanced" and add these:

| Key | Value | Status |
|-----|-------|--------|
| `DISCORD_TOKEN` | (from Part 2) | [ ] |
| `CLIENT_ID` | (from Part 2) | [ ] |
| `MONGO_URI` | (from Part 3) | [ ] |
| `OWNER_ID` | (from Part 4) | [ ] |
| `MAIN_GUILD_ID` | (from Part 4) | [ ] |
| `DASHBOARD_SECRET` | `lr7-secret-2025` | [ ] |
| `PORT` | `3001` | [ ] |
| `NODE_ENV` | `production` | [ ] |

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-5 minutes)
- [ ] Check logs for success message

---

## ☐ Part 6: Verify Deployment

### Check Render Logs
- [ ] Logs show: "Bot initialization successful"
- [ ] Logs show: "Bot is now online and ready to serve!"

### Check Discord
- [ ] Bot is online (green status)
- [ ] Test `/ping` command
- [ ] Test `/user @YourName` command

---

## ☐ Part 7: Configure Logging (Optional)

### Create Channels
- [ ] Create `#bot-logs` channel
- [ ] Create `#mod-logs` channel
- [ ] Create `#protection-logs` channel

### Get Channel IDs
- [ ] **Bot Logs ID:** `_________________________________`
- [ ] **Mod Logs ID:** `_________________________________`
- [ ] **Protection Logs ID:** `_________________________________`

### Update settings.json
- [ ] Edit `settings.json` locally or on GitHub
- [ ] Update `logs.messageDelete.channelId`
- [ ] Update `logs.messageEdit.channelId`
- [ ] Update `protection.logChannelId`
- [ ] Push changes to GitHub
- [ ] Wait for Render to redeploy

### Test Logging
- [ ] Delete a message
- [ ] Check if log appears in `#bot-logs`

---

## ☐ Part 8: Dashboard Setup (Optional)

### Get Render URL
- [ ] **Service URL:** `_________________________________`

### Update Environment
- [ ] Update `CALLBACK_URL` in Render
- [ ] Value: `https://YOUR-SERVICE.onrender.com/auth/callback`

### Update Discord OAuth2
- [ ] Discord Developer Portal → OAuth2 → General
- [ ] Add Redirect: `https://YOUR-SERVICE.onrender.com/auth/callback`

### Test Dashboard
- [ ] Visit your Render URL
- [ ] Dashboard loads successfully

---

## ✅ Deployment Complete!

Your bot is now:
- ✅ Deployed on Render.com
- ✅ Connected to MongoDB
- ✅ Online in Discord
- ✅ Responding to commands
- ✅ Ready to use!

---

## 📝 Save Your Credentials

**IMPORTANT:** Save these somewhere safe (NOT in your code):

```
Discord Bot Token: _________________________________
Application ID: _________________________________
MongoDB URI: _________________________________
Owner ID: _________________________________
Main Guild ID: _________________________________
Render Service URL: _________________________________
```

---

## 🆘 Quick Troubleshooting

### Bot Offline?
1. Check Render logs
2. Verify DISCORD_TOKEN in Render environment
3. Check Discord intents are enabled

### Database Errors?
1. Verify MONGO_URI is correct
2. Check MongoDB allows 0.0.0.0/0
3. Verify username/password

### Commands Not Working?
1. Wait 1 hour for slash commands to register
2. Check bot has Administrator permission
3. Try kicking and re-inviting bot

---

## 📚 Full Guides

- **Complete Guide:** COMPLETE_DEPLOYMENT_GUIDE.md
- **Quick Start:** QUICKSTART.md
- **Render Guide:** RENDER_DEPLOYMENT.md
- **Git Commands:** DEPLOYMENT_COMMANDS.md

---

**Date Deployed:** _______________
**Deployed By:** _______________
**Notes:** _________________________________
