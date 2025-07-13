import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { 
  ApiEndpointKey, 
  ApiResponse, 
  ApiBody, 
  ApiParams 
} from "@/types/utils/http";
import { endpointConfig } from "@/types/api";

// Axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

// Error interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// URL builder function
const buildUrl = (url: string, params?: Record<string, string>): string => {
  if (!params) return url;
  return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)), url);
};


// Type-safe request parameters
type RequestOptions<K extends ApiEndpointKey> = {
  params?: ApiParams<K> extends never ? never : ApiParams<K>;
  body?: ApiBody<K> extends never ? never : ApiBody<K>;
  headers?: Record<string, string>;
};

// Enhanced API client with endpoint key support
export interface TypedApiClient {
  request<K extends ApiEndpointKey>(
    endpointKey: K,
    options?: RequestOptions<K>
  ): Promise<ApiResponse<K>>;
}

// Create typed API client
export const createApiClient = (): TypedApiClient => ({
  async request<K extends ApiEndpointKey>(
    endpointKey: K,
    options: RequestOptions<K> = {} as RequestOptions<K>
  ): Promise<ApiResponse<K>> {
    try {
      const config = endpointConfig[endpointKey];
      const url = buildUrl(config.url, options.params as Record<string, string>);

      const axiosConfig: AxiosRequestConfig = {
        method: config.method,
        url,
        headers: options.headers || {
          "Content-Type": options.body instanceof FormData ? "multipart/form-data" : "application/json",
        },
      };

      if (options.body && ["POST", "PUT", "PATCH"].includes(config.method)) {
        axiosConfig.data = options.body;
      }

      const { data } = await axiosInstance.request(axiosConfig);

      return data as ApiResponse<K>;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error("API Error:", {
          endpointKey,
          url: endpointConfig[endpointKey].url,
          method: endpointConfig[endpointKey].method,
          status: error.response.status,
          data: error.response.data,
        });
        return error.response.data as ApiResponse<K>;
      }

      console.error("Unexpected Error:", error);
      throw error;
    }
  },
});

// Default export for convenience
export const apiClient = createApiClient();
