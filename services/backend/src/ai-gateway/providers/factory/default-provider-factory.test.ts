import { describe, it, expect } from "vitest";
import { DefaultProviderFactory } from "./default-provider-factory.js";
import { DefaultProviderRegistry } from "../registry/default-provider-registry.js";
import { ProviderStub } from "../stub/provider-stub.js";
import type { ProviderRegistry } from "../registry/provider-registry.interface.js";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";

describe("DefaultProviderFactory", () => {
  it("should create a stub provider", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const stub: AiProvider = new ProviderStub();
    const factory = new DefaultProviderFactory(registry, stub);

    const provider = factory.create("stub");

    expect(provider).toBeDefined();
    expect(provider.metadata.name).toBe("stub");
  });

  it("should register stub in registry on creation", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const stub: AiProvider = new ProviderStub();
    const factory = new DefaultProviderFactory(registry, stub);

    factory.create("stub");

    expect(registry.has("stub")).toBe(true);
  });

  it("should throw for unsupported provider", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const stub: AiProvider = new ProviderStub();
    const factory = new DefaultProviderFactory(registry, stub);

    expect(() => factory.create("openai")).toThrow("Unsupported provider: openai");
  });

  it("should report supported providers", () => {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const stub: AiProvider = new ProviderStub();
    const factory = new DefaultProviderFactory(registry, stub);

    expect(factory.supports("stub")).toBe(true);
    expect(factory.supports("openai")).toBe(false);
    expect(factory.supports("anthropic")).toBe(false);
  });
});
