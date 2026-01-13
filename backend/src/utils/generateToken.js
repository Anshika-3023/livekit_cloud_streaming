// src/utils/generateToken.js
import { AccessToken } from "livekit-server-sdk";

/**
 * Generate a LiveKit AccessToken for room participation.
 * 
 * @param {string} roomName
 * @param {string} participantName
 * @returns {string} JWT token
 */
export function generateToken(roomName, participantName) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  console.log("Generating token with:");
  console.log("API KEY:", apiKey);
  console.log("API SECRET:", apiSecret ? "[LOADED]" : "[MISSING]");
  console.log("Room:", roomName);
  console.log("Participant:", participantName);

  if (!apiKey || !apiSecret) {
    throw new Error("Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in environment");
  }

  if (!roomName || !participantName) {
    throw new Error("roomName and participantName are required");
  }

  // 10-year expiration
  const ttl = 60 * 60 * 24 * 365 * 10;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: ttl,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
    // Explicitly allow publishing camera and microphone
    canPublishSources: ["camera", "microphone"],
  });

  return at.toJwt();
}
