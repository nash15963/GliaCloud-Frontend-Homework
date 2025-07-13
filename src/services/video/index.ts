import { apiClient } from '@/utils/api-client';

// Video API service using the typed API client
export class VideoApiService {
  // Process uploaded video
  static async processVideo(videoFile: File) {
    const formData = new FormData();
    formData.append('video', videoFile);

    return apiClient.request('IVideoProcess', {
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get video transcript
  static async getTranscript(videoId: string) {
    return apiClient.request('IGetTranscript', {
      params: { videoId },
    });
  }

  // Update highlight selections
  static async updateHighlights(
    videoId: string, 
    sentences: Array<{ id: string; isHighlight: boolean }>
  ) {
    return apiClient.request("IUpdateHighlights", {
      params: { videoId },
      body: { sentences },
    });
  }

  // Generate highlight video
  static async generateHighlights(videoId: string) {
    return apiClient.request('IGenerateHighlights', {
      params: { videoId },
    });
  }
}

// Export individual functions for convenience
export const videoApi = {
  processVideo: VideoApiService.processVideo,
  getTranscript: VideoApiService.getTranscript,
  updateHighlights: VideoApiService.updateHighlights,
  generateHighlights: VideoApiService.generateHighlights,
};