import { Module } from "@nestjs/common";
import { MEMORY_MANAGER } from "../interfaces/agent-memory-manager.interface.js";
import { MEMORY_STORE } from "../interfaces/agent-memory-store.interface.js";
import { MEMORY_SUMMARIZER } from "../interfaces/agent-memory-summarizer.interface.js";
import { MEMORY_POLICY } from "../interfaces/agent-memory-policy.interface.js";
import { InMemoryMemoryStore } from "../services/in-memory-memory-store.service.js";
import { DefaultMemoryStrategyService } from "../services/default-memory-strategy.service.js";
import { MemoryLimitsService } from "../services/memory-limits.service.js";
import { MemorySummarizerService } from "../services/memory-summarizer.service.js";
import { MemoryPolicyService } from "../services/memory-policy.service.js";
import { MemoryManagerService } from "../services/memory-manager.service.js";

@Module({
  providers: [
    DefaultMemoryStrategyService,
    MemoryLimitsService,
    { provide: MEMORY_STORE, useClass: InMemoryMemoryStore },
    { provide: MEMORY_SUMMARIZER, useClass: MemorySummarizerService },
    { provide: MEMORY_POLICY, useClass: MemoryPolicyService },
    {
      provide: MEMORY_MANAGER,
      useFactory: (
        store: InMemoryMemoryStore,
        strategy: DefaultMemoryStrategyService,
        summarizer: MemorySummarizerService,
        policy: MemoryPolicyService,
        limits: MemoryLimitsService,
      ): MemoryManagerService => new MemoryManagerService(store, strategy, summarizer, policy, limits),
      inject: [
        MEMORY_STORE,
        DefaultMemoryStrategyService,
        MEMORY_SUMMARIZER,
        MEMORY_POLICY,
        MemoryLimitsService,
      ],
    },
  ],
  exports: [MEMORY_MANAGER, MEMORY_STORE, MEMORY_POLICY],
})
export class AgentMemoryModule {}

export type {
  MemoryManager,
  MemoryStore,
  MemorySummarizer,
  MemoryAccessPolicy,
  MemoryStrategy,
  MemoryWindow,
  MemoryWindowEntry,
  AgentMemoryLimits,
  MemoryLimitsConfig,
  MemoryTokenBudget,
} from "../interfaces/index.js";

export {
  MEMORY_MANAGER,
  MEMORY_STORE,
  MEMORY_SUMMARIZER,
  MEMORY_POLICY,
} from "../interfaces/index.js";
