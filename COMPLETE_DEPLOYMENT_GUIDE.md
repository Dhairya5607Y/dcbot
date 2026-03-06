# LR7 Community Bot - Complete Deployment Guide

## 🚀 Full Deployment from Scratch

This guide will walk you through deploying your bot completely, including resetting tokens and setting up everything fresh.

---

## Part 1: Push to GitHub (5 minutes)

### Step 1: Push Your Code

Run these commands in your terminal:

```bash
git add .
git commit -m "Initial commit - LR7 Community Bot"
git branch -M main
git remote add origin https://github.com/Dhairya5607Y/dcbot.git
git push -u origin main --force
```

✅ **Done!** Your code is now on GitHub at: https://github.com/Dhairya5607Y/dcbot

---

## Part 2: Discord Bot Setup (5 minutes)

### Step 1: Create New Discord Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it **"LR7 Community Bot"**
4. Click **"Create"**

### Step 2: Create Bot & Get Token

1. Click **"Bot"** in the left sidebar
2. Click **"Add Bot"** → Confirm
3. Click **"Reset Token"** (if you want a fresh token)
4. **Copy the token** and save it somewhere safe (you'll need it soon!)

### Step 3: Enable Intents

Still in the Bot section, scroll down to **"Privileged Gateway Intents"** and enable:
- ✅ **Presence Intent**
- ✅ **Server Members Intent**
- ✅ **Message Content Intent**

Click **"Save Changes"**

### Step 4: Get Your Application ID

1. Click **"General Information"** in the left sidebar
2. Under **"Application ID"**, click **"Copy"**
3. Save this ID (you'll need it soon!)

### Step 5: Generate Bot Invite Link

1. Click **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select permissions:
   - ✅ **Administrator** (or select specific permissions)
4. **Copy the generated URL** at the bottom
5. Open the URL in your browser and invite the bot to your server

---

## Part 3: MongoDB Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account (or log in)
3. Click **"Build a Database"**

### Step 2: Create Free Cluster

1. Choose **"M0 FREE"** tier
2. Select your preferred cloud provider and region
3. Click **"Create Cluster"** (wait 1-3 minutes for it to be ready)

### Step 3: Create Database User

1. Click **"Database Access"** in the left sidebar (under Security)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username (e.g., `lr7bot`)
5. Click **"Autogenerate Secure Password"** and **copy it**
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Allow Network Access

1. Click **"Network Access"** in the left sidebar (under Security)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Save this complete connection string

---

## Part 4: Get Discord IDs (2 minutes)

### Step 1: Enable Developer Mode

1. Open Discord
2. Go to **Settings** → **Advanced**
3. Enable **"Developer Mode"**

### Step 2: Get Your User ID

1. Right-click your username anywhere in Discord
2. Click **"Copy User ID"**
3. Save this ID (this is your Owner ID)

### Step 3: Get Your Server ID

1. Right-click your server icon in the server list
2. Click **"Copy Server ID"**
3. Save this ID (this is your Main Guild ID)

---

## Part 5: Deploy to Render.com (10 minutes)

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

### Step 2: Create New Web Service

1. Click **"New +"** in the top right
2. Select **"Web Service"**
3. Click **"Connect account"** to connect GitHub (if not already connected)
4. Find and select **"dcbot"** repository
5. Click **"Connect"**

### Step 3: Configure Service

Fill in these settings:

**Basic Settings:**
- **Name:** `lr7-community-bot` (or any name you prefer)
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node index.js`

**Instance Type:**
- Select **"Free"** (or paid plan for 24/7 uptime)

### Step 4: Add Environment Variables

Click **"Advanced"** to expand, then scroll to **"Environment Variables"**.

Add these variables one by one (click "Add Environment Variable" for each):

| Key | Value | Where to Get It |
|-----|-------|-----------------|
| `DISCORD_TOKEN` | Your bot token | From Discord Developer Portal (Part 2, Step 2) |
| `CLIENT_ID` | Your application ID | From Discord Developer Portal (Part 2, Step 4) |
| `MONGO_URI` | Your MongoDB connection string | From MongoDB Atlas (Part 3, Step 5) |
| `OWNER_ID` | Your Discord user ID | From Discord (Part 4, Step 2) |
| `MAIN_GUILD_ID` | Your server ID | From Discord (Part 4, Step 3) |
| `DASHBOARD_SECRET` | Any random string | Generate: `lr7-secret-key-2025` or use random generator |
| `PORT` | `3001` | Just type: 3001 |
| `NODE_ENV` | `production` | Just type: production |

**Example Environment Variables:**
```
DISCORD_TOKEN=paste_your_actual_bot_token_here
CLIENT_ID=1234567890123456789
MONGO_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
OWNER_ID=987654321098765432
MAIN_GUILD_ID=876543210987654321
DASHBOARD_SECRET=lr7-secret-key-2025-random
PORT=3001
NODE_ENV=production
```

### Step 5: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Wait for deployment (2-5 minutes)
3. Watch the logs for any errors

---

## Part 6: Verify Deployment (3 minutes)

### Step 1: Check Render Logs

1. In Render dashboard, click on your service
2. Click **"Logs"** tab
3. Look for these success messages:
   ```
   ✓ Bot initialization successful
   ✓ Bot is now online and ready to serve!
   ```

### Step 2: Check Discord

1. Go to your Discord server
2. Check if the bot is **online** (green status)
3. If offline, check Render logs for errors

### Step 3: Test Commands

Try these commands in Discord:

```
/ping
```
Should respond with bot latency.

```
/user @YourName
```
Should show your user information.

✅ **Success!** Your bot is deployed and working!

---

## Part 7: Configure Bot Features (10 minutes)

### Step 1: Create Log Channels

In your Discord server, create these channels:
- `#bot-logs` (for general logs)
- `#mod-logs` (for moderation logs)
- `#protection-logs` (for protection system logs)

### Step 2: Get Channel IDs

1. Right-click each channel
2. Click **"Copy Channel ID"**
3. Save these IDs

### Step 3: Update settings.json

You need to update `settings.json` with your channel IDs. You can do this in two ways:

**Option A: Edit Locally and Push**

1. Open `settings.json` in your code editor
2. Find the `logs` section
3. Update channel IDs:
   ```json
   "logs": {
       "enabled": true,
       "messageDelete": {
           "enabled": true,
           "channelId": "YOUR_BOT_LOGS_CHANNEL_ID"
       },
       "messageEdit": {
           "enabled": true,
           "channelId": "YOUR_BOT_LOGS_CHANNEL_ID"
       }
   }
   ```
4. Update protection log channel:
   ```json
   "protection": {
       "enabled": true,
       "logChannelId": "YOUR_PROTECTION_LOGS_CHANNEL_ID"
   }
   ```
5. Save the file
6. Push to GitHub:
   ```bash
   git add settings.json
   git commit -m "Update log channel IDs"
   git push
   ```
7. Render will automatically redeploy

**Option B: Edit on GitHub**

1. Go to https://github.com/Dhairya5607Y/dcbot
2. Click on `settings.json`
3. Click the pencil icon (Edit)
4. Update the channel IDs
5. Click **"Commit changes"**
6. Render will automatically redeploy

### Step 4: Test Logging

1. Delete a message in your server
2. Check `#bot-logs` - you should see a log entry
3. If not, check Render logs for errors

---

## Part 8: Optional Dashboard Setup

If you want to use the web dashboard:

### Step 1: Get Your Render URL

1. In Render dashboard, find your service URL
2. It looks like: `https://lr7-community-bot.onrender.com`

### Step 2: Update Callback URL

1. In Render dashboard, go to **Environment**
2. Find `CALLBACK_URL` variable
3. Update it to: `https://YOUR-SERVICE-NAME.onrender.com/auth/callback`
4. Click **"Save Changes"**

### Step 3: Add OAuth2 Redirect

1. Go to Discord Developer Portal
2. Your Application → **OAuth2** → **General**
3. Under **"Redirects"**, click **"Add Redirect"**
4. Add: `https://YOUR-SERVICE-NAME.onrender.com/auth/callback`
5. Click **"Save Changes"**

### Step 4: Access Dashboard

Visit: `https://YOUR-SERVICE-NAME.onrender.com`

---

## 🎉 Deployment Complete!

Your LR7 Community Bot is now:
- ✅ Deployed on Render.com
- ✅ Connected to MongoDB
- ✅ Online in Discord
- ✅ Responding to commands
- ✅ Logging events
- ✅ Ready to moderate your server

---

## 📋 Quick Reference

### Important URLs
- **GitHub Repository:** https://github.com/Dhairya5607Y/dcbot
- **Render Dashboard:** https://dashboard.render.com
- **Discord Developer Portal:** https://discord.com/developers/applications
- **MongoDB Atlas:** https://cloud.mongodb.com

### Your Credentials Checklist
- [ ] Discord Bot Token
- [ ] Discord Application ID (Client ID)
- [ ] MongoDB Connection String
- [ ] Discord Owner ID (Your User ID)
- [ ] Discord Main Guild ID (Your Server ID)
- [ ] Log Channel IDs

### Common Commands
```bash
# Update bot code
git add .
git commit -m "Update description"
git push

# View Render logs
# Go to Render Dashboard → Your Service → Logs

# Restart bot
# Go to Render Dashboard → Your Service → Manual Deploy → Restart
```

---

## 🆘 Troubleshooting

### Bot Not Coming Online?

**Check:**
1. Render logs for errors (Dashboard → Logs)
2. Verify `DISCORD_TOKEN` is correct in Render environment variables
3. Ensure all intents are enabled in Discord Developer Portal
4. Check if bot is invited to your server

**Fix:**
- Go to Render → Environment → Edit `DISCORD_TOKEN`
- Or reset token in Discord Developer Portal and update Render

### Database Connection Errors?

**Check:**
1. Verify `MONGO_URI` is correct
2. Check MongoDB Atlas allows 0.0.0.0/0 connections
3. Verify username/password in connection string

**Fix:**
- Go to MongoDB Atlas → Database Access → Edit user
- Go to MongoDB Atlas → Network Access → Verify 0.0.0.0/0 is allowed

### Commands Not Working?

**Check:**
1. Bot has Administrator permission in Discord
2. Commands are enabled in `settings.json`
3. Wait up to 1 hour for slash commands to register

**Fix:**
- Kick and re-invite the bot with proper permissions
- Check `settings.json` → `commands` section

### Render Service Sleeping (Free Tier)?

**Issue:** Free tier services sleep after 15 minutes of inactivity.

**Solutions:**
1. **Upgrade to Starter Plan** ($7/month) for 24/7 uptime
2. **Use UptimeRobot** (free) to ping your service every 5 minutes:
   - Go to https://uptimerobot.com
   - Create free account
   - Add new monitor with your Render URL
   - Set interval to 5 minutes

---

## 🔄 Updating Your Bot

### Update Code
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push
```

Render will automatically detect the push and redeploy (takes 2-3 minutes).

### Update Environment Variables
1. Go to Render Dashboard
2. Click your service
3. Go to **Environment** tab
4. Edit variables
5. Click **"Save Changes"**
6. Service will automatically restart

### Update Settings
1. Edit `settings.json` locally or on GitHub
2. Push changes
3. Render will automatically redeploy

---

## 🎯 Next Steps

1. **Customize Bot:**
   - Update bot avatar in Discord Developer Portal
   - Customize embed colors in `settings.json`
   - Configure protection thresholds

2. **Enable Features:**
   - Set up ticket system
   - Configure suggestion channels
   - Enable giveaway system
   - Set up auto-roles

3. **Monitor Performance:**
   - Check Render logs regularly
   - Monitor bot uptime
   - Review protection logs

4. **Secure Your Bot:**
   - Never share your bot token
   - Rotate tokens periodically
   - Use strong MongoDB passwords

---

## 📚 Additional Resources

- **Full Deployment Guide:** RENDER_DEPLOYMENT.md
- **Quick Start Guide:** QUICKSTART.md
- **Configuration Guide:** README-CONFIG.md
- **Setup Checklist:** SETUP_CHECKLIST.md
- **Git Commands:** DEPLOYMENT_COMMANDS.md

---

**Need Help?** Check Render logs first, then review this guide. Most issues are related to incorrect environment variables or Discord permissions.

**Enjoy your LR7 Community Bot! 🤖✨**
