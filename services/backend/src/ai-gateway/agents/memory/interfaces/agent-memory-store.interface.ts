import type { AgentMemoryEntry, AgentMemoryType } from "../../interfaces/agent-memory.interface.js";

export const MEMORY_STORE = "MEMORY_STORE";

export interface MemoryStore {
  save(entry: AgentMemoryEntry): Promise<AgentMemoryEntry>;
  get(id: string): Promise<AgentMemoryEntry | null>;
  findByKey(agentId: string, key: string, type: AgentMemoryType): Promise<AgentMemoryEntry | null>;
  findByAgent(agentId: string, type?: AgentMemoryType): Promise<readonly AgentMemoryEntry[]>;
  findRecent(
    agentId: string,
    type: AgentMemoryType,
    limit: number,
  ): Promise<readonly AgentMemoryEntry[]>;
  search(
    agentId: string,
    query: string,
    type: AgentMemoryType,
  ): Promise<readonly AgentMemoryEntry[]>;
  delete(id: string): Promise<boolean>;
  deleteByAgent(agentId: string, type?: AgentMemoryType): Promise<void>;
  count(agentId: string, type?: AgentMemoryType): Promise<number>;
  clear(): Promise<void>;
}
