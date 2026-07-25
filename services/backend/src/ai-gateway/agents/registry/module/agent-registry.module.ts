import { Module } from "@nestjs/common";
import { AGENT_REGISTRY } from "../../interfaces/agent-registry.interface.js";
import { REGISTRY } from "../interfaces/agent-registry.interface.js";
import { AgentRegistryService } from "../services/agent-registry.service.js";
import { AgentDiscoveryService } from "../services/agent-discovery.service.js";
import { AgentHealthService } from "../services/agent-health.service.js";
import { AgentVersionService } from "../services/agent-version.service.js";

@Module({
  providers: [
    AgentDiscoveryService,
    AgentHealthService,
    AgentVersionService,
    AgentRegistryService,
    {
      provide: REGISTRY,
      useExisting: AgentRegistryService,
    },
    {
      provide: AGENT_REGISTRY,
      useExisting: AgentRegistryService,
    },
  ],
  exports: [
    REGISTRY,
    AGENT_REGISTRY,
    AgentRegistryService,
  ],
})
export class AgentRegistryModule {}
