export interface RetryPolicyConfig {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly timeoutMs: number;
  readonly jitter: boolean;
  readonly retryableStatusCodes: readonly number[];
}

export interface RetryPolicy {
  readonly config: RetryPolicyConfig;
  getDelay(attempt: number): number;
  shouldRetry(attempt: number, statusCode: number): boolean;
}

export const RETRY_POLICY_SERVICE = "RETRY_POLICY_SERVICE";

export interface RetryPolicyService {
  getOrCreate(name: string, config?: Partial<RetryPolicyConfig>): RetryPolicy;
  execute<T>(name: string, fn: () => Promise<T>, attempt?: number): Promise<T>;
  getConfig(name: string): RetryPolicyConfig | null;
}
