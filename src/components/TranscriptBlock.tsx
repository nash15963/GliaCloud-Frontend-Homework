import type { ApiEndpoints } from '@/types/api';
import type { UseMutationResult } from '@tanstack/react-query';

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

const TranscriptBlock = ({ videoDataMutation }: Props) => {
  const transformedData = transformVideoData(videoDataMutation?.data?.data);

  return (
    <div
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
        <div key={sectionIndex} className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">
            {section.title}
          </h4>
          
          <div className="space-y-2">
            {section.script.map((scriptItem, scriptIndex) => (
              <div
                key={scriptIndex}
                className="p-3 bg-white border-l-4 border-blue-400 rounded-r-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-500 font-mono min-w-max">
                    {Math.floor(scriptItem.startTime / 60)}:{Math.floor(scriptItem.startTime % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-800">
                    {scriptItem.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptBlock;

