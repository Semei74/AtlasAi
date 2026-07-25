import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { AgentMemoryEntry } from "../../interfaces/agent-memory.interface.js";

export interface MemoryAccessPolicy {
  canRead(context: AgentContext, entry: AgentMemoryEntry): boolean;
  canWrite(context: AgentContext, entry: AgentMemoryEntry): boolean;
  canDelete(context: AgentContext, entry: AgentMemoryEntry): boolean;
}

export const MEMORY_POLICY = "MEMORY_POLICY";
