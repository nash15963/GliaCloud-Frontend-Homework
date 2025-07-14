import React from 'react';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  currentSubtitle: string;
  showSubtitles: boolean;
}

const VideoDisplay = ({
  videoRef,
  isLoading,
  currentSubtitle,
  showSubtitles
}: VideoDisplayProps) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-md w-full bg-black relative aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        preload="metadata"
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
  );
};

export default VideoDisplay;