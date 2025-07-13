import type { ITranscriptData, IVideoProcessResponse } from '@/types/api'

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

export const createMockVideoProcessResponse = (videoFile: File | null): IVideoProcessResponse => {
  const fileName = videoFile?.name || 'uploaded-video.mp4';
  const videoId = 'mock-video-id-' + Date.now();
  
  return {
    videoId,
    fileName,
    transcript: mockTranscriptData
  };
}

export const mockMetaData = {
  videoId: "vid_1234567890",
  title: "Sample Video for AI Highlights",
  duration: 3600,
  hlsStreamUrl: "https://yourdomain.com/videos/vid_1234567890/master.m3u8",
  thumbnailUrl: "https://yourdomain.com/videos/vid_1234567890/thumb.jpg",
  transcript: {
    sections: [
      {
        sectionId: "sec_001",
        title: "影片開場介紹",
        startTime: 0,
        endTime: 120,
        sentences: [
          {
            id: "s1",
            timestamp: 5,
            text: "歡迎收看這個影片，我們將介紹精彩內容。",
          },
          {
            id: "s2",
            timestamp: 15,
            text: "本影片將介紹多個有趣的主題。",
          },
        ],
      },
      {
        sectionId: "sec_002",
        title: "主要內容",
        startTime: 121,
        endTime: 3590,
        sentences: [
          {
            id: "s101",
            timestamp: 130,
            text: "接下來我們會討論第一個重點。",
          },
          {
            id: "s102",
            timestamp: 150,
            text: "這個概念非常重要，請仔細聽。",
          },
        ],
      },
      {
        sectionId: "sec_003",
        title: "影片總結",
        startTime: 3591,
        endTime: 3600,
        sentences: [
          {
            id: "s201",
            timestamp: 3592,
            text: "謝謝大家的收看。",
          },
        ],
      },
    ],
  },
  suggestedHighlights: [
    {
      sentenceId: "s2",
      reason: "影片開頭介紹內容的關鍵句子。",
    },
    {
      sentenceId: "s102",
      reason: "重點清晰，適合納入精華片段。",
    },
  ],
} as const;
