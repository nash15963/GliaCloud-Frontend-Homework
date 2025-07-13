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

  static async checkVideoStatus(videoId: string) {
    return apiClient.request('IVideoStatus', {
      params: { videoId },
    });
  }

  static async getVideoData(videoId: string) {
    return apiClient.request('IVideoData', {
      params: { videoId },
    });
  }
}

// Export individual functions for convenience
export const videoApi = {
  processVideo: VideoApiService.processVideo,
  checkVideoStatus: VideoApiService.checkVideoStatus,
  getVideoData: VideoApiService.getVideoData,
};