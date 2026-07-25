import type { ModelPricing } from "../../model-registry/interfaces/model-pricing.interface.js";

export const COST_CALCULATOR = "COST_CALCULATOR";

export interface TokenCostInput {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly cachedTokens?: number;
}

export interface CostCalculator {
  calculate(input: TokenCostInput, pricing: ModelPricing): number;
}
