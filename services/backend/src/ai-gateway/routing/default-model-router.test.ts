import { describe, it, expect, vi } from "vitest";
import { DefaultModelRouter } from "./default-model-router.js";
import type { ModelInfo } from "../model-registry/interfaces/model-info.interface.js";
import type { ModelCapabilities } from "../model-registry/interfaces/model-capabilities.interface.js";

function makeCapabilities(overrides: Partial<ModelCapabilities>): ModelCapabilities {
  return {
    streaming: false,
    toolCalling: false,
    vision: false,
    embeddings: false,
    imageGeneration: false,
    audio: false,
    reasoning: false,
    functionCalling: false,
    moderation: false,
    ...overrides,
  };
}

function makeModel(overrides: Partial<ModelInfo>): ModelInfo {
  return {
    id: "model",
    provider: "provider",
    displayName: "Model",
    status: "active",
    capabilities: makeCapabilities({ streaming: true }),
    pricing: { inputPerToken: 0.001, outputPerToken: 0.001 },
    limits: { contextWindow: 128000, maxOutputTokens: 4096 },
    enabled: true,
    deprecated: false,
    ...overrides,
  };
}

const GPT4O = makeModel({
  id: "openai/gpt-4o",
  provider: "openai",
  capabilities: makeCapabilities({
    streaming: true,
    toolCalling: true,
    vision: true,
    embeddings: true,
    reasoning: true,
    functionCalling: true,
    moderation: true,
  }),
  pricing: { inputPerToken: 0.005, outputPerToken: 0.015 },
  limits: { contextWindow: 128000, maxOutputTokens: 4096 },
});

const CLAUDE_HAIKU = makeModel({
  id: "anthropic/claude-haiku",
  provider: "anthropic",
  capabilities: makeCapabilities({
    streaming: true,
    toolCalling: true,
    vision: true,
    reasoning: true,
    functionCalling: true,
  }),
  pricing: { inputPerToken: 0.00025, outputPerToken: 0.00125 },
  limits: { contextWindow: 200000, maxOutputTokens: 8192 },
});

const DEEPSEEK_CODER = makeModel({
  id: "deepseek/coder",
  provider: "deepseek",
  capabilities: makeCapabilities({ streaming: true, toolCalling: true, functionCalling: true }),
  pricing: { inputPerToken: 0.0001, outputPerToken: 0.0001 },
  limits: { contextWindow: 64000, maxOutputTokens: 4096 },
});

const ALL_MODELS = [GPT4O, CLAUDE_HAIKU, DEEPSEEK_CODER];

function createRouter(options: {
  models?: ModelInfo[];
  enabled?: Set<string>;
  available?: Set<string>;
  latencies?: Record<string, number>;
}): DefaultModelRouter {
  const models = options.models ?? ALL_MODELS;
  const enabled = options.enabled ?? new Set(["openai", "anthropic", "deepseek"]);
  const available = options.available ?? new Set(["openai", "anthropic", "deepseek"]);
  const latencies = options.latencies ?? { openai: 200, anthropic: 100, deepseek: 500 };

  const modelRegistry = { list: vi.fn().mockReturnValue(models) } as never;
  const providerRegistry = { isEnabled: vi.fn((name: string) => enabled.has(name)) } as never;
  const healthMonitor = {
    isAvailable: vi.fn((name: string) => available.has(name)),
    getHealth: vi.fn((name: string) => (latencies[name] !== undefined ? { latency: latencies[name] } : null)),
  } as never;

  return new DefaultModelRouter(modelRegistry, providerRegistry, healthMonitor);
}

describe("DefaultModelRouter", () => {
  it("selects the cheapest model for the cost strategy", async () => {
    const decision = await createRouter({}).route({}, { strategy: "cost" });
    expect(decision.provider).toBe("deepseek");
    expect(decision.model).toBe("deepseek/coder");
  });

  it("selects the most capable model for the capability strategy", async () => {
    const decision = await createRouter({}).route({}, { strategy: "capability" });
    expect(decision.provider).toBe("openai");
    expect(decision.model).toBe("openai/gpt-4o");
  });

  it("selects the lowest-latency provider for the latency strategy", async () => {
    const decision = await createRouter({}).route({}, { strategy: "latency" });
    expect(decision.provider).toBe("anthropic");
    expect(decision.model).toBe("anthropic/claude-haiku");
  });

  it("honors required capabilities", async () => {
    const decision = await createRouter({}).route({ requiredCapabilities: { vision: true } });
    expect(decision.provider).toBe("openai");
    expect(decision.model).toBe("openai/gpt-4o");
  });

  it("honors the minimum context window", async () => {
    const decision = await createRouter({}).route({ minContextWindow: 150000 });
    expect(decision.provider).toBe("anthropic");
    expect(decision.model).toBe("anthropic/claude-haiku");
  });

  it("filters by allowed providers", async () => {
    const decision = await createRouter({}).route({}, { allowedProviders: ["openai"] });
    expect(decision.provider).toBe("openai");
    expect(decision.model).toBe("openai/gpt-4o");
  });

  it("filters by allowed models", async () => {
    const decision = await createRouter({}).route({}, { allowedModels: ["deepseek/coder"] });
    expect(decision.provider).toBe("deepseek");
    expect(decision.model).toBe("deepseek/coder");
  });

  it("biases toward the preferred provider", async () => {
    const decision = await createRouter({}).route({}, { strategy: "cost", preferredProvider: "anthropic" });
    expect(decision.provider).toBe("anthropic");
    expect(decision.model).toBe("anthropic/claude-haiku");
  });

  it("excludes unavailable providers", async () => {
    const decision = await createRouter({
      enabled: new Set(["openai", "deepseek"]),
      available: new Set(["openai", "deepseek"]),
    }).route({}, { strategy: "latency" });
    expect(decision.provider).toBe("openai");
    expect(decision.model).toBe("openai/gpt-4o");
  });

  it("throws when no model satisfies the constraints", async () => {
    await expect(createRouter({}).route({}, { allowedModels: ["missing/model"] })).rejects.toThrow(
      "No model satisfies the routing constraints",
    );
  });
});
