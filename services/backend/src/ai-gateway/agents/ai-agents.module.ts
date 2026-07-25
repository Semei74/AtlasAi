import { Module } from "@nestjs/common";
import { AgentLifecycleService } from "./services/agent-lifecycle.service.js";
import { AgentContextBuilderService } from "./services/agent-context-builder.service.js";
import { AgentValidatorService } from "./services/agent-validator.service.js";
import { ContextModule } from "../context/context.module.js";
import { RagModule } from "../rag/rag.module.js";
import { VectorSearchModule } from "../vector-search/vector-search.module.js";
import { AgentRuntimeModule } from "./runtime/module/agent-runtime.module.js";
import { AgentRegistryModule } from "./registry/module/agent-registry.module.js";
import { AgentMemoryModule } from "./memory/module/agent-memory.module.js";
import { WorkflowModule } from "./workflow/module/workflow.module.js";

@Module({
  imports: [ContextModule, RagModule, VectorSearchModule, AgentRuntimeModule, AgentRegistryModule, AgentMemoryModule, WorkflowModule],
  providers: [
    AgentLifecycleService,
    AgentContextBuilderService,
    AgentValidatorService,
  ],
  exports: [
    AgentRegistryModule,
    AgentLifecycleService,
    AgentContextBuilderService,
    AgentValidatorService,
    AgentRuntimeModule,
    AgentMemoryModule,
    WorkflowModule,
  ],
})
export class AiAgentsModule {}

export { REGISTRY } from "./registry/interfaces/agent-registry.interface.js";
export type { Registry } from "./registry/interfaces/agent-registry.interface.js";
export type { AgentRegistration } from "./registry/interfaces/agent-registration.interface.js";
export type { AgentDescriptor } from "./registry/interfaces/agent-descriptor.interface.js";
export type { AgentHealthStatus, AgentHealthStatusValue } from "./registry/interfaces/agent-health.interface.js";
export type { AgentVersionInfo } from "./registry/interfaces/agent-version.interface.js";
export type { AgentSearchOptions, AgentSearchResult, AgentSortField } from "./registry/interfaces/agent-search-options.interface.js";
export type { AgentFilter } from "./registry/interfaces/agent-filter.interface.js";
