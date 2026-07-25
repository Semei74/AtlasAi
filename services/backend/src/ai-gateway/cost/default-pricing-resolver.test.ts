import { describe, it, expect, vi } from "vitest";
import type { ModelInfo } from "../model-registry/interfaces/model-info.interface.js";
import type { ModelRegistry } from "../model-registry/interfaces/model-registry.interface.js";
import { DefaultPricingResolver } from "./default-pricing-resolver.js";

function makeRegistry(entries: Record<string, ModelInfo["pricing"]>): ModelRegistry {
  return {
    get: vi.fn((provider: string, model: string) => {
      const pricing = entries[`${provider}:${model}`];

      return pricing === undefined ? null : ({ pricing } as unknown as ModelInfo);
    }),
  } as unknown as ModelRegistry;
}

describe("DefaultPricingResolver", () => {
  it("resolves pricing for a registered model", () => {
    const registry = makeRegistry({ "openai:gpt-4.1": { inputPerToken: 0.000002, outputPerToken: 0.000008 } });
    const resolver = new DefaultPricingResolver(registry);

    expect(resolver.resolve("openai", "gpt-4.1")).toEqual({
      inputPerToken: 0.000002,
      outputPerToken: 0.000008,
    });
  });

  it("returns null for an unknown provider or model", () => {
    const registry = makeRegistry({});
    const resolver = new DefaultPricingResolver(registry);

    expect(resolver.resolve("openai", "missing")).toBeNull();
    expect(resolver.resolve("missing", "gpt-4.1")).toBeNull();
  });
});
