import type { AiPolicy } from "./ai-policy.interface.js";

export const REGIONAL_POLICY = "REGIONAL_POLICY";

export interface RegionalPolicy extends AiPolicy {
  readonly name: "regional";
}
