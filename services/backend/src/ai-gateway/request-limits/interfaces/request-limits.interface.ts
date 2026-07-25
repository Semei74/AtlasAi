export interface RequestLimitsConfig {
  readonly maxPromptLength: number;
  readonly maxResponseLength: number;
  readonly maxContextLength: number;
  readonly maxAttachments: number;
  readonly maxAttachmentSizeBytes: number;
  readonly maxStreamingDurationMs: number;
  readonly maxMessagesPerRequest: number;
}

export interface RequestLimits {
  readonly config: RequestLimitsConfig;
  validatePrompt(prompt: string): RequestLimitResult;
  validateResponse(response: string): RequestLimitResult;
  validateContext(context: string): RequestLimitResult;
  validateAttachments(count: number): RequestLimitResult;
  validateStreamingDuration(durationMs: number): RequestLimitResult;
  validateMessages(count: number): RequestLimitResult;
}

export interface RequestLimitResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly current: number;
  readonly limit: number;
}

export const REQUEST_LIMITS_SERVICE = "REQUEST_LIMITS_SERVICE";

export interface RequestLimitsService {
  getOrCreate(name: string, config?: Partial<RequestLimitsConfig>): RequestLimits;
  validatePrompt(name: string, prompt: string): RequestLimitResult;
  validateResponse(name: string, response: string): RequestLimitResult;
  validateContext(name: string, context: string): RequestLimitResult;
  validateAttachments(name: string, count: number): RequestLimitResult;
  validateStreamingDuration(name: string, durationMs: number): RequestLimitResult;
  validateMessages(name: string, count: number): RequestLimitResult;
}
