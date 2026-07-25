import type { ProviderTokenUsage } from "../../providers/interfaces/provider-response.interface.js";

export const USAGE_CALCULATOR = "USAGE_CALCULATOR";

export interface TokenCount {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface UsageCalculator {
  fromProvider(usage: ProviderTokenUsage): TokenCount;
  estimate(promptText: string, completionText?: string): TokenCount;
}
