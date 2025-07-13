import { apiClient } from '@/utils/api-client';

// Health check API service
export class HealthCheckService {
  // Check API health status
  static async checkHealth() {
    return apiClient.request('ICheckHealth');
  }
}

// Export individual function for convenience
export const healthApi = {
  checkHealth: HealthCheckService.checkHealth,
};

// Export default service
export default HealthCheckService;