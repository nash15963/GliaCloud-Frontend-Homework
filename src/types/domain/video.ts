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