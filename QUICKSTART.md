# LR7 Community Bot - Quick Start Guide

Get your bot up and running in 15 minutes!

## 🚀 Fast Track Deployment

### Step 1: Get Your Credentials (5 minutes)

1. **Discord Bot Token:**
   - Go to https://discord.com/developers/applications
   - Click "New Application" → Name it "LR7 Community Bot"
   - Go to "Bot" → Click "Add Bot"
   - Copy the token (you'll need this!)
   - Enable these intents: Presence, Server Members, Message Content
   - Copy your Application ID from the "General Information" page

2. **MongoDB Database:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free account → Create free cluster (M0)
   - Create database user (save username & password!)
   - Network Access → Allow 0.0.0.0/0
   - Click "Connect" → "Connect your application" → Copy connection string
   - Replace `<username>` and `<password>` in the string

3. **Discord IDs:**
   - Enable Developer Mode in Discord (Settings → Advanced)
   - Right-click your profile → Copy ID (this is your Owner ID)
   - Right-click your server icon → Copy ID (this is your Guild ID)

### Step 2: Deploy to Render (5 minutes)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Fill in:
     - Name: `lr7-community-bot`
     - Build Command: `npm install`
     - Start Command: `node index.js`
   - Click "Advanced" and add environment variables:

   | Variable | Value |
   |----------|-------|
   | `DISCORD_TOKEN` | Your bot token |
   | `CLIENT_ID` | Your application ID |
   | `MONGO_URI` | Your MongoDB connection string |
   | `OWNER_ID` | Your Discord user ID |
   | `MAIN_GUILD_ID` | Your server ID |
   | `DASHBOARD_SECRET` | Any random string |
   | `PORT` | `3001` |
   | `NODE_ENV` | `production` |

   - Click "Create Web Service"

### Step 3: Invite Bot & Configure (5 minutes)

1. **Invite Bot to Server:**
   - Go to Discord Developer Portal → Your App → OAuth2 → URL Generator
   - Select: `bot` and `applications.commands`
   - Select: `Administrator` (or specific permissions)
   - Copy URL and open in browser → Select your server

2. **Basic Configuration:**
   - Create a log channel in your Discord server
   - Copy the channel ID (right-click channel → Copy ID)
   - Edit `settings.json` and update log channel IDs:
   ```json
   "logs": {
       "enabled": true,
       "messageDelete": {
           "enabled": true,
           "channelId": "YOUR_LOG_CHANNEL_ID"
       }
   }
   ```
   - Commit and push changes (Render will auto-deploy)

3. **Test the Bot:**
   - In Discord, type `/ping`
   - Bot should respond with latency info
   - Try `/user @someone` to test commands

## ✅ You're Done!

Your bot is now:
- ✅ Running on Render.com
- ✅ Connected to MongoDB
- ✅ Responding to commands
- ✅ Ready to moderate your server

## 🎯 Next Steps

### Essential Configuration

1. **Set Up Logging:**
   - Create dedicated channels for different log types
   - Update channel IDs in `settings.json`
   - Enable/disable specific log events

2. **Configure Protection:**
   - Edit protection settings in `settings.json`
   - Set thresholds for anti-spam, anti-raid, etc.
   - Create a protection log channel

3. **Enable Features:**
   - Ticket system: Configure sections and categories
   - Suggestions: Set suggestion channels
   - Giveaways: Configure giveaway settings
   - Auto-roles: Set roles for new members

### Recommended Settings

**For Small Servers (< 100 members):**
```json
{
  "protection": {
    "enabled": true,
    "antispam": {
      "enabled": true,
      "limits": {
        "messageLimit": 5,
        "timeWindow": 5000
      }
    }
  }
}
```

**For Medium Servers (100-1000 members):**
```json
{
  "protection": {
    "enabled": true,
    "antispam": {
      "enabled": true,
      "limits": {
        "messageLimit": 4,
        "timeWindow": 7000
      }
    },
    "channel": {
      "enabled": true
    },
    "role": {
      "enabled": true
    }
  }
}
```

**For Large Servers (1000+ members):**
```json
{
  "protection": {
    "enabled": true,
    "antispam": {
      "enabled": true,
      "limits": {
        "messageLimit": 3,
        "timeWindow": 10000
      }
    },
    "channel": {
      "enabled": true
    },
    "role": {
      "enabled": true
    },
    "antibot": {
      "enabled": true
    }
  }
}
```

## 📚 Learn More

- **Full Deployment Guide:** [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **Configuration Guide:** [README-CONFIG.md](./README-CONFIG.md)
- **Setup Checklist:** [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- **Main Documentation:** [README.md](./README.md)

## 🆘 Troubleshooting

### Bot Not Coming Online?
1. Check Render logs for errors
2. Verify `DISCORD_TOKEN` is correct
3. Ensure all intents are enabled in Discord Developer Portal
4. Check if bot is invited to your server

### Commands Not Working?
1. Wait up to 1 hour for slash commands to register
2. Verify bot has Administrator permission
3. Check if commands are enabled in `settings.json`
4. Try kicking and re-inviting the bot

### Database Errors?
1. Verify `MONGO_URI` is correct
2. Check MongoDB Atlas allows 0.0.0.0/0 connections
3. Verify database user has read/write permissions
4. Check username/password in connection string

### Need More Help?
- Check Render logs: Dashboard → Your Service → Logs
- Review [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed troubleshooting
- Check Discord Developer Portal for bot status

## 💡 Pro Tips

1. **Keep Bot Awake (Free Tier):**
   - Use UptimeRobot to ping your bot every 5 minutes
   - Prevents free tier from sleeping

2. **Monitor Your Bot:**
   - Bookmark Render dashboard
   - Check logs regularly
   - Set up uptime monitoring

3. **Secure Your Bot:**
   - Never share your bot token
   - Use environment variables for all secrets
   - Rotate tokens periodically

4. **Optimize Performance:**
   - Disable unused features in `settings.json`
   - Use specific log channels instead of one for all
   - Consider upgrading to paid plan for 24/7 uptime

## 🎉 Success!

Your LR7 Community Bot is now protecting and managing your Discord server!

**Enjoy your new bot!** 🤖✨

---

**Quick Links:**
- [Render Dashboard](https://dashboard.render.com)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [MongoDB Atlas](https://cloud.mongodb.com)
