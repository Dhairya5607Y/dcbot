# LR7 Community Bot - Render.com Deployment Guide

This guide will walk you through deploying the LR7 Community Bot on Render.com, a modern cloud platform that offers free hosting for Discord bots.

## Prerequisites

Before you begin, ensure you have:

1. A Discord Bot Token and Application ID from the [Discord Developer Portal](https://discord.com/developers/applications)
2. A MongoDB database (we recommend [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
3. A GitHub account (for connecting your repository to Render)
4. A Render.com account (sign up at [render.com](https://render.com))

---

## Part 1: Discord Bot Setup

### 1.1 Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "LR7 Community Bot" and click "Create"
4. Navigate to the "Bot" section in the left sidebar
5. Click "Add Bot" and confirm

### 1.2 Configure Bot Settings

1. Under the Bot section:
   - Copy your **Bot Token** (you'll need this later)
   - Enable these Privileged Gateway Intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent

2. Under the "OAuth2" section:
   - Copy your **Application ID** (Client ID)

### 1.3 Generate Bot Invite Link

1. Go to OAuth2 → URL Generator
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions (or use Administrator for simplicity):
   - ✅ Administrator (or select specific permissions as needed)
4. Copy the generated URL and use it to invite the bot to your server

---

## Part 2: MongoDB Setup

### 2.1 Create MongoDB Atlas Database (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project (e.g., "LR7 Bot")
4. Click "Build a Database"
5. Choose the **FREE** tier (M0 Sandbox)
6. Select your preferred cloud provider and region
7. Click "Create Cluster"

### 2.2 Configure Database Access

1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password (save these!)
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 2.3 Configure Network Access

1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is necessary for Render.com to connect
4. Click "Confirm"

### 2.4 Get Connection String

1. Go back to "Database" section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database credentials

---

## Part 3: Prepare Your Repository

### 3.1 Push Code to GitHub

If you haven't already, push your bot code to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit - LR7 Community Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lr7-community-bot.git
git push -u origin main
```

### 3.2 Update Configuration Files

Before deploying, ensure your `dist/config.js` is properly configured. The file should look like this:

```javascript
const config = {
    token: process.env.DISCORD_TOKEN || 'YOUR_TOKEN_HERE',
    clientId: process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
    mongoUri: process.env.MONGO_URI || 'YOUR_MONGO_URI_HERE',
    ownerid: process.env.OWNER_ID || 'YOUR_OWNER_ID_HERE',
    defaultPrefix: '!',
    mainGuildId: process.env.MAIN_GUILD_ID || 'YOUR_GUILD_ID_HERE',
    defaultLanguage: 'en',
    dashboard: {
        port: process.env.PORT || 3001,
        secret: process.env.DASHBOARD_SECRET || 'your-secret-key',
        callbackUrl: process.env.CALLBACK_URL || 'http://localhost:3000/auth/callback'
    }
};
```

**Note:** For security, we'll use environment variables on Render instead of hardcoded values.

---

## Part 4: Deploy to Render.com

### 4.1 Create New Web Service

1. Log in to [Render.com](https://render.com)
2. Click "New +" button in the top right
3. Select "Web Service"
4. Connect your GitHub account if you haven't already
5. Select your bot repository from the list

### 4.2 Configure Service Settings

Fill in the following settings:

**Basic Settings:**
- **Name:** `lr7-community-bot` (or your preferred name)
- **Region:** Choose the closest region to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** Leave blank (unless your bot is in a subdirectory)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node index.js`

**Instance Type:**
- Select **Free** tier (or paid tier for better performance)

### 4.3 Add Environment Variables

Click "Advanced" and add the following environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `DISCORD_TOKEN` | Your bot token | From Discord Developer Portal |
| `CLIENT_ID` | Your application ID | From Discord Developer Portal |
| `MONGO_URI` | Your MongoDB connection string | From MongoDB Atlas |
| `OWNER_ID` | Your Discord user ID | Right-click your profile → Copy ID |
| `MAIN_GUILD_ID` | Your main server ID | Right-click server icon → Copy ID |
| `DASHBOARD_SECRET` | Random secure string | Generate a random string |
| `PORT` | `3001` | Port for the dashboard |
| `NODE_ENV` | `production` | Environment mode |

**To get your Discord User ID:**
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your username and select "Copy ID"

**To get your Server (Guild) ID:**
1. Right-click your server icon in Discord
2. Select "Copy ID"

### 4.4 Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your bot
3. Monitor the deployment logs for any errors

---

## Part 5: Post-Deployment Configuration

### 5.1 Verify Bot is Online

1. Check your Discord server - the bot should appear online
2. Try a test command like `/ping` or `!ping`
3. Check Render logs for any errors:
   - Go to your service dashboard
   - Click "Logs" tab
   - Look for "Bot is now online and ready to serve!"

### 5.2 Configure Bot Settings

The bot uses `settings.json` for feature configuration. You can modify this file to:

- Enable/disable commands
- Configure logging channels
- Set up protection systems
- Configure auto-roles
- Set up tickets, giveaways, suggestions, etc.

**Important Settings to Configure:**

1. **Logging Channels:** Update channel IDs in `settings.json`:
   ```json
   "logs": {
       "enabled": true,
       "messageDelete": {
           "enabled": true,
           "channelId": "YOUR_LOG_CHANNEL_ID"
       }
   }
   ```

2. **Protection Systems:** Configure protection in `settings.json`:
   ```json
   "protection": {
       "enabled": true,
       "logChannelId": "YOUR_PROTECTION_LOG_CHANNEL_ID"
   }
   ```

### 5.3 Update Dashboard Callback URL (Optional)

If you're using the dashboard feature:

1. Get your Render service URL (e.g., `https://lr7-community-bot.onrender.com`)
2. Update the `CALLBACK_URL` environment variable:
   ```
   https://lr7-community-bot.onrender.com/auth/callback
   ```
3. Add this URL to Discord OAuth2 Redirects:
   - Go to Discord Developer Portal
   - Your Application → OAuth2 → Redirects
   - Add: `https://lr7-community-bot.onrender.com/auth/callback`

---

## Part 6: Maintenance and Monitoring

### 6.1 View Logs

- Go to your Render dashboard
- Select your service
- Click "Logs" to view real-time logs
- Use logs to troubleshoot issues

### 6.2 Restart Service

If you need to restart the bot:
1. Go to your Render dashboard
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Or click "Restart" for a quick restart

### 6.3 Update Bot Code

To deploy updates:
1. Push changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Update bot features"
   git push
   ```
2. Render will automatically detect changes and redeploy
3. Monitor logs to ensure successful deployment

### 6.4 Monitor Performance

- Check Render dashboard for:
  - CPU usage
  - Memory usage
  - Request metrics
- Free tier limitations:
  - 750 hours/month
  - Spins down after 15 minutes of inactivity
  - Takes ~30 seconds to spin back up

**Note:** Free tier services sleep after inactivity. Consider upgrading to a paid plan for 24/7 uptime.

---

## Part 7: Troubleshooting

### Common Issues

#### Bot Not Coming Online

**Check:**
1. Verify `DISCORD_TOKEN` is correct in environment variables
2. Check Render logs for error messages
3. Ensure all Privileged Gateway Intents are enabled
4. Verify bot has been invited to your server

#### Database Connection Errors

**Check:**
1. Verify `MONGO_URI` is correct
2. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Check database user has correct permissions
4. Verify username/password in connection string

#### Commands Not Working

**Check:**
1. Ensure bot has proper permissions in Discord
2. Verify commands are enabled in `settings.json`
3. Check if slash commands are registered (may take up to 1 hour)
4. Try kicking and re-inviting the bot

#### Service Keeps Crashing

**Check:**
1. Review Render logs for error messages
2. Verify all required files are in repository
3. Check `package.json` dependencies are correct
4. Ensure Node.js version compatibility

### Getting Help

If you encounter issues:

1. Check Render logs first
2. Review Discord Developer Portal for bot status
3. Verify MongoDB Atlas connection
4. Check GitHub repository issues
5. Review bot documentation

---

## Part 8: Optimization Tips

### 8.1 Keep Bot Awake (Free Tier)

Free tier services sleep after 15 minutes of inactivity. To keep it awake:

**Option 1: Use a Ping Service**
- Use [UptimeRobot](https://uptimerobot.com/) (free)
- Set it to ping your Render URL every 5 minutes

**Option 2: Self-Ping**
- Add a cron job in your bot to ping itself
- Not recommended as it uses resources

### 8.2 Upgrade to Paid Plan

For production use, consider upgrading:
- **Starter Plan ($7/month):**
  - 24/7 uptime
  - No sleep
  - Better performance
  - More resources

### 8.3 Environment-Specific Configuration

Use environment variables for different configurations:

```javascript
const isProduction = process.env.NODE_ENV === 'production';

const config = {
    // Use different settings based on environment
    logLevel: isProduction ? 'error' : 'debug',
    // ... other settings
};
```

---

## Part 9: Security Best Practices

### 9.1 Protect Sensitive Data

- ✅ Never commit tokens or secrets to GitHub
- ✅ Use environment variables for all sensitive data
- ✅ Add `.env` to `.gitignore` if using local env files
- ✅ Rotate tokens periodically

### 9.2 MongoDB Security

- ✅ Use strong passwords
- ✅ Limit database user permissions
- ✅ Enable MongoDB Atlas IP whitelist when possible
- ✅ Regularly backup your database

### 9.3 Discord Bot Security

- ✅ Only enable required intents
- ✅ Use role-based permissions for commands
- ✅ Implement rate limiting
- ✅ Validate all user inputs

---

## Part 10: Scaling Considerations

### When to Scale

Consider upgrading or scaling when:
- Bot serves 100+ servers
- Response times increase
- Memory usage consistently high
- Need 24/7 guaranteed uptime

### Scaling Options

1. **Upgrade Render Plan:** More resources, better performance
2. **Optimize Code:** Reduce memory usage, improve efficiency
3. **Use Redis:** Cache frequently accessed data
4. **Shard Bot:** For 2,500+ servers

---

## Conclusion

You've successfully deployed the LR7 Community Bot to Render.com! Your bot should now be:

✅ Running 24/7 (or on free tier with sleep)
✅ Connected to MongoDB
✅ Responding to commands
✅ Logging events
✅ Protecting your server

### Next Steps

1. Configure `settings.json` for your server's needs
2. Set up logging channels
3. Enable desired features (tickets, giveaways, etc.)
4. Customize bot responses and embeds
5. Monitor performance and logs

### Quick Reference

**Render Dashboard:** https://dashboard.render.com
**Discord Developer Portal:** https://discord.com/developers/applications
**MongoDB Atlas:** https://cloud.mongodb.com

---

**Need Help?** Check the logs first, then review this guide. Most issues are related to incorrect environment variables or Discord permissions.

**Enjoy your LR7 Community Bot! 🎉**
