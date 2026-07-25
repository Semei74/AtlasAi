import { Injectable, Inject } from "@nestjs/common";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import { RAG_ENGINE } from "../../rag/rag.module.js";
import { RagEngineService } from "../../rag/services/rag-engine.service.js";

@Injectable()
export class RagContextSource implements ContextSource {
  public readonly type = ContextSourceType.KnowledgeBase;
  public readonly name = "Knowledge Base (RAG)";

  public constructor(
    @Inject(RAG_ENGINE)
    private readonly ragEngine: RagEngineService,
  ) {}

  public async collect(request: ContextRequest): Promise<readonly ContextItem[]> {
    if (request.query === undefined || request.query.length === 0) return [];

    const result = await this.ragEngine.query({
      query: request.query,
      sourceIds: [],
      topK: 5,
      minScore: 0.5,
      filter: {
        organizationId: request.organizationId,
      },
    });

    return result.chunks.map((chunk, index) => ({
      id: chunk.id,
      sourceType: ContextSourceType.KnowledgeBase,
      content: chunk.content,
      metadata: {
        ...chunk.metadata,
        sourceId: chunk.sourceId,
        score: chunk.score,
        label: `Knowledge Result ${String(index + 1)}`,
      },
      tokenCount: Math.ceil(chunk.content.length / 4),
      priority: Math.round(chunk.score * 100),
      score: chunk.score,
      freshness: new Date(),
      permissions: [],
    }));
  }

  public isAvailable(): boolean {
    return true;
  }
}
