import type { ContextRequest } from "./context-request.interface.js";
import type { ContextResult } from "./context-result.interface.js";
import type { ContextMetrics } from "./context-metrics.interface.js";
import type { ContextSource } from "./context-source.interface.js";
import type { ContextSourceType } from "./context-source-type.enum.js";

export const CONTEXT_ENGINE = "CONTEXT_ENGINE";

export interface ContextEngine {
  buildContext(request: ContextRequest): Promise<ContextResult>;
  registerSource(source: ContextSource): void;
  removeSource(type: ContextSourceType): void;
  getMetrics(): ContextMetrics;
}
