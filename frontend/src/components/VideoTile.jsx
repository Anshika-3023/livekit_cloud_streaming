import { useEffect, useRef, useState, useCallback } from "react";
import { RoomEvent, Track } from "livekit-client";

export default function VideoTile({ participant, label }) {
  const videoRef = useRef(null);
  const cleanupRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!participant?.sid || !videoRef.current) {
      cleanup();
      return;
    }

    const handleTrackSubscribed = (track) => {
      if (track?.kind === Track.Kind.Video && track?.mediaStreamTrack) {
        try {
          const stream = new MediaStream([track.mediaStreamTrack]);
          videoRef.current.srcObject = stream;
          setHasVideo(true);
        } catch (e) {
          console.warn("Error attaching video track:", e);
        }
      }
    };

    const handleTrackUnsubscribed = (track) => {
      if (track?.kind === Track.Kind.Video) {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setHasVideo(false);
      }
    };

    const handleTrackPublished = (publication) => {
      if (publication?.track?.kind === Track.Kind.Video) {
        setHasVideo(true);
      }
    };

    const handleTrackUnpublished = (publication) => {
      if (publication?.track?.kind === Track.Kind.Video) {
        setHasVideo(false);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    // Subscribe to events
    participant.on?.(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    participant.on?.(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    participant.on?.(RoomEvent.TrackPublished, handleTrackPublished);
    participant.on?.(RoomEvent.TrackUnpublished, handleTrackUnpublished);

    // Check existing subscribed tracks
    try {
      const tracks = participant.tracks || new Map();
      tracks.forEach((publication) => {
        if (publication?.isSubscribed && publication?.track) {
          handleTrackSubscribed(publication.track);
        }
      });
    } catch (e) {
      console.warn("Error checking existing tracks:", e);
    }

    cleanupRef.current = () => {
      try {
        participant.off?.(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        participant.off?.(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
        participant.off?.(RoomEvent.TrackPublished, handleTrackPublished);
        participant.off?.(RoomEvent.TrackUnpublished, handleTrackUnpublished);
      } catch (e) {
        console.warn("Error cleaning up event listeners:", e);
      }
    };

    return () => {
      cleanup();
    };
  }, [participant, cleanup]);

  const toggleMute = () => {
    try {
      if (isMuted) {
        participant?.audioTrack?.unmute();
        setIsMuted(false);
      } else {
        participant?.audioTrack?.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.warn("Error toggling mute:", e);
    }
  };

  const displayName = label || participant?.identity || "Participant";

  return (
    <div style={{ 
      border: "1px solid #4b5563", 
      borderRadius: "8px", 
      overflow: "hidden",
      backgroundColor: "#1f2937"
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant?.isLocal}
        style={{ 
          width: "100%", 
          background: "#000", 
          aspectRatio: "16/9",
          display: hasVideo ? "block" : "none"
        }}
      />
      {!hasVideo && (
        <div style={{ 
          width: "100%", 
          aspectRatio: "16/9",
          background: "#374151",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "48px"
        }}>
          📹
        </div>
      )}
      <div style={{ 
        padding: "10px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        backgroundColor: "#374151"
      }}>
        <span style={{ color: "white" }}>{displayName}</span>
        {!participant?.isLocal && (
          <button 
            onClick={toggleMute}
            style={{
              padding: "5px 10px",
              background: isMuted ? "#dc2626" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        )}
      </div>
    </div>
  );
}
