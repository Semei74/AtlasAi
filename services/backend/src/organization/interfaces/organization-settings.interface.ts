import type { SecuritySettings } from "./security-settings.interface.js";
import type { AuthenticationSettings } from "./authentication-settings.interface.js";
import type { AiProviderSettings } from "./ai-provider-settings.interface.js";
import type { StorageSettings } from "./storage-settings.interface.js";
import type { RegionalSettings } from "./regional-settings.interface.js";
import type { FeatureFlags } from "./feature-flags.interface.js";
import type { BillingSettings } from "./billing-settings.interface.js";

export interface OrganizationSettings {
  readonly security: SecuritySettings;
  readonly authentication: AuthenticationSettings;
  readonly ai: AiProviderSettings;
  readonly storage: StorageSettings;
  readonly regional: RegionalSettings;
  readonly featureFlags: FeatureFlags;
  readonly billing: BillingSettings;
}
