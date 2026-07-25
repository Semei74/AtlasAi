import type { AgentMemoryType } from "../../interfaces/agent-memory.interface.js";

export interface MemoryWindowEntry {
  readonly id: string;
  readonly key: string;
  readonly value: string;
  readonly tokenCount: number;
  readonly timestamp: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface MemoryWindow {
  readonly agentId: string;
  readonly type: AgentMemoryType;
  readonly entries: readonly MemoryWindowEntry[];
  readonly summary: string | null;
  readonly totalTokens: number;
  readonly entryCount: number;
  readonly startTime: Date;
  readonly endTime: Date;
}
