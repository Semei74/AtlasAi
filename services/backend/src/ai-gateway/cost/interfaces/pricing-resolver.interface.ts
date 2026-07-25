import type { ModelPricing } from "../../model-registry/interfaces/model-pricing.interface.js";

export const PRICING_RESOLVER = "PRICING_RESOLVER";

export interface PricingResolver {
  resolve(provider: string, model: string): ModelPricing | null;
}
