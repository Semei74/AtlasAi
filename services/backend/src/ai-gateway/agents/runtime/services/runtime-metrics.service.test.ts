import { describe, it, expect, beforeEach } from "vitest";
import { RuntimeMetricsService } from "./runtime-metrics.service.js";
import type { ExecutionResult } from "../interfaces/execution-result.interface.js";

function createResult(overrides?: Partial<ExecutionResult>): ExecutionResult {
  return {
    output: "",
    status: "completed",
    totalTokens: 100,
    totalCost: 0.002,
    durationMs: 1000,
    modelUsed: "gpt-4",
    providerUsed: "openai",
    finishedAt: new Date(),
    error: null,
    ...overrides,
  };
}

describe("RuntimeMetricsService", () => {
  let service: RuntimeMetricsService;

  beforeEach(() => {
    service = new RuntimeMetricsService();
  });

  it("should start with zero metrics", () => {
    const m = service.getMetrics();
    expect(m.totalExecutions).toBe(0);
    expect(m.completedExecutions).toBe(0);
    expect(m.failedExecutions).toBe(0);
    expect(m.cancelledExecutions).toBe(0);
    expect(m.timedOutExecutions).toBe(0);
    expect(m.totalDurationMs).toBe(0);
    expect(m.totalTokensUsed).toBe(0);
    expect(m.totalCost).toBe(0);
    expect(m.averageDurationMs).toBe(0);
    expect(m.averageTokensPerExecution).toBe(0);
    expect(m.activeExecutions).toBe(0);
  });

  it("should track active executions on start and complete", () => {
    service.recordExecutionStart();
    expect(service.getMetrics().activeExecutions).toBe(1);

    service.recordExecutionComplete(createResult());
    expect(service.getMetrics().activeExecutions).toBe(0);
  });

  it("should increment total on complete", () => {
    service.recordExecutionStart();
    service.recordExecutionComplete(createResult());
    expect(service.getMetrics().totalExecutions).toBe(1);
  });

  describe("status tracking", () => {
    it("should count completed executions", () => {
      service.recordExecutionStart();
      service.recordExecutionComplete(createResult({ status: "completed" }));
      expect(service.getMetrics().completedExecutions).toBe(1);
    });

    it("should count failed executions", () => {
      service.recordExecutionStart();
      service.recordExecutionComplete(createResult({ status: "failed" }));
      expect(service.getMetrics().failedExecutions).toBe(1);
    });

    it("should count cancelled executions", () => {
      service.recordExecutionStart();
      service.recordExecutionComplete(createResult({ status: "cancelled" }));
      expect(service.getMetrics().cancelledExecutions).toBe(1);
    });

    it("should count timedOut executions", () => {
      service.recordExecutionStart();
      service.recordExecutionComplete(createResult({ status: "timeout" }));
      expect(service.getMetrics().timedOutExecutions).toBe(1);
    });
  });

  it("should accumulate duration, tokens, and cost", () => {
    service.recordExecutionStart();
    service.recordExecutionComplete(createResult({ durationMs: 500, totalTokens: 50, totalCost: 0.001 }));
    service.recordExecutionStart();
    service.recordExecutionComplete(createResult({ durationMs: 1500, totalTokens: 150, totalCost: 0.003 }));

    const m = service.getMetrics();
    expect(m.totalDurationMs).toBe(2000);
    expect(m.totalTokensUsed).toBe(200);
    expect(m.totalCost).toBe(0.004);
    expect(m.averageDurationMs).toBe(1000);
    expect(m.averageTokensPerExecution).toBe(100);
  });

  it("should not go below 0 for activeExecutions", () => {
    service.recordExecutionError();
    expect(service.getMetrics().activeExecutions).toBe(0);

    service.recordExecutionError();
    expect(service.getMetrics().activeExecutions).toBe(0);
  });

  it("should track active count with multiple concurrent executions", () => {
    service.recordExecutionStart();
    service.recordExecutionStart();
    service.recordExecutionStart();
    expect(service.getMetrics().activeExecutions).toBe(3);

    service.recordExecutionComplete(createResult());
    service.recordExecutionError();
    expect(service.getMetrics().activeExecutions).toBe(1);
  });
});
