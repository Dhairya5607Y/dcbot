# OAuth2 Setup Instructions

## ✅ What's Been Done

All dashboard routes and API endpoints are now protected with Discord OAuth2 authentication. Only users who:
1. Are logged in with Discord
2. Are administrators of the selected server
3. Are in a server where the bot is also present

...can access and modify dashboard settings.

## 🔧 What You Need to Do

### Step 1: Get Discord Client Secret

1. Go to https://discord.com/developers/applications
2. Select your application (LR7 Community Bot)
3. Go to **OAuth2** section in the left sidebar
4. Click **Reset Secret** (or copy existing secret if you have it)
5. Copy the **Client Secret** - you'll need this in Step 2

### Step 2: Add OAuth2 Redirect URL

While still in the Discord Developer Portal:

1. In the **OAuth2** section, scroll down to **Redirects**
2. Click **Add Redirect**
3. Enter: `https://lr7-community-bot.onrender.com/auth/callback`
4. Click **Save Changes**

### Step 3: Add Environment Variables to Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your **lr7-community-bot** service
3. Go to **Environment** tab
4. Add these three new environment variables:

| Key | Value |
|-----|-------|
| `DISCORD_CLIENT_SECRET` | (paste the secret from Step 1) |
| `CALLBACK_URL` | `https://lr7-community-bot.onrender.com/auth/callback` |
| `DASHBOARD_DOMAIN` | `https://lr7-community-bot.onrender.com` |

5. Click **Save Changes**

### Step 4: Deploy

After adding the environment variables, Render will automatically redeploy your service.

## 🧪 Testing the OAuth Flow

Once deployed:

1. Visit https://lr7-community-bot.onrender.com
2. Click **Login with Discord** in the sidebar
3. Authorize the application
4. You should see a server selection page showing all servers where:
   - You are an administrator
   - The bot is present
5. Select a server
6. You should now be able to access all dashboard features

## 🔒 Security Features

- **Session-based authentication**: Users must log in to access protected pages
- **Administrator check**: Only server admins can modify settings
- **Guild validation**: Bot must be in the server
- **Secure cookies**: Enabled in production
- **Automatic redirects**: Unauthenticated users redirected to login

## 📋 Protected Routes

All of these routes now require authentication:

### Pages
- `/settings` - Bot settings
- `/commands` - Command management
- `/logs` - Log configuration
- `/protection` - Server protection
- `/tickets` - Ticket system
- `/apply` - Application system
- `/rules` - Rules management
- `/giveaway` - Giveaway system
- `/tempchannels` - Temporary channels
- `/autoreply` - Auto-reply system
- `/suggestions` - Suggestions system
- `/welcome` - Welcome messages
- `/selectroles` - Role selection
- `/games` - Games configuration
- `/automod` - Auto-moderation
- `/autolines` - Auto-lines
- `/leveling` - Leveling system

### API Endpoints
All `/api/*` endpoints are protected (commands, settings, logs, etc.)

## ❓ Troubleshooting

### "OAuth error" in logs
- Check that `DISCORD_CLIENT_SECRET` is correct
- Verify the redirect URL matches exactly in Discord Developer Portal

### "No guild selected" error
- Make sure you're an administrator in at least one server where the bot is present
- Check that the bot has proper permissions in your server

### Can't access dashboard after login
- Clear your browser cookies
- Try logging out and logging in again
- Check browser console for errors

## 🎉 Next Steps

After OAuth is working:
1. Test all dashboard features
2. Invite team members to test
3. Configure your bot settings through the dashboard
4. Set up logging, protection, and other features

## 📞 Need Help?

If you encounter issues:
1. Check Render logs for error messages
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Make sure Discord OAuth2 redirect URL is configured
