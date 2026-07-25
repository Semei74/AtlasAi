import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderCapabilities } from "../interfaces/provider-capabilities.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderMetadata } from "../interfaces/provider-metadata.interface.js";

export type ProviderCapabilityKey = keyof ProviderCapabilities;

export interface ProviderRegistrationOptions {
  readonly enabled?: boolean;
}

export interface ProviderRegistration {
  readonly name: string;
  readonly provider: AiProvider;
  readonly metadata: ProviderMetadata;
  enabled: boolean;
  initialized: boolean;
  health: ProviderHealth | null;
  readonly registeredAt: Date;
}
