// src/pages/JoinRoom.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOKEN_ENDPOINT } from "../config/livekit";

export default function JoinRoom() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = `${TOKEN_ENDPOINT}?room=${roomId}&identity=${name}`;
      console.log("Fetching:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const data = await response.json();

      localStorage.setItem("livekit_token", data.token);
      localStorage.setItem("participant_name", name);
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error("Token fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Join Room</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Room ID</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </div>
  );
}
