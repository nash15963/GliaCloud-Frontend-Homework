import { DownloadIcon } from "@radix-ui/react-icons";
import type { ApiEndpoints } from "@/types/api";

interface ExportButtonProps {
  selectedHighlights: string[];
  videoData?: NonNullable<ApiEndpoints["IVideoData"]["response"]["data"]>;
}

// Pure function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Pure function to get selected highlights content
const getSelectedHighlightsContent = (
  selectedHighlights: string[],
  videoData?: NonNullable<ApiEndpoints["IVideoData"]["response"]["data"]>
) => {
  if (!videoData?.transcript?.sections || selectedHighlights.length === 0) {
    return [];
  }

  const allSentences = videoData.transcript.sections
    .flatMap(section => section.sentences);

  return selectedHighlights
    .map(highlightId => allSentences.find(sentence => sentence.id === highlightId))
    .filter(sentence => sentence !== undefined)
    .sort((a, b) => a.startTime - b.startTime)
    .map(sentence => ({
      id: sentence.id,
      text: sentence.text,
      startTime: sentence.startTime,
      endTime: sentence.endTime
    }));
};

// Pure function to format time ranges
const formatTimeRanges = (selectedContent: ReturnType<typeof getSelectedHighlightsContent>): string => {
  return selectedContent.map(item => 
    `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
  ).join('\n');
};

const ExportButton: React.FC<ExportButtonProps> = ({ selectedHighlights, videoData }) => {

  // Function to handle export button click
  const handleExportClick = () => {
    const selectedContent = getSelectedHighlightsContent(selectedHighlights, videoData);
    
    if (selectedContent.length === 0) {
      alert("No highlights selected for export.");
      return;
    }

    const timeRanges = formatTimeRanges(selectedContent);

    console.log("Selected highlight time ranges:", selectedContent);
    alert(`Selected Highlights Time Ranges:\n\n${timeRanges}`);
  };

  return (
    <button
      onClick={handleExportClick}
      disabled={selectedHighlights.length === 0}
      className={`fixed top-4 right-14 z-50 p-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 ${
        selectedHighlights.length === 0 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
      aria-label="Export Highlights"
      title={selectedHighlights.length === 0 ? "No highlights selected" : "Export selected highlights"}
    >
      Export <DownloadIcon className="w-4 h-4" />
    </button>
  );
};

export default ExportButton;