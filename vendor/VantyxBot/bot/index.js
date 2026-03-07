const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const path = require("path");
const moduleAlias = require("module-alias");

// Register All-In-One aliases so its internal @helpers, @src, etc. work
moduleAlias.addAliases({
  "@root": path.join(__dirname, "../../All-In-One-Bot"),
  "@handlers": path.join(__dirname, "../../All-In-One-Bot/src/handlers"),
  "@helpers": path.join(__dirname, "../../All-In-One-Bot/src/helpers"),
  "@schemas": path.join(__dirname, "../../All-In-One-Bot/src/database/schemas"),
  "@src": path.join(__dirname, "../../All-In-One-Bot/src"),
  "@structures": path.join(__dirname, "../../All-In-One-Bot/src/structures"),
});

const config = require("../config.js");
const logger = require("./src/utils/logger");
const connectDB = require("./src/database/mongoose");
const startSchedulers = require("./src/utils/scheduler");

/**
 * Initialize Discord Client with necessary intents and partials.
 * Intents are required to receive specific events from Discord.
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
});

// Attach commands collection and config to the client for easy access
client.commands = new Collection();

// --- Initialize All-In-One Features ---
const aioConfig = require("../../All-In-One-Bot/config");
const { schemas } = require("../../All-In-One-Bot/src/database/mongoose");
const lavaclient = require("../../All-In-One-Bot/src/handlers/lavaclient");
const giveawaysHandler = require("../../All-In-One-Bot/src/handlers/giveaway");
const { DiscordTogether } = require("discord-together");

// Merge AIO config into Vantyx config
client.config = { ...aioConfig, ...config }; 
client.configAIO = aioConfig; // Keep original AIO config for AIO-specific logic
client.databaseAIO = schemas;
if (aioConfig.MUSIC.ENABLED) client.musicManager = lavaclient(client);
if (aioConfig.GIVEAWAYS.ENABLED) client.giveawaysManager = giveawaysHandler(client);
client.discordTogether = new DiscordTogether(client);
client.loggerAIO = require("../../All-In-One-Bot/src/helpers/Logger");
client.wait = require("util").promisify(setTimeout);

/**
 * Main initialization block to start the bot.
 */
(async () => {
  try {
    // Establish database connection
    await connectDB();

    // Load Vantyx handlers
    require("./src/handlers/commandHandler")(client);
    require("./src/handlers/eventHandler")(client);

    // --- Load All-In-One Events ---
    const { recursiveReadDirSync } = require("../../All-In-One-Bot/src/helpers/Utils");
    const aioEventsPath = path.join(__dirname, "../../All-In-One-Bot/src/events");
    if (fs.existsSync(aioEventsPath)) {
      recursiveReadDirSync(aioEventsPath).forEach((filePath) => {
        const eventName = path.basename(filePath, ".js");
        const event = require(filePath);
        client.on(eventName, event.bind(null, client));
      });
    }

    // Sync slash commands with Discord API
    const registerCommands = require("./src/utils/registerCommands");
    await registerCommands(client);

    // Initialize background cron jobs and tasks
    startSchedulers(client);

    // Authenticate with Discord
    await client.login(config.DISCORD_TOKEN);
  } catch (err) {
    logger.error(`Initialization failed: ${err.message}`);
    process.exit(1);
  }
})();

module.exports = client;
