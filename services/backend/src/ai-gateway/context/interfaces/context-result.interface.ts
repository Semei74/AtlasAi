import type { ContextItem } from "./context-item.interface.js";
import type { ContextPipelineTiming } from "./context-metrics.interface.js";

export interface ContextResult {
  readonly items: readonly ContextItem[];
  readonly composedContext: string;
  readonly tokenCount: number;
  readonly sourceBreakdown: Readonly<Record<string, number>>;
  readonly pipelineTiming: ContextPipelineTiming;
  readonly truncated: boolean;
}
