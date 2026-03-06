// Source of truth for dashboard configuration
// Uses environment variables with sensible fallbacks

const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost",
  API_PORT: process.env.NEXT_PUBLIC_API_PORT || process.env.API_PORT || "4000",
  PROJECT_VERSION: process.env.NEXT_PUBLIC_PROJECT_VERSION || process.env.PROJECT_VERSION || "1.0",
  LINKS: {
    SUPPORT: process.env.NEXT_PUBLIC_LINK_SUPPORT || "",
    INVITE: process.env.NEXT_PUBLIC_LINK_INVITE || "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands",
    WEBSITE: process.env.NEXT_PUBLIC_LINK_WEBSITE || "",
    TERMS: process.env.NEXT_PUBLIC_LINK_TERMS || "/terms",
    PRIVACY: process.env.NEXT_PUBLIC_LINK_PRIVACY || "/privacy",
    GITHUB: process.env.NEXT_PUBLIC_LINK_GITHUB || "",
    X: process.env.NEXT_PUBLIC_LINK_X || "",
  }
};

export default config;
