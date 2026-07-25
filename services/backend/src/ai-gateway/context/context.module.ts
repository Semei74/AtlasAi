import { Module } from "@nestjs/common";
import { CONTEXT_ENGINE } from "./interfaces/context-engine.interface.js";
import { ContextEngineService } from "./services/context-engine.service.js";
import { ContextCollectorService } from "./services/context-collector.service.js";
import { ContextNormalizerService } from "./services/context-normalizer.service.js";
import { ContextFilterService } from "./services/context-filter.service.js";
import { ContextRankerService } from "./services/context-ranker.service.js";
import { ContextOptimizerService } from "./services/context-optimizer.service.js";
import { ContextComposerService } from "./services/context-composer.service.js";
import { ContextCacheService } from "./services/context-cache.service.js";
import { ConversationContextSource } from "./sources/conversation-context.source.js";
import { UserContextSource } from "./sources/user-context.source.js";
import { SystemContextSource } from "./sources/system-context.source.js";
import { WorkspaceContextSource } from "./sources/workspace-context.source.js";
import { RagContextSource } from "./sources/rag-context.source.js";
import { RagModule } from "../rag/rag.module.js";
import { PrismaModule } from "../../prisma/prisma.module.js";

@Module({
  imports: [RagModule, PrismaModule],
  providers: [
    ContextCollectorService,
    ContextNormalizerService,
    ContextFilterService,
    ContextRankerService,
    ContextOptimizerService,
    ContextComposerService,
    ContextCacheService,
    ConversationContextSource,
    UserContextSource,
    SystemContextSource,
    WorkspaceContextSource,
    RagContextSource,
    {
      provide: CONTEXT_ENGINE,
      useFactory: (
        collector: ContextCollectorService,
        normalizer: ContextNormalizerService,
        filter: ContextFilterService,
        ranker: ContextRankerService,
        optimizer: ContextOptimizerService,
        composer: ContextComposerService,
        cache: ContextCacheService,
        conversationSource: ConversationContextSource,
        userSource: UserContextSource,
        systemSource: SystemContextSource,
        workspaceSource: WorkspaceContextSource,
        ragSource: RagContextSource,
      ): ContextEngineService => {
        const engine = new ContextEngineService(
          collector,
          normalizer,
          filter,
          ranker,
          optimizer,
          composer,
          cache,
        );
        engine.registerSource(conversationSource);
        engine.registerSource(userSource);
        engine.registerSource(systemSource);
        engine.registerSource(workspaceSource);
        engine.registerSource(ragSource);
        return engine;
      },
      inject: [
        ContextCollectorService,
        ContextNormalizerService,
        ContextFilterService,
        ContextRankerService,
        ContextOptimizerService,
        ContextComposerService,
        ContextCacheService,
        ConversationContextSource,
        UserContextSource,
        SystemContextSource,
        WorkspaceContextSource,
        RagContextSource,
      ],
    },
  ],
  exports: [CONTEXT_ENGINE, ContextCacheService],
})
export class ContextModule {}
