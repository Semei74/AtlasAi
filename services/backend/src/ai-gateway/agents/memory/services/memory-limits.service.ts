import { Injectable } from "@nestjs/common";
import type { AgentMemoryType } from "../../interfaces/agent-memory.interface.js";
import type { MemoryTokenBudget } from "../interfaces/agent-memory-limits.interface.js";
import { DefaultMemoryStrategyService } from "./default-memory-strategy.service.js";

export interface LimitEnforcementResult {
  readonly allowed: boolean;
  readonly reason: string | null;
}

@Injectable()
export class MemoryLimitsService {
  private readonly tokenBudgets = new Map<string, number>();

  public constructor(
    private readonly strategy: DefaultMemoryStrategyService,
  ) {}

  public validateEntry(
    agentId: string,
    type: AgentMemoryType,
    currentCount: number,
    currentTokens: number,
    newText: string,
  ): LimitEnforcementResult {
    const cfg = this.strategy.getLimits(type);
    const estimatedTokens = this.strategy.estimateTokens(newText);

    if (currentCount >= cfg.maxEntries) {
      return { allowed: false, reason: `Memory type "${type}" for agent "${agentId}" has reached max entries (${String(cfg.maxEntries)})` };
    }

    if (currentTokens + estimatedTokens > cfg.maxTokens) {
      return { allowed: false, reason: `Memory type "${type}" for agent "${agentId}" would exceed max tokens (${String(cfg.maxTokens)})` };
    }

    return { allowed: true, reason: null };
  }

  public getTokenBudget(
    _agentId: string,
    type: AgentMemoryType,
    totalConsumed: number,
  ): MemoryTokenBudget {
    const cfg = this.strategy.getLimits(type);
    return {
      totalConsumed,
      totalBudget: cfg.maxTokens,
      remaining: Math.max(0, cfg.maxTokens - totalConsumed),
      overBudget: totalConsumed > cfg.maxTokens,
    };
  }

  public setCustomBudget(_agentId: string, budget: number): void {
    this.tokenBudgets.set(_agentId, budget);
  }

  public getCustomBudget(agentId: string): number | null {
    return this.tokenBudgets.get(agentId) ?? null;
  }

  public clearCustomBudget(agentId: string): void {
    this.tokenBudgets.delete(agentId);
  }
}
