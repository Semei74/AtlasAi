import { Injectable } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { TriggerHandler } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

@Injectable()
export class EventTrigger {
  public readonly triggerType = "event";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // Event trigger - placeholder for future event system
    // In a production system, this would integrate with an event bus/message queue
    const execution = await this.workflowRuntime.execute(definition, {
      context,
      trigger: "event",
      input: trigger.config?.["input"] ?? "event trigger",
    });

    return { execution, triggered: true };
  };
}

/** Register the event trigger */
TRIGGER_CONTRACTS.push({
  type: "event",
  description: "Event trigger - placeholder for future event bus integration",
  handler: EventTrigger.handler,
});