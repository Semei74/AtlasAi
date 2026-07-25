import { describe, it, expect, beforeEach } from "vitest";
import { WorkflowRegistryService } from "./workflow-registry.service.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";

function createDefinition(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    id: "wf-1",
    name: "Test Workflow",
    description: "",
    version: "1.0.0",
    status: "draft",
    organizationId: "org-1",
    workspaceId: "ws-1",
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

describe("WorkflowRegistryService", () => {
  let registry: WorkflowRegistryService;

  beforeEach(() => {
    registry = new WorkflowRegistryService();
  });

  describe("register", () => {
    it("should register a new workflow definition", async () => {
      const def = createDefinition();
      const result = await registry.register(def);
      expect(result).toEqual(def);
    });

    it("should reject duplicate registration", async () => {
      const def = createDefinition();
      await registry.register(def);
      await expect(registry.register(def)).rejects.toThrow('already registered');
    });
  });

  describe("unregister", () => {
    it("should remove a registered workflow", async () => {
      await registry.register(createDefinition());
      const result = await registry.unregister("wf-1");
      expect(result).toBe(true);
    });

    it("should return false for unknown workflow", async () => {
      const result = await registry.unregister("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("get", () => {
    it("should retrieve a registered workflow", async () => {
      const def = createDefinition();
      await registry.register(def);
      const result = await registry.get("wf-1");
      expect(result).toEqual(def);
    });

    it("should return null for unknown workflow", async () => {
      const result = await registry.get("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("list", () => {
    it("should return all registered workflows", async () => {
      await registry.register(createDefinition({ id: "wf-1" }));
      await registry.register(createDefinition({ id: "wf-2" }));
      const results = await registry.list();
      expect(results).toHaveLength(2);
    });

    it("should filter by organizationId", async () => {
      await registry.register(createDefinition({ id: "wf-1", organizationId: "org-1" }));
      await registry.register(createDefinition({ id: "wf-2", organizationId: "org-2" }));
      const results = await registry.list({ organizationId: "org-1" });
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe("wf-1");
    });

    it("should filter by workspaceId", async () => {
      await registry.register(createDefinition({ id: "wf-1", workspaceId: "ws-1" }));
      await registry.register(createDefinition({ id: "wf-2", workspaceId: "ws-2" }));
      const results = await registry.list({ workspaceId: "ws-1" });
      expect(results).toHaveLength(1);
    });

    it("should filter by status", async () => {
      await registry.register(createDefinition({ id: "wf-1", status: "published" }));
      await registry.register(createDefinition({ id: "wf-2", status: "draft" }));
      const results = await registry.list({ status: "published" });
      expect(results).toHaveLength(1);
    });

    it("should filter by tags", async () => {
      await registry.register(createDefinition({ id: "wf-1", tags: ["urgent"] }));
      await registry.register(createDefinition({ id: "wf-2", tags: ["normal"] }));
      const results = await registry.list({ tags: ["urgent"] });
      expect(results).toHaveLength(1);
    });

    it("should return empty list when no match", async () => {
      const results = await registry.list({ organizationId: "nonexistent" });
      expect(results).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should partially update a registered workflow", async () => {
      await registry.register(createDefinition());
      const result = await registry.update("wf-1", { name: "Updated Name" });
      expect(result.name).toBe("Updated Name");
    });

    it("should reject update for unknown workflow", async () => {
      await expect(registry.update("nonexistent", { name: "x" })).rejects.toThrow("not found");
    });
  });

  describe("exists", () => {
    it("should return true for existing workflow", async () => {
      await registry.register(createDefinition());
      expect(await registry.exists("wf-1")).toBe(true);
    });

    it("should return false for missing workflow", async () => {
      expect(await registry.exists("nonexistent")).toBe(false);
    });
  });

  describe("count", () => {
    it("should count all workflows", async () => {
      await registry.register(createDefinition({ id: "wf-1" }));
      await registry.register(createDefinition({ id: "wf-2" }));
      expect(await registry.count()).toBe(2);
    });

    it("should count workflows by organization", async () => {
      await registry.register(createDefinition({ id: "wf-1", organizationId: "org-1" }));
      await registry.register(createDefinition({ id: "wf-2", organizationId: "org-2" }));
      expect(await registry.count("org-1")).toBe(1);
    });
  });
});
