import type { ModelStatus } from "./model-status.interface.js";
import type { ModelCapabilities } from "./model-capabilities.interface.js";

export interface ModelFilter {
  readonly provider?: string;
  readonly capabilities?: Partial<ModelCapabilities>;
  readonly status?: ModelStatus;
  readonly enabled?: boolean;
  readonly deprecated?: boolean;
}
