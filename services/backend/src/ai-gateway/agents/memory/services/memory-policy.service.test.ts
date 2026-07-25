import { describe, it, expect, beforeEach } from "vitest";
import { MemoryPolicyService } from "./memory-policy.service.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { AgentMemoryEntry, AgentMemoryType } from "../../interfaces/agent-memory.interface.js";

function createContext(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    agentId: "agent-1",
    userId: "user-1",
    organizationId: "org-1",
    workspaceId: null,
    conversationId: null,
    requestId: "req-1",
    input: "",
    metadata: {},
    ...overrides,
  };
}

function createEntry(
  contextOverrides: Partial<AgentContext>,
  type: AgentMemoryType = "session",
): AgentMemoryEntry {
  return {
    id: "entry-1",
    agentId: contextOverrides.agentId ?? "agent-1",
    type,
    key: "test-key",
    value: "test-value",
    context: createContext(contextOverrides),
    timestamp: new Date(),
    ttl: null,
    metadata: {},
  };
}

describe("MemoryPolicyService", () => {
  let policy: MemoryPolicyService;

  beforeEach(() => {
    policy = new MemoryPolicyService();
  });

  describe("canRead", () => {
    it("should allow reading within same organization", () => {
      const ctx = createContext();
      const entry = createEntry({ organizationId: "org-1" });
      expect(policy.canRead(ctx, entry)).toBe(true);
    });

    it("should deny reading from different organization", () => {
      const ctx = createContext({ organizationId: "org-1" });
      const entry = createEntry({ organizationId: "org-2" });
      expect(policy.canRead(ctx, entry)).toBe(false);
    });

    it("should deny reading workspace memory from different workspace", () => {
      const ctx = createContext({ organizationId: "org-1", workspaceId: "ws-1" });
      const entry = createEntry({ organizationId: "org-1", workspaceId: "ws-2" }, "workspace");
      expect(policy.canRead(ctx, entry)).toBe(false);
    });

    it("should allow reading workspace memory from same workspace", () => {
      const ctx = createContext({ organizationId: "org-1", workspaceId: "ws-1" });
      const entry = createEntry({ organizationId: "org-1", workspaceId: "ws-1" }, "workspace");
      expect(policy.canRead(ctx, entry)).toBe(true);
    });
  });

  describe("canWrite", () => {
    it("should allow writing by same agent in same org", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1" });
      const entry = createEntry({ agentId: "agent-1", organizationId: "org-1" });
      expect(policy.canWrite(ctx, entry)).toBe(true);
    });

    it("should deny writing by different agent", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1" });
      const entry = createEntry({ agentId: "agent-2", organizationId: "org-1" });
      expect(policy.canWrite(ctx, entry)).toBe(false);
    });

    it("should deny writing across organizations", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1" });
      const entry = createEntry({ agentId: "agent-1", organizationId: "org-2" });
      expect(policy.canWrite(ctx, entry)).toBe(false);
    });

    it("should deny writing to workspace memory from different workspace", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1", workspaceId: "ws-1" });
      const entry = createEntry({ agentId: "agent-1", organizationId: "org-1", workspaceId: "ws-2" }, "workspace");
      expect(policy.canWrite(ctx, entry)).toBe(false);
    });
  });

  describe("canDelete", () => {
    it("should allow deletion by same agent in same org", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1" });
      const entry = createEntry({ agentId: "agent-1", organizationId: "org-1" });
      expect(policy.canDelete(ctx, entry)).toBe(true);
    });

    it("should deny deletion by different agent", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1" });
      const entry = createEntry({ agentId: "agent-2", organizationId: "org-1" });
      expect(policy.canDelete(ctx, entry)).toBe(false);
    });

    it("should deny deletion across organizations", () => {
      const ctx = createContext({ agentId: "agent-1", organizationId: "org-1" });
      const entry = createEntry({ agentId: "agent-1", organizationId: "org-2" });
      expect(policy.canDelete(ctx, entry)).toBe(false);
    });
  });
});
