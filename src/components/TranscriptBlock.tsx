import type { ApiEndpoints } from '@/types/api';
import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

type ApiResponse = NonNullable<ApiEndpoints["IVideoData"]["response"]>;
type TRawVideoData = ApiResponse["data"];

interface TransformSection {
  title: string;
  script: Array<{
    startTime: number;
    text: string;
  }>;
}
interface Props {
  videoDataMutation?: UseMutationResult<ApiResponse, Error, string | undefined, unknown>;
  onTimestampClick?: (timestamp: number) => void;
  currentTime?: number;
}

// Pure function to transform videoDataMutation data
const transformVideoData = (videoData?: TRawVideoData): TransformSection[] => {
  if (!videoData?.transcript?.sections) {
    return [];
  }

  return videoData.transcript.sections
    .map((section) => ({
      title: section.title,
      script: section.sentences
        .filter((sentence) => sentence.isHighlight)
        .map((sentence) => ({
          startTime: sentence.startTime,
          text: sentence.text,
        })),
    }))
    .filter((section) => section.script.length > 0);
};

const TranscriptBlock = ({ videoDataMutation, onTimestampClick, currentTime = 0 }: Props) => {
  const transformedData = transformVideoData(videoDataMutation?.data?.data);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Check if a script item is currently playing (within 1 second window)
  const isCurrentlyPlaying = (startTime: number) => {
    return Math.abs(currentTime - startTime) < 1;
  };

  // Auto-scroll to follow highlighted item
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeItem = activeItemRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const activeItemRect = activeItem.getBoundingClientRect();
      
      // Check if the active item is outside the visible area
      const isAboveView = activeItemRect.top < containerRect.top;
      const isBelowView = activeItemRect.bottom > containerRect.bottom;
      
      if (isAboveView || isBelowView) {
        // Calculate the scroll position to center the active item
        const activeItemOffsetTop = activeItem.offsetTop;
        const containerHeight = container.clientHeight;
        const activeItemHeight = activeItem.clientHeight;
        
        // Center the active item in the container
        const targetScrollTop = activeItemOffsetTop - (containerHeight / 2) + (activeItemHeight / 2);
        
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime]); // Trigger when currentTime changes

  return (
    <div
      ref={containerRef}
      style={{ width: "49%", height: "90vh" }}
      className="border border-gray-300 rounded-lg bg-white shadow-sm box-border p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcript Highlights</h3>
      
      {videoDataMutation?.isPending && (
        <div className="text-gray-500">Loading transcript...</div>
      )}
      
      {videoDataMutation?.isError && (
        <div className="text-red-500">Error loading transcript</div>
      )}
      
      {transformedData.length === 0 && !videoDataMutation?.isPending && (
        <div className="text-gray-500">No highlighted content available</div>
      )}
      
      {transformedData.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-8 last:mb-0">
          <h4 className="text-md font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">
            {section.title}
          </h4>
          
          <div className="space-y-3">
            {section.script.map((scriptItem, scriptIndex) => {
              const isHighlighted = isCurrentlyPlaying(scriptItem.startTime);
              return (
                <div
                  key={scriptIndex}
                  ref={isHighlighted ? activeItemRef : null}
                  className={`p-4 border-l-4 rounded-r-md hover:bg-gray-100 transition-all duration-200 cursor-pointer shadow-sm ${
                    isHighlighted 
                      ? 'bg-blue-100 border-blue-600 shadow-md transform scale-[1.02]' 
                      : 'bg-white border-blue-400 hover:shadow-md'
                  }`}
                  onClick={() => onTimestampClick?.(scriptItem.startTime)}
                >
              
                <div className="flex items-start gap-3">
                  <span 
                    className="text-xs text-gray-500 font-mono min-w-max hover:text-blue-600 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimestampClick?.(scriptItem.startTime);
                    }}
                  >
                    {Math.floor(scriptItem.startTime / 60)}:{Math.floor(scriptItem.startTime % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-800">
                    {scriptItem.text}
                  </span>
                </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptBlock;

