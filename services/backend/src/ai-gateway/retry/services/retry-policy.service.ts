import { Injectable } from "@nestjs/common";
import type { RetryPolicy, RetryPolicyConfig, RetryPolicyService } from "../interfaces/retry-policy.interface.js";

const DEFAULT_RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

const DEFAULT_CONFIG: RetryPolicyConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  timeoutMs: 60000,
  jitter: true,
  retryableStatusCodes: DEFAULT_RETRYABLE_STATUS_CODES,
};

class DefaultRetryPolicy implements RetryPolicy {
  public readonly config: RetryPolicyConfig;

  public constructor(config: Partial<RetryPolicyConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public getDelay(attempt: number): number {
    const exponential = this.config.baseDelayMs * 2 ** attempt;
    const capped = Math.min(exponential, this.config.maxDelayMs);

    if (!this.config.jitter) {
      return capped;
    }

    const jitterRange = capped * 0.25;
    const jitter = Math.random() * jitterRange;
    return Math.floor(capped + jitter);
  }

  public shouldRetry(attempt: number, statusCode: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    return this.config.retryableStatusCodes.includes(statusCode);
  }
}

class RetryError extends Error {
  public readonly attempt: number;
  public readonly statusCode: number;

  public constructor(message: string, attempt: number, statusCode: number) {
    super(message);
    this.name = "RetryError";
    this.attempt = attempt;
    this.statusCode = statusCode;
  }
}

@Injectable()
export class RetryPolicyServiceImpl implements RetryPolicyService {
  private readonly policies = new Map<string, RetryPolicy>();

  public getOrCreate(name: string, config?: Partial<RetryPolicyConfig>): RetryPolicy {
    const existing = this.policies.get(name);

    if (existing !== undefined) {
      return existing;
    }

    const policy = new DefaultRetryPolicy(config ?? {});
    this.policies.set(name, policy);
    return policy;
  }

  public async execute<T>(name: string, fn: () => Promise<T>, attempt = 0): Promise<T> {
    const policy = this.policies.get(name);

    if (policy === undefined) {
      return fn();
    }

    try {
      const result = await fn();
      return result;
    } catch (error: unknown) {
      const statusCode = error instanceof RetryError ? error.statusCode : 500;

      if (policy.shouldRetry(attempt, statusCode)) {
        const delay = policy.getDelay(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.execute(name, fn, attempt + 1);
      }

      throw error;
    }
  }

  public getConfig(name: string): RetryPolicyConfig | null {
    return this.policies.get(name)?.config ?? null;
  }
}
