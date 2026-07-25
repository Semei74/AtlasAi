import { describe, it, expect } from "vitest";
import { DefaultProviderFactory } from "./default-provider-factory.js";
import { DefaultProviderRegistry } from "../registry/default-provider-registry.js";
import { ProviderStub } from "../stub/provider-stub.js";
import { OpenaiProvider } from "../openai/openai.provider.js";
import { AnthropicProvider } from "../anthropic/anthropic.provider.js";
import { GeminiProvider } from "../gemini/gemini.provider.js";
import { OpenrouterProvider } from "../openrouter/openrouter.provider.js";
import { DeepseekProvider } from "../deepseek/deepseek.provider.js";
import { MistralProvider } from "../mistral/mistral.provider.js";
import { GroqProvider } from "../groq/groq.provider.js";
import { XaiProvider } from "../xai/xai.provider.js";
import { OllamaProvider } from "../ollama/ollama.provider.js";
import { OllamaClient } from "../ollama/ollama.client.js";
import type { ProviderRegistry } from "../registry/provider-registry.interface.js";

const providerNames = [
  "stub",
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
  "deepseek",
  "mistral",
  "groq",
  "xai",
  "ollama",
] as const;

describe("DefaultProviderFactory", () => {
  function createFactory(): DefaultProviderFactory {
    const registry: ProviderRegistry = new DefaultProviderRegistry();
    const ollamaClient = new OllamaClient();
    return new DefaultProviderFactory(
      registry,
      new ProviderStub(),
      new OpenaiProvider(),
      new AnthropicProvider(),
      new GeminiProvider(),
      new OpenrouterProvider(),
      new DeepseekProvider(),
      new MistralProvider(),
      new GroqProvider(),
      new XaiProvider(),
      new OllamaProvider(ollamaClient),
    );
  }

  describe("create", () => {
    for (const name of providerNames) {
      it(`should create ${name} provider`, () => {
        const factory = createFactory();

        const provider = factory.create(name);

        expect(provider).toBeDefined();
        expect(provider.metadata.name).toBe(name);
      });
    }

    it("should register provider in registry on creation", () => {
      const registry: ProviderRegistry = new DefaultProviderRegistry();
      const ollamaClient = new OllamaClient();
      const factory = new DefaultProviderFactory(
        registry,
        new ProviderStub(),
        new OpenaiProvider(),
        new AnthropicProvider(),
        new GeminiProvider(),
        new OpenrouterProvider(),
        new DeepseekProvider(),
        new MistralProvider(),
        new GroqProvider(),
        new XaiProvider(),
        new OllamaProvider(ollamaClient),
      );

      factory.create("openai");

      expect(registry.has("openai")).toBe(true);
    });

    it("should throw for unsupported provider", () => {
      const factory = createFactory();

      expect(() => factory.create("nonexistent")).toThrow("not found");
    });
  });

  describe("supports", () => {
    const factory = createFactory();

    for (const name of providerNames) {
      it(`should support ${name}`, () => {
        expect(factory.supports(name)).toBe(true);
      });
    }

    it("should not support unknown provider", () => {
      expect(factory.supports("nonexistent")).toBe(false);
    });
  });

  describe("auto-registration", () => {
    function createFactoryWith(registry: ProviderRegistry): DefaultProviderFactory {
      const ollamaClient = new OllamaClient();
      return new DefaultProviderFactory(
        registry,
        new ProviderStub(),
        new OpenaiProvider(),
        new AnthropicProvider(),
        new GeminiProvider(),
        new OpenrouterProvider(),
        new DeepseekProvider(),
        new MistralProvider(),
        new GroqProvider(),
        new XaiProvider(),
        new OllamaProvider(ollamaClient),
      );
    }

    it("should register and initialize every provider on module init", async () => {
      const registry: ProviderRegistry = new DefaultProviderRegistry();
      const factory = createFactoryWith(registry);

      await factory.onModuleInit();

      for (const name of providerNames) {
        expect(registry.has(name)).toBe(true);
        expect(registry.getEntry(name)?.initialized).toBe(true);
      }
    });
  });
});
