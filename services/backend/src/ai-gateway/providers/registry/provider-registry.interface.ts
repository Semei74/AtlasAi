import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderMetadata } from "../interfaces/provider-metadata.interface.js";
import type {
  ProviderCapabilityKey,
  ProviderRegistration,
  ProviderRegistrationOptions,
} from "./provider-registration.interface.js";

export const PROVIDER_REGISTRY = "PROVIDER_REGISTRY";

export interface ProviderRegistry {
  register(name: string, provider: AiProvider, options?: ProviderRegistrationOptions): void;
  unregister(name: string): boolean;
  get(name: string): AiProvider | null;
  has(name: string): boolean;
  getAll(): ReadonlyMap<string, AiProvider>;
  getEntry(name: string): ProviderRegistration | null;
  list(): readonly ProviderRegistration[];
  listEnabled(): readonly ProviderRegistration[];
  findByCapability(capability: ProviderCapabilityKey): readonly ProviderRegistration[];
  setEnabled(name: string, enabled: boolean): void;
  isEnabled(name: string): boolean;
  getMetadata(name: string): ProviderMetadata | null;
  initialize(name: string): Promise<void>;
  initializeAll(): Promise<void>;
  getHealth(name: string): Promise<ProviderHealth | null>;
  getHealthAll(): Promise<ReadonlyMap<string, ProviderHealth>>;
}
