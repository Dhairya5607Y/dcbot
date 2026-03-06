# LR7 Community Bot

A powerful Discord moderation bot with an advanced dashboard, extensive protection systems, and customizable moderation tools built with discord.js v14.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🚀 Quick Deploy

**New to this bot?** Follow our step-by-step guide:
- **[📖 START HERE](./START_HERE.md)** - Begin your deployment journey
- **[📘 Complete Deployment Guide](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Full walkthrough from scratch (30 min)
- **[⚡ Quick Start Guide](./QUICKSTART.md)** - Get running in 15 minutes
- **[✅ Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Printable checklist

**Repository:** https://github.com/Dhairya5607Y/dcbot

---

## Features

### 🛡️ Protection Systems
- **Anti-Spam Protection:** Automatically detects and handles spam
- **Anti-Bot Protection:** Prevents unauthorized bot additions
- **Channel Protection:** Monitors channel creation, deletion, and updates
- **Role Protection:** Prevents mass role changes and deletions
- **Server Protection:** Guards against server setting modifications
- **Timeout Protection:** Monitors timeout abuse
- **Moderation Protection:** Prevents moderation command abuse

### 📝 Moderation Commands
- User management (kick, ban, timeout, warn)
- Channel management (lock, unlock, hide, unhide)
- Message management (clear, bulk delete)
- Role management (add, remove roles)
- Nickname management

### 📊 Comprehensive Logging
- Message events (delete, edit, bulk delete)
- Member events (join, leave, nickname changes)
- Role events (create, delete, update, give, remove)
- Channel events (create, delete, update)
- Voice events (join, leave, move, mute, deafen)
- Server events (updates, bans, unbans, kicks)
- Emoji and sticker events
- Thread events
- Invite tracking

### 🎫 Advanced Features
- **Ticket System:** Multi-section support ticket system
- **Suggestion System:** Community suggestions with voting
- **Giveaway System:** Automated giveaway management
- **Application System:** Custom application forms
- **Auto-Reply System:** Automated message responses
- **Temporary Channels:** User-created temporary voice channels
- **Rules System:** Interactive rules display
- **Auto-Roles:** Automatic role assignment for members and bots

### 🎨 Dashboard
- Web-based configuration dashboard
- Real-time settings management
- User-friendly interface

## Quick Start

### Prerequisites
- Node.js 16.x or higher
- MongoDB database
- Discord Bot Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lr7/lr7-community-bot.git
cd lr7-community-bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure the bot:
   - Edit `dist/config.js` with your bot token, client ID, and MongoDB URI
   - Or use environment variables (recommended for production)

4. Start the bot:
```bash
npm start
```

## Deployment

### Deploy to Render.com (Recommended)

For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Quick Steps:**
1. Push code to GitHub
2. Create a new Web Service on Render.com
3. Connect your repository
4. Add environment variables
5. Deploy!

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | Yes |
| `CLIENT_ID` | Your Discord application ID | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `OWNER_ID` | Your Discord user ID | Yes |
| `MAIN_GUILD_ID` | Your main server ID | Yes |
| `DASHBOARD_SECRET` | Secret key for dashboard sessions | No |
| `PORT` | Port for dashboard (default: 3001) | No |
| `NODE_ENV` | Environment mode (production/development) | No |

## Configuration

The bot uses `settings.json` for feature configuration. Key sections include:

- **commands:** Enable/disable commands and set permissions
- **logs:** Configure logging channels and events
- **protection:** Set up protection systems and thresholds
- **suggestions:** Configure suggestion channels and settings
- **tickets:** Set up ticket system sections
- **giveaway:** Configure giveaway settings
- **autoRoles:** Set up automatic role assignment
- **tempChannels:** Configure temporary voice channels
- **autoReply:** Set up automated responses
- **rules:** Configure rules display system

For detailed configuration, see [README-CONFIG.md](./README-CONFIG.md)

## Commands

### Information Commands
- `/ping` - Check bot latency
- `/user` - View user information
- `/server` - View server information
- `/avatar` - Display user avatar
- `/banner` - Display user banner
- `/roles` - List server roles
- `/adminlist` - List server administrators

### Moderation Commands
- `/kick` - Kick a member
- `/ban` - Ban a member
- `/unban` - Unban a user
- `/timeout` - Timeout a member
- `/rtimeout` - Remove timeout
- `/warn` - Warn a member
- `/warns` - View member warnings
- `/unwarn` - Remove a warning
- `/clear` - Clear messages
- `/lock` - Lock a channel
- `/unlock` - Unlock a channel
- `/hide` - Hide a channel
- `/unhide` - Unhide a channel
- `/setnick` - Set member nickname
- `/role` - Add role to member
- `/rrole` - Remove role from member
- `/move` - Move member to voice channel
- `/mute` - Mute member in voice
- `/unmute` - Unmute member in voice

### System Commands
- `/ticket` - Manage ticket system
- `/apply` - Manage application system
- `/giveaway` - Manage giveaways
- `/rules` - Display server rules

## Project Structure

```
lr7-community-bot/
├── dist/                      # Compiled TypeScript files
│   ├── src/
│   │   ├── commands/         # Bot commands
│   │   ├── logs/             # Logging handlers
│   │   ├── protection/       # Protection systems
│   │   ├── suggestions/      # Suggestion system
│   │   ├── ticket/           # Ticket system
│   │   ├── giveaway/         # Giveaway system
│   │   ├── apply/            # Application system
│   │   ├── autoReply/        # Auto-reply system
│   │   ├── tempChannels/     # Temporary channels
│   │   ├── rules/            # Rules system
│   │   └── utils/            # Utility functions
│   ├── dashboard/            # Web dashboard
│   ├── config.js             # Bot configuration
│   └── index.js              # Main bot file
├── transcripts/              # Ticket transcripts
├── index.js                  # Launcher script
├── package.json              # Dependencies
├── settings.json             # Bot settings
├── README.md                 # This file
├── README-CONFIG.md          # Configuration guide
└── RENDER_DEPLOYMENT.md      # Deployment guide
```

## Development

### Scripts

- `npm start` - Start the bot
- `npm run dev` - Start with nodemon (auto-restart)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run clean` - Clean logs and cache
- `npm run update` - Update dependencies

### Building from Source

If you're working with TypeScript source files:

1. Install TypeScript: `npm install -g typescript`
2. Compile: `tsc`
3. Run: `npm start`

## Support

- **Documentation:** See [README-CONFIG.md](./README-CONFIG.md) for configuration details
- **Deployment:** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for hosting instructions
- **Issues:** Report bugs via GitHub Issues

## License

This project is licensed under the MIT License.

## Credits

- Built with [discord.js](https://discord.js.org/)
- Developed by the LR7 Team

## Version

Current Version: 2.0.0

---

**LR7 Community Bot** - Powerful moderation and community management for Discord servers.
