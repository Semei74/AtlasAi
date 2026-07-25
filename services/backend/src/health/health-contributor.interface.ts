export type HealthStatusValue = "connected" | "disconnected" | "not_checked";

export interface HealthContributor {
  readonly name: string;
  check(): Promise<HealthStatusValue>;
}

export const HEALTH_CONTRIBUTORS = Symbol("HEALTH_CONTRIBUTORS");
