import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultModelRegistry } from "./model-registry/default-model-registry.js";
import { DefaultPricingResolver } from "./cost/default-pricing-resolver.js";
import { DefaultCostCalculator } from "./cost/default-cost-calculator.js";
import { DefaultTokenEstimator } from "./cost/default-token-estimator.js";
import { DefaultUsageCalculator } from "./cost/default-usage-calculator.js";
import { DefaultTokenAccountingService } from "./cost/default-token-accounting.service.js";
import { DefaultModelRouter } from "./routing/default-model-router.js";

interface Phase08Components {
  modelRegistry: DefaultModelRegistry;
  pricingResolver: DefaultPricingResolver;
  costCalculator: DefaultCostCalculator;
  tokenEstimator: DefaultTokenEstimator;
  usageCalculator: DefaultUsageCalculator;
  tokenAccounting: DefaultTokenAccountingService;
  modelRouter: DefaultModelRouter;
}

function createComponents(): Phase08Components {
  const modelRegistry = new DefaultModelRegistry();
  const pricingResolver = new DefaultPricingResolver(modelRegistry);
  const costCalculator = new DefaultCostCalculator();
  const tokenEstimator = new DefaultTokenEstimator();
  const usageCalculator = new DefaultUsageCalculator(tokenEstimator);
  const metricsMock = {
    aiGatewayCostTotal: { inc: vi.fn() },
    aiGatewayProviderHealth: { set: vi.fn() },
    aiGatewayTokensTotal: { inc: vi.fn() },
    aiGatewayHealthCheckDurationSeconds: { observe: vi.fn() },
  };
  const tokenAccounting = new DefaultTokenAccountingService(
    pricingResolver,
    costCalculator,
    tokenEstimator,
    usageCalculator,
    metricsMock as never,
  );
  const healthMock = {
    isAvailable: vi.fn(() => true),
    getHealth: vi.fn(() => ({ latency: 100, status: "healthy", lastChecked: new Date(), consecutiveFailures: 0, isAvailable: true })),
  };
  const providerRegistryMock = {
    isEnabled: vi.fn(() => true),
  };
  const modelRouter = new DefaultModelRouter(modelRegistry, providerRegistryMock as never, healthMock as never);

  return { modelRegistry, pricingResolver, costCalculator, tokenEstimator, usageCalculator, tokenAccounting, modelRouter };
}

describe("Phase 08 Integration: Full Lifecycle", () => {
  let comp: Phase08Components;

  beforeEach(() => {
    comp = createComponents();
  });

  it("0805+0804: Model router picks a provider and model when model=auto", async () => {
    const decision = await comp.modelRouter.route({}, { strategy: "balanced" });
    expect(decision.provider).toBeTruthy();
    expect(decision.model).toBeTruthy();
    expect(typeof decision.score).toBe("number");
    expect(decision.reason).toBeTruthy();
  });

  it("0805+0804: Model router handles latency strategy", async () => {
    const decision = await comp.modelRouter.route({}, { strategy: "latency" });
    expect(decision.provider).toBeTruthy();
    expect(decision.model).toBeTruthy();
  });

  it("0805+0804: Model router handles cost strategy", async () => {
    const decision = await comp.modelRouter.route({}, { strategy: "cost" });
    expect(decision.provider).toBeTruthy();
    expect(decision.model).toBeTruthy();
  });

  it("0809: Pricing resolver returns pricing for known models from MODEL_REGISTRY", () => {
    const pricing = comp.pricingResolver.resolve("openai", "gpt-4.1");
    expect(pricing).not.toBeNull();
    expect(pricing!.inputPerToken).toBeGreaterThan(0);
    expect(pricing!.outputPerToken).toBeGreaterThan(0);
  });

  it("0809: Pricing resolver returns null for unknown models", () => {
    expect(comp.pricingResolver.resolve("openai", "nonexistent")).toBeNull();
    expect(comp.pricingResolver.resolve("unknown", "gpt-4.1")).toBeNull();
  });

  it("0809: Token & Cost Accounting: known model returns non-zero cost (not estimated)", () => {
    const result = comp.tokenAccounting.account({
      provider: "openai",
      model: "gpt-4.1",
      providerUsage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 },
    });
    expect(result.usage.estimatedCost).toBeGreaterThan(0);
    expect(result.estimated).toBe(false);
    expect(result.usage.promptTokens).toBe(1000);
    expect(result.usage.completionTokens).toBe(500);
    expect(result.usage.totalTokens).toBe(1500);
  });

  it("0809: Token & Cost Accounting: unknown model uses fallback pricing and marks estimated", () => {
    const result = comp.tokenAccounting.account({
      provider: "unknown",
      model: "unknown",
      providerUsage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 },
    });
    expect(result.usage.estimatedCost).toBeGreaterThan(0);
    expect(result.estimated).toBe(true);
  });

  it("0809: Token & Cost Accounting: estimates tokens from text when provider returns no usage", () => {
    const result = comp.tokenAccounting.account({
      provider: "openai",
      model: "gpt-4.1",
      promptText: "Hello, world! This is a test prompt.",
    });
    expect(result.usage.promptTokens).toBeGreaterThan(0);
    expect(result.usage.completionTokens).toBe(0);
    expect(result.estimated).toBe(true);
    expect(result.usage.estimatedCost).toBeGreaterThan(0);
  });

  it("0809: Token & Cost Accounting: zero-token request falls to estimation", () => {
    const result = comp.tokenAccounting.account({
      provider: "openai",
      model: "gpt-4.1",
      providerUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      promptText: "Hello",
    });
    expect(result.usage.promptTokens).toBeGreaterThan(0);
    expect(result.estimated).toBe(true);
  });

  it("0809: Cost calculator produces correct values for known pricing", () => {
    const pricing = comp.modelRegistry.get("openai", "gpt-4.1")!.pricing;
    const inputCost = 1000 * pricing.inputPerToken;
    const outputCost = 500 * pricing.outputPerToken;
    const expected = inputCost + outputCost;
    const actual = comp.costCalculator.calculate(
      { promptTokens: 1000, completionTokens: 500 },
      pricing,
    );
    expect(actual).toBeCloseTo(expected);
  });

  it("0809: Token estimator returns consistent values", () => {
    expect(comp.tokenEstimator.estimate("")).toBe(0);
    expect(comp.tokenEstimator.estimate("hello world")).toBe(3);
    expect(comp.tokenEstimator.estimate("A".repeat(100))).toBe(25);
  });

  it("0809: Usage calculator maps provider usage and estimates from text", () => {
    const fromProvider = comp.usageCalculator.fromProvider({
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    });
    expect(fromProvider).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 });

    const estimated = comp.usageCalculator.estimate("hello world", "there");
    expect(estimated.promptTokens).toBe(3);
    expect(estimated.completionTokens).toBe(2);
    expect(estimated.totalTokens).toBe(5);
  });

  it("0804: MODEL_REGISTRY has all expected models with pricing", () => {
    const models = comp.modelRegistry.list();
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.pricing).toBeDefined();
      expect(typeof model.pricing.inputPerToken).toBe("number");
      expect(typeof model.pricing.outputPerToken).toBe("number");
    }
  });

  it("0804: MODEL_REGISTRY findEnabled returns only enabled models", () => {
    const enabled = comp.modelRegistry.findEnabled();
    for (const m of enabled) {
      expect(m.enabled).toBe(true);
    }
  });
});
