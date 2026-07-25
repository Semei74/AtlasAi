import { Injectable, Inject } from "@nestjs/common";
import type { CircuitBreaker, CircuitBreakerConfig, CircuitBreakerService, CircuitBreakerState, CircuitState } from "../interfaces/circuit-breaker.interface.js";
import { MetricsService } from "../../../metrics/metrics.service.js";

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeoutMs: 30000,
  halfOpenMaxRequests: 3,
};

function createInitialState(): CircuitBreakerState {
  return {
    state: "closed",
    failureCount: 0,
    successCount: 0,
    lastFailureTime: null,
    lastStateChange: Date.now(),
    halfOpenRequests: 0,
  };
}

class DefaultCircuitBreaker implements CircuitBreaker {
  public readonly name: string;
  public readonly config: CircuitBreakerConfig;
  public state: CircuitBreakerState;
  private readonly onStateChange: ((from: CircuitState, to: CircuitState) => void) | undefined;

  public constructor(
    name: string,
    config: Partial<CircuitBreakerConfig>,
    onStateChange?: (from: CircuitState, to: CircuitState) => void,
  ) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = createInitialState();
    this.onStateChange = onStateChange;
  }

  public allowRequest(): boolean {
    const now = Date.now();

    if (this.state.state === "closed") {
      return true;
    }

    if (this.state.state === "open") {
      if (this.state.lastFailureTime !== null && now - this.state.lastFailureTime >= this.config.timeoutMs) {
        const from = this.state.state;
        this.state = {
          ...this.state,
          state: "half_open",
          successCount: 0,
          failureCount: 0,
          lastStateChange: now,
          halfOpenRequests: 1,
        };
        this.onStateChange?.(from, "half_open");
        return true;
      }

      return false;
    }

    if (this.state.halfOpenRequests < this.config.halfOpenMaxRequests) {
      this.state = { ...this.state, halfOpenRequests: this.state.halfOpenRequests + 1 };
      return true;
    }

    return false;
  }

  public onSuccess(): void {
    if (this.state.state === "half_open") {
      const newSuccessCount = this.state.successCount + 1;

      if (newSuccessCount >= this.config.successThreshold) {
        this.#transitionTo("closed");
      } else {
        this.state = { ...this.state, successCount: newSuccessCount };
      }
    } else if (this.state.state === "closed") {
      this.state = { ...this.state, failureCount: 0, successCount: 0 };
    }
  }

  public onFailure(): void {
    const newFailureCount = this.state.failureCount + 1;

    if (this.state.state === "half_open") {
      this.#transitionTo("open");
      return;
    }

    if (this.state.state === "closed" && newFailureCount >= this.config.failureThreshold) {
      this.#transitionTo("open");
      return;
    }

    this.state = {
      ...this.state,
      failureCount: newFailureCount,
      lastFailureTime: Date.now(),
      successCount: 0,
    };
  }

  public reset(): void {
    this.state = createInitialState();
  }

  #transitionTo(newState: CircuitState): void {
    const from = this.state.state;
    this.state = {
      state: newState,
      failureCount: newState === "open" ? this.config.failureThreshold : 0,
      successCount: 0,
      lastFailureTime: newState === "open" ? Date.now() : this.state.lastFailureTime,
      lastStateChange: Date.now(),
      halfOpenRequests: 0,
    };
    this.onStateChange?.(from, newState);
  }
}

@Injectable()
export class CircuitBreakerServiceImpl implements CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker>();

  public constructor(
    @Inject(MetricsService)
    private readonly metricsService: MetricsService,
  ) {}

  public getOrCreate(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    const existing = this.breakers.get(name);

    if (existing !== undefined) {
      return existing;
    }

    const breaker = new DefaultCircuitBreaker(name, config ?? {}, (from, to) => {
      this.metricsService.aiGatewayCircuitBreakerState.set({ provider: name }, this.#stateToNumber(to));
      this.metricsService.aiGatewayCircuitBreakerTransitionsTotal.inc({ provider: name, from_state: from, to_state: to });
    });
    this.breakers.set(name, breaker);
    return breaker;
  }

  public allowRequest(name: string): boolean {
    const breaker = this.breakers.get(name);

    if (breaker === undefined) {
      return true;
    }

    return breaker.allowRequest();
  }

  public onSuccess(name: string): void {
    const breaker = this.breakers.get(name) ?? this.getOrCreate(name);

    breaker.onSuccess();
  }

  public onFailure(name: string): void {
    const breaker = this.breakers.get(name) ?? this.getOrCreate(name);

    breaker.onFailure();
  }

  public getState(name: string): CircuitBreakerState | null {
    return this.breakers.get(name)?.state ?? null;
  }

  public getAllStates(): ReadonlyMap<string, CircuitBreakerState> {
    const states = new Map<string, CircuitBreakerState>();
    for (const [name, breaker] of this.breakers) {
      states.set(name, breaker.state);
    }
    return states;
  }

  public reset(name: string): void {
    this.breakers.get(name)?.reset();
  }

  public resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  #stateToNumber(state: CircuitState): number {
    switch (state) {
      case "closed": return 0;
      case "half_open": return 1;
      case "open": return 2;
    }
  }
}
