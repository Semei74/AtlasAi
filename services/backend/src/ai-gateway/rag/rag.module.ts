import { Module } from "@nestjs/common";
import { VectorSearchModule } from "../vector-search/vector-search.module.js";
import { QueryProcessorService } from "./services/query-processor.service.js";
import { RetrieverService } from "./services/retriever.service.js";
import { RagRankerService } from "./services/rag-ranker.service.js";
import { RagContextComposerService } from "./services/rag-context-composer.service.js";
import { RagEngineService } from "./services/rag-engine.service.js";
import type { RagConfig } from "./interfaces/rag-config.interface.js";

export const RAG_ENGINE = "RAG_ENGINE";

const DEFAULT_RAG_CONFIG: RagConfig = {
  defaultTopK: 5,
  defaultMinScore: 0.5,
  maxContextTokens: 2000,
  enableQueryExpansion: true,
  enableHybridSearch: true,
};

@Module({
  imports: [VectorSearchModule],
  providers: [
    QueryProcessorService,
    RetrieverService,
    RagRankerService,
    RagContextComposerService,
    {
      provide: RAG_ENGINE,
      useFactory: (
        retriever: RetrieverService,
        ranker: RagRankerService,
        composer: RagContextComposerService,
      ): RagEngineService => new RagEngineService(retriever, ranker, composer, DEFAULT_RAG_CONFIG),
      inject: [RetrieverService, RagRankerService, RagContextComposerService],
    },
  ],
  exports: [RAG_ENGINE, QueryProcessorService, RetrieverService, RagRankerService, RagContextComposerService],
})
export class RagModule {}
