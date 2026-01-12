import { Routes, Route } from "react-router-dom";
import JoinRoom from "./pages/JoinRoom";
import VideoRoom from "./pages/VideoRoom";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<VideoRoom />} />
      </Routes>
    </div>
  );
}

export default App;
