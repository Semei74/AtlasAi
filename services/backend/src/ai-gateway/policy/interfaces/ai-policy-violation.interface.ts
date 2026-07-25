export type PolicyViolationSeverity = "error" | "warning";

export interface AiPolicyViolation {
  readonly policy: string;
  readonly code: string;
  readonly reason: string;
  readonly severity: PolicyViolationSeverity;
}
