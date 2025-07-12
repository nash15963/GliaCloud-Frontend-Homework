import type { ITranscriptData, IVideoProcessResponse } from '@/types/domain/video'

// Mock data for video transcript using proper types
export const mockTranscriptData: ITranscriptData = {
  sections: [
    {
      id: "1",
      title: "Introduction",
      startTime: 0,
      endTime: 30,
      sentences: [
        {
          id: "s1",
          text: "Welcome to our video highlight tool demonstration.",
          startTime: 0,
          endTime: 5,
          isHighlight: false,
        },
        {
          id: "s2",
          text: "This tool will help you create amazing highlight clips from your videos.",
          startTime: 5,
          endTime: 12,
          isHighlight: true,
        },
        {
          id: "s3",
          text: "Let me show you how it works step by step.",
          startTime: 12,
          endTime: 18,
          isHighlight: false,
        },
      ],
    },
    {
      id: "2",
      title: "Main Content",
      startTime: 30,
      endTime: 120,
      sentences: [
        {
          id: "s4",
          text: "First, you upload your video file using the upload button.",
          startTime: 30,
          endTime: 36,
          isHighlight: true,
        },
        {
          id: "s5",
          text: "The AI will automatically analyze the content and generate a transcript.",
          startTime: 36,
          endTime: 43,
          isHighlight: true,
        },
        {
          id: "s6",
          text: "You can then select which sentences to include in your highlight reel.",
          startTime: 43,
          endTime: 50,
          isHighlight: false,
        },
      ],
    },
    {
      id: "3",
      title: "Conclusion",
      startTime: 120,
      endTime: 150,
      sentences: [
        {
          id: "s7",
          text: "The preview will show your selected highlights with synchronized text overlay.",
          startTime: 120,
          endTime: 128,
          isHighlight: true,
        },
        {
          id: "s8",
          text: "Thank you for watching this demonstration.",
          startTime: 128,
          endTime: 133,
          isHighlight: false,
        },
      ],
    },
  ],
  duration: 150,
  aiSuggestions: ["s2", "s4", "s5", "s7"],
}

export const createMockVideoProcessResponse = (videoFile: File): IVideoProcessResponse => ({
  videoId: 'mock-video-id-' + Date.now(),
  fileName: videoFile?.name || 'uploaded-video.mp4',
  transcript: mockTranscriptData
})
