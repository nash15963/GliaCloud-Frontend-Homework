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
  TResponse,
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
  response: {
    success: boolean;
    data?: TResponse;
  }
}

// API endpoint helper type
export type ApiEndpoint<T extends ApiModel<string, unknown, unknown, Record<string, string>>> = T;

// API client type helper with better typing
export type ApiClient = {
  request<T extends ApiModel<string, unknown, unknown, Record<string, string>>>(endpoint: T): Promise<T["response"]>;
};