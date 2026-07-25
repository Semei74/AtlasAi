import type { AgentMemoryType } from "../../interfaces/agent-memory.interface.js";
import type { MemoryLimitsConfig } from "./agent-memory-limits.interface.js";
import type { AgentMemoryEntry } from "../../interfaces/agent-memory.interface.js";
import type { MemoryWindow } from "./agent-memory-window.interface.js";

export interface MemoryStrategy {
  getLimits(type: AgentMemoryType): MemoryLimitsConfig;
  shouldSummarize(type: AgentMemoryType, entryCount: number, totalTokens: number): boolean;
  shouldTrim(type: AgentMemoryType, entryCount: number, totalTokens: number): boolean;
  getTrimTarget(type: AgentMemoryType, entryCount: number): number;
  estimateTokens(text: string): number;
  buildWindow(
    agentId: string,
    type: AgentMemoryType,
    entries: readonly Pick<AgentMemoryEntry, "id" | "key" | "value" | "timestamp" | "metadata">[],
    summary: string | null,
    tokenCount: number,
  ): MemoryWindow;
}

export const MEMORY_STRATEGY = "MEMORY_STRATEGY";
