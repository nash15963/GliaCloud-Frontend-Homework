import { useRef, useCallback, useState, useEffect } from "react";
import { PlayIcon, PauseIcon, TrackPreviousIcon, TrackNextIcon, TextIcon } from "@radix-ui/react-icons";
import Hls from "hls.js";

// Subtitle interface
interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

interface CustomVideoPlayerProps {
  src: string;
  currentTimestamp?: number | null;
  onTimestampHandled?: () => void;
  onTimeUpdate?: (time: number) => void;
  subtitles?: Subtitle[];
}

const CustomVideoPlayer = ({ src, currentTimestamp, onTimestampHandled, onTimeUpdate, subtitles = [] }: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<Array<{start: number, end: number}>>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const initializeHls = useCallback(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
        });
        
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          console.log('HLS manifest loaded');
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS error:', data);
          setIsLoading(false);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setIsLoading(false);
      } else {
        console.error('HLS is not supported');
        setIsLoading(false);
      }
    } else {
      video.src = src;
      setIsLoading(false);
    }
  }, [src]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const skipForward = useCallback((seconds: number = 10) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + seconds, video.duration);
  }, []);

  const skipBackward = useCallback((seconds: number = 10) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - seconds, 0);
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  }, []);

  const toggleSubtitles = useCallback(() => {
    setShowSubtitles(prev => !prev);
  }, []);

  // Handle progress bar dragging
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    setDragTime(newTime);
  }, [duration]);

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const progressBar = document.querySelector('.progress-bar-container') as HTMLElement;
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, moveX / rect.width));
    const newTime = percentage * duration;
    setDragTime(newTime);
  }, [isDragging, duration]);

  const handleProgressMouseUp = useCallback(() => {
    if (isDragging) {
      seekTo(dragTime);
      setIsDragging(false);
    }
  }, [isDragging, dragTime, seekTo]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging]);

  // Handle hover for time preview
  const handleProgressMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    const time = percentage * duration;
    setHoverTime(time);
    setHoverPosition(hoverX);
  }, [duration]);

  const handleProgressMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleProgressMouseHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    const time = percentage * duration;
    setHoverTime(time);
    setHoverPosition(hoverX);
  }, [duration, isDragging]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const updateBufferedRanges = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.buffered) return;

    const ranges: Array<{start: number, end: number}> = [];
    for (let i = 0; i < video.buffered.length; i++) {
      ranges.push({
        start: video.buffered.start(i),
        end: video.buffered.end(i)
      });
    }
    setBufferedRanges(ranges);
  }, []);

  // Find current subtitle based on current time
  const updateCurrentSubtitle = useCallback((time: number) => {
    const activeSubtitle = subtitles.find(subtitle => 
      time >= subtitle.startTime && time <= subtitle.endTime
    );
    setCurrentSubtitle(activeSubtitle?.text || "");
  }, [subtitles]);

  useEffect(() => {
    if (src) {
      setIsLoading(true);
      initializeHls();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, initializeHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
      updateCurrentSubtitle(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleProgress = () => {
      updateBufferedRanges();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
    };
  }, [updateBufferedRanges, updateCurrentSubtitle]);

  useEffect(() => {
    if (currentTimestamp !== null && currentTimestamp !== undefined) {
      seekTo(currentTimestamp);
      const video = videoRef.current;
      if (video && video.paused) {
        video.play();
        setIsPlaying(true);
      }
      onTimestampHandled?.();
    }
  }, [currentTimestamp]);

  return (
    <div className="video-player-wrapper flex flex-col gap-3">
      {/* Video playback area with subtitle overlay - Fixed aspect ratio */}
      <div className="rounded-xl overflow-hidden shadow-md w-full bg-black relative aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          preload="metadata"
          // Remove controls attribute to hide native controls
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-sm">Loading...</div>
          </div>
        )}

        {/* Subtitle overlay - Positioned at bottom of video */}
        {currentSubtitle && showSubtitles && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-75 rounded max-w-[90%]">
            <span className="text-white text-center text-sm md:text-base leading-relaxed block">
              {currentSubtitle}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-mono min-w-max transition-colors duration-200 ${
            isDragging ? 'text-blue-600 font-semibold' : 'text-gray-500'
          }`}>
            {formatTime(isDragging ? dragTime : currentTime)}
          </span>
          <div className="flex-1 relative">
            {/* Custom progress bar container */}
            <div 
              className="progress-bar-container relative w-full h-2 bg-gray-200 rounded-lg cursor-pointer hover:h-3 transition-all duration-200 group select-none"
              onMouseDown={handleProgressMouseDown}
              onMouseEnter={handleProgressMouseEnter}
              onMouseLeave={handleProgressMouseLeave}
              onMouseMove={handleProgressMouseHover}
            >
              {/* Buffered ranges - gray background */}
              {bufferedRanges.map((range, index) => (
                <div
                  key={index}
                  className="absolute h-full bg-gray-400 rounded-lg transition-all duration-200"
                  style={{
                    left: `${duration > 0 ? (range.start / duration) * 100 : 0}%`,
                    width: `${duration > 0 ? ((range.end - range.start) / duration) * 100 : 0}%`
                  }}
                />
              ))}
              
              {/* Current progress - blue with hover effect */}
              <div
                className={`absolute h-full bg-blue-500 rounded-lg transition-all group-hover:bg-blue-600 ${
                  isDragging ? 'duration-0' : 'duration-100'
                }`}
                style={{
                  width: `${duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0}%`
                }}
              />
              
              {/* Progress indicator dot - appears on hover or drag */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg transition-opacity duration-200 ${
                  isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
                }`}
                style={{
                  left: `calc(${duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0}% - 8px)`
                }}
              />
              
              {/* Time preview tooltip */}
              {hoverTime !== null && !isDragging && (
                <div 
                  className="absolute bottom-full mb-2 px-2 py-1 bg-black bg-opacity-80 text-white text-xs rounded whitespace-nowrap pointer-events-none z-10"
                  style={{
                    left: `${hoverPosition}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Invisible range input for accessibility */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={isDragging ? dragTime : currentTime}
                onChange={(e) => !isDragging && seekTo(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <span className="text-sm text-gray-500 font-mono min-w-max">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            onClick={() => skipBackward()}
            disabled={isLoading}
          >
            <TrackPreviousIcon className="w-4 h-4" />
          </button>

          <button
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            onClick={togglePlayPause}
            disabled={isLoading}
          >
            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          </button>

          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            onClick={() => skipForward()}
            disabled={isLoading}
          >
            <TrackNextIcon className="w-4 h-4" />
          </button>

          <button
            className={`flex items-center gap-2 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 ${
              showSubtitles 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            onClick={toggleSubtitles}
            disabled={isLoading}
            title={showSubtitles ? "Hide Subtitles" : "Show Subtitles"}
          >
            <TextIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;