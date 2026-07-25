import type { AgentContext } from "./agent-context.interface.js";

export type AgentMemoryType = "session" | "conversation" | "workspace" | "longTerm" | "vector";

export interface AgentMemoryEntry {
  readonly id: string;
  readonly agentId: string;
  readonly type: AgentMemoryType;
  readonly key: string;
  readonly value: string;
  readonly context: AgentContext;
  readonly timestamp: Date;
  readonly ttl: number | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface AgentMemory {
  readonly type: AgentMemoryType;
  store(entry: Omit<AgentMemoryEntry, "id" | "timestamp">): Promise<AgentMemoryEntry>;
  retrieve(agentId: string, key: string, type: AgentMemoryType): Promise<AgentMemoryEntry | null>;
  search(agentId: string, query: string, type: AgentMemoryType): Promise<readonly AgentMemoryEntry[]>;
  delete(id: string): Promise<boolean>;
  clear(agentId: string, type?: AgentMemoryType): Promise<void>;
}
