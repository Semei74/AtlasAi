import { Injectable } from "@nestjs/common";
import type { RankedChunk } from "./rag-ranker.service.js";

@Injectable()
export class RagContextComposerService {
  public compose(
    chunks: readonly RankedChunk[],
    maxTokens: number,
  ): { context: string; usedChunks: readonly RankedChunk[]; truncated: boolean } {
    let totalTokens = 0;
    const used: RankedChunk[] = [];
    let truncated = false;

    for (const chunk of chunks) {
      const tokens = Math.ceil(chunk.content.length / 4);

      if (totalTokens + tokens > maxTokens) {
        truncated = true;
        break;
      }

      used.push(chunk);
      totalTokens += tokens;
    }

    const parts = used.map((chunk, index) => {
      const sourceMeta = chunk.metadata["sourceName"];
      const sourceName = sourceMeta as string | undefined;
      const sourceInfo = sourceName !== undefined
        ? `[Source: ${sourceName}]`
        : `[Source: ${chunk.sourceId}]`;

      const scoreText = chunk.finalScore.toFixed(3);
      return `[${String(index + 1)}] ${sourceInfo}\n${chunk.content}\n[Score: ${scoreText}]`;
    });

    return {
      context: parts.join("\n\n"),
      usedChunks: used,
      truncated,
    };
  }
}
