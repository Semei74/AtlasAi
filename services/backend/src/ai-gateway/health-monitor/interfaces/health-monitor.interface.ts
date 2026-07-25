import type { ProviderHealthStatus } from "../../providers/interfaces/provider-health.interface.js";

export interface HealthMonitorConfig {
  readonly checkIntervalMs: number;
  readonly timeoutMs: number;
  readonly consecutiveFailuresBeforeAlert: number;
}

export interface ProviderHealthSnapshot {
  readonly provider: string;
  readonly status: ProviderHealthStatus;
  readonly latency: number;
  readonly lastChecked: Date;
  readonly consecutiveFailures: number;
  readonly isAvailable: boolean;
}

export interface HealthMonitorService {
  readonly config: HealthMonitorConfig;
  start(): void;
  stop(): void;
  getHealth(provider: string): ProviderHealthSnapshot | null;
  getAllHealth(): ReadonlyMap<string, ProviderHealthSnapshot>;
  isAvailable(provider: string): boolean;
  forceCheck(provider: string): Promise<ProviderHealthSnapshot>;
}

export const HEALTH_MONITOR_SERVICE = "HEALTH_MONITOR_SERVICE";
