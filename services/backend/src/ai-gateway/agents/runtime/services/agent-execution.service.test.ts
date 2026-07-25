import { describe, it, expect, beforeEach, vi } from "vitest";
import { AgentExecutionService } from "./agent-execution.service.js";
import type { ProviderResolver } from "../../../providers/resolver/provider-resolver.interface.js";
import type { AiProvider } from "../../../providers/interfaces/ai-provider.interface.js";
import type { ExecutionContext } from "../interfaces/execution-context.interface.js";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { ExecutionLimits } from "../interfaces/execution-limits.interface.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";

function createAgent(overrides?: Partial<AgentDefinition>): AgentDefinition {
  return {
    id: "agent-1",
    name: "Test Agent",
    description: "A test agent",
    version: "1.0.0",
    capabilities: { reasoning: true, planning: false, toolExecution: false, fileAnalysis: false, codeGeneration: false, knowledgeRetrieval: true, workflowExecution: false, collaboration: false, memory: false, streaming: false },
    supportedModels: ["gpt-4"],
    supportedProviders: ["openai"],
    defaultModel: "gpt-4",
    defaultProvider: "openai",
    maxConcurrency: 5,
    timeoutMs: 30000,
    maxRetries: 3,
    state: AgentState.Ready,
    enabled: true,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createContext(overrides?: Partial<ExecutionContext>): ExecutionContext {
  return {
    executionId: "exec-1",
    agent: createAgent(),
    policy: {} as AgentPolicy,
    context: {
      agentId: "agent-1",
      userId: "user-1",
      organizationId: "org-1",
      workspaceId: null,
      conversationId: null,
      requestId: "exec-1",
      input: "do something",
      metadata: {},
    } as AgentContext,
    limits: { timeoutMs: 30000, maxTokens: 10000, maxSteps: 50, maxRetries: 3, allowedProviders: ["openai"], allowedModels: ["gpt-4"], requireHumanApproval: false } as ExecutionLimits,
    signal: new AbortController().signal,
    startedAt: new Date(),
    ...overrides,
  };
}

describe("AgentExecutionService", () => {
  let providerResolver: ProviderResolver;
  let executionService: AgentExecutionService;

  beforeEach(() => {
    providerResolver = {
      resolve: vi.fn(),
    };
    executionService = new AgentExecutionService(providerResolver);
  });

  describe("execute", () => {
    it("should call provider chat and return completed result", async () => {
      const mockProvider = {
        metadata: { name: "openai", version: "1", provider: "openai" } as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockResolvedValue({
          success: true,
          data: {
            content: "Hello world",
            model: "gpt-4",
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          },
          error: null,
        }),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      } as unknown as AiProvider;
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      const result = await executionService.execute(createContext());

      expect(result.status).toBe("completed");
      expect(result.output).toBe("Hello world");
      expect(result.totalTokens).toBe(30);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.modelUsed).toBe("gpt-4");
      expect(result.providerUsed).toBe("openai");
      expect(result.error).toBeNull();
    });

    it("should return cancelled if signal already aborted at start", async () => {
      const controller = new AbortController();
      controller.abort();
      const result = await executionService.execute(createContext({ signal: controller.signal }));
      expect(result.status).toBe("cancelled");
    });

    it("should return cancelled if signal aborted after chat returns", async () => {
      const controller = new AbortController();
      const mockProvider: AiProvider = {
        metadata: {} as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockResolvedValue({
          success: true,
          data: { content: "test", model: "gpt-4", usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } },
          error: null,
        }),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      };
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      const resultPromise = executionService.execute(createContext({ signal: controller.signal }));
      controller.abort();
      const result = await resultPromise;

      expect(result.status).toBe("cancelled");
    });

    it("should return failed if provider response has error", async () => {
      const mockProvider: AiProvider = {
        metadata: {} as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockResolvedValue({
          success: false,
          data: null,
          error: { message: "Provider error", code: "ERR" },
        }),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      };
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      const result = await executionService.execute(createContext());
      expect(result.status).toBe("failed");
      expect(result.error).toBe("Provider error");
    });

    it("should return timeout on timeout error", async () => {
      const mockProvider: AiProvider = {
        metadata: {} as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockRejectedValue(new Error("timeout exceeded")),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      };
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      const result = await executionService.execute(createContext());
      expect(result.status).toBe("timeout");
    });

    it("should return failed on non-timeout error", async () => {
      const mockProvider: AiProvider = {
        metadata: {} as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockRejectedValue(new Error("Something went wrong")),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      };
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      const result = await executionService.execute(createContext());
      expect(result.status).toBe("failed");
      expect(result.error).toBe("Something went wrong");
    });

    it("should build system message from agent name and description", async () => {
      const mockProvider: AiProvider = {
        metadata: {} as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockImplementation(async (req) => {
          expect(req.messages[0].role).toBe("system");
          expect(req.messages[0].content).toContain("Test Agent");
          expect(req.messages[1].role).toBe("user");
          expect(req.messages[1].content).toBe("do something");
          return { success: true, data: { content: "ok", model: "gpt-4", usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } }, error: null };
        }),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      };
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      await executionService.execute(createContext());
      expect(mockProvider.chat).toHaveBeenCalledTimes(1);
    });

    it("should use metadata provider and model over defaults", async () => {
      const ctx = createContext({
        context: {
          agentId: "agent-1",
          userId: "user-1",
          organizationId: "org-1",
          workspaceId: null,
          conversationId: null,
          requestId: "exec-1",
          input: "hi",
          metadata: { provider: "anthropic", model: "claude-3" },
        },
      });

      const mockProvider: AiProvider = {
        metadata: {} as never,
        capabilities: {} as never,
        configuration: {} as never,
        chat: vi.fn().mockResolvedValue({ success: true, data: { content: "ok", model: "claude-3", usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } }, error: null }),
        health: vi.fn(),
        configure: vi.fn(),
        initialize: vi.fn(),
      };
      providerResolver.resolve = vi.fn().mockReturnValue(mockProvider);

      await executionService.execute(ctx);
      expect(providerResolver.resolve).toHaveBeenCalledWith("anthropic");
    });
  });
});
