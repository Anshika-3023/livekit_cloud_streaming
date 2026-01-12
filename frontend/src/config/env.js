import { LIVEKIT_URL, TOKEN_ENDPOINT } from "./livekit";

export const config = {
  LIVEKIT_URL,
  TOKEN_ENDPOINT,
};

export function loadEnv() {
  return config;
}
