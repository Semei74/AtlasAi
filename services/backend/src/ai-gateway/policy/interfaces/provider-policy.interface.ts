import type { AiPolicy } from "./ai-policy.interface.js";

export const PROVIDER_POLICY = "PROVIDER_POLICY";

export interface ProviderPolicy extends AiPolicy {
  readonly name: "provider";
}
