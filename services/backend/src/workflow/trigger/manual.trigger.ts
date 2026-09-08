import { Injectable } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { TriggerHandler } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

@Injectable()
export class ManualTrigger {
  public readonly triggerType = "manual";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // Manual trigger - simply create an execution
    const execution = await this.workflowRuntime.execute(definition, {
      context,
      trigger: "manual",
      input: trigger.config?.["input"] ?? "manual trigger",
    });

    return { execution, triggered: true };
  };
}

/** Register the manual trigger */
TRIGGER_CONTRACTS.push({
  type: "manual",
  description: "Manual trigger - directly creates a workflow execution",
  handler: ManualTrigger.handler,
});