import { useRef, useCallback, useState, useEffect } from "react";
import { PlayIcon, PauseIcon, TrackPreviousIcon, TrackNextIcon } from "@radix-ui/react-icons";
import Hls from "hls.js";

interface CustomVideoPlayerProps {
  src: string;
  width?: string | number;
  height?: string | number;
  currentTimestamp?: number | null;
  onTimestampHandled?: () => void;
  onTimeUpdate?: (time: number) => void;
}

const CustomVideoPlayer = ({ src, width = "100%", height = "100%", currentTimestamp, onTimestampHandled, onTimeUpdate }: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<Array<{start: number, end: number}>>([]);

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
  }, [updateBufferedRanges]);

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
      {/* Video playback area - no native controls */}
      <div className="rounded-xl overflow-hidden shadow-md w-full bg-black relative">
        <video
          ref={videoRef}
          width={width}
          height={height}
          className="w-full h-auto"
          preload="metadata"
          // Remove controls attribute to hide native controls
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-sm">Loading...</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-mono min-w-max">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            {/* Custom progress bar container */}
            <div 
              className="relative w-full h-2 bg-gray-200 rounded-lg cursor-pointer hover:h-3 transition-all duration-200 group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                seekTo(percentage * duration);
              }}
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
                className="absolute h-full bg-blue-500 rounded-lg transition-all duration-100 group-hover:bg-blue-600"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                }}
              />
              
              {/* Progress indicator dot - appears on hover */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                style={{
                  left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)`
                }}
              />
              
              {/* Invisible range input for accessibility */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
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
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;