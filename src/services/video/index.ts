import { apiClient } from '@/utils/api-client';
import type { 
  IVideoProcess, 
  IGetTranscript, 
  IUpdateHighlights, 
  IGenerateHighlights 
} from '@/types/api';

// Video API service using the typed API client
export class VideoApiService {
  // Process uploaded video
  static async processVideo(videoFile: File) {
    const formData = new FormData();
    formData.append('video', videoFile);

    return apiClient.request<IVideoProcess>({
      url: '/api/video/process',
      method: 'POST',
      body: formData,
      response: { success: true, data: undefined },
    });
  }

  // Get video transcript
  static async getTranscript(videoId: string) {
    return apiClient.request<IGetTranscript>({
      url: '/api/video/:videoId/transcript',
      method: 'GET',
      params: { videoId },
      response: { success: true, data: undefined },
    });
  }

  // Update highlight selections
  static async updateHighlights(
    videoId: string, 
    sentences: Array<{ id: string; isHighlight: boolean }>
  ) {
    return apiClient.request<IUpdateHighlights>({
      url: '/api/video/:videoId/highlights',
      method: 'PATCH',
      params: { videoId },
      body: { sentences },
      response: { success: true, data: undefined },
    });
  }

  // Generate highlight video
  static async generateHighlights(videoId: string) {
    return apiClient.request<IGenerateHighlights>({
      url: '/api/video/:videoId/generate-highlights',
      method: 'POST',
      params: { videoId },
      response: { success: true, data: undefined },
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