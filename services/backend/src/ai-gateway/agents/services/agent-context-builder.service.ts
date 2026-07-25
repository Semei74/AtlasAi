import { Injectable, Inject } from "@nestjs/common";
import { CONTEXT_ENGINE } from "../../context/interfaces/context-engine.interface.js";
import type { ContextEngine } from "../../context/interfaces/context-engine.interface.js";
import type { ContextRequest } from "../../context/interfaces/context-request.interface.js";
import type { ContextResult } from "../../context/interfaces/context-result.interface.js";
import type { ContextSourceType } from "../../context/interfaces/context-source-type.enum.js";
import { RAG_ENGINE } from "../../rag/rag.module.js";
import type { RagEngine, RagQuery, RagResult } from "../../providers/interfaces/rag-engine.interface.js";
import { VECTOR_SEARCH_SERVICE } from "../../vector-search/interfaces/vector-search.interface.js";
import type { VectorSearchService, VectorSearchQuery, VectorSearchResult } from "../../vector-search/interfaces/vector-search.interface.js";
import type { AgentContext } from "../interfaces/agent-context.interface.js";

@Injectable()
export class AgentContextBuilderService {
  public constructor(
    @Inject(CONTEXT_ENGINE)
    private readonly contextEngine: ContextEngine,
    @Inject(RAG_ENGINE)
    private readonly ragEngine: RagEngine,
    @Inject(VECTOR_SEARCH_SERVICE)
    private readonly vectorSearch: VectorSearchService,
  ) {}

  public buildContext(
    agentId: string,
    userId: string,
    organizationId: string,
    workspaceId: string | null,
    conversationId: string | null,
    input: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<AgentContext> {
    return Promise.resolve({
      agentId,
      userId,
      organizationId,
      workspaceId,
      conversationId,
      requestId: crypto.randomUUID(),
      input,
      metadata: metadata ?? {},
    });
  }

  public buildContextEngineContext(
    context: AgentContext,
    requiredSources?: readonly ContextSourceType[],
  ): Promise<ContextResult> {
    const contextRequest: ContextRequest = {
      userId: context.userId,
      organizationId: context.organizationId,
      ...(context.workspaceId !== null ? { workspaceId: context.workspaceId } : {}),
      query: context.input,
      ...(requiredSources !== undefined ? { requiredSources } : {}),
      maxTokens: 4096,
    };
    return this.contextEngine.buildContext(contextRequest);
  }

  public buildRagContext(
    context: AgentContext,
    query?: string,
  ): Promise<RagResult> {
    const ragQuery: RagQuery = {
      query: query ?? context.input,
      sourceIds: [],
      topK: 5,
      minScore: 0.3,
      filter: null,
    };
    return this.ragEngine.query(ragQuery);
  }

  public buildVectorSearchContext(
    context: AgentContext,
    query?: string,
    sourceTypes?: readonly string[],
  ): Promise<readonly VectorSearchResult[]> {
    const searchQuery: VectorSearchQuery = {
      queryText: query ?? context.input,
      topK: 5,
      ...(sourceTypes !== undefined ? { sourceTypes } : {}),
    };
    return this.vectorSearch.search(searchQuery);
  }
}
