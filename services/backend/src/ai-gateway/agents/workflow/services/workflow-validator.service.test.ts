import { describe, it, expect } from "vitest";
import { WorkflowValidatorService } from "./workflow-validator.service.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";

function validDefinition(): WorkflowDefinition {
  return {
    id: "wf-1",
    name: "Test",
    description: "",
    version: "1.0.0",
    status: "draft",
    organizationId: "org-1",
    workspaceId: null,
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
      { id: "action-1", type: "action", label: "Action", config: { action: "log" }, position: { x: 100, y: 0 }, metadata: {} },
    ],
    edges: [
      { id: "e1", sourceNodeId: "trigger-1", targetNodeId: "action-1", config: {}, metadata: {} },
    ],
    triggers: [],
    timeoutMs: 30000,
    maxConcurrency: 1,
    tags: [],
    metadata: {},
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("WorkflowValidatorService", () => {
  const validator = new WorkflowValidatorService();

  describe("validate", () => {
    it("should pass a valid workflow definition", async () => {
      const result = await validator.validate(validDefinition());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when id is missing", async () => {
      const def = { ...validDefinition(), id: "" };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "MISSING_ID")).toBe(true);
    });

    it("should fail when name is missing", async () => {
      const def = { ...validDefinition(), name: "" };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "MISSING_NAME")).toBe(true);
    });

    it("should fail when organizationId is missing", async () => {
      const def = { ...validDefinition(), organizationId: "" };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "MISSING_ORG")).toBe(true);
    });

    it("should fail when no nodes present", async () => {
      const def = { ...validDefinition(), nodes: [] };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "NO_NODES")).toBe(true);
    });

    it("should fail with too many nodes", async () => {
      const nodes = Array.from({ length: 101 }, (_, i) => ({
        id: `n${i}`,
        type: "action" as const,
        label: "Action",
        config: {},
        position: { x: 0, y: 0 },
        metadata: {},
      }));
      const def = { ...validDefinition(), nodes };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "TOO_MANY_NODES")).toBe(true);
    });

    it("should fail with duplicate node ids", async () => {
      const def = {
        ...validDefinition(),
        nodes: [
          { id: "dup", type: "trigger" as const, label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
          { id: "dup", type: "action" as const, label: "Action", config: {}, position: { x: 100, y: 0 }, metadata: {} },
        ],
      };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "DUPLICATE_NODES")).toBe(true);
    });

    it("should fail when edge references unknown source node", async () => {
      const def = {
        ...validDefinition(),
        edges: [{ id: "bad-edge", sourceNodeId: "missing", targetNodeId: "action-1", config: {}, metadata: {} }],
      };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_SOURCE")).toBe(true);
    });

    it("should fail when edge references unknown target node", async () => {
      const def = {
        ...validDefinition(),
        edges: [{ id: "bad-edge", sourceNodeId: "trigger-1", targetNodeId: "missing", config: {}, metadata: {} }],
      };
      const result = await validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_TARGET")).toBe(true);
    });

    it("should warn about unreachable nodes", async () => {
      const def = {
        ...validDefinition(),
        nodes: [
          { id: "trigger-1", type: "trigger" as const, label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
          { id: "orphan", type: "action" as const, label: "Orphan", config: {}, position: { x: 200, y: 0 }, metadata: {} },
        ],
        edges: [],
      };
      const result = await validator.validate(def);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("validateNode", () => {
    it("should fail when node lacks id", () => {
      const errors = validator.validateNode({ id: "", type: "action", label: "Test", config: {}, position: { x: 0, y: 0 }, metadata: {} });
      expect(errors.some((e) => e.code === "MISSING_NODE_ID")).toBe(true);
    });

    it("should pass valid node", () => {
      const errors = validator.validateNode({ id: "n1", type: "action", label: "Test", config: {}, position: { x: 0, y: 0 }, metadata: {} });
      expect(errors).toHaveLength(0);
    });
  });

  describe("validateEdge", () => {
    it("should fail when edge missing source or target", () => {
      const nodeIds = new Set(["n1", "n2"]);
      const errors = validator.validateEdge({ id: "bad", sourceNodeId: "", targetNodeId: "", config: {}, metadata: {} }, nodeIds);
      expect(errors.some((e) => e.code === "INCOMPLETE_EDGE")).toBe(true);
    });

    it("should pass valid edge", () => {
      const nodeIds = new Set(["n1", "n2"]);
      const errors = validator.validateEdge({ id: "e1", sourceNodeId: "n1", targetNodeId: "n2", config: {}, metadata: {} }, nodeIds);
      expect(errors).toHaveLength(0);
    });
  });
});
