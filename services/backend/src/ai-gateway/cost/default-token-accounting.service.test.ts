import { describe, it, expect, vi } from "vitest";
import type { PricingResolver } from "./interfaces/pricing-resolver.interface.js";
import type { MetricsService } from "../../metrics/metrics.service.js";
import { DefaultCostCalculator } from "./default-cost-calculator.js";
import { DefaultTokenEstimator } from "./default-token-estimator.js";
import { DefaultUsageCalculator } from "./default-usage-calculator.js";
import { DefaultTokenAccountingService } from "./default-token-accounting.service.js";

const KNOWN_PRICING = { inputPerToken: 0.000002, outputPerToken: 0.000008 };

function createService(resolve: PricingResolver["resolve"]): {
  service: DefaultTokenAccountingService;
  metrics: MetricsService;
} {
  const pricingResolver = { resolve: vi.fn(resolve) } as unknown as PricingResolver;
  const costCalculator = new DefaultCostCalculator();
  const tokenEstimator = new DefaultTokenEstimator();
  const usageCalculator = new DefaultUsageCalculator(tokenEstimator);
  const metrics = { aiGatewayCostTotal: { inc: vi.fn() } } as unknown as MetricsService;

  return {
    service: new DefaultTokenAccountingService(pricingResolver, costCalculator, tokenEstimator, usageCalculator, metrics),
    metrics,
  };
}

describe("DefaultTokenAccountingService", () => {
  it("computes native cost from provider usage when pricing is known", () => {
    const { service } = createService(() => KNOWN_PRICING);

    const result = service.account({
      provider: "openai",
      model: "gpt-4.1",
      providerUsage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 },
    });

    expect(result.usage.estimatedCost).toBeCloseTo(0.006);
    expect(result.estimated).toBe(false);
    expect(result.currency).toBe("USD");
  });

  it("falls back to default pricing and marks estimated when pricing is unknown", () => {
    const { service } = createService(() => null);

    const result = service.account({
      provider: "unknown",
      model: "unknown-model",
      providerUsage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 },
    });

    expect(result.usage.estimatedCost).toBeGreaterThan(0);
    expect(result.estimated).toBe(true);
  });

  it("estimates tokens from text when the provider returns no usage", () => {
    const { service } = createService(() => KNOWN_PRICING);

    const result = service.account({
      provider: "openai",
      model: "gpt-4.1",
      promptText: "hello world",
    });

    expect(result.usage.promptTokens).toBe(3);
    expect(result.usage.completionTokens).toBe(0);
    expect(result.usage.totalTokens).toBe(3);
    expect(result.estimated).toBe(true);
  });

  it("estimates from text when provider usage is zero", () => {
    const { service } = createService(() => KNOWN_PRICING);

    const result = service.account({
      provider: "openai",
      model: "gpt-4.1",
      providerUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      promptText: "hi",
    });

    expect(result.usage.promptTokens).toBe(1);
    expect(result.estimated).toBe(true);
  });

  it("returns zero cost and estimated=true for an unknown provider with no usage", () => {
    const { service } = createService(() => null);

    const result = service.account({ provider: "unknown", model: "unknown-model" });

    expect(result.usage.promptTokens).toBe(0);
    expect(result.usage.estimatedCost).toBe(0);
    expect(result.estimated).toBe(true);
  });

  it("calculateCost uses known pricing and falls back otherwise", () => {
    const { service } = createService(() => KNOWN_PRICING);
    const usage = {
      promptTokens: 1000,
      completionTokens: 500,
      cachedTokens: 0,
      totalTokens: 1500,
      estimatedCost: 0,
      currency: "USD",
    };

    expect(service.calculateCost(usage, "gpt-4.1", "openai")).toBeCloseTo(0.006);

    const unknown = createService(() => null);
    expect(unknown.service.calculateCost(usage, "x", "y")).toBeGreaterThan(0);
  });

  it("estimateTokens delegates to the estimator", () => {
    const { service } = createService(() => null);

    expect(service.estimateTokens("hello world", "gpt-4.1")).toBe(3);
  });

  it("recordUsage increments the cost metric with provider and model labels", async () => {
    const { service, metrics } = createService(() => null);

    await service.recordUsage("org-1", "ws-1", {
      promptTokens: 1000,
      completionTokens: 500,
      cachedTokens: 0,
      totalTokens: 1500,
      estimatedCost: 0.002,
      currency: "USD",
    }, "openai", "gpt-4.1");

    expect(metrics.aiGatewayCostTotal.inc).toHaveBeenCalledWith(
      { provider: "openai", model: "gpt-4.1" },
      0.002,
    );
  });
});
