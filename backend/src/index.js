// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tokenRouter from "./routes/token.js";

// Load .env FIRST
dotenv.config();

console.log("=== ENV DEBUG ===");
console.log("LIVEKIT_API_KEY:", process.env.LIVEKIT_API_KEY);
console.log("LIVEKIT_API_SECRET:", process.env.LIVEKIT_API_SECRET ? "[LOADED]" : "[MISSING]");
console.log("LIVEKIT_URL:", process.env.LIVEKIT_URL);
console.log("=================");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/token", tokenRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Token endpoint: http://localhost:${PORT}/api/token`);
});
