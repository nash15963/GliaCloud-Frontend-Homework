import type { ApiEndpoints } from '@/types/api';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import TranscriptItem from './Transcript/TranscriptItem';

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
  isLoading: boolean;
  isError: boolean;
  data: TRawVideoData;
  onTimestampClick: (timestamp: number) => void;
  currentTime?: number;
  selectedHighlights?: string[];
  onHighlightToggle: (selectedIds: string[]) => void;
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

// Pure function to handle highlight toggle
const toggleHighlight = (selectedHighlights: string[], sentenceId: string): string[] => {
  return selectedHighlights.includes(sentenceId)
    ? selectedHighlights.filter(id => id !== sentenceId)
    : [...selectedHighlights, sentenceId];
};

// Pure function to apply suggested highlights
const getSuggestedHighlights = (videoData?: TRawVideoData): string[] => {
  if (!videoData?.suggestedHighlights || !videoData?.transcript?.sections) {
    return [];
  }
  
  // Get all sentence IDs that fall within suggested highlight time ranges
  const allSentences = videoData.transcript.sections
    .flatMap(section => section.sentences);
  
  const suggestedSentenceIds: string[] = [];
  
  videoData.suggestedHighlights.forEach(highlight => {
    const sentencesInRange = allSentences.filter(sentence => 
      sentence.startTime >= highlight.startTime && sentence.endTime <= highlight.endTime
    );
    suggestedSentenceIds.push(...sentencesInRange.map(s => s.id));
  });
  
  return suggestedSentenceIds;
};

const TranscriptBlock = ({ 
  isLoading,
  isError,
  data, 
  onTimestampClick, 
  currentTime = 0, 
  selectedHighlights = [], 
  onHighlightToggle 
}: Props) => {
  const { containerRef, activeItemRef } = useAutoScroll({ triggerReload: currentTime });
  const transformedData = transformVideoData(data);
  


  // Handle checkbox toggle for highlights
  const handleHighlightToggle = (sentenceId: string) => {
    const newSelectedHighlights = toggleHighlight(selectedHighlights, sentenceId);
    onHighlightToggle(newSelectedHighlights);
  };

  // Apply suggested highlights
  const applySuggestedHighlights = () => {
    const suggestedSentenceIds = getSuggestedHighlights(data);
    onHighlightToggle(suggestedSentenceIds);
  };

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

        {data?.suggestedHighlights && (
          <div className="flex gap-2">
            <button
              onClick={applySuggestedHighlights}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200"
              disabled={isLoading}
            >
              Apply AI Suggestions
            </button>
            <button
              onClick={() => onHighlightToggle([])}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
              disabled={isLoading || selectedHighlights.length === 0}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="text-gray-500">Loading transcript...</div>
      )}

      {isError && (
        <div className="text-red-500">Error loading transcript</div>
      )}
      
      {transformedData.length === 0 && !isLoading && (
        <div className="text-gray-500">No transcript content available</div>
      )}
      
      {transformedData.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="mb-8 last:mb-0">
          <h4 className="text-md font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">
            {section.title}
          </h4>
          
          <div className="space-y-3">
            {section.script.map((scriptItem, scriptIndex) => (
              <TranscriptItem
                key={`${sectionIndex}-${scriptIndex}`}
                scriptItem={scriptItem}
                currentTime={currentTime}
                selectedHighlights={selectedHighlights}
                onHighlightToggle={handleHighlightToggle}
                onTimestampClick={onTimestampClick}
                activeItemRef={activeItemRef}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptBlock;

