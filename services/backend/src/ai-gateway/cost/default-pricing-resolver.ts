import { Injectable, Inject } from "@nestjs/common";
import type { ModelPricing } from "../model-registry/interfaces/model-pricing.interface.js";
import { MODEL_REGISTRY } from "../model-registry/interfaces/model-registry.interface.js";
import type { ModelRegistry } from "../model-registry/interfaces/model-registry.interface.js";
import type { PricingResolver } from "./interfaces/pricing-resolver.interface.js";

@Injectable()
export class DefaultPricingResolver implements PricingResolver {
  public constructor(
    @Inject(MODEL_REGISTRY)
    private readonly modelRegistry: ModelRegistry,
  ) {}

  public resolve(provider: string, model: string): ModelPricing | null {
    const info = this.modelRegistry.get(provider, model);

    return info === null ? null : info.pricing;
  }
}
