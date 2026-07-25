export interface ProviderError {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly provider?: string;
}
