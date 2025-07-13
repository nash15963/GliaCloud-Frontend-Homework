import type { ApiEndpoint, EndpointConfigItem } from '@/types/utils/http';

interface ISentence {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  isHighlight: boolean;
}

// Section type definition
interface ISection {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  sentences: ISentence[];
}

// Transcript type definition
interface ITranscript {
  sections: ISection[];
  duration: number;
  aiSuggestions: string[];
}

// Video data type definition
interface IVideoData {
  videoId: string;
  fileName: string;
  url?: string;
  duration: number;
  transcript: ITranscript;
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


// GET /api/video/:videoId/data - Get complete video data including transcript
export type IGetVideoData = ApiEndpoint<{
  url: "/video/:videoId/data";
  method: "GET";
  params: { videoId: string };
  response: {
    success: boolean;
    data?: IVideoData;
  };
}>;



// Create a unified API endpoints mapping
export interface ApiEndpoints {
  ICheckHealth: ICheckHealth;
  IVideoProcess: IVideoProcess;
  IVideoStatus: IVideoStatus;
  IVideoData: IGetVideoData;
}


export const endpointConfig = {
  ICheckHealth: { url: "/health", method: "GET" },
  IVideoProcess: { url: "/video/process", method: "POST" },
  IVideoStatus: { url: "/video/:videoId/status", method: "GET" },
  IVideoData: { url: "/video/:videoId/data", method: "GET" },
} as const satisfies Record<keyof ApiEndpoints, EndpointConfigItem>;
