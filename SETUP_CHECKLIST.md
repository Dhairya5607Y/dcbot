# LR7 Community Bot - Setup Checklist

Use this checklist to ensure you've completed all necessary steps for deploying your bot.

## ☐ Pre-Deployment Checklist

### Discord Setup
- [ ] Created Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Copied Bot Token
- [ ] Copied Application ID (Client ID)
- [ ] Enabled Privileged Gateway Intents:
  - [ ] Presence Intent
  - [ ] Server Members Intent
  - [ ] Message Content Intent
- [ ] Generated bot invite URL with proper permissions
- [ ] Invited bot to your Discord server
- [ ] Copied your Discord User ID (Owner ID)
- [ ] Copied your Discord Server ID (Guild ID)

### Database Setup
- [ ] Created MongoDB Atlas account
- [ ] Created a free cluster
- [ ] Created database user with read/write permissions
- [ ] Configured network access (0.0.0.0/0 for Render)
- [ ] Copied MongoDB connection string
- [ ] Replaced `<username>` and `<password>` in connection string

### Repository Setup
- [ ] Pushed code to GitHub repository
- [ ] Verified all files are committed
- [ ] Updated repository URL in package.json (optional)

## ☐ Render.com Deployment Checklist

### Service Creation
- [ ] Created Render.com account
- [ ] Connected GitHub account to Render
- [ ] Created new Web Service
- [ ] Selected correct repository
- [ ] Set branch to `main`
- [ ] Set build command to `npm install`
- [ ] Set start command to `node index.js`
- [ ] Selected instance type (Free or Starter)

### Environment Variables
- [ ] Added `DISCORD_TOKEN` with bot token
- [ ] Added `CLIENT_ID` with application ID
- [ ] Added `MONGO_URI` with MongoDB connection string
- [ ] Added `OWNER_ID` with your Discord user ID
- [ ] Added `MAIN_GUILD_ID` with your server ID
- [ ] Added `DASHBOARD_SECRET` with random secure string
- [ ] Added `PORT` set to `3001`
- [ ] Added `NODE_ENV` set to `production`

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Monitored deployment logs for errors
- [ ] Verified deployment completed successfully
- [ ] Noted service URL (e.g., https://lr7-community-bot.onrender.com)

## ☐ Post-Deployment Checklist

### Verification
- [ ] Bot appears online in Discord server
- [ ] Tested `/ping` command
- [ ] Tested basic moderation command
- [ ] Checked Render logs for errors
- [ ] Verified MongoDB connection in logs

### Configuration
- [ ] Created log channels in Discord
- [ ] Updated `settings.json` with log channel IDs
- [ ] Configured protection systems
- [ ] Set up auto-roles (if needed)
- [ ] Configured ticket system (if needed)
- [ ] Set up suggestion channels (if needed)
- [ ] Configured giveaway settings (if needed)

### Dashboard Setup (Optional)
- [ ] Updated `CALLBACK_URL` environment variable with Render URL
- [ ] Added OAuth2 redirect URL in Discord Developer Portal
- [ ] Tested dashboard access
- [ ] Verified authentication works

### Security
- [ ] Verified no tokens are committed to GitHub
- [ ] Confirmed all sensitive data uses environment variables
- [ ] Checked MongoDB security settings
- [ ] Reviewed bot permissions in Discord

## ☐ Maintenance Setup

### Monitoring
- [ ] Bookmarked Render dashboard
- [ ] Set up log monitoring
- [ ] Configured uptime monitoring (UptimeRobot for free tier)
- [ ] Tested manual restart process

### Backup
- [ ] Documented all environment variables
- [ ] Backed up `settings.json` configuration
- [ ] Noted MongoDB connection details (securely)
- [ ] Saved Discord bot token (securely)

### Updates
- [ ] Tested git push → auto-deploy workflow
- [ ] Verified deployment notifications
- [ ] Documented update process for team

## ☐ Feature Configuration

### Logging System
- [ ] Enabled desired log events in `settings.json`
- [ ] Created dedicated log channels
- [ ] Updated channel IDs in configuration
- [ ] Tested log events

### Protection Systems
- [ ] Configured anti-spam settings
- [ ] Set up channel protection
- [ ] Configured role protection
- [ ] Set protection log channel
- [ ] Tested protection triggers

### Ticket System
- [ ] Created ticket category
- [ ] Configured ticket sections
- [ ] Set up staff roles
- [ ] Created ticket panel
- [ ] Tested ticket creation

### Suggestion System
- [ ] Created suggestion channel
- [ ] Configured suggestion settings
- [ ] Tested suggestion submission
- [ ] Verified voting reactions

### Giveaway System
- [ ] Configured giveaway settings
- [ ] Set allowed channels
- [ ] Tested giveaway creation
- [ ] Verified winner selection

### Auto-Reply System
- [ ] Configured auto-reply triggers
- [ ] Set up response messages
- [ ] Tested auto-replies
- [ ] Configured cooldowns

### Temporary Channels
- [ ] Created parent voice channel
- [ ] Set up category for temp channels
- [ ] Configured channel settings
- [ ] Tested channel creation

### Rules System
- [ ] Created rules sections
- [ ] Configured rule embeds
- [ ] Set up rules channel
- [ ] Tested rules display

## ☐ Testing Checklist

### Basic Functionality
- [ ] Bot responds to commands
- [ ] Slash commands work
- [ ] Prefix commands work (if enabled)
- [ ] Bot has necessary permissions
- [ ] Commands show proper error messages

### Moderation Features
- [ ] Kick command works
- [ ] Ban command works
- [ ] Timeout command works
- [ ] Warn system works
- [ ] Message clear works
- [ ] Channel lock/unlock works

### Logging Features
- [ ] Message delete logs
- [ ] Message edit logs
- [ ] Member join/leave logs
- [ ] Role change logs
- [ ] Channel change logs
- [ ] Voice state logs

### Protection Features
- [ ] Anti-spam triggers correctly
- [ ] Channel protection works
- [ ] Role protection works
- [ ] Bot protection works
- [ ] Protection logs correctly

### Advanced Features
- [ ] Tickets create properly
- [ ] Suggestions post correctly
- [ ] Giveaways function
- [ ] Auto-replies trigger
- [ ] Temp channels create/delete
- [ ] Rules display correctly

## ☐ Documentation

- [ ] Documented custom configurations
- [ ] Created server-specific setup guide
- [ ] Noted any custom modifications
- [ ] Documented admin procedures
- [ ] Created troubleshooting guide for team

## ☐ Go-Live Checklist

- [ ] All features tested and working
- [ ] All configurations finalized
- [ ] Team trained on bot usage
- [ ] Announcement prepared for server
- [ ] Support channel created for bot questions
- [ ] Monitoring in place
- [ ] Backup procedures documented

---

## Quick Reference

### Important URLs
- **Render Dashboard:** https://dashboard.render.com
- **Discord Developer Portal:** https://discord.com/developers/applications
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Bot Invite URL:** [Your generated URL]
- **Service URL:** [Your Render URL]

### Important IDs
- **Bot Token:** [Stored in Render env vars]
- **Client ID:** [Your application ID]
- **Owner ID:** [Your Discord user ID]
- **Main Guild ID:** [Your server ID]
- **MongoDB URI:** [Stored in Render env vars]

### Support Resources
- **Deployment Guide:** RENDER_DEPLOYMENT.md
- **Configuration Guide:** README-CONFIG.md
- **Main README:** README.md

---

**Status:** ☐ Not Started | ⏳ In Progress | ✅ Complete

**Deployment Date:** _______________

**Deployed By:** _______________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
