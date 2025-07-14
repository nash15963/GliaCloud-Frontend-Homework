import { useRef, useCallback, useState, useEffect } from "react";
import { PlayIcon, PauseIcon, TrackPreviousIcon, TrackNextIcon, TextIcon } from "@radix-ui/react-icons";
import Hls from "hls.js";

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
  currentTimestamp?: number | null;
  onTimestampHandled?: () => void;
  onTimeUpdate?: (time: number) => void;
  subtitles?: Subtitle[];
  highlightClips?: Clip[];
}

const CustomVideoPlayer = ({ src, currentTimestamp, onTimestampHandled, onTimeUpdate, subtitles = [], highlightClips = [] }: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [isPlayingClips, setIsPlayingClips] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  // Play only highlight clips or full video if no clips selected
  const playHighlightClips = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (highlightClips.length === 0) {
      // No clips selected, play full video
      setIsPlayingClips(false);
      video.currentTime = 0;
      video.play();
      setIsPlaying(true);
      return;
    }

    // Play clips in sequence
    setIsPlayingClips(true);
    setCurrentClipIndex(0);
    video.currentTime = highlightClips[0].startTime;
    video.play();
    setIsPlaying(true);
  }, [highlightClips]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (highlightClips.length > 0 && !isPlayingClips) {
        playHighlightClips();
      } else {
        video.play();
        setIsPlaying(true);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [highlightClips, isPlayingClips, playHighlightClips]);

  // Find which clip the current time belongs to
  const getCurrentClipIndex = useCallback((currentVideoTime: number) => {
    return highlightClips.findIndex(clip => 
      currentVideoTime >= clip.startTime && currentVideoTime <= clip.endTime
    );
  }, [highlightClips]);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video || highlightClips.length <= 1) return;

    // Jump to next clip
    const nextClipIndex = currentClipIndex + 1;
    if (nextClipIndex < highlightClips.length) {
      setCurrentClipIndex(nextClipIndex);
      video.currentTime = highlightClips[nextClipIndex].startTime;
      if (!isPlaying) {
        setIsPlayingClips(true);
        video.play();
        setIsPlaying(true);
      }
    } else {
      // At last clip, jump to first clip
      setCurrentClipIndex(0);
      video.currentTime = highlightClips[0].startTime;
      if (!isPlaying) {
        setIsPlayingClips(true);
        video.play();
        setIsPlaying(true);
      }
    }
  }, [highlightClips, currentClipIndex, isPlaying]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video || highlightClips.length <= 1) return;

    // Jump to previous clip
    const prevClipIndex = currentClipIndex - 1;
    if (prevClipIndex >= 0) {
      setCurrentClipIndex(prevClipIndex);
      video.currentTime = highlightClips[prevClipIndex].startTime;
      if (!isPlaying) {
        setIsPlayingClips(true);
        video.play();
        setIsPlaying(true);
      }
    } else {
      // At first clip, jump to last clip
      const lastClipIndex = highlightClips.length - 1;
      setCurrentClipIndex(lastClipIndex);
      video.currentTime = highlightClips[lastClipIndex].startTime;
      if (!isPlaying) {
        setIsPlayingClips(true);
        video.play();
        setIsPlaying(true);
      }
    }
  }, [highlightClips, currentClipIndex, isPlaying]);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  }, []);

  const toggleSubtitles = useCallback(() => {
    setShowSubtitles(prev => !prev);
  }, []);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle hover for time preview on progress bar
  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) {
      return; // Don't show hover if no duration
    }
    
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

  // Check if a time position is within any selected clip
  const isTimeInClips = useCallback((time: number) => {
    return highlightClips.some(clip => 
      time >= clip.startTime && time <= clip.endTime
    );
  }, [highlightClips]);

  // Find which clip contains the given time
  const findClipForTime = useCallback((time: number) => {
    return highlightClips.find(clip => 
      time >= clip.startTime && time <= clip.endTime
    );
  }, [highlightClips]);

  // Handle progress bar click for seeking
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = percentage * duration;
    
    // Only allow seeking if the time is within a selected clip
    if (isTimeInClips(seekTime)) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = seekTime;
        
        // Update clip index if we're playing clips
        if (isPlayingClips) {
          const newClipIndex = getCurrentClipIndex(seekTime);
          if (newClipIndex >= 0) {
            setCurrentClipIndex(newClipIndex);
          }
        }
      }
    }
  }, [duration, isTimeInClips, getCurrentClipIndex, isPlayingClips]);

  // Handle mouse down for dragging
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = percentage * duration;
    
    // Only start dragging if the click is within a selected clip
    if (isTimeInClips(seekTime)) {
      setIsDragging(true);
      handleProgressClick(e);
    }
  }, [duration, isTimeInClips, handleProgressClick]);

  // Handle mouse move during drag
  const handleProgressMouseMoveWhileDragging = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || duration <= 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, moveX / rect.width));
    const seekTime = percentage * duration;
    
    // Only allow dragging within selected clips
    if (isTimeInClips(seekTime)) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = seekTime;
        
        // Update clip index if we're playing clips
        if (isPlayingClips) {
          const newClipIndex = getCurrentClipIndex(seekTime);
          if (newClipIndex >= 0) {
            setCurrentClipIndex(newClipIndex);
          }
        }
      }
    }
  }, [isDragging, duration, isTimeInClips, getCurrentClipIndex, isPlayingClips]);

  // Handle mouse up to stop dragging
  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Enhanced mouse move handler that combines hover and drag functionality
  const handleProgressMouseMoveEnhanced = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Always update hover time for preview
    handleProgressMouseMove(e);
    
    // Handle dragging if active
    if (isDragging) {
      handleProgressMouseMoveWhileDragging(e);
    }
  }, [handleProgressMouseMove, isDragging, handleProgressMouseMoveWhileDragging]);




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
      const currentVideoTime = video.currentTime;
      setCurrentTime(currentVideoTime);
      onTimeUpdate?.(currentVideoTime);
      updateCurrentSubtitle(currentVideoTime);

      // Check if we're playing clips and need to jump to next clip
      if (isPlayingClips && highlightClips.length > 0) {
        const currentClip = highlightClips[currentClipIndex];
        if (currentClip && currentVideoTime >= currentClip.endTime) {
          // Current clip ended, move to next clip
          const nextClipIndex = currentClipIndex + 1;
          if (nextClipIndex < highlightClips.length) {
            setCurrentClipIndex(nextClipIndex);
            video.currentTime = highlightClips[nextClipIndex].startTime;
          } else {
            // All clips finished, stop playing
            video.pause();
            setIsPlaying(false);
            setIsPlayingClips(false);
            setCurrentClipIndex(0);
          }
        }
      }
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


    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      };
  }, [updateCurrentSubtitle, isPlayingClips, highlightClips, currentClipIndex]);

  // Add global mouse event listeners for drag functionality
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

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
    <div className="video-player-wrapper flex flex-col gap-3 w-[90%]">
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
        {/* Custom Clip Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-mono min-w-max">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <div 
              className="relative w-full h-3 bg-gray-200 rounded-lg overflow-hidden cursor-pointer select-none"
              onMouseMove={handleProgressMouseMoveEnhanced}
              onMouseLeave={handleProgressMouseLeave}
              onMouseDown={handleProgressMouseDown}
              onMouseUp={handleProgressMouseUp}
              onClick={handleProgressClick}
            >
              {/* Video duration background */}
              <div className="absolute inset-0 bg-gray-300"></div>
              
              {/* Highlight clips */}
              {highlightClips.map((clip, index) => (
                <div
                  key={index}
                  className="absolute h-full bg-blue-500"
                  style={{
                    left: `${duration > 0 ? (clip.startTime / duration) * 100 : 0}%`,
                    width: `${duration > 0 ? ((clip.endTime - clip.startTime) / duration) * 100 : 0}%`
                  }}
                />
              ))}
              
              {/* Current progress indicator */}
              <div
                className="absolute top-0 w-1 h-full bg-red-500 z-10"
                style={{
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                }}
              />

              {/* Time preview tooltip */}
              {hoverTime !== null && duration > 0 && (
                <div 
                  className="absolute bottom-full mb-2 px-2 py-1 bg-black bg-opacity-80 text-white text-xs rounded whitespace-nowrap pointer-events-none z-20"
                  style={{
                    left: `${hoverPosition}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 font-mono min-w-max">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => skipBackward()}
            disabled={isLoading || highlightClips.length <= 1}
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
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => skipForward()}
            disabled={isLoading || highlightClips.length <= 1}
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