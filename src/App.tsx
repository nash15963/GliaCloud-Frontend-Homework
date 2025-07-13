import { useQuery } from '@tanstack/react-query';
import "./App.css";
import TranscriptBlock from "./components/TranscriptBlock";
import VideoPlayerBlock from "./components/VideoPlayerBlock";
import { healthApi } from "./services/check-health";

function App() {
  // Health check query
  const { 
    data,
    isLoading: isHealthLoading, 
    error: healthError,
    isError: isHealthError 
  } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.checkHealth,
  });

  if(isHealthLoading) {
    return <div className="loading">Checking server health...</div>;
  }

  if(isHealthError && data?.success === false) {
    return <div className="error">Error checking server health: {healthError.message}</div>;
  }

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
