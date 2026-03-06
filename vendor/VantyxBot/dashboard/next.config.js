/** @type {import('next').NextConfig} */

const path = require("path");

// Use env vars directly if available to avoid requirement of config.js during build if possible
const API_URL = process.env.API_URL || "http://localhost";
const API_PORT = process.env.API_PORT || "4000";
const { hostname } = new URL(API_URL);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },

      // Api http
      {
        protocol: "http",
        hostname,
        port: API_PORT.toString(),
        pathname: "/**",
      },
      // Api https
      {
        protocol: "https",
        hostname,
        port: API_PORT.toString(),
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
