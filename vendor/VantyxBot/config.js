module.exports = {
  // --- Discord Application Details ---
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,

  // --- Database Connection ---
  MONGO_URI: process.env.MONGO_URI,

  // --- Dashboard & API ---
  DASHBOARD_URL: process.env.DASHBOARD_URL || "http://localhost:3000",
  API_URL: process.env.API_URL || "http://localhost",
  API_PORT: process.env.API_PORT || 4000,

  // --- Bot Settings ---
  BOT_PREFIX: process.env.BOT_PREFIX || "!",
  OWNER_IDS: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(",") : [],

  // --- Feature Settings ---
  DEFAULT_LANG: process.env.DEFAULT_LANG || "en",

  // --- Project version ---
  PROJECT_VERSION: "1.0",

  // --- Links ---
  LINKS: {
    SUPPORT: "https://discord.gg/4EbSFSJZqH",
    INVITE: `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,
    WEBSITE: process.env.DASHBOARD_URL || "http://localhost:3000",
    TERMS: "/terms",
    PRIVACY: "/privacy",
    GITHUB: "https://github.com/Hadi-4100",
    X: "https://x.com/",
  },
};
