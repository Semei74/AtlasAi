export interface TokenUsageDetail {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly cachedTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly currency: string;
}

export interface TokenAccountingProvider {
  readonly calculateCost: (usage: TokenUsageDetail, model: string, provider: string) => number;
  readonly estimateTokens: (text: string, model: string) => number;
  readonly recordUsage: (
    organizationId: string,
    workspaceId: string,
    usage: TokenUsageDetail,
    provider: string,
    model: string,
  ) => Promise<void>;
}
