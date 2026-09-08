import { Injectable } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { TriggerHandler } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

@Injectable()
export class AiCompletionTrigger {
  public readonly triggerType = "ai-completion";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // AI completion trigger - placeholder for future AI provider integration
    // In a production system, this would integrate with AI providers (OpenAI, Anthropic, etc.)
    // and trigger on AI completion events
    const execution = await this.workflowRuntime.execute(definition, {
      context,
      trigger: "ai-completion",
      input: trigger.config?.["input"] ?? "ai completion trigger",
    });

    return { execution, triggered: true };
  };
}

/** Register the AI completion trigger */
TRIGGER_CONTRACTS.push({
  type: "ai-completion",
  description: "AI completion trigger - placeholder for future AI provider event integration",
  handler: AiCompletionTrigger.handler,
});