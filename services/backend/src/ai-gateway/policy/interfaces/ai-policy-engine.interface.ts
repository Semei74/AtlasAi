import type { AiPolicyContext } from "./ai-policy-context.interface.js";
import type { AiPolicyResult } from "./ai-policy-result.interface.js";

export const AI_POLICY_ENGINE = "AI_POLICY_ENGINE";

export interface AiPolicyEngine {
  evaluate(context: AiPolicyContext): Promise<AiPolicyResult>;
}
