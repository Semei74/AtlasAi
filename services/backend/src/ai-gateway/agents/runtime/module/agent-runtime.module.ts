import { Module, forwardRef } from "@nestjs/common";
import { AGENT_RUNTIME } from "../interfaces/agent-runtime.interface.js";
import { AgentRuntimeService } from "../services/agent-runtime.service.js";
import { AgentExecutionService } from "../services/agent-execution.service.js";
import { ExecutionValidatorService } from "../services/execution-validator.service.js";
import { ExecutionLimitsService } from "../services/execution-limits.service.js";
import { RuntimeMetricsService } from "../services/runtime-metrics.service.js";
import { AiGatewayModule } from "../../../ai-gateway.module.js";

@Module({
  imports: [forwardRef(() => AiGatewayModule)],
  providers: [
    AgentRuntimeService,
    AgentExecutionService,
    ExecutionValidatorService,
    ExecutionLimitsService,
    RuntimeMetricsService,
    {
      provide: AGENT_RUNTIME,
      useExisting: AgentRuntimeService,
    },
  ],
  exports: [AGENT_RUNTIME],
})
export class AgentRuntimeModule {}
