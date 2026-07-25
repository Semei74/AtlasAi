import { ValidationError, ForbiddenError } from "@atlas/errors";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { AgentMemoryEntry, AgentMemoryType } from "../../interfaces/agent-memory.interface.js";
import type { MemoryManager } from "../interfaces/agent-memory-manager.interface.js";
import type { MemoryStore } from "../interfaces/agent-memory-store.interface.js";
import type { MemorySummarizer } from "../interfaces/agent-memory-summarizer.interface.js";
import type { MemoryAccessPolicy } from "../interfaces/agent-memory-policy.interface.js";
import type { MemoryWindow } from "../interfaces/agent-memory-window.interface.js";
import { DefaultMemoryStrategyService } from "./default-memory-strategy.service.js";
import { MemoryLimitsService } from "./memory-limits.service.js";

@Injectable()
export class MemoryManagerService implements MemoryManager {
  public constructor(
    private readonly store: MemoryStore,
    private readonly strategy: DefaultMemoryStrategyService,
    private readonly summarizer: MemorySummarizer,
    private readonly policy: MemoryAccessPolicy,
    private readonly limits: MemoryLimitsService,
  ) {}

  public async remember(
    context: AgentContext,
    type: AgentMemoryType,
    key: string,
    value: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<AgentMemoryEntry> {
    const currentCount = await this.store.count(context.agentId, type);
    const entries = await this.store.findByAgent(context.agentId, type);
    const currentTokens = entries.reduce(
      (sum, e) => sum + this.strategy.estimateTokens(e.value),
      0,
    );

    const enforcement = this.limits.validateEntry(
      context.agentId,
      type,
      currentCount,
      currentTokens,
      value,
    );

    if (!enforcement.allowed) {
      if (this.strategy.shouldTrim(type, currentCount, currentTokens)) {
        const target = this.strategy.getTrimTarget(type, currentCount);
        const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const toRemove = sorted.slice(0, sorted.length - target);
        for (const entry of toRemove) {
          await this.store.delete(entry.id);
        }
      } else {
        throw new ValidationError(enforcement.reason ?? "Memory limit exceeded");
      }
    }

    const entry: AgentMemoryEntry = {
      id: randomUUID(),
      agentId: context.agentId,
      type,
      key,
      value,
      context,
      timestamp: new Date(),
      ttl: this.strategy.getLimits(type).defaultTtlMs,
      metadata: metadata ?? {},
    };

    const stored = await this.store.save(entry);

    if (this.contextBelongsTo(context, entry)) {
      return stored;
    }

    throw new ForbiddenError("Memory write permission denied");
  }

  public async recall(
    context: AgentContext,
    type: AgentMemoryType,
    key: string,
  ): Promise<AgentMemoryEntry | null> {
    const entry = await this.store.findByKey(context.agentId, key, type);
    if (!entry) return null;
    if (!this.policy.canRead(context, entry)) return null;
    return entry;
  }

  public async search(
    context: AgentContext,
    type: AgentMemoryType,
    query: string,
  ): Promise<readonly AgentMemoryEntry[]> {
    const results = await this.store.search(context.agentId, query, type);
    return results.filter((entry) => this.policy.canRead(context, entry));
  }

  public async getWindow(
    context: AgentContext,
    type: AgentMemoryType,
  ): Promise<MemoryWindow> {
    const entries = await this.store.findByAgent(context.agentId, type);
    const filtered = entries.filter((e) => this.policy.canRead(context, e));

    const totalTokens = filtered.reduce(
      (sum, e) => sum + this.strategy.estimateTokens(e.value),
      0,
    );

    return this.strategy.buildWindow(
      context.agentId,
      type,
      filtered,
      null,
      totalTokens,
    );
  }

  public async summarizeWindow(
    context: AgentContext,
    type: AgentMemoryType,
  ): Promise<MemoryWindow> {
    const window = await this.getWindow(context, type);
    const summary = await this.summarizer.summarize(window);
    return { ...window, summary };
  }

  public async forget(context: AgentContext, id: string): Promise<boolean> {
    const entry = await this.store.get(id);
    if (!entry) return false;
    if (!this.policy.canDelete(context, entry)) return false;
    return this.store.delete(id);
  }

  public async clear(
    context: AgentContext,
    type?: AgentMemoryType,
  ): Promise<void> {
    await this.store.deleteByAgent(context.agentId, type);
  }

  public async getMemoryUsage(
    context: AgentContext,
  ): Promise<Readonly<Record<AgentMemoryType, number>>> {
    const types: AgentMemoryType[] = ["session", "conversation", "workspace", "longTerm", "vector"];
    const result: Record<string, number> = {};

    for (const t of types) {
      result[t] = await this.store.count(context.agentId, t);
    }

    return result as Readonly<Record<AgentMemoryType, number>>;
  }

  private contextBelongsTo(context: AgentContext, entry: AgentMemoryEntry): boolean {
    return (
      context.organizationId === entry.context.organizationId &&
      context.agentId === entry.context.agentId
    );
  }
}
