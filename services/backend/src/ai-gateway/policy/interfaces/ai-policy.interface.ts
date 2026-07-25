import type { AiPolicyContext } from "./ai-policy-context.interface.js";
import type { AiPolicyViolation } from "./ai-policy-violation.interface.js";

export interface AiPolicy {
  readonly name: string;
  evaluate(context: AiPolicyContext): readonly AiPolicyViolation[];
}
