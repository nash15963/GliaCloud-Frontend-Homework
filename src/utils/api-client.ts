import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiModel, ApiClient } from '@/types/utils/http';

// Create axios instance with base configuration
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Response interceptor - handle common errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log errors for debugging
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Build URL with path parameters
const buildUrl = (url: string, params?: Record<string, string>): string => {
  let builtUrl = url;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      builtUrl = builtUrl.replace(`:${key}`, encodeURIComponent(value));
    });
  }
  return builtUrl;
};

// Build query parameters
const buildQuery = (query?: Record<string, string | number | boolean>): Record<string, string> => {
  if (!query) return {};
  
  const result: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    result[key] = String(value);
  });
  
  return result;
};

// Create the API client implementation
export const createApiClient = (): ApiClient => {
  const axiosInstance = createAxiosInstance();

  return {
    async request<T extends ApiModel<string, unknown, unknown, Record<string, string>>>(
      endpoint: T
    ): Promise<T["response"]> {
      try {
        // Build URL with path parameters
        const url = buildUrl(endpoint.url, endpoint.params);

        // Prepare axios config
        const config: AxiosRequestConfig = {
          method: endpoint.method,
          url,
          headers: endpoint.headers,
          params: buildQuery(endpoint.query),
          responseType: endpoint.responseType || 'json',
        };

        // Handle request body
        if (endpoint.body && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
          if (endpoint.body instanceof FormData) {
            config.data = endpoint.body;
            // Remove Content-Type to let axios set it for FormData
            if (config.headers) {
              delete config.headers['Content-Type'];
            }
          } else {
            config.data = endpoint.body;
          }
        }

        // Make the request
        const response = await axiosInstance.request(config);

        // Return the backend response directly (backend controls success/data structure)
        return response.data as T["response"];

      } catch (error) {
        // Handle axios errors
        if (axios.isAxiosError(error)) {
          console.error('API Error:', {
            url: endpoint.url,
            method: endpoint.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
          });

          // If backend returns error response with data, use that
          if (error.response?.data) {
            return error.response.data as T["response"];
          }
        }

        // Handle unexpected errors - re-throw to let caller handle
        console.error('Unexpected Error:', error);
        throw error;
      }
    },
  };
};

// Export default instance
export const apiClient = createApiClient();