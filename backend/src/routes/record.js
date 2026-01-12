import express from "express";

const router = express.Router();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_CLOUD_API_URL = "https://cloud.livekit.io/api/v1";

async function livekitApiRequest(endpoint, method = "GET", body = null) {
  const response = await fetch(`${LIVEKIT_CLOUD_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${btoa(`${LIVEKIT_API_KEY}:${LIVEKIT_API_SECRET}`)}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "LiveKit API error");
  }

  return response.json();
}

router.post("/start", async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: "Missing roomName" });
    }

    const egressRequest = {
      name: `Recording-${roomName}`,
      room_name: roomName,
      layout: "speaker",
      audio_only: false,
      video_only: false,
      file_type: "mp4",
      egress: {
        composite: {
          name: `composite-${roomName}`,
          template: "grid-v3",
        },
      },
    };

    const result = await livekitApiRequest("/egress/start", "POST", egressRequest);

    res.json({ egressId: result.egress_id, status: result.status });
  } catch (error) {
    console.error("Start recording error:", error);
    res.status(500).json({ error: "Failed to start recording" });
  }
});

router.post("/stop", async (req, res) => {
  try {
    const { egressId } = req.body;

    if (!egressId) {
      return res.status(400).json({ error: "Missing egressId" });
    }

    const result = await livekitApiRequest(`/egress/${egressId}/stop`, "POST");

    res.json({ egressId: result.egress_id, status: result.status });
  } catch (error) {
    console.error("Stop recording error:", error);
    res.status(500).json({ error: "Failed to stop recording" });
  }
});

export default router;
