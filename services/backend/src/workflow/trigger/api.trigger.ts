import { Injectable } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { TriggerHandler } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

@Injectable()
export class ApiTrigger {
  public readonly triggerType = "api";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // API trigger - creates a workflow execution via API call
    // Similar to manual trigger but identified as API-originated
    const execution = await this.workflowRuntime.execute(definition, {
      context,
      trigger: "api",
      input: trigger.config?.["input"] ?? "api trigger",
    });

    return { execution, triggered: true };
  };
}

/** Register the API trigger */
TRIGGER_CONTRACTS.push({
  type: "api",
  description: "API trigger - creates a workflow execution via API invocation",
  handler: ApiTrigger.handler,
});