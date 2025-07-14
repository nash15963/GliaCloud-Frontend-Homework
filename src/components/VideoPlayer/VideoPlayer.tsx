import { PlayIcon, PauseIcon, TrackPreviousIcon, TrackNextIcon, TextIcon } from "@radix-ui/react-icons";
import ClipProgressBar from "./ClipProgressBar";
import ControlButton from "./ControlButton";
import VideoDisplay from "./VideoDisplay";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";

// Subtitle interface
interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

interface Clip {
  startTime: number;
  endTime: number;
}

interface CustomVideoPlayerProps {
  src: string;
  subtitles?: Subtitle[];
  highlightClips?: Clip[];
  currentTimestamp: number | null;
  onTimestampHandled: () => void;
  onTimeUpdate: (time: number) => void;
}

const CustomVideoPlayer = ({ src, currentTimestamp, onTimestampHandled, onTimeUpdate, subtitles = [], highlightClips = [] }: CustomVideoPlayerProps) => {
  // Use the comprehensive video player hook
  const {
    videoRef,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    showSubtitles,
    canPlay,
    setCurrentClipIndex,
    togglePlayPause,
    skipForward,
    skipBackward,
    toggleSubtitles
  } = useVideoPlayer({
    src,
    highlightClips,
    currentTimestamp,
    onTimestampHandled,
    onTimeUpdate
  });
  

  return (
    <div className="video-player-wrapper flex flex-col gap-3 w-[90%]">
      {/* Video playback area with subtitle overlay - Fixed aspect ratio */}
      <VideoDisplay
        videoRef={videoRef}
        isLoading={isLoading}
        showSubtitles={showSubtitles}
        subtitles={subtitles}
        currentTime={currentTime}
      />

      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
        {/* Custom Clip Progress Bar */}
        <ClipProgressBar
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          highlightClips={highlightClips}
          isPlayingClips={isPlaying}
          setCurrentClipIndex={setCurrentClipIndex}
        />

        <div className="flex justify-center gap-3">
          <ControlButton
            variant="blue"
            onClick={skipBackward}
            disabled={isLoading || !canPlay || highlightClips.length <= 1}
          >
            <TrackPreviousIcon className="w-4 h-4" />
          </ControlButton>

          <ControlButton
            variant="green"
            onClick={togglePlayPause}
            disabled={isLoading || !canPlay}
          >
            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          </ControlButton>

          <ControlButton
            variant="blue"
            onClick={skipForward}
            disabled={isLoading || !canPlay || highlightClips.length <= 1}
          >
            <TrackNextIcon className="w-4 h-4" />
          </ControlButton>

          <ControlButton
            variant={showSubtitles ? 'yellow' : 'gray'}
            onClick={toggleSubtitles}
            disabled={isLoading}
            title={showSubtitles ? "Hide Subtitles" : "Show Subtitles"}
          >
            <TextIcon className="w-4 h-4" />
          </ControlButton>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;