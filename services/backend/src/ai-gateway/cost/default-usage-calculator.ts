import { Injectable, Inject } from "@nestjs/common";
import type { ProviderTokenUsage } from "../providers/interfaces/provider-response.interface.js";
import { TOKEN_ESTIMATOR } from "./interfaces/token-estimator.interface.js";
import type { TokenEstimator } from "./interfaces/token-estimator.interface.js";
import type { TokenCount, UsageCalculator } from "./interfaces/usage-calculator.interface.js";

@Injectable()
export class DefaultUsageCalculator implements UsageCalculator {
  public constructor(
    @Inject(TOKEN_ESTIMATOR)
    private readonly estimator: TokenEstimator,
  ) {}

  public fromProvider(usage: ProviderTokenUsage): TokenCount {
    return {
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
    };
  }

  public estimate(promptText: string, completionText?: string): TokenCount {
    const promptTokens = this.estimator.estimate(promptText);
    const completionTokens = this.estimator.estimate(completionText ?? "");

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }
}
