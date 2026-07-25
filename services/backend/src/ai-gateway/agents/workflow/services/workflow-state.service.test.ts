import { describe, it, expect, beforeEach } from "vitest";
import { WorkflowStateService } from "./workflow-state.service.js";

describe("WorkflowStateService", () => {
  let state: WorkflowStateService;

  beforeEach(() => {
    state = new WorkflowStateService();
  });

  describe("getStatus", () => {
    it("should return 'pending' for unknown execution", () => {
      expect(state.getStatus("nonexistent")).toBe("pending");
    });

    it("should return current status after transition", () => {
      state.transition("exec-1", "running");
      expect(state.getStatus("exec-1")).toBe("running");
    });
  });

  describe("transition", () => {
    it("should transition from pending to running", () => {
      state.transition("exec-1", "running");
    });

    it("should transition from pending to cancelled", () => {
      state.transition("exec-1", "cancelled");
    });

    it("should transition from running to completed", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "completed");
    });

    it("should transition from running to failed", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "failed");
    });

    it("should transition from running to cancelled", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "cancelled");
    });

    it("should transition from running to paused", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "paused");
    });

    it("should transition from paused to running", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "paused");
      state.transition("exec-1", "running");
    });

    it("should transition from paused to cancelled", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "paused");
      state.transition("exec-1", "cancelled");
    });

    it("should reject invalid transition from pending to completed", () => {
      expect(() => { state.transition("exec-1", "completed"); }).toThrow("Invalid state transition");
    });

    it("should reject invalid transition from pending to failed", () => {
      expect(() => { state.transition("exec-1", "failed"); }).toThrow("Invalid state transition");
    });

    it("should reject invalid transition from pending to paused", () => {
      expect(() => { state.transition("exec-1", "paused"); }).toThrow("Invalid state transition");
    });

    it("should reject transition from terminal state completed", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "completed");
      expect(() => { state.transition("exec-1", "running"); }).toThrow("Invalid state transition");
    });

    it("should reject transition from terminal state failed", () => {
      state.transition("exec-1", "running");
      state.transition("exec-1", "failed");
      expect(() => { state.transition("exec-1", "running"); }).toThrow("Invalid state transition");
    });

    it("should reject transition from terminal state cancelled", () => {
      state.transition("exec-1", "cancelled");
      expect(() => { state.transition("exec-1", "running"); }).toThrow("Invalid state transition");
    });
  });

  describe("validateTransition", () => {
    it("should return true for valid transitions", () => {
      expect(state.validateTransition("pending", "running")).toBe(true);
      expect(state.validateTransition("running", "completed")).toBe(true);
      expect(state.validateTransition("paused", "running")).toBe(true);
    });

    it("should return false for invalid transitions", () => {
      expect(state.validateTransition("pending", "completed")).toBe(false);
      expect(state.validateTransition("completed", "running")).toBe(false);
      expect(state.validateTransition("failed", "running")).toBe(false);
    });

    it("should return false for terminal states", () => {
      expect(state.validateTransition("completed", "failed")).toBe(false);
      expect(state.validateTransition("cancelled", "paused")).toBe(false);
    });
  });

  describe("canExecute", () => {
    it("should return true for pending status", () => {
      expect(state.canExecute("pending")).toBe(true);
    });

    it("should return true for paused status", () => {
      expect(state.canExecute("paused")).toBe(true);
    });

    it("should return false for running status", () => {
      expect(state.canExecute("running")).toBe(false);
    });

    it("should return false for terminal statuses", () => {
      expect(state.canExecute("completed")).toBe(false);
      expect(state.canExecute("failed")).toBe(false);
      expect(state.canExecute("cancelled")).toBe(false);
    });
  });

  describe("isTerminal", () => {
    it("should return true for terminal statuses", () => {
      expect(state.isTerminal("completed")).toBe(true);
      expect(state.isTerminal("failed")).toBe(true);
      expect(state.isTerminal("cancelled")).toBe(true);
    });

    it("should return false for non-terminal statuses", () => {
      expect(state.isTerminal("pending")).toBe(false);
      expect(state.isTerminal("running")).toBe(false);
      expect(state.isTerminal("paused")).toBe(false);
    });
  });

  describe("remove", () => {
    it("should remove an execution's status", () => {
      state.transition("exec-1", "running");
      state.remove("exec-1");
      expect(state.getStatus("exec-1")).toBe("pending");
    });
  });

  describe("clear", () => {
    it("should reset all statuses", () => {
      state.transition("exec-1", "running");
      state.transition("exec-2", "running");
      state.clear();
      expect(state.getStatus("exec-1")).toBe("pending");
      expect(state.getStatus("exec-2")).toBe("pending");
    });
  });
});
