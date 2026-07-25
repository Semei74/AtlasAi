export type ProviderHealthStatus = "healthy" | "degraded" | "unhealthy";

export interface ProviderHealth {
  readonly status: ProviderHealthStatus;
  readonly latency: number;
  readonly lastChecked: Date;
  readonly message?: string;
}
