import VideoPlayer from "./VideoPlayer";
import type { ApiEndpoints } from "@/types/api";
import ProcessingState from "./VideoBlock/ProcessingState";
import ErrorState from "./VideoBlock/ErrorState";
import UploadPrompt from "./VideoBlock/UploadPrompt";
import { useVideoUpload } from "@/hooks/useVideoUpload";

type ApiResponse = NonNullable<ApiEndpoints["IVideoData"]["response"]>;
type TRawVideoData = ApiResponse["data"];

// Subtitle interface
interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

// transform video data to subtitle array
const transformToSubtitles = (videoData?: TRawVideoData): Subtitle[] => {
  if (!videoData?.transcript?.sections) {
    return [];
  }

  const subtitles: Subtitle[] = [];

  videoData.transcript.sections.forEach((section) => {
    section.sentences.forEach((sentence) => {
      subtitles.push({
        startTime: sentence.startTime,
        endTime: sentence.endTime,
        text: sentence.text,
      });
    });
  });

  // Sort by start time to ensure proper order
  return subtitles.sort((a, b) => a.startTime - b.startTime);
};

// generate clips from selected highlights - merge consecutive sentences into continuous segments
const generateHighlightClips = (
  selectedHighlights: string[],
  videoData?: TRawVideoData
): Array<{ startTime: number; endTime: number }> => {
  if (selectedHighlights.length === 0) {
    return [];
  }

  if (!videoData?.transcript?.sections) {
    return [];
  }

  const selectedSentences = videoData.transcript.sections
    .flatMap((section) => section.sentences)
    .filter((sentence) => selectedHighlights.includes(sentence.id))
    .sort((a, b) => a.startTime - b.startTime);

  if (selectedSentences.length === 0) return [];

  const clips: Array<{ startTime: number; endTime: number }> = [];
  let currentClip = {
    startTime: selectedSentences[0].startTime,
    endTime: selectedSentences[0].endTime,
  };

  for (let i = 1; i < selectedSentences.length; i++) {
    const sentence = selectedSentences[i];
    const previousSentence = selectedSentences[i - 1];

    // If current sentence starts immediately after the previous one ends (or with small gap < 1 second),
    // extend the current clip
    if (sentence.startTime - previousSentence.endTime <= 1) {
      currentClip.endTime = sentence.endTime;
    } else {
      // Gap is too large, start a new clip
      clips.push(currentClip);
      currentClip = {
        startTime: sentence.startTime,
        endTime: sentence.endTime,
      };
    }
  }
  clips.push(currentClip);

  return clips;
};

interface Props {
  handleVideoProcess: (file: File) => void;
  currentTimestamp?: number | null;
  onTimestampHandled?: () => void;
  onTimeUpdate?: (time: number) => void;
  data: TRawVideoData;
  state: {
    loading: boolean;
    error : boolean;
    success: boolean;
  }
  selectedHighlights?: string[];
}

const VideoPlayerBlock = ({
  data,
  state,
  handleVideoProcess,
  currentTimestamp,
  onTimestampHandled,
  onTimeUpdate,
  selectedHighlights = [],
}: Props) => {

  const {
    videoSrc,
    selectedFileName,
    handleUploadClick,
    FileInput
  } = useVideoUpload({
    onVideoProcess: handleVideoProcess
  });

  const subtitles = transformToSubtitles(data);
  const highlightClips = generateHighlightClips(selectedHighlights, data);

  return (
    <div className="w-full min-h-[500px] border border-gray-300 rounded-lg bg-white shadow-sm p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Video Player{selectedFileName && <span className="text-gray-600 font-normal"> - {selectedFileName}</span>}
      </h3>
      <FileInput />

      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        {videoSrc && state.success && (
          <VideoPlayer
            // use data?.url for mock video or videoSrc for uploaded video
            src={data?.url || videoSrc}
            currentTimestamp={currentTimestamp}
            onTimestampHandled={onTimestampHandled}
            onTimeUpdate={onTimeUpdate}
            subtitles={subtitles}
            highlightClips={highlightClips}
          />
        )}
        {videoSrc && state.loading && <ProcessingState />}
        {videoSrc && state.error && <ErrorState onRetry={handleUploadClick} />}
        {!videoSrc && <UploadPrompt onUploadClick={handleUploadClick} />}
      </div>
    </div>
  );
};

export default VideoPlayerBlock;
