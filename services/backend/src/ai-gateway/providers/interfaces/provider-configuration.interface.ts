export interface ProviderConfiguration {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly timeout: number;
  readonly maxRetries: number;
}
