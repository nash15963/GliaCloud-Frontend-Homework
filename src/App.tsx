import { useMutation, useQuery } from "@tanstack/react-query";
import "./App.css";
import TranscriptBlock from "./components/TranscriptBlock";
import VideoPlayerBlock from "./components/VideoPlayerBlock";
import { videoApi } from "./services/video";
import { useEffect, useState } from "react";

function App() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const videoProcessMutation = useMutation({
    mutationFn: async (file: File) => await videoApi.processVideo(file),
  });

  const videoDataMutaion = useMutation({
    mutationFn: async (videoId: string | undefined) => {
      if (!videoId) {
        throw new Error("Video ID is required to fetch video data");
      }
      return await videoApi.getVideoData(videoId);
    },
  });

  const checkVideoStatus = useQuery({
    queryKey: ["videoStatus", videoProcessMutation.data?.data.videoId],
    queryFn: () => videoApi.checkVideoStatus(videoProcessMutation.data?.data.videoId || ""),
    enabled: !!videoProcessMutation.data?.data.videoId && !videoDataMutaion.data?.success,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (checkVideoStatus.data?.data?.status === "completed") {
      console.log("Video processing completed, fetching video data...");
      videoDataMutaion.mutate(videoProcessMutation.data?.data.videoId);
    }
  }, [checkVideoStatus.data?.data?.status]);

  return (
    <div
      className="bg-gray-200"
      style={{
        display: "flex",
        justifyContent: "space-around",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "20px 0",
      }}>
      {/* Left side - Transcript */}
      <TranscriptBlock 
        videoDataMutation={videoDataMutaion} 
        onTimestampClick={setCurrentTimestamp}
        currentTime={currentTime}
      />

      {/* Right side - Preview */}
      <VideoPlayerBlock
        src={videoDataMutaion.data?.data?.url || ""}
        handleVideoProcess={videoProcessMutation.mutate}
        currentTimestamp={currentTimestamp}
        onTimestampHandled={() => setCurrentTimestamp(null)}
        onTimeUpdate={setCurrentTime}
        state={{
          videoProcessMutation,
        }}
      />
    </div>
  );
}

export default App;
