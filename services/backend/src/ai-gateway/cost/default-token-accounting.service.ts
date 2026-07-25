import { Injectable, Inject } from "@nestjs/common";
import { rootLogger } from "@atlas/logger";
import type { ModelPricing } from "../model-registry/interfaces/model-pricing.interface.js";
import type { TokenUsage } from "../interfaces/token-usage.interface.js";
import type { TokenUsageDetail } from "../providers/interfaces/token-accounting.interface.js";
import { MetricsService } from "../../metrics/metrics.service.js";
import {
  CURRENCY,
  FALLBACK_CACHED_INPUT_PER_TOKEN,
  FALLBACK_INPUT_PER_TOKEN,
  FALLBACK_OUTPUT_PER_TOKEN,
} from "./cost-constants.js";
import { PRICING_RESOLVER } from "./interfaces/pricing-resolver.interface.js";
import type { PricingResolver } from "./interfaces/pricing-resolver.interface.js";
import { COST_CALCULATOR } from "./interfaces/cost-calculator.interface.js";
import type { CostCalculator } from "./interfaces/cost-calculator.interface.js";
import { TOKEN_ESTIMATOR } from "./interfaces/token-estimator.interface.js";
import type { TokenEstimator } from "./interfaces/token-estimator.interface.js";
import { USAGE_CALCULATOR } from "./interfaces/usage-calculator.interface.js";
import type { TokenCount, UsageCalculator } from "./interfaces/usage-calculator.interface.js";
import type { AccountRequest, TokenAccountingResult, TokenAccountingService } from "./interfaces/token-accounting.interface.js";

const FALLBACK_PRICING: ModelPricing = {
  inputPerToken: FALLBACK_INPUT_PER_TOKEN,
  outputPerToken: FALLBACK_OUTPUT_PER_TOKEN,
  cachedInputPerToken: FALLBACK_CACHED_INPUT_PER_TOKEN,
};

@Injectable()
export class DefaultTokenAccountingService implements TokenAccountingService {
  public constructor(
    @Inject(PRICING_RESOLVER)
    private readonly pricingResolver: PricingResolver,
    @Inject(COST_CALCULATOR)
    private readonly costCalculator: CostCalculator,
    @Inject(TOKEN_ESTIMATOR)
    private readonly tokenEstimator: TokenEstimator,
    @Inject(USAGE_CALCULATOR)
    private readonly usageCalculator: UsageCalculator,
    private readonly metricsService: MetricsService,
  ) {}

  public account(request: AccountRequest): TokenAccountingResult {
    const pricing = this.pricingResolver.resolve(request.provider, request.model);

    let tokens: TokenCount;
    let estimatedTokens = false;

    if (request.providerUsage !== undefined && request.providerUsage.totalTokens > 0) {
      tokens = this.usageCalculator.fromProvider(request.providerUsage);
    } else {
      tokens = this.usageCalculator.estimate(request.promptText ?? "", request.completionText);
      estimatedTokens = true;
    }

    const effectivePricing: ModelPricing = pricing ?? FALLBACK_PRICING;
    const estimatedCost = this.costCalculator.calculate(tokens, effectivePricing);
    const estimated = estimatedTokens || pricing === null;

    const usage: TokenUsage = {
      promptTokens: tokens.promptTokens,
      completionTokens: tokens.completionTokens,
      totalTokens: tokens.totalTokens,
      estimatedCost,
    };

    return {
      usage,
      cachedTokens: 0,
      estimated,
      currency: CURRENCY,
    };
  }

  public calculateCost(usage: TokenUsageDetail, model: string, provider: string): number {
    const pricing = this.pricingResolver.resolve(provider, model) ?? FALLBACK_PRICING;

    return this.costCalculator.calculate(
      {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        cachedTokens: usage.cachedTokens,
      },
      pricing,
    );
  }

  public estimateTokens(text: string, model: string): number {
    return this.tokenEstimator.estimate(text, model);
  }

  public recordUsage(
    organizationId: string,
    workspaceId: string,
    usage: TokenUsageDetail,
    provider: string,
    model: string,
  ): Promise<void> {
    this.metricsService.aiGatewayCostTotal.inc({ provider, model }, usage.estimatedCost);
    rootLogger.debug("Recorded AI usage cost", {
      organizationId,
      workspaceId,
      provider,
      model,
      estimatedCost: usage.estimatedCost,
    });

    return Promise.resolve();
  }
}
