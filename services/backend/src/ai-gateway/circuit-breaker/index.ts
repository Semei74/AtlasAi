export type {
  CircuitBreaker,
  CircuitBreakerConfig,
  CircuitBreakerService,
  CircuitBreakerState,
  CircuitState,
} from "./interfaces/circuit-breaker.interface.js";

export { CIRCUIT_BREAKER_SERVICE } from "./interfaces/circuit-breaker.interface.js";

export { CircuitBreakerServiceImpl } from "./services/circuit-breaker.service.js";
