// Video API endpoints definition

import type { mockMetaData } from '@/mocks/mocks';
import type { ApiEndpoint, EndpointConfigItem } from '@/types/utils/http';

// Domain types for video transcript functionality
export interface ISentence {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  isHighlight: boolean;
}

export interface ITranscriptSection {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  sentences: ISentence[];
}

export interface ITranscriptData {
  sections: ITranscriptSection[];
  duration: number;
  aiSuggestions: string[];
}

export interface IVideoProcessResponse {
  videoId: string;
  fileName: string;
  transcript: ITranscriptData;
}

// api check health endpoint
export type ICheckHealth = ApiEndpoint<{
  url: "/health";
  method: "GET";
  response: {
    success: boolean;
    message: string;
  };
}>;

// Define all video API endpoints
export type IVideoProcess = ApiEndpoint<{
  url: "/video/process";
  method: "POST";
  body: FormData;
  response: {
    success: boolean;
    message: string;
    data: {
      videoId: string;
    };
  };
}>;

// GET /api/video/:videoId/status
export type IVideoStatus = ApiEndpoint<{
  url: "/video/:videoId/status";
  method: "GET";
  params: { videoId: string };
  response: {
    success: boolean;
    message: string;
    data?: {
      status: "processing" | "completed" | "failed";
      progress?: number; // Optional, only if status is "processing"
    };
  };
}>;

// GET /api/video/:videoId/metadata
export type IVideoMetadata = ApiEndpoint<{
  url: "/video/:videoId/metadata";
  method: "GET";
  params: { videoId: string };
  response: {
    success: boolean;
    data?: typeof mockMetaData;
  };
}>;

// ---

export type IGetTranscript = ApiEndpoint<{
  url: "/video/:videoId/transcript";
  method: "GET";
  params: { videoId: string };
  response: {
    success: boolean;
    data?: ITranscriptData;
  };
}>;

export type IUpdateHighlights = ApiEndpoint<{
  url: "/video/:videoId/highlights";
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
  url: "/video/:videoId/generate-highlights";
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

// Create a unified API endpoints mapping
export interface ApiEndpoints {
  ICheckHealth: ICheckHealth;
  IVideoProcess: IVideoProcess;
  IGetTranscript: IGetTranscript;
  IUpdateHighlights: IUpdateHighlights;
  IGenerateHighlights: IGenerateHighlights;
}


export const endpointConfig = {
  ICheckHealth: { url: "/health", method: "GET" },
  IVideoProcess: { url: "/video/process", method: "POST" },
  IGetTranscript: { url: "/video/:videoId/transcript", method: "GET" },
  IUpdateHighlights: { url: "/video/:videoId/highlights", method: "PATCH" },
  IGenerateHighlights: { url: "/video/:videoId/generate-highlights", method: "POST" },
} as const satisfies Record<keyof ApiEndpoints, EndpointConfigItem>;
