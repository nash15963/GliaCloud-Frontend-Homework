import { useRef, useCallback, useState, useEffect } from "react";
import { PlayIcon, PauseIcon, TrackPreviousIcon, TrackNextIcon, TextIcon } from "@radix-ui/react-icons";
import Hls from "hls.js";
import ClipProgressBar from "./VideoPlayer/ClipProgressBar";
import ControlButton from "./VideoPlayer/ControlButton";
import VideoDisplay from "./VideoPlayer/VideoDisplay";

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
      <VideoDisplay
        videoRef={videoRef}
        isLoading={isLoading}
        currentSubtitle={currentSubtitle}
        showSubtitles={showSubtitles}
      />

      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
        {/* Custom Clip Progress Bar */}
        <ClipProgressBar
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          highlightClips={highlightClips}
          isPlayingClips={isPlayingClips}
          setCurrentClipIndex={setCurrentClipIndex}
        />

        <div className="flex justify-center gap-3">
          <ControlButton
            variant="blue"
            onClick={() => skipBackward()}
            disabled={isLoading || highlightClips.length <= 1}
          >
            <TrackPreviousIcon className="w-4 h-4" />
          </ControlButton>

          <ControlButton
            variant="green"
            onClick={togglePlayPause}
            disabled={isLoading}
          >
            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          </ControlButton>

          <ControlButton
            variant="blue"
            onClick={() => skipForward()}
            disabled={isLoading || highlightClips.length <= 1}
          >
            <TrackNextIcon className="w-4 h-4" />
          </ControlButton>

          <ControlButton
            variant={showSubtitles ? 'yellow' : 'gray'}
            onClick={() => setShowSubtitles(prev => !prev)}
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