import type { AiPolicy } from "./ai-policy.interface.js";

export const CAPABILITY_POLICY = "CAPABILITY_POLICY";

export interface CapabilityPolicy extends AiPolicy {
  readonly name: "capability";
}
