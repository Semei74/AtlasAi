import { describe, it, expect, beforeEach } from "vitest";
import { WorkflowLimitsService } from "./workflow-limits.service.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";

function createDefinition(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    id: "wf-1",
    name: "Test",
    description: "",
    version: "1.0.0",
    status: "draft",
    organizationId: "org-1",
    workspaceId: null,
    nodes: [{ id: "n1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} }],
    edges: [],
    triggers: [],
    timeoutMs: 30000,
    maxConcurrency: 1,
    tags: [],
    metadata: {},
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("WorkflowLimitsService", () => {
  let limits: WorkflowLimitsService;

  beforeEach(() => {
    limits = new WorkflowLimitsService();
  });

  describe("getDefaults", () => {
    it("should return default limits", () => {
      const defaults = limits.getDefaults();
      expect(defaults.maxNodes).toBe(100);
      expect(defaults.maxDepth).toBe(10);
      expect(defaults.maxBranches).toBe(20);
      expect(defaults.maxExecutionDurationMs).toBe(300_000);
      expect(defaults.maxSteps).toBe(500);
      expect(defaults.maxRetriesPerStep).toBe(3);
      expect(defaults.maxVariables).toBe(100);
      expect(defaults.maxInputSize).toBe(100_000);
      expect(defaults.maxOutputSize).toBe(100_000);
    });
  });

  describe("getLimits", () => {
    it("should return defaults for workflow without custom limits", () => {
      const def = createDefinition();
      const result = limits.getLimits(def);
      expect(result.maxNodes).toBe(100);
    });

    it("should merge custom limits on top of defaults", () => {
      limits.setCustomLimits("wf-1", { maxNodes: 5 });
      const def = createDefinition();
      const result = limits.getLimits(def);
      expect(result.maxNodes).toBe(5);
      expect(result.maxDepth).toBe(10);
    });
  });

  describe("validateLimits", () => {
    it("should pass for workflow within limits", () => {
      const def = createDefinition();
      const result = limits.validateLimits(def);
      expect(result.valid).toBe(true);
    });

    it("should fail when nodes exceed maxNodes", () => {
      limits.setCustomLimits("wf-1", { maxNodes: 1 });
      const def = createDefinition({
        nodes: [
          { id: "n1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
          { id: "n2", type: "action", label: "Action", config: {}, position: { x: 100, y: 0 }, metadata: {} },
        ],
      });
      const result = limits.validateLimits(def);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("exceed limit");
    });

    it("should fail when depth exceeds maxDepth", () => {
      limits.setCustomLimits("wf-1", { maxDepth: 1 });
      const def = createDefinition({
        nodes: [
          { id: "n1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
          { id: "n2", type: "action", label: "Action", config: {}, position: { x: 100, y: 0 }, metadata: {} },
          { id: "n3", type: "action", label: "Action 2", config: {}, position: { x: 200, y: 0 }, metadata: {} },
        ],
        edges: [
          { id: "e1", sourceNodeId: "n1", targetNodeId: "n2", config: {}, metadata: {} },
          { id: "e2", sourceNodeId: "n2", targetNodeId: "n3", config: {}, metadata: {} },
        ],
      });
      const result = limits.validateLimits(def);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("depth");
    });

    it("should fail when timeout exceeds maxExecutionDurationMs", () => {
      const def = createDefinition({ timeoutMs: 400_000 });
      const result = limits.validateLimits(def);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("timeout");
    });
  });

  describe("custom limits", () => {
    it("should set and get custom limits", () => {
      limits.setCustomLimits("wf-1", { maxNodes: 50, maxSteps: 200 });
      const def = createDefinition();
      const result = limits.getLimits(def);
      expect(result.maxNodes).toBe(50);
      expect(result.maxSteps).toBe(200);
    });

    it("should remove custom limits", () => {
      limits.setCustomLimits("wf-1", { maxNodes: 50 });
      limits.removeCustomLimits("wf-1");
      const def = createDefinition();
      const result = limits.getLimits(def);
      expect(result.maxNodes).toBe(100);
    });
  });

  describe("organization limits", () => {
    it("should apply organization-level limits", () => {
      limits.setOrganizationLimits("org-1", { maxNodes: 75 });
      const def = createDefinition();
      const result = limits.getLimits(def);
      expect(result.maxNodes).toBe(75);
    });

    it("should override org limits with custom workflow limits", () => {
      limits.setOrganizationLimits("org-1", { maxNodes: 75 });
      limits.setCustomLimits("wf-1", { maxNodes: 50 });
      const def = createDefinition();
      const result = limits.getLimits(def);
      expect(result.maxNodes).toBe(50);
    });
  });
});
