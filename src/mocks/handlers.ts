import { http, HttpResponse } from 'msw'
import { endpointConfig } from '@/types/api'
import type { 
  ApiEndpointKey, 
  ApiResponse, 
  ApiBody, 
  ApiParams 
} from '@/types/utils/http'
import { aiGenMockData } from './mocks';

// Type-safe handler creator for MSW
type HandlerFunction<K extends ApiEndpointKey> = (params: {
  request: Request;
  params: ApiParams<K> extends never ? Record<string, never> : ApiParams<K>;
  body: ApiBody<K> extends never ? never : ApiBody<K>;
}) => Promise<ApiResponse<K>> | ApiResponse<K>;

// Helper to create type-safe handlers
function createTypedHandler<K extends ApiEndpointKey>(
  endpointKey: K,
  handler: HandlerFunction<K>
) {
  

  const config = endpointConfig[endpointKey];
  const url = `/api${config.url}`;

  if (config.method === 'GET') {
    return http.get(url, async ({ request, params }) => {
      const typedParams = params as ApiParams<K> extends never ? Record<string, never> : ApiParams<K>;
      const result = await handler({ 
        request, 
        params: typedParams, 
        body: undefined as ApiBody<K> extends never ? never : ApiBody<K>
      });
      return HttpResponse.json(result);
    });
  } else if (config.method === 'POST') {
    return http.post(url, async ({ request, params }) => {
      const typedParams = params as ApiParams<K> extends never ? Record<string, never> : ApiParams<K>;
      let body: ApiBody<K> extends never ? never : ApiBody<K>;
      
      try {
        // Handle different body types
        if (endpointKey === 'IVideoProcess') {
          body = await request.formData() as ApiBody<K> extends never ? never : ApiBody<K>;
        } else {
          body = await request.json() as ApiBody<K> extends never ? never : ApiBody<K>;
        }
        
        const result = await handler({ request, params: typedParams, body });
        return HttpResponse.json(result);
      } catch (error) {
        console.error('[MSW] Error in POST handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return HttpResponse.json({ success: false, error: errorMessage }, { status: 500 });
      }
    });
  } 
  // @ts-expect-error Unsupported method
  throw new Error(`Unsupported method: ${String(config.method)}`);
}

export const handlers = [
  // Type-safe health check handler
  createTypedHandler("ICheckHealth", () => {
    return {
      success: true,
      message: "API is healthy",
    };
  }),

  createTypedHandler("IVideoStatus", () => {
    return {
      success: true,
      message: "video is successfully processed",
      data: {
        status: "completed",
        progress: 100,
      }
    };
  }),

  // Type-safe video processing handler
  createTypedHandler("IVideoProcess", async ({ body }) => {
    try {
      // Check if body is FormData
      if (!body || !(body instanceof FormData)) {
        throw new Error("Request body must be FormData");
      }

      const videoFile = body.get("video") as File;

      // Check if video file exists
      if (!videoFile || !(videoFile instanceof File)) {
        throw new Error("No video file provided");
      }

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        message: "Video processed successfully",
        data: {
          videoId: "x36xhzz",
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        message: errorMessage,
        data: {
          videoId: "",
        },
      };
    }
  }),

  // Type-safe transcript retrieval handler
  createTypedHandler("IVideoData", () => {
    return {
      success: true,
      data: aiGenMockData,
    };
  }),
];