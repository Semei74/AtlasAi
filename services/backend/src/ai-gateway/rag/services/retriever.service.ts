import { Injectable, Inject } from "@nestjs/common";
import { VECTOR_SEARCH_SERVICE } from "../../vector-search/interfaces/vector-search.interface.js";
import type { VectorSearchService, VectorSearchQuery } from "../../vector-search/interfaces/vector-search.interface.js";
import { QueryProcessorService } from "./query-processor.service.js";
import type { RagChunk } from "../../providers/interfaces/rag-engine.interface.js";

@Injectable()
export class RetrieverService {
  public constructor(
    @Inject(VECTOR_SEARCH_SERVICE)
    private readonly vectorSearch: VectorSearchService,
    private readonly queryProcessor: QueryProcessorService,
  ) {}

  public async retrieve(
    query: string,
    sourceIds: readonly string[],
    topK: number,
    minScore: number,
    filter: Record<string, unknown> | null,
  ): Promise<readonly RagChunk[]> {
    const normalized = this.queryProcessor.normalize(query);
    const expandedQueries = this.queryProcessor.expand(normalized);

    const seen = new Set<string>();
    const chunks: RagChunk[] = [];

    const resultSets = await Promise.all(
      expandedQueries.map((q) => {
        const searchQuery: VectorSearchQuery = {
          queryText: q,
          topK,
          minScore,
          ...(filter !== null ? { filter } : {}),
          ...(sourceIds.length > 0 ? { sourceTypes: sourceIds } : {}),
        };

        return this.vectorSearch.search(searchQuery);
      }),
    );

    for (const results of resultSets) {
      for (const result of results) {
        if (seen.has(result.id)) continue;
        seen.add(result.id);

        chunks.push({
          id: result.id,
          content: result.content,
          sourceId: result.sourceId,
          score: result.score,
          metadata: result.metadata,
        });
      }
    }

    chunks.sort((a, b) => b.score - a.score);
    return chunks.slice(0, topK);
  }
}
