export interface ModelPricing {
  readonly inputPerToken: number;
  readonly outputPerToken: number;
  readonly cachedInputPerToken?: number;
}
