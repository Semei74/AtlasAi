import { describe, it, expect, vi, beforeEach } from "vitest";
import { AiPolicyEngineService } from "./ai-policy-engine.service.js";
import type { OrganizationSettingsRepository } from "../../../organization/interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettings } from "../../../organization/interfaces/organization-settings.interface.js";
import type { ModelRegistry } from "../../model-registry/interfaces/model-registry.interface.js";
import type { AiPolicyContext } from "../interfaces/ai-policy-context.interface.js";

function makeSettings(aiOverrides: Partial<OrganizationSettings["ai"]> = {}): OrganizationSettings {
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
      ...aiOverrides,
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

function makeContext(overrides: Partial<AiPolicyContext> = {}): AiPolicyContext {
  return {
    organizationId: "org-1",
    workspaceId: "ws-1",
    userId: "user-1",
    provider: "stub",
    model: "gpt-4",
    requestedCapabilities: {},
    metadata: {},
    ...overrides,
  };
}

describe("AiPolicyEngineService", () => {
  const mockFindByOrgId = vi.fn();
  let modelRegistry: ModelRegistry;
  let engine: AiPolicyEngineService;

  function createEngine(): void {
    const orgSettingsRepo = {
      findByOrganizationId: mockFindByOrgId,
    } as unknown as OrganizationSettingsRepository;

    modelRegistry = {
      list: vi.fn().mockReturnValue([
        { id: "gpt-4" },
        { id: "gpt-4.1" },
        { id: "claude-sonnet-4" },
      ]),
    } as unknown as ModelRegistry;

    engine = new AiPolicyEngineService(orgSettingsRepo, modelRegistry);
  }

  beforeEach(() => {
    mockFindByOrgId.mockReset();
    createEngine();
  });

  describe("provider policy", () => {
    it("should allow provider not in enabledProviders when enabledProviders is empty", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ enabledProviders: [] }));
      const result = await engine.evaluate(makeContext({ provider: "openai" }));

      expect(result.allowed).toBe(true);
      expect(result.violations.filter((v) => v.policy === "provider")).toHaveLength(0);
    });

    it("should allow provider in enabledProviders", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ enabledProviders: ["openai"] }));
      const result = await engine.evaluate(makeContext({ provider: "openai" }));

      expect(result.allowed).toBe(true);
    });

    it("should deny provider not in enabledProviders when list is non-empty", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ enabledProviders: ["anthropic"] }));
      const result = await engine.evaluate(makeContext({ provider: "openai" }));

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "provider",
            code: "PROVIDER_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should deny blocked provider", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ blockedProviders: ["openai"] }));
      const result = await engine.evaluate(makeContext({ provider: "openai" }));

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "provider",
            code: "PROVIDER_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should deny blocked provider even if also in enabledProviders", async () => {
      mockFindByOrgId.mockResolvedValue(
        makeSettings({ enabledProviders: ["openai"], blockedProviders: ["openai"] }),
      );
      const result = await engine.evaluate(makeContext({ provider: "openai" }));

      expect(result.allowed).toBe(false);
    });
  });

  describe("model policy", () => {
    it("should allow model not in allowedModels when allowedModels is empty", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowedModels: [] }));
      const result = await engine.evaluate(makeContext({ model: "gpt-4" }));

      expect(result.allowed).toBe(true);
    });

    it("should allow model in allowedModels", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowedModels: ["gpt-4"] }));
      const result = await engine.evaluate(makeContext({ model: "gpt-4" }));

      expect(result.allowed).toBe(true);
    });

    it("should deny model not in allowedModels when list is non-empty", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowedModels: ["gpt-3.5-turbo"] }));
      const result = await engine.evaluate(makeContext({ model: "gpt-4" }));

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "model",
            code: "MODEL_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should deny blocked model", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ blockedModels: ["gpt-4"] }));
      const result = await engine.evaluate(makeContext({ model: "gpt-4" }));

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "model",
            code: "MODEL_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should warn on unknown model not in registry", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const result = await engine.evaluate(makeContext({ model: "unknown-model" }));

      expect(result.allowed).toBe(true);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "model",
            code: "MODEL_UNKNOWN",
            severity: "warning",
          }),
        ]),
      );
    });

    it("should not warn for model that exists in registry", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const result = await engine.evaluate(makeContext({ model: "gpt-4" }));

      expect(result.violations.filter((v) => v.code === "MODEL_UNKNOWN")).toHaveLength(0);
    });
  });

  describe("capability policy", () => {
    it("should deny streaming when allowStreaming is false", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowStreaming: false }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { streaming: true } }),
      );

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "capability",
            code: "STREAMING_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should allow streaming when allowStreaming is true", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowStreaming: true }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { streaming: true } }),
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny tool calling when allowTools is false", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowTools: false }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { toolCalling: true } }),
      );

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "capability",
            code: "TOOLS_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should allow tool calling when allowTools is true", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowTools: true }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { toolCalling: true } }),
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny image generation when allowImageGeneration is false", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowImageGeneration: false }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { imageGeneration: true } }),
      );

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "capability",
            code: "IMAGE_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should allow image generation when allowImageGeneration is true", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowImageGeneration: true }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { imageGeneration: true } }),
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny embeddings when allowEmbeddings is false", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowEmbeddings: false }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { embeddings: true } }),
      );

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "capability",
            code: "EMBEDDINGS_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should allow embeddings when allowEmbeddings is true", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowEmbeddings: true }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { embeddings: true } }),
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny audio when allowAudioGeneration is false", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowAudioGeneration: false }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { audio: true } }),
      );

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "capability",
            code: "AUDIO_NOT_ALLOWED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should allow audio when allowAudioGeneration is true", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings({ allowAudioGeneration: true }));
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { audio: true } }),
      );

      expect(result.allowed).toBe(true);
    });

    it("should not fail when requested capability is not in capability map", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const result = await engine.evaluate(
        makeContext({ requestedCapabilities: { vision: true } }),
      );

      expect(result.allowed).toBe(true);
    });

    it("should not fail when requested capabilities is empty", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const result = await engine.evaluate(makeContext({ requestedCapabilities: {} }));

      expect(result.allowed).toBe(true);
    });
  });

  describe("multiple violations", () => {
    it("should collect multiple violations", async () => {
      mockFindByOrgId.mockResolvedValue(
        makeSettings({
          blockedProviders: ["stub"],
          blockedModels: ["gpt-4"],
          allowStreaming: false,
        }),
      );
      const result = await engine.evaluate(
        makeContext({
          provider: "stub",
          model: "gpt-4",
          requestedCapabilities: { streaming: true },
        }),
      );

      expect(result.allowed).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(3);
    });

    it("should list evaluated policies", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const result = await engine.evaluate(makeContext());

      expect(result.evaluatedPolicies).toContain("provider");
      expect(result.evaluatedPolicies).toContain("model");
      expect(result.evaluatedPolicies).toContain("capability");
      expect(result.evaluatedPolicies).toContain("regional");
    });
  });

  describe("missing organization settings", () => {
    it("should deny when settings are null", async () => {
      mockFindByOrgId.mockResolvedValue(null);
      const result = await engine.evaluate(makeContext());

      expect(result.allowed).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            policy: "engine",
            code: "ORGANIZATION_NOT_CONFIGURED",
            severity: "error",
          }),
        ]),
      );
    });

    it("should return empty evaluatedPolicies when settings are null", async () => {
      mockFindByOrgId.mockResolvedValue(null);
      const result = await engine.evaluate(makeContext());

      expect(result.evaluatedPolicies).toHaveLength(0);
    });
  });

  describe("regional policy", () => {
    it("should not produce violations (foundation)", async () => {
      mockFindByOrgId.mockResolvedValue(makeSettings());
      const result = await engine.evaluate(makeContext());

      expect(result.violations.filter((v) => v.policy === "regional")).toHaveLength(0);
    });
  });
});
