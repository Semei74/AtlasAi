export type AgentHealthStatusValue = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface AgentHealthStatus {
  readonly status: AgentHealthStatusValue;
  readonly lastChecked: Date | null;
  readonly responseTimeMs: number | null;
  readonly lastError: string | null;
  readonly consecutiveFailures: number;
}
