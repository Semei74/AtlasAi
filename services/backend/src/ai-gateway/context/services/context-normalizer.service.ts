import { Injectable } from "@nestjs/common";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import { TokenCounter } from "../utils/token-counter.js";

@Injectable()
export class ContextNormalizerService {
  private readonly tokenCounter = new TokenCounter();

  public normalize(items: readonly ContextItem[]): readonly ContextItem[] {
    const seen = new Set<string>();
    const normalized: ContextItem[] = [];

    for (const item of items) {
      const trimmed = item.content.trim();
      if (trimmed.length === 0) continue;

      const dedupKey = `${item.sourceType}:${trimmed}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      normalized.push({
        ...item,
        content: trimmed,
        tokenCount: this.tokenCounter.estimateTokens(trimmed),
        score: item.score,
      });
    }

    return normalized;
  }

  public estimateTokens(text: string): number {
    return this.tokenCounter.estimateTokens(text);
  }
}
