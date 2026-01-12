// src/routes/token.js
import express from "express";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

/**
 * GET /api/token?room=roomName&identity=participantName
 */
router.get("/", (req, res) => {
  const { room, identity } = req.query;

  if (!room || !identity) {
    return res.status(400).json({ error: "room and identity are required" });
  }

  try {
    const token = generateToken(room, identity);
    res.json({ token });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
