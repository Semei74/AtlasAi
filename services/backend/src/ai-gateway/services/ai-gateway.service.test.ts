import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { AiGatewayService } from "./ai-gateway.service.js";
import type { ProviderResolver } from "../providers/resolver/provider-resolver.interface.js";
import type { ProviderChatResponse } from "../providers/interfaces/provider-response.interface.js";
import type { ProviderResult } from "../providers/interfaces/provider-result.interface.js";
import type { OrganizationSettingsRepository } from "../../organization/interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettings } from "../../organization/interfaces/organization-settings.interface.js";
import type { AiRequestRepository } from "../interfaces/ai-request-repository.interface.js";
import type { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";
import type { AiPolicyEngine } from "../policy/interfaces/ai-policy-engine.interface.js";
import type { AiPolicyResult } from "../policy/interfaces/ai-policy-result.interface.js";

function makeSettings(overrides: Partial<OrganizationSettings["ai"]> = {}): OrganizationSettings {
  return {
    security: {} as OrganizationSettings["security"],
    authentication: {} as OrganizationSettings["authentication"],
    ai: {
      enabledProviders: [],
      blockedProviders: [],
      defaultProvider: null,
      allowedModels: [],
      blockedModels: [],
      maxInputTokens: null,
      maxOutputTokens: null,
      allowImageGeneration: false,
      allowAudioGeneration: false,
      allowEmbeddings: false,
      allowModeration: false,
      allowTools: false,
      allowMcp: false,
      allowRag: false,
      allowPromptTemplates: false,
      allowConversationMemory: false,
      allowStreaming: false,
      ...overrides,
    },
    storage: {} as OrganizationSettings["storage"],
    regional: {} as OrganizationSettings["regional"],
    featureFlags: {},
    billing: {
      enabledProviders: [],
      defaultCurrency: "USD",
      billingEmail: null,
      invoicePrefix: null,
      taxId: null,
      paymentTermsDays: 30,
      autoInvoicing: false,
      currency: {},
    },
  };
}

function makeDto(overrides: Partial<ChatCompletionRequestDto> = {}): ChatCompletionRequestDto {
  return {
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    maxTokens: 100,
    stream: false,
    ...overrides,
  };
}

const mockProviderData: ProviderChatResponse = {
  id: "test-id",
  model: "gpt-4",
  content: "Test response",
  finishReason: "stop",
  usage: {
    promptTokens: 10,
    completionTokens: 20,
    totalTokens: 30,
  },
};

const mockProvider = {
  metadata: { name: "stub", version: "1.0.0", description: "Mock provider" },
  capabilities: { chat: true, streaming: true, functionCalling: false, embeddings: false, imageGeneration: false, audioTranscription: false, toolCalling: false, audioGeneration: false, moderation: false, reasoning: false, mcp: false, rag: false, promptTemplates: false, conversationMemory: false, maxModels: 0, supportedModels: [] },
  configuration: { timeout: 30000, maxRetries: 0 },
  chat: vi.fn(),
  health: vi.fn(),
  configure: vi.fn(),
};

const mockProviderResult: ProviderResult<ProviderChatResponse> = {
  success: true,
  latency: 100,
  data: mockProviderData,
};

const mockAllowResult: AiPolicyResult = {
  allowed: true,
  violations: [],
  evaluatedPolicies: ["provider", "model", "capability", "regional"],
};

const mockDenyResult: AiPolicyResult = {
  allowed: false,
  violations: [
    {
      policy: "model",
      code: "MODEL_NOT_ALLOWED",
      reason: "Model 'gpt-4' is not allowed for this organization",
      severity: "error",
    },
  ],
  evaluatedPolicies: ["provider", "model"],
};

describe("AiGatewayService", () => {
  const mockFindByOrgId = vi.fn();
  const mockCreateRequest = vi.fn();
  const mockResolve = vi.fn();
  const mockPolicyEvaluate = vi.fn();
  const mockStreamingEngine = { stream: vi.fn() } as never;
  const mockTokenAccounting = {
    account: vi.fn().mockReturnValue({
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, estimatedCost: 0.00005 },
      cachedTokens: 0,
      estimated: true,
      currency: "USD",
    }),
    calculateCost: vi.fn().mockReturnValue(0),
    estimateTokens: vi.fn().mockReturnValue(0),
    recordUsage: vi.fn().mockResolvedValue(undefined),
  } as never;
  const mockModelRouter = { route: vi.fn() };
  let service: AiGatewayService;

  function createService(): void {
    const orgSettingsRepo = {
      findByOrganizationId: mockFindByOrgId,
    } as unknown as OrganizationSettingsRepository;
    const resolverMock = { resolve: mockResolve } as unknown as ProviderResolver;
    const requestRepo = { create: mockCreateRequest } as unknown as AiRequestRepository;
    const policyEngine = { evaluate: mockPolicyEvaluate } as unknown as AiPolicyEngine;
    const promptManager = { render: vi.fn() } as never;
    const contextEngine = { buildContext: vi.fn().mockResolvedValue(null) } as never;
    const ragEngine = { query: vi.fn(), indexSource: vi.fn(), removeSource: vi.fn() } as never;
    const vectorSearch = { search: vi.fn(), indexText: vi.fn(), remove: vi.fn(), clear: vi.fn() } as never;
    const agentRegistry = { register: vi.fn(), unregister: vi.fn(), get: vi.fn(), exists: vi.fn(), list: vi.fn(), listByCapability: vi.fn(), listByOrganization: vi.fn(), listByWorkspace: vi.fn(), findByProvider: vi.fn(), findByModel: vi.fn(), enable: vi.fn(), disable: vi.fn() } as never;
    const agentRuntime = { execute: vi.fn(), cancel: vi.fn(), getState: vi.fn(), getMetrics: vi.fn(), onEvent: vi.fn(), removeEventListener: vi.fn() } as never;
    const registry = { register: vi.fn(), unregister: vi.fn(), get: vi.fn(), exists: vi.fn(), list: vi.fn(), listByCapability: vi.fn(), listByOrganization: vi.fn(), listByWorkspace: vi.fn(), findByProvider: vi.fn(), findByModel: vi.fn(), enable: vi.fn(), disable: vi.fn(), registerFromRegistration: vi.fn(), getDescriptor: vi.fn(), search: vi.fn(), filter: vi.fn(), getHealth: vi.fn(), updateHealth: vi.fn(), getVersionHistory: vi.fn(), getLatestVersion: vi.fn(), deprecateVersion: vi.fn(), getMetadata: vi.fn(), updateMetadata: vi.fn() } as never;
    const mockMetrics = {
      aiGatewayRequestsTotal: { inc: vi.fn() },
      aiGatewayTokensTotal: { inc: vi.fn() },
      aiGatewayDurationSeconds: { observe: vi.fn() },
      aiGatewayErrorsTotal: { inc: vi.fn() },
      aiGatewayCostTotal: { inc: vi.fn() },
      aiGatewayProviderHealth: { set: vi.fn() },
      aiGatewayProviderFallbackTotal: { inc: vi.fn() },
      aiGatewayStreamTotal: { inc: vi.fn() },
    } as never;

    service = new AiGatewayService(
      orgSettingsRepo,
      resolverMock,
      requestRepo,
      policyEngine,
      promptManager,
      contextEngine,
      ragEngine,
      vectorSearch,
      agentRegistry,
      registry,
      agentRuntime,
      mockMetrics,
      mockStreamingEngine,
      mockModelRouter,
      mockTokenAccounting,
    );
  }

  beforeEach(() => {
    mockFindByOrgId.mockReset();
    mockCreateRequest.mockReset();
    mockResolve.mockReset();
    mockProvider.chat = vi.fn().mockResolvedValue(mockProviderResult);
    mockCreateRequest.mockResolvedValue({});
    mockPolicyEvaluate.mockResolvedValue(mockAllowResult);
  });

  describe("chat", () => {
    it("should return a valid GatewayResponse on success", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      const result = await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(result).toHaveProperty("id", "test-id");
      expect(result).toHaveProperty("model", "gpt-4");
      expect(result).toHaveProperty("provider", "stub");
      expect(result).toHaveProperty("content", "Test response");
      expect(result).toHaveProperty("finishReason", "stop");
      expect(result.usage).toHaveProperty("promptTokens", 10);
      expect(result.usage).toHaveProperty("completionTokens", 20);
      expect(result.usage).toHaveProperty("totalTokens", 30);
      expect(result.usage.estimatedCost).toBeGreaterThan(0);
      expect(result).toHaveProperty("latency");
      expect(typeof result.latency).toBe("number");
    });

    it("should record a successful request", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(mockCreateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          workspaceId: "ws-1",
          organizationId: "org-1",
          provider: "stub",
          model: "gpt-4",
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
          estimatedCost: expect.any(Number),
          success: true,
        }),
      );
    });

    it("should route to the model router when model is 'auto'", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      mockModelRouter.route.mockResolvedValue({ provider: "openai", model: "openai/gpt-4", score: 0.9, reason: "balanced" });
      createService();

      await service.chat(makeDto({ model: "auto" }), "user-1", "org-1", "ws-1");

      expect(mockModelRouter.route).toHaveBeenCalledOnce();
      expect(mockProvider.chat).toHaveBeenCalledWith(expect.objectContaining({ model: "openai/gpt-4" }));
    });

    it("should throw ForbiddenException when org settings not found", async () => {
      mockFindByOrgId.mockResolvedValue(null);
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw ForbiddenException when policy engine denies", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockPolicyEvaluate.mockResolvedValue(mockDenyResult);
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should not call provider when policy engine denies", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockPolicyEvaluate.mockResolvedValue(mockDenyResult);
      mockResolve.mockReturnValue(mockProvider);
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockProvider.chat).not.toHaveBeenCalled();
    });

    it("should call policy engine with correct context", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(mockPolicyEvaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org-1",
          workspaceId: "ws-1",
          userId: "user-1",
          provider: "stub",
          model: "gpt-4",
        }),
      );
    });

    it("should record a failed request when provider stub throws", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      mockProvider.chat = vi.fn().mockRejectedValue(new Error("Provider error"));
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        "Provider error",
      );

      expect(mockCreateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it("should use the provider resolver", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(mockResolve).toHaveBeenCalledWith("stub");
    });

    it("should use defaultProvider from settings when available", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ defaultProvider: "custom" }));
      mockPolicyEvaluate.mockResolvedValue(mockDenyResult);
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow();
    });

    it("should call provider with ProviderChatRequest (without gateway fields)", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      const callArg = mockProvider.chat.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
      expect(callArg).toHaveProperty("model", "gpt-4");
      expect(callArg).not.toHaveProperty("workspaceId");
      expect(callArg).not.toHaveProperty("organizationId");
    });

    it("should throw ForbiddenException when provider returns error result", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      mockProvider.chat = vi.fn().mockResolvedValue({
        success: false,
        error: { code: "PROVIDER_ERROR", message: "Provider failed", statusCode: 502 },
        latency: 0,
      });
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should use default stream value when not provided", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      const dto = {
        model: "gpt-4",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.7,
        maxTokens: 100,
      } as ChatCompletionRequestDto;
      await service.chat(dto, "user-1", "org-1", "ws-1");

      expect(mockProvider.chat).toHaveBeenCalledWith(expect.objectContaining({ stream: false }));
    });

    it("should include policyViolations in response when warnings exist", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      mockPolicyEvaluate.mockResolvedValue({
        allowed: true,
        violations: [
          {
            policy: "model",
            code: "MODEL_UNKNOWN",
            reason: "Model 'gpt-4' is not registered",
            severity: "warning" as const,
          },
        ],
        evaluatedPolicies: ["provider", "model", "capability", "regional"],
      });
      createService();

      const result = await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(result.policyViolations).toBeDefined();
      expect(result.policyViolations).toHaveLength(1);
      expect(result.policyViolations?.[0]?.code).toBe("MODEL_UNKNOWN");
    });

    it("should not include policyViolations in response when no violations", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      mockResolve.mockReturnValue(mockProvider);
      createService();

      const result = await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(result.policyViolations).toBeUndefined();
    });
  });
});
