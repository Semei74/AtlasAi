import { describe, it, expect } from "vitest";
import { DefaultProviderRegistry } from "./default-provider-registry.js";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";
import type { ProviderChatResponse } from "../interfaces/provider-response.interface.js";
import type { ProviderResult } from "../interfaces/provider-result.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderConfiguration } from "../interfaces/provider-configuration.interface.js";

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
  chat(_request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    return Promise.resolve({
      success: true,
      latency: 0,
      data: {
        id: "dummy",
        model: "dummy",
        content: "",
        finishReason: "stop",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      },
    });
  },
  health(): Promise<ProviderHealth> {
    return Promise.resolve({ status: "healthy", latency: 0, lastChecked: new Date() });
  },
  configure(_config: Partial<ProviderConfiguration>): void {
    /* no-op */
  },
  initialize(): Promise<void> {
    return Promise.resolve();
  },
};

describe("DefaultProviderRegistry", () => {
  it("should register and retrieve a provider", () => {
    const registry = new DefaultProviderRegistry();

    registry.register("test", dummyProvider);

    const retrieved = registry.get("test");
    expect(retrieved).toBe(dummyProvider);
  });

  it("should return null for unregistered provider", () => {
    const registry = new DefaultProviderRegistry();

    expect(registry.get("unknown")).toBeNull();
  });

  it("should check if a provider exists", () => {
    const registry = new DefaultProviderRegistry();

    registry.register("test", dummyProvider);

    expect(registry.has("test")).toBe(true);
    expect(registry.has("unknown")).toBe(false);
  });

  it("should return all registered providers", () => {
    const registry = new DefaultProviderRegistry();

    registry.register("a", dummyProvider);
    registry.register("b", dummyProvider);

    const all = registry.getAll();
    expect(all.size).toBe(2);
    expect(all.has("a")).toBe(true);
    expect(all.has("b")).toBe(true);
  });

  it("should overwrite existing provider on re-register", () => {
    const registry = new DefaultProviderRegistry();
    const other: AiProvider = {
      ...dummyProvider,
      metadata: { ...dummyProvider.metadata, name: "other" },
    };

    registry.register("test", dummyProvider);
    registry.register("test", other);

    expect(registry.get("test")?.metadata.name).toBe("other");
  });

  it("should expose a full registration entry", () => {
    const registry = new DefaultProviderRegistry();
    registry.register("test", dummyProvider);

    const entry = registry.getEntry("test");

    expect(entry).not.toBeNull();
    expect(entry?.name).toBe("test");
    expect(entry?.metadata).toBe(dummyProvider.metadata);
    expect(entry?.enabled).toBe(true);
    expect(entry?.initialized).toBe(false);
    expect(entry?.health).toBeNull();
    expect(entry?.registeredAt).toBeInstanceOf(Date);
  });

  it("should default to enabled and support runtime enable/disable", () => {
    const registry = new DefaultProviderRegistry();
    registry.register("test", dummyProvider, { enabled: false });

    expect(registry.isEnabled("test")).toBe(false);

    registry.setEnabled("test", true);
    expect(registry.isEnabled("test")).toBe(true);
  });

  it("should throw when enabling an unregistered provider", () => {
    const registry = new DefaultProviderRegistry();

    expect(() => { registry.setEnabled("missing", true); }).toThrow(/not found/);
  });

  it("should unregister a provider", () => {
    const registry = new DefaultProviderRegistry();
    registry.register("test", dummyProvider);

    expect(registry.unregister("test")).toBe(true);
    expect(registry.has("test")).toBe(false);
    expect(registry.unregister("test")).toBe(false);
  });

  it("should filter providers by capability", () => {
    const registry = new DefaultProviderRegistry();
    const chatOnly: AiProvider = {
      ...dummyProvider,
      capabilities: { ...dummyProvider.capabilities, chat: true, embeddings: false },
    };
    const embeddingOnly: AiProvider = {
      ...dummyProvider,
      capabilities: { ...dummyProvider.capabilities, chat: false, embeddings: true },
    };

    registry.register("chat", chatOnly);
    registry.register("embedding", embeddingOnly);

    expect(registry.findByCapability("chat").map((e) => e.name)).toEqual(["chat"]);
    expect(registry.findByCapability("embeddings").map((e) => e.name)).toEqual(["embedding"]);
    expect(registry.listEnabled().map((e) => e.name).sort()).toEqual(["chat", "embedding"]);
  });

  it("should expose metadata for a registered provider", () => {
    const registry = new DefaultProviderRegistry();
    registry.register("test", dummyProvider);

    expect(registry.getMetadata("test")).toBe(dummyProvider.metadata);
    expect(registry.getMetadata("missing")).toBeNull();
  });

  it("should track lifecycle initialization", async () => {
    const registry = new DefaultProviderRegistry();
    let initialized = false;
    const trackable: AiProvider = {
      ...dummyProvider,
      initialize: () => {
        initialized = true;

        return Promise.resolve();
      },
    };

    registry.register("track", trackable);
    await registry.initialize("track");

    expect(initialized).toBe(true);
    expect(registry.getEntry("track")?.initialized).toBe(true);
  });

  it("should track provider health", async () => {
    const registry = new DefaultProviderRegistry();
    const trackable: AiProvider = {
      ...dummyProvider,
      health: () =>
        Promise.resolve({ status: "healthy", latency: 12, lastChecked: new Date() }),
    };

    registry.register("track", trackable);
    const health = await registry.getHealth("track");

    expect(health?.status).toBe("healthy");
    expect(health?.latency).toBe(12);
    expect(registry.getEntry("track")?.health?.status).toBe("healthy");
    expect(await registry.getHealth("missing")).toBeNull();
  });
});
