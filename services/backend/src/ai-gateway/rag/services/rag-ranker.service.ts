import { Injectable } from "@nestjs/common";
import type { RagChunk } from "../../providers/interfaces/rag-engine.interface.js";

export interface RankedChunk extends RagChunk {
  readonly finalScore: number;
}

@Injectable()
export class RagRankerService {
  public rerank(
    chunks: readonly RagChunk[],
    query: string,
  ): readonly RankedChunk[] {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const ranked = chunks.map((chunk) => {
      let finalScore = chunk.score;

      const keywordBonus = this.computeKeywordBonus(chunk.content, queryTerms);
      finalScore += keywordBonus * 0.3;

      const freshnessPenalty = this.computeFreshnessPenalty(chunk.metadata);
      finalScore -= freshnessPenalty * 0.1;

      return { ...chunk, finalScore };
    });

    ranked.sort((a, b) => b.finalScore - a.finalScore);
    return ranked;
  }

  private computeKeywordBonus(content: string, queryTerms: readonly string[]): number {
    if (queryTerms.length === 0) return 0;

    const lower = content.toLowerCase();
    let matches = 0;
    for (const term of queryTerms) {
      if (lower.includes(term)) matches++;
    }

    return matches / queryTerms.length;
  }

  private computeFreshnessPenalty(metadata: Readonly<Record<string, unknown>>): number {
    const timestamp = metadata["timestamp"];
    if (typeof timestamp !== "string") return 0;

    const age = Date.now() - new Date(timestamp).getTime();
    const ageDays = age / (1000 * 60 * 60 * 24);
    return Math.min(ageDays / 30, 1);
  }
}
