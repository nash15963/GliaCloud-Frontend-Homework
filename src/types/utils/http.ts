// Base HTTP types for API layer
export type TMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Utility types for extracting params and query from URL
export type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractParams<Rest>]: string }
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : {};

export type ExtractQuery<T extends string> = T extends `${infer _Path}?${infer _Query}`
  ? Record<string, string | number | boolean>
  : {};

// Enhanced API model with type-safe params and query
export interface ApiModel<
  TRoute extends string,
  TResponse = unknown,
  TBody = never,
  THeaders extends Record<string, string> = Record<string, string>
> {
  url: TRoute;
  method: TMethod;
  headers?: THeaders;
  body?: TBody;
  params?: ExtractParams<TRoute>;
  query?: ExtractQuery<TRoute>;
  responseType?: "json" | "text" | "blob";
  response: TResponse;
}

// API endpoint helper type
export type ApiEndpoint<T extends ApiModel<string, unknown, unknown, Record<string, string>>> = T;

// Request parameters type for different endpoint configurations
export type RequestParams<T extends ApiModel<string, unknown, unknown, Record<string, string>>> = 
  {} & 
  (T extends { body: infer B } ? { body: B } : {}) &
  (T extends { params: infer P } ? { params: P } : {}) &
  (T extends { query: infer Q } ? { query: Q } : {}) &
  (T extends { headers: infer H } ? { headers: H } : {});

// API client type helper with better typing
export type ApiClient = {
  request<T extends ApiModel<string, unknown, unknown, Record<string, string>>>(endpoint: T): Promise<T["response"]>;
};



// Import ApiEndpoints for type helpers
import type { ApiEndpoints } from '@/types/api';

// Type helpers for extracting endpoint properties
export type ApiEndpointKey = keyof ApiEndpoints;
export type ApiEndpointConfig<K extends ApiEndpointKey> = ApiEndpoints[K];
export type ApiResponse<K extends ApiEndpointKey> = ApiEndpoints[K]['response'];
export type ApiBody<K extends ApiEndpointKey> = ApiEndpoints[K] extends { body: infer B } ? B : never;
export type ApiParams<K extends ApiEndpointKey> = ApiEndpoints[K] extends { params: infer P } ? P : never;
export type EndpointConfigItem = { url: string; method: TMethod };