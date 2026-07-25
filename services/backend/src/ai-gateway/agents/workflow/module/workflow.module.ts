import { Module } from "@nestjs/common";
import { WORKFLOW_RUNTIME } from "../interfaces/workflow-runtime.interface.js";
import { WORKFLOW_REGISTRY } from "../interfaces/workflow-registry.interface.js";
import { WORKFLOW_VALIDATOR } from "../interfaces/workflow-validator.interface.js";
import { WORKFLOW_POLICY } from "../interfaces/workflow-policy.interface.js";
import { WorkflowRegistryService } from "../services/workflow-registry.service.js";
import { WorkflowValidatorService } from "../services/workflow-validator.service.js";
import { WorkflowLimitsService } from "../services/workflow-limits.service.js";
import { WorkflowPolicyService } from "../services/workflow-policy.service.js";
import { WorkflowStateService } from "../services/workflow-state.service.js";
import { WorkflowRuntimeService } from "../services/workflow-runtime.service.js";

@Module({
  providers: [
    WorkflowValidatorService,
    WorkflowPolicyService,
    WorkflowRegistryService,
    WorkflowLimitsService,
    WorkflowStateService,
    {
      provide: WORKFLOW_REGISTRY,
      useClass: WorkflowRegistryService,
    },
    {
      provide: WORKFLOW_VALIDATOR,
      useClass: WorkflowValidatorService,
    },
    {
      provide: WORKFLOW_POLICY,
      useClass: WorkflowPolicyService,
    },
    {
      provide: WORKFLOW_RUNTIME,
      useFactory: (
        validator: WorkflowValidatorService,
        limitsService: WorkflowLimitsService,
        policy: WorkflowPolicyService,
        state: WorkflowStateService,
      ): WorkflowRuntimeService =>
        new WorkflowRuntimeService(validator, limitsService, policy, state),
      inject: [
        WorkflowValidatorService,
        WorkflowLimitsService,
        WorkflowPolicyService,
        WorkflowStateService,
      ],
    },
  ],
  exports: [WORKFLOW_RUNTIME, WORKFLOW_REGISTRY, WORKFLOW_VALIDATOR, WORKFLOW_POLICY],
})
export class WorkflowModule {}
