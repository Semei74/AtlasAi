import type { AiPolicy } from "./ai-policy.interface.js";

export const MODEL_POLICY = "MODEL_POLICY";

export interface ModelPolicy extends AiPolicy {
  readonly name: "model";
}
