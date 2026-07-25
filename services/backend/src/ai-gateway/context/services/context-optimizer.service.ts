import { Injectable } from "@nestjs/common";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextSourceType } from "../interfaces/context-source-type.enum.js";

@Injectable()
export class ContextOptimizerService {
  public optimize(
    items: readonly ContextItem[],
    maxTokens: number,
  ): { items: readonly ContextItem[]; truncated: boolean } {
    const scored = items.map((item) => ({
      ...item,
      score: this.#computeEffectiveScore(item),
    }));

    const deduplicated = this.#removeLowValue(scored);

    const sorted = [...deduplicated].sort((a, b) => {
      const priorityDiff = b.score - a.score;
      if (priorityDiff !== 0) return priorityDiff;
      return b.priority - a.priority;
    });

    let totalTokens = 0;
    const selected: ContextItem[] = [];
    let truncated = false;

    for (const item of sorted) {
      const itemTokens = item.tokenCount;

      if (totalTokens + itemTokens > maxTokens) {
        if (selected.length === 0 && itemTokens > maxTokens) {
          const ratio = maxTokens / itemTokens;
          const truncatedLength = Math.floor(item.content.length * ratio);

          selected.push({
            ...item,
            content: item.content.slice(0, truncatedLength) + "\n[TRUNCATED]",
            tokenCount: maxTokens,
          });
          totalTokens = maxTokens;
          truncated = true;
        } else {
          truncated = true;
        }
        break;
      }

      selected.push(item);
      totalTokens += itemTokens;
    }

    return { items: selected, truncated };
  }

  #computeEffectiveScore(item: ContextItem): number {
    const contentLength = item.content.length;
    const contentQuality = contentLength > 10 ? 1 : contentLength > 0 ? 0.5 : 0;
    return item.score + item.priority * contentQuality;
  }

  #removeLowValue(items: ContextItem[]): ContextItem[] {
    const sourceCounts = new Map<ContextSourceType, number>();
    for (const item of items) {
      sourceCounts.set(item.sourceType, (sourceCounts.get(item.sourceType) ?? 0) + 1);
    }

    return items.filter((item) => {
      if (item.content.length <= 1 && item.score < 10) return false;
      return true;
    });
  }
}
