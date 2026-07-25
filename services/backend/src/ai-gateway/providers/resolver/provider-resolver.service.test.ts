import { describe, it, expect, vi } from "vitest";
import { ProviderResolverService } from "./provider-resolver.service.js";
import { DefaultProviderRegistry } from "../registry/default-provider-registry.js";
import type { ProviderRegistry } from "../registry/provider-registry.interface.js";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";

const dummyProvider: AiProvider = {
  metadata: { name: "dummy", version: "1.0.0", description: "Dummy" },
  capabilities: {
    chat: true,
    streaming: false,
    functionCalling: false,
    embeddings: false,
    imageGeneration: false,
    audioTranscription: false,
    toolCalling: false,
    audioGeneration: false,
    moderation: false,
    reasoning: false,
    mcp: false,
    rag: false,
    promptTemplates: false,
    conversationMemory: false,
    maxModels: 0,
    supportedModels: [],
  },
  configuration: { timeout: 30000, maxRetries: 0 },
  chat: vi.fn(),
  health: vi.fn(),
  configure: vi.fn(),
  initialize: vi.fn(),
};

describe("ProviderResolverService", () => {
  it("should resolve a registered provider", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    registry.register("test", dummyProvider);
    const factory = { create: vi.fn(), supports: vi.fn() };
    const resolver = new ProviderResolverService(registry, factory);

    const provider = resolver.resolve("test");

    expect(provider).toBe(dummyProvider);
    expect(factory.create).not.toHaveBeenCalled();
  });

  it("should create provider via factory if not registered", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const factory = {
      create: vi.fn().mockReturnValue(dummyProvider),
      supports: vi.fn().mockReturnValue(true),
    };
    const resolver = new ProviderResolverService(registry, factory);

    const provider = resolver.resolve("stub");

    expect(provider).toBe(dummyProvider);
    expect(factory.create).toHaveBeenCalledWith("stub");
  });

  it("should throw for unsupported provider", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const factory = { create: vi.fn(), supports: vi.fn().mockReturnValue(false) };
    const resolver = new ProviderResolverService(registry, factory);

    expect(() => resolver.resolve("openai")).toThrow("not found");
    expect(factory.create).not.toHaveBeenCalled();
  });

  it("should not call factory if provider is already registered", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    registry.register("stub", dummyProvider);
    const factory = { create: vi.fn(), supports: vi.fn() };
    const resolver = new ProviderResolverService(registry, factory);

    const provider = resolver.resolve("stub");

    expect(provider).toBe(dummyProvider);
    expect(factory.supports).not.toHaveBeenCalled();
    expect(factory.create).not.toHaveBeenCalled();
  });
});
