import { describe, it, expect, beforeEach } from "vitest";
import { DefaultModelRegistry } from "./default-model-registry.js";
import { STATIC_MODELS } from "./static-models.js";
import type { ModelInfo } from "./interfaces/model-info.interface.js";

function validModel(overrides: Partial<ModelInfo> = {}): ModelInfo {
  return {
    id: "test-model",
    provider: "test-provider",
    displayName: "Test Model",
    status: "active",
    capabilities: {
      streaming: false,
      toolCalling: false,
      vision: false,
      embeddings: false,
      imageGeneration: false,
      audio: false,
      reasoning: false,
      functionCalling: false,
      moderation: false,
    },
    pricing: { inputPerToken: 0.000001, outputPerToken: 0.000002 },
    limits: { contextWindow: 4096, maxOutputTokens: 1024 },
    enabled: true,
    deprecated: false,
    ...overrides,
  };
}

describe("DefaultModelRegistry", () => {
  let registry: DefaultModelRegistry;

  beforeEach(() => {
    registry = new DefaultModelRegistry();
    registry.clear();
  });

  describe("static model loading", () => {
    it("should register static models from constructor", () => {
      const fullRegistry = new DefaultModelRegistry();
      expect(fullRegistry.list().length).toBeGreaterThan(0);
    });

    it("should register all models from STATIC_MODELS", () => {
      const fullRegistry = new DefaultModelRegistry();
      for (const model of STATIC_MODELS) {
        expect(fullRegistry.has(model.provider, model.id)).toBe(true);
      }
    });
  });

  describe("register", () => {
    it("should register a model", () => {
      const model = validModel();

      registry.register(model);

      expect(registry.has("test-provider", "test-model")).toBe(true);
    });

    it("should throw on duplicate registration", () => {
      registry.register(validModel());

      expect(() => {
        registry.register(validModel());
      }).toThrow("Duplicate model");
    });

    it("should register models from different providers with same id", () => {
      registry.register(validModel({ provider: "p1", id: "shared" }));
      registry.register(validModel({ provider: "p2", id: "shared" }));

      expect(registry.has("p1", "shared")).toBe(true);
      expect(registry.has("p2", "shared")).toBe(true);
      expect(registry.list().length).toBe(2);
    });
  });

  describe("registerMany", () => {
    it("should register multiple models", () => {
      registry.registerMany([
        validModel({ id: "m1", provider: "p" }),
        validModel({ id: "m2", provider: "p" }),
        validModel({ id: "m3", provider: "p" }),
      ]);

      expect(registry.list().length).toBe(3);
    });

    it("should throw on duplicate in batch (first model registers before error)", () => {
      const models = [
        validModel({ id: "m1", provider: "p" }),
        validModel({ id: "m1", provider: "p" }),
      ];

      expect(() => {
        registry.registerMany(models);
      }).toThrow("Duplicate model");
      expect(registry.list().length).toBe(1);
    });
  });

  describe("get", () => {
    it("should return registered model", () => {
      registry.register(validModel({ id: "gpt-4", provider: "openai" }));

      const result = registry.get("openai", "gpt-4");

      expect(result).not.toBeNull();
      if (result !== null) {
        expect(result.id).toBe("gpt-4");
        expect(result.provider).toBe("openai");
      }
    });

    it("should return null for unknown model", () => {
      expect(registry.get("nonexistent", "unknown")).toBeNull();
    });
  });

  describe("has", () => {
    it("should return true for registered model", () => {
      registry.register(validModel());

      expect(registry.has("test-provider", "test-model")).toBe(true);
    });

    it("should return false for unregistered model", () => {
      expect(registry.has("unknown", "unknown")).toBe(false);
    });
  });

  describe("remove", () => {
    it("should remove a registered model", () => {
      registry.register(validModel());

      const removed = registry.remove("test-provider", "test-model");

      expect(removed).toBe(true);
      expect(registry.has("test-provider", "test-model")).toBe(false);
    });

    it("should return false when model is not found", () => {
      expect(registry.remove("unknown", "unknown")).toBe(false);
    });
  });

  describe("list", () => {
    it("should return all registered models", () => {
      registry.registerMany([
        validModel({ id: "a", provider: "p1" }),
        validModel({ id: "b", provider: "p2" }),
      ]);

      expect(registry.list().length).toBe(2);
    });

    it("should return empty array when no models registered", () => {
      expect(registry.list()).toEqual([]);
    });
  });

  describe("listByProvider", () => {
    it("should return models filtered by provider", () => {
      registry.registerMany([
        validModel({ id: "a", provider: "openai" }),
        validModel({ id: "b", provider: "openai" }),
        validModel({ id: "c", provider: "anthropic" }),
      ]);

      const openaiModels = registry.listByProvider("openai");

      expect(openaiModels.length).toBe(2);
      expect(openaiModels.every((m) => m.provider === "openai")).toBe(true);
    });

    it("should return empty array when provider has no models", () => {
      expect(registry.listByProvider("nonexistent")).toEqual([]);
    });
  });

  describe("findByCapability", () => {
    it("should return models matching all specified capabilities", () => {
      registry.registerMany([
        validModel({ id: "vision-model", provider: "p", capabilities: { ...validModel().capabilities, vision: true } }),
        validModel({ id: "no-vision", provider: "p", capabilities: { ...validModel().capabilities, vision: false } }),
        validModel({ id: "vision-stream", provider: "p", capabilities: { ...validModel().capabilities, vision: true, streaming: true } }),
      ]);

      const visionModels = registry.findByCapability({ vision: true });

      expect(visionModels.length).toBe(2);
    });

    it("should return all models when capability filter is empty", () => {
      registry.registerMany([
        validModel({ id: "a", provider: "p" }),
        validModel({ id: "b", provider: "p" }),
      ]);

      const all = registry.findByCapability({});

      expect(all.length).toBe(2);
    });

    it("should return empty when no models match", () => {
      registry.register(validModel());

      const result = registry.findByCapability({ audio: true });

      expect(result).toEqual([]);
    });
  });

  describe("findEnabled", () => {
    it("should return only enabled models", () => {
      registry.registerMany([
        validModel({ id: "enabled-1", provider: "p", enabled: true }),
        validModel({ id: "enabled-2", provider: "p", enabled: true }),
        validModel({ id: "disabled", provider: "p", enabled: false }),
      ]);

      const enabled = registry.findEnabled();

      expect(enabled.length).toBe(2);
      expect(enabled.every((m) => m.enabled)).toBe(true);
    });
  });

  describe("findDeprecated", () => {
    it("should return only deprecated models", () => {
      registry.registerMany([
        validModel({ id: "current", provider: "p", deprecated: false }),
        validModel({ id: "old", provider: "p", deprecated: true }),
      ]);

      const deprecated = registry.findDeprecated();

      expect(deprecated.length).toBe(1);
      expect(deprecated[0]?.id).toBe("old");
    });
  });

  describe("clear", () => {
    it("should remove all models", () => {
      registry.registerMany([
        validModel({ id: "a", provider: "p" }),
        validModel({ id: "b", provider: "p" }),
      ]);

      registry.clear();

      expect(registry.list().length).toBe(0);
    });

    it("should allow re-registration after clear", () => {
      registry.register(validModel({ id: "m", provider: "p" }));
      registry.clear();
      registry.register(validModel({ id: "m", provider: "p" }));

      expect(registry.has("p", "m")).toBe(true);
    });
  });

  describe("validation", () => {
    it("should reject missing id", () => {
      expect(() => {
        registry.register(validModel({ id: "" }));
      }).toThrow("'id' is required");
    });

    it("should reject missing provider", () => {
      expect(() => {
        registry.register(validModel({ provider: "" }));
      }).toThrow("'provider' is required");
    });

    it("should reject missing displayName", () => {
      expect(() => {
        registry.register(validModel({ displayName: "" }));
      }).toThrow("'displayName' is required");
    });

    it("should reject contextWindow < 1", () => {
      expect(() => {
        registry.register(validModel({ limits: { contextWindow: 0, maxOutputTokens: 1024 } }));
      }).toThrow("contextWindow");
    });

    it("should reject maxOutputTokens < 1", () => {
      expect(() => {
        registry.register(validModel({ limits: { contextWindow: 4096, maxOutputTokens: 0 } }));
      }).toThrow("maxOutputTokens");
    });

    it("should reject negative input pricing", () => {
      expect(() => {
        registry.register(validModel({ pricing: { inputPerToken: -1, outputPerToken: 0.000002 } }));
      }).toThrow("inputPerToken");
    });

    it("should reject negative output pricing", () => {
      expect(() => {
        registry.register(validModel({ pricing: { inputPerToken: 0.000001, outputPerToken: -1 } }));
      }).toThrow("outputPerToken");
    });

    it("should allow zero pricing", () => {
      expect(() => {
        registry.register(validModel({ pricing: { inputPerToken: 0, outputPerToken: 0 } }));
      }).not.toThrow();
    });
  });

  describe("runtime registration", () => {
    it("should allow registering additional models after construction", () => {
      registry.register(
        validModel({ id: "custom-model", provider: "ollama", displayName: "Custom Model" }),
      );

      expect(registry.has("ollama", "custom-model")).toBe(true);
    });

    it("should allow registering models from any provider at runtime", () => {
      const model = validModel({
        id: "new-model",
        provider: "ollama",
        displayName: "Runtime Model",
      });

      registry.register(model);

      expect(registry.get("ollama", "new-model")?.displayName).toBe("Runtime Model");
    });
  });

  describe("provider model counts", () => {
    it("should register models for all 9 providers", () => {
      const fullRegistry = new DefaultModelRegistry();
      const providers = Array.from(new Set(fullRegistry.list().map((m) => m.provider)));

      expect(providers).toContain("openai");
      expect(providers).toContain("anthropic");
      expect(providers).toContain("gemini");
      expect(providers).toContain("openrouter");
      expect(providers).toContain("deepseek");
      expect(providers).toContain("mistral");
      expect(providers).toContain("groq");
      expect(providers).toContain("xai");
      expect(providers).toContain("ollama");
    });
  });
});
