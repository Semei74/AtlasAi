import type { ModelStatus } from "./model-status.interface.js";
import type { ModelCapabilities } from "./model-capabilities.interface.js";
import type { ModelPricing } from "./model-pricing.interface.js";
import type { ModelLimits } from "./model-limits.interface.js";

export interface ModelInfo {
  readonly id: string;
  readonly provider: string;
  readonly displayName: string;
  readonly status: ModelStatus;
  readonly capabilities: ModelCapabilities;
  readonly pricing: ModelPricing;
  readonly limits: ModelLimits;
  readonly enabled: boolean;
  readonly deprecated: boolean;
}
