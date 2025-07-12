import "./App.css";
import TranscriptBlock from "./components/TranscriptBlock";
import VideoPlayerBlock from "./components/VideoPlayerBlock";

function App() {
  return (
    <div className="bg-gray-200" style={{
      display: "flex",
      justifyContent: "space-around",
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "20px 0",
    }}>
      {/* Left side - Transcript */}
        <TranscriptBlock />

      {/* Right side - Preview */}
        <VideoPlayerBlock />
    </div>
  );
}

export default App;
