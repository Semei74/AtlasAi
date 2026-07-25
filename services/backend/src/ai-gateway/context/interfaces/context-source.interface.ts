import type { ContextRequest } from "./context-request.interface.js";
import type { ContextItem } from "./context-item.interface.js";
import type { ContextSourceType } from "./context-source-type.enum.js";

export const CONTEXT_SOURCE = "CONTEXT_SOURCE";

export interface ContextSource {
  readonly type: ContextSourceType;
  readonly name: string;
  collect(request: ContextRequest): Promise<readonly ContextItem[]>;
  isAvailable(): boolean;
}
