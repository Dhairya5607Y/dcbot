// Source of truth for API configuration
// Uses environment variables with sensible fallbacks

const config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
  CLIENT_ID: process.env.CLIENT_ID || "",
  CLIENT_SECRET: process.env.CLIENT_SECRET || "",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/vantyx",
  DASHBOARD_URL: process.env.DASHBOARD_URL || "http://localhost:3000",
  API_URL: process.env.API_URL || "http://localhost",
  API_PORT: parseInt(process.env.API_PORT || process.env.PORT || "4000", 10),
  BOT_PREFIX: process.env.BOT_PREFIX || "!",
  OWNER_IDS: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(",") : [],
  DEFAULT_LANG: process.env.DEFAULT_LANG || "en",
  PROJECT_VERSION: process.env.PROJECT_VERSION || "1.0",
};

module.exports = config;
