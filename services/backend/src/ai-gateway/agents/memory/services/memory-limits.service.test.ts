import { describe, it, expect, beforeEach } from "vitest";
import { MemoryLimitsService } from "./memory-limits.service.js";
import { DefaultMemoryStrategyService } from "./default-memory-strategy.service.js";

describe("MemoryLimitsService", () => {
  let strategy: DefaultMemoryStrategyService;
  let limits: MemoryLimitsService;

  beforeEach(() => {
    strategy = new DefaultMemoryStrategyService();
    limits = new MemoryLimitsService(strategy);
  });

  describe("validateEntry", () => {
    it("should allow entry within limits", () => {
      const result = limits.validateEntry("agent-1", "session", 0, 0, "hello");
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it("should reject when at max entries", () => {
      const result = limits.validateEntry("agent-1", "session", 50, 0, "hello");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("max entries");
    });

    it("should reject when exceeding max tokens", () => {
      const longText = "x".repeat(8001);
      const result = limits.validateEntry("agent-1", "session", 0, 1999, longText);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("max tokens");
    });
  });

  describe("getTokenBudget", () => {
    it("should return correct budget for session type", () => {
      const budget = limits.getTokenBudget("agent-1", "session", 500);
      expect(budget.totalBudget).toBe(2000);
      expect(budget.totalConsumed).toBe(500);
      expect(budget.remaining).toBe(1500);
      expect(budget.overBudget).toBe(false);
    });

    it("should indicate over budget when exceeded", () => {
      const budget = limits.getTokenBudget("agent-1", "session", 2500);
      expect(budget.overBudget).toBe(true);
      expect(budget.remaining).toBe(0);
    });

    it("should return budget for longTerm type", () => {
      const budget = limits.getTokenBudget("agent-1", "longTerm", 5000);
      expect(budget.totalBudget).toBe(16000);
    });
  });

  describe("custom budget overrides", () => {
    it("should set and retrieve custom budget", () => {
      limits.setCustomBudget("agent-1", 10000);
      expect(limits.getCustomBudget("agent-1")).toBe(10000);
    });

    it("should clear custom budget", () => {
      limits.setCustomBudget("agent-1", 10000);
      limits.clearCustomBudget("agent-1");
      expect(limits.getCustomBudget("agent-1")).toBeNull();
    });

    it("should return null for agents without custom budget", () => {
      expect(limits.getCustomBudget("unknown")).toBeNull();
    });
  });
});
