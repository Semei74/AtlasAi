import type { CircuitBreakerConfig } from "../../circuit-breaker/interfaces/circuit-breaker.interface.js";
import type { RetryPolicyConfig } from "../../retry/interfaces/retry-policy.interface.js";

export interface ProviderConfiguration {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly circuitBreaker?: Partial<CircuitBreakerConfig>;
  readonly retryPolicy?: Partial<RetryPolicyConfig>;
}
