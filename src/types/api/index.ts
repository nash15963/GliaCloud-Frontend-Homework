// Video API endpoints definition

import type { ISentence, ITranscriptData, IVideoProcessResponse } from '@/types/domain/video';
import type { ApiEndpoint } from '@/types/utils/http';


// Define all video API endpoints
export type IVideoProcess = ApiEndpoint<{
  url: "/api/video/process";
  method: "POST";
  body: FormData;
  response: {
    success: boolean;
    data?: IVideoProcessResponse;
  };
}>;

export type IGetTranscript = ApiEndpoint<{
  url: "/api/video/:videoId/transcript";
  method: "GET";
  params: { videoId: string };
  response: {
    success: boolean;
    data?: ITranscriptData;
  };
}>;

export type IUpdateHighlights = ApiEndpoint<{
  url: "/api/video/:videoId/highlights";
  method: "PATCH";
  params: { videoId: string };
  body: {
    sentences: Array<{
      id: string;
      isHighlight: boolean;
    }>;
  };
  response: {
    success: boolean;
    data?: { updatedSentences: ISentence[] };
  };
}>;

export type IGenerateHighlights = ApiEndpoint<{
  url: "/api/video/:videoId/generate-highlights";
  method: "POST";
  params: { videoId: string };
  response: {
    success: boolean;
    data?: {
      highlightVideoUrl: string;
      duration: number;
    };
  };
}>;
