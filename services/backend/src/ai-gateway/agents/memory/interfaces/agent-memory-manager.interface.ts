import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { AgentMemoryEntry, AgentMemoryType } from "../../interfaces/agent-memory.interface.js";
import type { MemoryWindow } from "./agent-memory-window.interface.js";

export interface MemoryManager {
  remember(
    context: AgentContext,
    type: AgentMemoryType,
    key: string,
    value: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<AgentMemoryEntry>;

  recall(
    context: AgentContext,
    type: AgentMemoryType,
    key: string,
  ): Promise<AgentMemoryEntry | null>;

  search(
    context: AgentContext,
    type: AgentMemoryType,
    query: string,
  ): Promise<readonly AgentMemoryEntry[]>;

  getWindow(
    context: AgentContext,
    type: AgentMemoryType,
  ): Promise<MemoryWindow>;

  summarizeWindow(
    context: AgentContext,
    type: AgentMemoryType,
  ): Promise<MemoryWindow>;

  forget(context: AgentContext, id: string): Promise<boolean>;

  clear(context: AgentContext, type?: AgentMemoryType): Promise<void>;

  getMemoryUsage(
    context: AgentContext,
  ): Promise<Readonly<Record<AgentMemoryType, number>>>;
}

export const MEMORY_MANAGER = "MEMORY_MANAGER";
