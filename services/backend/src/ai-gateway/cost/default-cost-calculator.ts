import { Injectable } from "@nestjs/common";
import type { ModelPricing } from "../model-registry/interfaces/model-pricing.interface.js";
import type { CostCalculator, TokenCostInput } from "./interfaces/cost-calculator.interface.js";

@Injectable()
export class DefaultCostCalculator implements CostCalculator {
  public calculate(input: TokenCostInput, pricing: ModelPricing): number {
    const cachedTokens = input.cachedTokens ?? 0;
    const cachedRate = pricing.cachedInputPerToken ?? pricing.inputPerToken;

    return (
      input.promptTokens * pricing.inputPerToken +
      input.completionTokens * pricing.outputPerToken +
      cachedTokens * cachedRate
    );
  }
}
