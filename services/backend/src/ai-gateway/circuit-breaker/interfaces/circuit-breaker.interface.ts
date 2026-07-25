export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly timeoutMs: number;
  readonly halfOpenMaxRequests: number;
}

export interface CircuitBreakerState {
  readonly state: CircuitState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly lastFailureTime: number | null;
  readonly lastStateChange: number;
  readonly halfOpenRequests: number;
}

export interface CircuitBreaker {
  readonly name: string;
  readonly config: CircuitBreakerConfig;
  readonly state: CircuitBreakerState;

  allowRequest(): boolean;
  onSuccess(): void;
  onFailure(): void;
  reset(): void;
}

export const CIRCUIT_BREAKER_SERVICE = "CIRCUIT_BREAKER_SERVICE";

export interface CircuitBreakerService {
  getOrCreate(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
  allowRequest(name: string): boolean;
  onSuccess(name: string): void;
  onFailure(name: string): void;
  getState(name: string): CircuitBreakerState | null;
  getAllStates(): ReadonlyMap<string, CircuitBreakerState>;
  reset(name: string): void;
  resetAll(): void;
}
