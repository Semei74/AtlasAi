import { describe, it, expect } from "vitest";
import { WorkflowPolicyService } from "./workflow-policy.service.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";

function definition(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    id: "wf-1",
    name: "Test",
    description: "",
    version: "1.0.0",
    status: "published",
    organizationId: "org-1",
    workspaceId: null,
    nodes: [],
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

function context(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    agentId: "agent-1",
    userId: "user-1",
    organizationId: "org-1",
    workspaceId: null,
    conversationId: null,
    requestId: "req-1",
    input: "hello",
    metadata: {},
    ...overrides,
  };
}

describe("WorkflowPolicyService", () => {
  const policy = new WorkflowPolicyService();

  describe("canExecute", () => {
    it("should allow execution for same org, published workflow", () => {
      expect(policy.canExecute(definition(), context())).toBe(true);
    });

    it("should deny execution for different org", () => {
      expect(policy.canExecute(definition({ organizationId: "org-2" }), context())).toBe(false);
    });

    it("should deny execution for workspace-scoped workflow in different workspace", () => {
      expect(policy.canExecute(definition({ workspaceId: "ws-1" }), context({ workspaceId: "ws-2" }))).toBe(false);
    });

    it("should allow execution for workspace-scoped workflow in same workspace", () => {
      expect(policy.canExecute(definition({ workspaceId: "ws-1" }), context({ workspaceId: "ws-1" }))).toBe(true);
    });

    it("should deny execution for non-published workflow", () => {
      expect(policy.canExecute(definition({ status: "draft" }), context())).toBe(false);
      expect(policy.canExecute(definition({ status: "archived" }), context())).toBe(false);
      expect(policy.canExecute(definition({ status: "disabled" }), context())).toBe(false);
    });
  });

  describe("canCreate", () => {
    it("should allow creation in same org", () => {
      expect(policy.canCreate(definition(), context())).toBe(true);
    });

    it("should deny creation in different org", () => {
      expect(policy.canCreate(definition({ organizationId: "org-2" }), context())).toBe(false);
    });
  });

  describe("canUpdate", () => {
    it("should allow update in same org", () => {
      expect(policy.canUpdate(definition(), context())).toBe(true);
    });

    it("should deny update in different org", () => {
      expect(policy.canUpdate(definition({ organizationId: "org-2" }), context())).toBe(false);
    });

    it("should deny update for workspace-scoped from different workspace", () => {
      expect(policy.canUpdate(definition({ workspaceId: "ws-1" }), context({ workspaceId: "ws-2" }))).toBe(false);
    });
  });

  describe("canDelete", () => {
    it("should allow delete in same org", () => {
      expect(policy.canDelete(definition(), context())).toBe(true);
    });

    it("should deny delete in different org", () => {
      expect(policy.canDelete(definition({ organizationId: "org-2" }), context())).toBe(false);
    });
  });
});
