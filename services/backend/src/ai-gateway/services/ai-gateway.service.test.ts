import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { AiGatewayService } from "./ai-gateway.service.js";
import type { ProviderResolver } from "../providers/resolver/provider-resolver.interface.js";
import type { AiProvider } from "../providers/interfaces/ai-provider.interface.js";
import type { ProviderChatResponse } from "../providers/interfaces/provider-response.interface.js";
import type { ProviderResult } from "../providers/interfaces/provider-result.interface.js";
import type { OrganizationSettingsRepository } from "../../organization/interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettings } from "../../organization/interfaces/organization-settings.interface.js";
import type { AiRequestRepository } from "../interfaces/ai-request-repository.interface.js";
import type { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";

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
      ...overrides,
    },
    storage: {} as OrganizationSettings["storage"],
    regional: {} as OrganizationSettings["regional"],
    featureFlags: {},
    billing: {},
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

const mockProviderResult: ProviderResult<ProviderChatResponse> = {
  success: true,
  latency: 100,
  data: mockProviderData,
};

describe("AiGatewayService", () => {
  const mockFindByOrgId = vi.fn();
  const mockCreateRequest = vi.fn();
  const mockProviderChat = vi.fn();
  const mockResolve = vi.fn();
  let service: AiGatewayService;

  function createService(): void {
    const orgSettingsRepo = {
      findByOrganizationId: mockFindByOrgId,
    } as unknown as OrganizationSettingsRepository;
    const resolverMock = { resolve: mockResolve } as unknown as ProviderResolver;
    const requestRepo = { create: mockCreateRequest } as unknown as AiRequestRepository;

    service = new AiGatewayService(orgSettingsRepo, resolverMock, requestRepo);
  }

  beforeEach(() => {
    mockFindByOrgId.mockReset();
    mockCreateRequest.mockReset();
    mockProviderChat.mockReset();
    mockResolve.mockReset();
    mockProviderChat.mockResolvedValue(mockProviderResult);
    mockCreateRequest.mockResolvedValue({});
  });

  describe("chat", () => {
    it("should return a valid GatewayResponse on success", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
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
      expect(result.usage).toHaveProperty("estimatedCost", 0);
      expect(result).toHaveProperty("latency");
      expect(typeof result.latency).toBe("number");
    });

    it("should record a successful request", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
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
          estimatedCost: 0,
          success: true,
        }),
      );
    });

    it("should throw ForbiddenException when org settings not found", async () => {
      mockFindByOrgId.mockResolvedValue(null);
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw ForbiddenException when model is blocked", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ blockedModels: ["gpt-4"] }));
      createService();

      await expect(
        service.chat(makeDto({ model: "gpt-4" }), "user-1", "org-1", "ws-1"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when model is not in allowedModels", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowedModels: ["gpt-3.5-turbo"] }));
      createService();

      await expect(
        service.chat(makeDto({ model: "gpt-4" }), "user-1", "org-1", "ws-1"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow any model when allowedModels is empty", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowedModels: [] }));
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
      createService();

      const result = await service.chat(makeDto({ model: "gpt-4" }), "user-1", "org-1", "ws-1");

      expect(result).toHaveProperty("model", "gpt-4");
    });

    it("should allow model when it is in allowedModels", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowedModels: ["gpt-4"] }));
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
      createService();

      const result = await service.chat(makeDto({ model: "gpt-4" }), "user-1", "org-1", "ws-1");

      expect(result).toHaveProperty("model", "gpt-4");
    });

    it("should record a failed request when provider stub throws", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
      mockProviderChat.mockRejectedValue(new Error("Provider error"));
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow(
        "Provider error",
      );

      expect(mockCreateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: "Provider error",
        }),
      );
    });

    it("should use the provider resolver", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
      createService();

      await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      expect(mockResolve).toHaveBeenCalledWith("stub");
    });

    it("should use defaultProvider from settings when available", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ defaultProvider: "custom" }));
      createService();

      await expect(service.chat(makeDto(), "user-1", "org-1", "ws-1")).rejects.toThrow();
    });

    it("should call provider with ProviderChatRequest (without gateway fields)", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const providerMockInner = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMockInner);
      createService();

      await service.chat(makeDto(), "user-1", "org-1", "ws-1");

      const callArg = mockProviderChat.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
      expect(callArg).toHaveProperty("model", "gpt-4");
      expect(callArg).not.toHaveProperty("workspaceId");
      expect(callArg).not.toHaveProperty("organizationId");
    });

    it("should throw ForbiddenException when provider returns error result", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
      mockProviderChat.mockResolvedValue({
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
      const providerMock = { chat: mockProviderChat } as unknown as AiProvider;
      mockResolve.mockReturnValue(providerMock);
      createService();

      const dto = {
        model: "gpt-4",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.7,
        maxTokens: 100,
      } as ChatCompletionRequestDto;
      await service.chat(dto, "user-1", "org-1", "ws-1");

      expect(mockProviderChat).toHaveBeenCalledWith(expect.objectContaining({ stream: false }));
    });
  });
});
