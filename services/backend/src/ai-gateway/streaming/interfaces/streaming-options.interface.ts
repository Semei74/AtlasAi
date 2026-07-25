export interface StreamingRetryOptions {
  readonly attempts: number;
  readonly backoffMs: number;
}

export interface StreamingOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly retry?: StreamingRetryOptions;
  readonly chunkSize?: number;
}
