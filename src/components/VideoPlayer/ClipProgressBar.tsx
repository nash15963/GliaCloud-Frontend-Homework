import { useEffect, useState, type Dispatch, type RefObject } from "react";

interface Clip {
  startTime: number;
  endTime: number;
}

interface ClipProgressBarProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  currentTime: number;
  duration: number;
  highlightClips: Clip[];
  isPlayingClips: boolean;
  setCurrentClipIndex: Dispatch<React.SetStateAction<number>>;
}

// Pure function to format time
const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Pure function to calculate mouse position data
const calculateMousePosition = (e: React.MouseEvent<HTMLDivElement>, duration: number) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));
  const time = percentage * duration;
  return { x, percentage, time };
};

// Pure function to check if time is within clips
const isTimeInClips = (time: number, clips: Clip[]): boolean => {
  return clips.some((clip) => time >= clip.startTime && time <= clip.endTime);
};

// Pure function to find current clip index
const getCurrentClipIndex = (time: number, clips: Clip[]): number => {
  return clips.findIndex((clip) => time >= clip.startTime && time <= clip.endTime);
};

// Pure function to handle video seeking
const seekToTime = (
  videoRef: RefObject<HTMLVideoElement | null>,
  time: number,
  isPlayingClips: boolean,
  clips: Clip[],
  setCurrentClipIndex: Dispatch<React.SetStateAction<number>>
) => {
  const video = videoRef.current;
  if (!video) return;

  video.currentTime = time;

  if (isPlayingClips) {
    const newClipIndex = getCurrentClipIndex(time, clips);
    if (newClipIndex >= 0) {
      setCurrentClipIndex(newClipIndex);
    }
  }
};

const ClipProgressBar = ({
  videoRef,
  currentTime,
  duration,
  highlightClips,
  isPlayingClips,
  setCurrentClipIndex,
}: ClipProgressBarProps) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Handle mouse move for hover and dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;

    const { x, time } = calculateMousePosition(e, duration);

    // Always update hover preview
    setHoverTime(time);
    setHoverPosition(x);

    // Handle dragging if active
    if (isDragging && isTimeInClips(time, highlightClips)) {
      seekToTime(videoRef, time, isPlayingClips, highlightClips, setCurrentClipIndex);
    }
  };

  // Handle mouse down for starting drag or click
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;

    const { time } = calculateMousePosition(e, duration);

    if (isTimeInClips(time, highlightClips)) {
      setIsDragging(true);
      seekToTime(videoRef, time, isPlayingClips, highlightClips, setCurrentClipIndex);
    }
  };

  // Handle click (same as mouse down but for accessibility)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0 || isDragging) return;

    const { time } = calculateMousePosition(e, duration);

    if (isTimeInClips(time, highlightClips)) {
      seekToTime(videoRef, time, isPlayingClips, highlightClips, setCurrentClipIndex);
    }
  };

  // Clean up dragging on mouse up
  useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(false);
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);


  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 font-mono min-w-max">{formatTime(currentTime)}</span>

      <div className="flex-1 relative">
        {/* Time preview tooltip - positioned outside the overflow-hidden container */}
        {hoverTime !== null && duration > 0 && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 bg-black bg-opacity-90 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50"
            style={{
              left: `${hoverPosition}px`,
              transform: "translateX(-50%)",
            }}>
            {formatTime(hoverTime)}
          </div>
        )}
        
        <div
          className="relative w-full h-3 bg-gray-200 rounded-lg overflow-hidden cursor-pointer select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          onMouseDown={handleMouseDown}
          onMouseUp={() => setIsDragging(false)}
          onClick={handleClick}>
          {/* Video duration background */}
          <div className="absolute inset-0 bg-gray-300"></div>

          {/* Highlight clips */}
          {highlightClips.map((clip, index) => (
            <div
              key={index}
              className="absolute h-full bg-blue-500"
              style={{
                left: `${duration > 0 ? (clip.startTime / duration) * 100 : 0}%`,
                width: `${duration > 0 ? ((clip.endTime - clip.startTime) / duration) * 100 : 0}%`,
              }}
            />
          ))}

          {/* Current progress indicator */}
          <div
            className="absolute top-0 w-1 h-full bg-red-500 z-10"
            style={{
              left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
      
      <span className="text-sm text-gray-500 font-mono min-w-max">{formatTime(duration)}</span>
    </div>
  );
};

export default ClipProgressBar;
