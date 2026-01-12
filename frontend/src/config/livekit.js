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
  // LiveKit Cloud TURN servers for restricted networks
  // These are required for camera publishing to work through firewalls/NATs
  iceServers: [
    // STUN servers - for NAT traversal discovery
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.livekit.com:3478" },
    // TURN servers - for relaying when direct peer-to-peer fails
    // UDP TURN (preferred for media)
    {
      urls: "turn:livekit.cloud:443?transport=udp",
      username: "livekit",
      credential: "livekit",
    },
    // TCP TURN (fallback for restrictive networks)
    {
      urls: "turn:livekit.cloud:443?transport=tcp",
      username: "livekit",
      credential: "livekit",
    },
    // Additional TURN server for redundancy
    {
      urls: "turn:turn.livekit.cloud:443?transport=udp",
      username: "livekit",
      credential: "livekit",
    },
  ],
  // ICE candidate gathering timeout (ms)
  iceCandidatePoolSize: 10,
};
