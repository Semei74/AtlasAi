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
});
