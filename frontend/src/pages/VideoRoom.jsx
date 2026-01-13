import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Room,
  RoomEvent,
  VideoPresets,
  Track,
} from "livekit-client";
import { LIVEKIT_URL, ICE_SERVERS } from "../config/livekit";

const RECONNECT_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
};

// Enhanced RTC config for restricted networks
const rtcConfig = {
  ...ICE_SERVERS,
  // Enable TURN/TLS for secure relay through firewalls
  enableDtlsSrtp: true,
  // Prefer UDP over TCP for media
  preferredCodecs: {
    video: ["VP8", "H264"],
    audio: ["opus"],
  },
};

// ---------------- DEBUG HELPERS ----------------
function attachDebugListeners(room) {
  room.on(RoomEvent.MediaDevicesError, (error) => {
    console.error("MEDIA DEVICES ERROR:", error);
  });

  room.on(RoomEvent.ConnectionError, (error) => {
    console.error("ENGINE / CONNECTION ERROR:", error);
  });

  room.on(RoomEvent.TrackPublishFailed, (track, error) => {
    console.error("TRACK PUBLISH FAILED:", track, error);
  });

  room.on(RoomEvent.IceConnectionStateChanged, (state) => {
    console.log("ICE STATE:", state);
  });

  room.on(RoomEvent.SignalConnected, () => {
    console.log("SIGNAL CONNECTED");
  });
}

function calculateBackoff(retryCount) {
  return Math.min(
    RECONNECT_CONFIG.initialDelay * Math.pow(2, retryCount),
    RECONNECT_CONFIG.maxDelay
  ) + Math.random() * 500;
}

// ------------------------------------------------

export default function VideoRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const localVideoRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isUnmountingRef = useRef(false);

  // Cleanup
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (room) room.disconnect();
    };
  }, [room]);

  const updateParticipants = useCallback((currentRoom) => {
    try {
      const arr = Array.from(currentRoom.participants.values());
      setParticipants(arr);
    } catch (err) {
      console.warn("Participant update error", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("livekit_token");
    if (!token) return navigate("/");

    const connect = async () => {
      try {
        setError("");
        setRetryCount(0);
        setIsReconnecting(false);

        console.log("Connecting to LiveKit:", LIVEKIT_URL);

        const roomOptions = {
          adaptiveStream: true,
          dynacast: true,
          rtcConfig: rtcConfig,
          publishDefaults: {
            videoEncoding: {
              maxBitrate: 1500000,
              maxFramerate: 30,
            },
            videoCodec: "VP8",
            audioBitrate: 20000,
          },
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        };

        const newRoom = new Room(roomOptions);
        attachDebugListeners(newRoom);

        // Basic listeners
        newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
          console.log("STATE:", state);
          if (state === "connected") {
            setIsConnected(true);
          }
        });

        newRoom.on(RoomEvent.ParticipantConnected, () => updateParticipants(newRoom));
        newRoom.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(newRoom));
        newRoom.on(RoomEvent.TrackSubscribed, () => updateParticipants(newRoom));
        newRoom.on(RoomEvent.TrackUnsubscribed, () => updateParticipants(newRoom));

        // Track publication listener for local video
        newRoom.on(RoomEvent.LocalTrackPublished, (publication) => {
          console.log("Local track published:", publication.kind);
          if (publication.kind === Track.Kind.Video && localVideoRef.current) {
            const track = publication.track?.mediaStreamTrack;
            if (track) {
              localVideoRef.current.srcObject = new MediaStream([track]);
            }
          }
        });

        // 1️⃣ Connect to Room
        console.log("Step 1: Connecting to room...");
        await newRoom.connect(LIVEKIT_URL, token);
        console.log("Connected successfully!");

        // 2️⃣ Enable camera and microphone (this will request permissions and publish)
        console.log("Step 2: Requesting camera + mic...");
        try {
          // Enable camera
          await newRoom.localParticipant.setCameraEnabled(true);
          console.log("Camera enabled");
          
          // Enable microphone
          await newRoom.localParticipant.setMicrophoneEnabled(true);
          console.log("Microphone enabled");
          
          // 3️⃣ Attach local video after successful publication
          const videoTrack = newRoom.localParticipant.videoTrackPublications.values().next().value;
          if (videoTrack?.track && localVideoRef.current) {
            const mediaStreamTrack = videoTrack.track.mediaStreamTrack;
            localVideoRef.current.srcObject = new MediaStream([mediaStreamTrack]);
            console.log("Local video attached");
          }
        } catch (mediaError) {
          console.error("Media enable failed:", mediaError);
          throw new Error(`Failed to enable camera/microphone: ${mediaError.message}`);
        }

        setRoom(newRoom);
      } catch (err) {
        console.error("Connect FAILED:", err);

        const msg = err.message?.toLowerCase() || "";
        if (
          msg.includes("invalid") ||
          msg.includes("401") ||
          msg.includes("token")
        ) {
          localStorage.removeItem("livekit_token");
          localStorage.removeItem("participant_name");
          setError("Session expired. Please rejoin.");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setError("Connection failed: " + err.message);
        }
      }
    };

    connect();
  }, [roomId, navigate, updateParticipants]);

  const leaveRoom = () => {
    if (room) room.disconnect();
    localStorage.clear();
    navigate("/");
  };

  if (error && !isConnected) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "white" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#1f2937", minHeight: "100vh" }}>
      <h1 style={{ color: "white" }}>Room: {roomId}</h1>

      {!isConnected && (
        <p style={{ color: "white" }}>Connecting to room...</p>
      )}

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {/* Local Video */}
        <div style={{ width: 400 }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", background: "black" }}
          />
          <p style={{ color: "white" }}>You</p>
        </div>

        {/* Remote Participants */}
        <div style={{ flex: 1, display: "grid", gap: 20 }}>
          {participants.map((p) => (
            <RemoteParticipant key={p.sid} participant={p} />
          ))}
        </div>
      </div>

      <button
        onClick={leaveRoom}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#dc2626",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Leave Room
      </button>
    </div>
  );
}

// ---------------------- REMOTE PARTICIPANT ----------------------

function RemoteParticipant({ participant }) {
  const ref = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const sub = (track) => {
      if (track.kind === Track.Kind.Video && ref.current) {
        ref.current.srcObject = new MediaStream([track.mediaStreamTrack]);
        setHasVideo(true);
      }
    };

    participant.on(RoomEvent.TrackSubscribed, sub);

    return () => {
      participant.off(RoomEvent.TrackSubscribed, sub);
    };
  }, [participant]);

  return (
    <div>
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{
          width: "100%",
          background: !hasVideo ? "#333" : "black",
          height: 250,
        }}
      />
      <p style={{ color: "white" }}>{participant.identity}</p>
    </div>
  );
}
