import { Injectable } from "@nestjs/common";
import type { AgentMemoryEntry, AgentMemoryType } from "../../interfaces/agent-memory.interface.js";
import type { AgentMemoryLimits, MemoryLimitsConfig } from "../interfaces/agent-memory-limits.interface.js";
import type { MemoryStrategy } from "../interfaces/agent-memory-strategy.interface.js";
import type { MemoryWindow } from "../interfaces/agent-memory-window.interface.js";

@Injectable()
export class DefaultMemoryStrategyService implements MemoryStrategy {
  private readonly limits: AgentMemoryLimits = {
    session: { maxEntries: 50, maxTokens: 2_000, defaultTtlMs: 3_600_000, summarizationThreshold: 0.7 },
    conversation: { maxEntries: 100, maxTokens: 4_000, defaultTtlMs: null, summarizationThreshold: 0.7 },
    workspace: { maxEntries: 200, maxTokens: 8_000, defaultTtlMs: null, summarizationThreshold: 0.8 },
    longTerm: { maxEntries: 500, maxTokens: 16_000, defaultTtlMs: null, summarizationThreshold: 0.9 },
    vector: { maxEntries: 1_000, maxTokens: 32_000, defaultTtlMs: null, summarizationThreshold: 0.9 },
  };

  public getLimits(type: AgentMemoryType): MemoryLimitsConfig {
    return this.limits[type];
  }

  public shouldSummarize(type: AgentMemoryType, _entryCount: number, totalTokens: number): boolean {
    const cfg = this.getLimits(type);
    const threshold = cfg.maxTokens * cfg.summarizationThreshold;
    return totalTokens >= threshold;
  }

  public shouldTrim(type: AgentMemoryType, entryCount: number, totalTokens: number): boolean {
    const cfg = this.getLimits(type);
    return entryCount >= cfg.maxEntries || totalTokens >= cfg.maxTokens;
  }

  public getTrimTarget(type: AgentMemoryType, entryCount: number): number {
    const cfg = this.getLimits(type);
    return Math.min(Math.max(Math.floor(entryCount * 0.5), 1), cfg.maxEntries);
  }

  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  public buildWindow(
    agentId: string,
    type: AgentMemoryType,
    entries: readonly Pick<AgentMemoryEntry, "id" | "key" | "value" | "timestamp" | "metadata">[],
    summary: string | null,
    tokenCount: number,
  ): MemoryWindow {
    const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      agentId,
      type,
      entries: sorted.map((e) => ({
        id: e.id,
        key: e.key,
        value: e.value,
        tokenCount: this.estimateTokens(e.value),
        timestamp: e.timestamp,
        metadata: e.metadata,
      })),
      summary,
      totalTokens: tokenCount,
      entryCount: sorted.length,
      startTime: sorted[0]?.timestamp ?? new Date(),
      endTime: sorted[sorted.length - 1]?.timestamp ?? new Date(),
    };
  }
}
