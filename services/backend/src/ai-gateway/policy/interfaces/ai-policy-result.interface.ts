import type { AiPolicyViolation } from "./ai-policy-violation.interface.js";

export interface AiPolicyResult {
  readonly allowed: boolean;
  readonly violations: readonly AiPolicyViolation[];
  readonly evaluatedPolicies: readonly string[];
}
