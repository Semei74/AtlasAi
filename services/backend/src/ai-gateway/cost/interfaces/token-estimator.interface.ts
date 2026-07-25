export const TOKEN_ESTIMATOR = "TOKEN_ESTIMATOR";

export interface TokenEstimator {
  estimate(text: string, model?: string): number;
}
