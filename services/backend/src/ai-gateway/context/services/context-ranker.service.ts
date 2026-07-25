import { Injectable } from "@nestjs/common";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";

@Injectable()
export class ContextRankerService {
  public rank(
    items: readonly ContextItem[],
    request: ContextRequest,
  ): readonly ContextItem[] {
    const scored = items.map((item) => ({
      ...item,
      score: this.calculateScore(item, request),
    }));

    return scored.sort((a, b) => b.score - a.score);
  }

  private calculateScore(item: ContextItem, request: ContextRequest): number {
    let score = item.priority;

    if (request.query !== undefined && request.query.length > 0) {
      score += this.relevanceBoost(item.content, request.query);
    }

    if (request.options?.prioritizeFreshness === true) {
      score += this.freshnessBoost(item.freshness);
    }

    if (item.sourceType as string === "system" && request.options?.includeSystemContext !== false) {
      score += 10;
    }

    if (
      item.sourceType as string === "conversation" &&
      request.options?.includeConversationHistory !== false
    ) {
      score += 5;
    }

    return score;
  }

  private relevanceBoost(content: string, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (queryTerms.length === 0) return 0;

    const lowerContent = content.toLowerCase();
    let matches = 0;
    for (const term of queryTerms) {
      if (lowerContent.includes(term)) matches++;
    }

    return (matches / queryTerms.length) * 50;
  }

  private freshnessBoost(freshness: Date): number {
    const ageMs = Date.now() - freshness.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    if (ageHours < 1) return 20;
    if (ageHours < 24) return 10;
    if (ageHours < 168) return 5;
    return 0;
  }
}
