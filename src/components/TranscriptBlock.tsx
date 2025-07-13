import type { ApiEndpoints } from '@/types/api';
import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

type ApiResponse = NonNullable<ApiEndpoints["IVideoData"]["response"]>;
type TRawVideoData = ApiResponse["data"];

interface TransformSection {
  title: string;
  script: Array<{
    id: string;
    startTime: number;
    endTime: number;
    text: string;
  }>;
}
interface Props {
  videoDataMutation?: UseMutationResult<ApiResponse, Error, string | undefined, unknown>;
  onTimestampClick?: (timestamp: number) => void;
  currentTime?: number;
  selectedHighlights?: string[];
  onHighlightToggle?: (selectedIds: string[]) => void;
}

// Pure function to transform videoDataMutation data - shows all sentences from transcript
const transformVideoData = (videoData?: TRawVideoData): TransformSection[] => {
  if (!videoData?.transcript?.sections) {
    return [];
  }

  return videoData.transcript.sections.map((section) => ({
    title: section.title,
    script: section.sentences.map((sentence) => ({
      id: sentence.id,
      startTime: sentence.startTime,
      endTime: sentence.endTime,
      text: sentence.text,
    })),
  }));
};

const TranscriptBlock = ({ 
  videoDataMutation, 
  onTimestampClick, 
  currentTime = 0, 
  selectedHighlights = [], 
  onHighlightToggle 
}: Props) => {
  const transformedData = transformVideoData(videoDataMutation?.data?.data);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Check if a script item is currently playing (within 1 second window)
  const isCurrentlyPlaying = (startTime: number) => {
    return Math.abs(currentTime - startTime) < 1;
  };

  // Handle checkbox toggle for highlights
  const handleHighlightToggle = (sentenceId: string) => {
    if (!onHighlightToggle) return;
    
    const newSelectedHighlights = selectedHighlights.includes(sentenceId)
      ? selectedHighlights.filter(id => id !== sentenceId)
      : [...selectedHighlights, sentenceId];
    
    onHighlightToggle(newSelectedHighlights);
  };

  // Apply suggested highlights
  const applySuggestedHighlights = () => {
    if (!onHighlightToggle || !videoDataMutation?.data?.data?.suggestedHighlights) return;
    
    // Get all sentence IDs that fall within suggested highlight time ranges
    const allSentences = videoDataMutation.data.data.transcript.sections
      .flatMap(section => section.sentences);
    
    const suggestedSentenceIds: string[] = [];
    
    videoDataMutation.data.data.suggestedHighlights.forEach(highlight => {
      const sentencesInRange = allSentences.filter(sentence => 
        sentence.startTime >= highlight.startTime && sentence.endTime <= highlight.endTime
      );
      suggestedSentenceIds.push(...sentencesInRange.map(s => s.id));
    });
    
    onHighlightToggle(suggestedSentenceIds);
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Video Transcript 
          {selectedHighlights.length > 0 && (
            <span className="text-sm text-blue-600 font-normal ml-2">
              ({selectedHighlights.length} selected)
            </span>
          )}
        </h3>
        
        {videoDataMutation?.data?.data?.suggestedHighlights && (
          <div className="flex gap-2">
            <button
              onClick={applySuggestedHighlights}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200"
              disabled={videoDataMutation.isPending}
            >
              Apply AI Suggestions
            </button>
            <button
              onClick={() => onHighlightToggle?.([])}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
              disabled={videoDataMutation.isPending || selectedHighlights.length === 0}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {videoDataMutation?.isPending && (
        <div className="text-gray-500">Loading transcript...</div>
      )}
      
      {videoDataMutation?.isError && (
        <div className="text-red-500">Error loading transcript</div>
      )}
      
      {transformedData.length === 0 && !videoDataMutation?.isPending && (
        <div className="text-gray-500">No transcript content available</div>
      )}
      
      {transformedData.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-8 last:mb-0">
          <h4 className="text-md font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">
            {section.title}
          </h4>
          
          <div className="space-y-3">
            {section.script.map((scriptItem, scriptIndex) => {
              const isHighlighted = isCurrentlyPlaying(scriptItem.startTime);
              const isSelected = selectedHighlights.includes(scriptItem.id);
              return (
                <div
                  key={scriptIndex}
                  ref={isHighlighted ? activeItemRef : null}
                  className={`p-4 border-l-4 rounded-r-md hover:bg-gray-100 transition-all duration-200 shadow-sm ${
                    isHighlighted 
                      ? 'bg-blue-100 border-blue-600 shadow-md transform scale-[1.02]' 
                      : isSelected
                      ? 'bg-green-50 border-green-400 hover:shadow-md'
                      : 'bg-white border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox for highlight selection */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleHighlightToggle(scriptItem.id)}
                      className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Timestamp */}
                    <span 
                      className="text-xs text-gray-500 font-mono min-w-max hover:text-blue-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimestampClick?.(scriptItem.startTime);
                      }}
                    >
                      {Math.floor(scriptItem.startTime / 60)}:{Math.floor(scriptItem.startTime % 60).toString().padStart(2, '0')}
                    </span>
                    
                    {/* Text content */}
                    <span 
                      className="text-sm text-gray-800 cursor-pointer flex-1"
                      onClick={() => onTimestampClick?.(scriptItem.startTime)}
                    >
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

