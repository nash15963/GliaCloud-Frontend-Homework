import { useCallback, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface Clip {
  startTime: number;
  endTime: number;
}

interface UseVideoPlayerProps {
  src: string;
  highlightClips: Clip[];
  currentTimestamp: number | null;
  onTimestampHandled: () => void;
  onTimeUpdate: (time: number) => void;
}



// Pure function to seek to a specific clip
const seekToClip = (video: HTMLVideoElement, clipIndex: number, clips: Clip[]) => {
  if (clipIndex >= 0 && clipIndex < clips.length) {
    video.currentTime = clips[clipIndex].startTime;
    return true;
  }
  return false;
};

// Pure function to get next clip index with wrapping
const getNextClipIndex = (currentIndex: number, totalClips: number): number => {
  return currentIndex + 1 < totalClips ? currentIndex + 1 : 0;
};

// Pure function to get previous clip index with wrapping
const getPreviousClipIndex = (currentIndex: number, totalClips: number): number => {
  return currentIndex - 1 >= 0 ? currentIndex - 1 : totalClips - 1;
};

// Pure function to check if time is within any clip
const findClipIndex = (time: number, clips: Clip[]): number => {
  return clips.findIndex(clip => time >= clip.startTime && time <= clip.endTime);
};

// Pure function to handle clip transitions during playback
const handleClipTransition = (
  currentTime: number,
  currentClipIndex: number,
  clips: Clip[]
): { shouldStop: boolean; nextClipIndex?: number } => {
  if (clips.length === 0) return { shouldStop: false };
  
  const currentClip = clips[currentClipIndex];
  if (!currentClip || currentTime < currentClip.endTime) {
    return { shouldStop: false };
  }
  
  const nextClipIndex = currentClipIndex + 1;
  if (nextClipIndex < clips.length) {
    return { shouldStop: false, nextClipIndex };
  }
  
  return { shouldStop: true };
};

interface UseVideoPlayerReturn {
  // Video refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  currentClipIndex: number;
  showSubtitles: boolean;
  canPlay: boolean; // Whether video can be played (has selected clips)
  
  // State setters (for external control)
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setCurrentClipIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  
  // Control functions
  togglePlayPause: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  seekTo: (time: number) => void;
  playHighlightClips: () => void;
  toggleSubtitles: () => void;
}

/**
 * Comprehensive video player hook that combines initialization and control functionality
 * Manages video state, playback controls, and clip navigation
 */
export const useVideoPlayer = ({
  src,
  highlightClips,
  currentTimestamp,
  onTimestampHandled,
  onTimeUpdate
}: UseVideoPlayerProps): UseVideoPlayerReturn => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);

  // Derived state - can only play if there are selected clips
  const canPlay = highlightClips.length > 0;

  // Video refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Pure function to handle video play/pause logic
  const playVideo = () => {
    videoRef.current?.play();
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  // Video initialization logic (no useCallback needed - only called in useEffect)
  const initializeHls = () => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Handle HLS streams
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
        // Safari native HLS support
        video.src = src;
        setIsLoading(false);
      } else {
        console.error('HLS is not supported');
        setIsLoading(false);
      }
    } else {
      // Handle regular video files
      video.src = src;
      setIsLoading(false);
    }
  };

  // Clean up HLS instance (no useCallback needed - only called in useEffect)
  const cleanupHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  // Initialize video when source changes
  useEffect(() => {
    if (src) {
      setIsLoading(true);
      initializeHls();
    }

    // Cleanup on unmount or source change
    return cleanupHls;
  }, [src]);

  // Video event listeners and clip management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentVideoTime = video.currentTime;
      setCurrentTime(currentVideoTime);
      onTimeUpdate(currentVideoTime);

      // Check if we're playing clips and need to jump to next clip
      if (isPlaying && highlightClips.length > 0) {
        const transition = handleClipTransition(currentVideoTime, currentClipIndex, highlightClips);
        
        if (transition.shouldStop) {
          // All clips finished, stop playing
          pauseVideo();
          setIsPlaying(false);
          setCurrentClipIndex(0);
        } else if (transition.nextClipIndex !== undefined) {
          // Move to next clip
          setCurrentClipIndex(transition.nextClipIndex);
          seekToClip(video, transition.nextClipIndex, highlightClips);
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

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [isPlaying, highlightClips, currentClipIndex]);

  // Handle external timestamp navigation - Fix: Add check to prevent infinite loops
  useEffect(() => {
    if (typeof currentTimestamp === "number" && canPlay) {
      const video = videoRef.current;
      if (video) {
        seekTo(currentTimestamp);
      }
      onTimestampHandled();
    }
  }, [currentTimestamp, canPlay]);

  /**
   * Play highlight clips in sequence - only works if clips are selected
   */
  const playHighlightClips = useCallback(() => {
    const video = videoRef.current;
    if (!video || !canPlay) return;

    // Start playing from the first clip
    setCurrentClipIndex(0);
    seekToClip(video, 0, highlightClips);
    playVideo();
    setIsPlaying(true);
  }, [highlightClips, canPlay]);

  /**
   * Toggle between play and pause states
   * Only works if clips are selected
   */
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video || !canPlay) return;

    if (video.paused) {
      // If not currently playing any clip, start from the current clip index
      if (!isPlaying) {
        seekToClip(video, currentClipIndex, highlightClips);
      }
      playVideo();
      setIsPlaying(true);
    } else {
      pauseVideo();
      setIsPlaying(false);
    }
  }, [canPlay, isPlaying, highlightClips, currentClipIndex]);

  /**
   * Skip to next clip or loop to first clip
   */
  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video || !canPlay || highlightClips.length <= 1) return;

    const nextIndex = getNextClipIndex(currentClipIndex, highlightClips.length);
    setCurrentClipIndex(nextIndex);
    seekToClip(video, nextIndex, highlightClips);

    // Continue playing if was playing
    if (isPlaying) {
      playVideo();
    }
  }, [highlightClips.length, currentClipIndex, isPlaying, canPlay]);

  /**
   * Skip to previous clip or loop to last clip
   */
  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video || !canPlay || highlightClips.length <= 1) return;

    const prevIndex = getPreviousClipIndex(currentClipIndex, highlightClips.length);
    setCurrentClipIndex(prevIndex);
    seekToClip(video, prevIndex, highlightClips);

    // Continue playing if was playing
    if (isPlaying) {
      playVideo();
    }
  }, [highlightClips.length, currentClipIndex, isPlaying, canPlay]);

  /**
   * Seek to specific time in video
   * Only allows seeking within selected clips
   */
  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !canPlay) return;

      // Check if the time is within any selected clip
      const clipIndex = findClipIndex(time, highlightClips);

      if (clipIndex >= 0) {
        setCurrentClipIndex(clipIndex);
        video.currentTime = time;
      } else {
        // If time is not within clips, seek to the first clip
        if (highlightClips.length > 0) {
          setCurrentClipIndex(0);
          video.currentTime = highlightClips[0].startTime;
        }
      }
    },
    [canPlay, highlightClips]
  );

  /**
   * Toggle subtitle visibility
   */
  const toggleSubtitles = () => {
    setShowSubtitles(prev => !prev);
  };

  return {
    // Video refs
    videoRef,
    
    // State
    isPlaying,
    isLoading,
    currentTime,
    duration,
    currentClipIndex,
    showSubtitles,
    canPlay,
    
    // State setters
    setCurrentTime,
    setDuration,
    setCurrentClipIndex,
    setIsPlaying,
    
    // Control functions
    togglePlayPause,
    skipForward,
    skipBackward,
    seekTo,
    playHighlightClips,
    toggleSubtitles
  };
};

