const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  WebhookClient,
  EmbedBuilder,
  codeBlock
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// --- START MODULE RESOLUTION FIX ---
// This forces nested AIO files to fallback to searching VantyxBot's node_modules
const Module = require("module");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  try {
    return originalResolveFilename.apply(this, arguments);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND' && !request.startsWith('.')) {
      return originalResolveFilename.call(this, request, module, isMain, options);
    }
    throw e;
  }
};
// --- END MODULE RESOLUTION FIX ---

// Map Render environment variables to what the new bot expects
process.env.MONGO_TOKEN = process.env.MONGO_URI; 
process.env.DISCORD_ID = process.env.CLIENT_ID;

const config = require("../config.js");
const logger = require("./src/utils/logger");
const connectDB = require("./src/database/mongoose");
const startSchedulers = require("./src/utils/scheduler");

/**
 * Initialize Discord Client with ALL intents for the new 400+ commands bot
 */
const client = new Client({
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
  autoReconnect: true,
  disabledEvents: ["TYPING_START"],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildScheduledEvent
  ],
  intents: Object.values(GatewayIntentBits).filter(Number.isInteger).reduce((acc, bit) => acc | bit, 0), // All intents as a single bitfield
  restTimeOffset: 0
});

// Attach core VantyxBot variables
client.logger = logger;
client.commands = new Collection();
client.slashCommands = client.commands; 
client.contextMenus = new Collection();

client.getCommand = (invoke) => client.commands.get(invoke.toLowerCase());

// Attach new bot structures
client.playerManager = new Map();
client.triviaManager = new Map();
client.queue = new Map();

// Load the new bot's configuration internally
const aioPath = path.join(__dirname, "../../All-In-One-Bot/src");
client.config = require(path.join(aioPath, "config/bot.js"));
client.changelogs = require(path.join(aioPath, "config/changelogs.js"));
client.emotes = require(path.join(aioPath, "config/emojis.json"));
client.webhooks = require(path.join(aioPath, "config/webhooks.json"));

// Mock Webhooks for the new Bot so it doesn't crash on start
const webHooksArray = ['startLogs', 'shardLogs', 'errorLogs', 'dmLogs', 'voiceLogs', 'serverLogs', 'serverLogs2', 'commandLogs', 'consoleLogs', 'warnLogs', 'voiceErrorLogs', 'creditLogs', 'evalLogs', 'interactionLogs'];
for (const webhookName of webHooksArray) {
    client.webhooks[webhookName].id = "111111111111111111"; // Dummy ID to pass validation
    client.webhooks[webhookName].token = "dummy_token"; 
}

/**
 * Main initialization block to start the bot.
 */
(async () => {
  try {
    // 1. Establish Vantyx Database connection
    await connectDB();

    // 2. Establish New AIO Database connection
    await require(path.join(aioPath, "database/connect"))();

    // 3. Load Vantyx Handlers (XP, Logging, AutoMod)
    require("./src/handlers/commandHandler")(client);
    require("./src/handlers/eventHandler")(client);

    // 4. Load New Bot Handlers & Commands
    // Sub-bots check native `process.cwd()` for files like `./src/interactions`.
    // We must physically change the operating system context.
    const originalCwd = process.cwd();
    const aioRoot = path.join(__dirname, "../../All-In-One-Bot");
    process.chdir(aioRoot);
    
    fs.readdirSync(path.join(aioPath, 'handlers')).forEach((dir) => {
        fs.readdirSync(path.join(aioPath, `handlers/${dir}`)).forEach((handler) => {
            try {
              require(path.join(aioPath, `handlers/${dir}/${handler}`))(client);
            } catch (e) {
              logger.warn(`Skipped new AIO handler ${handler}: ${e.message}`);
              if (handler === 'giveaway.js') console.error(e.stack);
            }
        });
    });

    try {
      process.chdir(originalCwd); // Restore 
    } catch(e) {}

    // Sync slash commands with Discord API (Vantyx method)
    const registerCommands = require("./src/utils/registerCommands");
    await registerCommands(client);

    // Initialize background cron jobs and tasks
    startSchedulers(client);

    // --- Dummy HTTP Server for Render ---
    const http = require('http');
    const port = process.env.PORT || 8080;
    http.createServer((req, res) => {
      res.writeHead(200);
      res.end('VantyxBot is running with 400+ Commands!');
    }).listen(port, () => logger.info(`Render port bind successful on port ${port}`));

    // Authenticate with Discord
    await client.login(config.DISCORD_TOKEN);
  } catch (err) {
    logger.error(`Initialization failed: ${err.message}`);
    process.exit(1);
  }
})();

module.exports = client;
