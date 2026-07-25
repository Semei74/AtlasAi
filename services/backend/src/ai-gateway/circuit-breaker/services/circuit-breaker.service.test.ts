import { describe, it, expect, beforeEach, vi } from "vitest";
import { CircuitBreakerServiceImpl } from "./circuit-breaker.service.js";

const mockMetricsService = {
  aiGatewayCircuitBreakerState: { set: vi.fn() },
  aiGatewayCircuitBreakerTransitionsTotal: { inc: vi.fn() },
} as never;

describe("CircuitBreakerServiceImpl", () => {
  let service: CircuitBreakerServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CircuitBreakerServiceImpl(mockMetricsService);
  });

  it("should allow requests when circuit is closed", () => {
    service.getOrCreate("test");
    expect(service.allowRequest("test")).toBe(true);
  });

  it("should allow requests when breaker does not exist", () => {
    expect(service.allowRequest("nonexistent")).toBe(true);
  });

  it("should open circuit after failure threshold", () => {
    service.getOrCreate("test", { failureThreshold: 3, timeoutMs: 60000 });

    service.onFailure("test");
    service.onFailure("test");

    expect(service.allowRequest("test")).toBe(true);

    service.onFailure("test");

    expect(service.allowRequest("test")).toBe(false);
  });

  it("should transition to half-open after timeout", () => {
    service.getOrCreate("test", { failureThreshold: 2, timeoutMs: 50 });

    service.onFailure("test");
    service.onFailure("test");
    expect(service.allowRequest("test")).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(service.allowRequest("test")).toBe(true);
        resolve();
      }, 60);
    });
  });

  it("should close circuit after success threshold in half-open", () => {
    service.getOrCreate("test", { failureThreshold: 2, successThreshold: 2, timeoutMs: 50 });

    service.onFailure("test");
    service.onFailure("test");
    expect(service.allowRequest("test")).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(service.allowRequest("test")).toBe(true);
        service.onSuccess("test");
        service.onSuccess("test");

        expect(service.getState("test")?.state).toBe("closed");
        resolve();
      }, 60);
    });
  });

  it("should re-open circuit on failure in half-open", () => {
    service.getOrCreate("test", { failureThreshold: 2, timeoutMs: 50 });

    service.onFailure("test");
    service.onFailure("test");
    expect(service.allowRequest("test")).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(service.allowRequest("test")).toBe(true);
        service.onFailure("test");
        expect(service.allowRequest("test")).toBe(false);
        resolve();
      }, 60);
    });
  });

  it("should reset breaker state", () => {
    service.getOrCreate("test", { failureThreshold: 1 });
    service.onFailure("test");
    expect(service.allowRequest("test")).toBe(false);

    service.reset("test");
    expect(service.allowRequest("test")).toBe(true);
  });

  it("should reset all breakers", () => {
    service.getOrCreate("a", { failureThreshold: 1 });
    service.getOrCreate("b", { failureThreshold: 1 });
    service.onFailure("a");
    service.onFailure("b");

    service.resetAll();

    expect(service.allowRequest("a")).toBe(true);
    expect(service.allowRequest("b")).toBe(true);
  });

  it("should limit half-open requests", () => {
    service.getOrCreate("test", { failureThreshold: 1, halfOpenMaxRequests: 2, timeoutMs: 50 });

    service.onFailure("test");
    expect(service.allowRequest("test")).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(service.allowRequest("test")).toBe(true);
        expect(service.allowRequest("test")).toBe(true);
        expect(service.allowRequest("test")).toBe(false);
        resolve();
      }, 60);
    });
  });

  it("should return null state for nonexistent breaker", () => {
    expect(service.getState("nonexistent")).toBeNull();
  });

  it("should return all states", () => {
    service.getOrCreate("a");
    service.getOrCreate("b");

    const states = service.getAllStates();
    expect(states.size).toBe(2);
    expect(states.get("a")).toBeDefined();
    expect(states.get("b")).toBeDefined();
  });
});
