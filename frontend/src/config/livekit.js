// LiveKit Cloud Configuration
// IMPORTANT: Use environment variables for dynamic configuration
// In development: Create .env file in frontend directory
// In production: Set VITE_TOKEN_ENDPOINT in your deployment platform

// Use environment variable or fallback to proxy path (relative URL)
const tokenEndpoint = import.meta.env.VITE_TOKEN_ENDPOINT || "/api/token";
const livekitUrl = import.meta.env.VITE_LIVEKIT_URL || "wss://hirevibe-code-wud39ncg.livekit.cloud";

console.log("=== LiveKit Configuration ===");
console.log("LIVEKIT_URL:", livekitUrl);
console.log("TOKEN_ENDPOINT:", tokenEndpoint);
console.log("=============================");

export const LIVEKIT_URL = livekitUrl;
export const TOKEN_ENDPOINT = tokenEndpoint;

export const ICE_SERVERS = {
  // LiveKit Cloud automatically provides TURN servers
  // Use default configuration for best compatibility
  iceServers: [
    // Google STUN servers for NAT traversal
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
  // ICE transport policy - use 'all' to try all options
  iceTransportPolicy: "all",
};
