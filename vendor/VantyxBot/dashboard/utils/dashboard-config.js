// Source of truth for dashboard configuration
// Uses environment variables with sensible fallbacks

const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost",
  API_PORT: process.env.NEXT_PUBLIC_API_PORT || process.env.API_PORT || "4000",
  PROJECT_VERSION: process.env.NEXT_PUBLIC_PROJECT_VERSION || process.env.PROJECT_VERSION || "1.0",
  DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_URL || "http://localhost:3000",
  LINKS: {
    SUPPORT: process.env.NEXT_PUBLIC_LINK_SUPPORT || process.env.LINK_SUPPORT || "",
    INVITE: process.env.NEXT_PUBLIC_LINK_INVITE || process.env.LINK_INVITE || "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands",
    WEBSITE: process.env.NEXT_PUBLIC_LINK_WEBSITE || process.env.LINK_WEBSITE || "",
    TERMS: process.env.NEXT_PUBLIC_LINK_TERMS || process.env.LINK_TERMS || "/terms",
    PRIVACY: process.env.NEXT_PUBLIC_LINK_PRIVACY || process.env.LINK_PRIVACY || "/privacy",
    GITHUB: process.env.NEXT_PUBLIC_LINK_GITHUB || process.env.LINK_GITHUB || "",
    X: process.env.NEXT_PUBLIC_LINK_X || process.env.LINK_X || "",
  }
};

export default config;
