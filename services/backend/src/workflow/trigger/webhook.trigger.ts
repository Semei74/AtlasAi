import { Inject, Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { TRIGGER_CONTRACTS, getTriggerContract } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";
import { AUTH_GUARD } from "../../auth/authorization/guards/auth.guard.js";

@Injectable()
export class WebhookTrigger {
  public readonly triggerType = "webhook";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // Webhook triggers require authentication and tenant validation
    // In a production system, this would verify the webhook signature
    // and ensure the workflow belongs to the requesting tenant

    // For now, create an execution with webhook context
    const execution = await this.workflowRuntime.execute(definition, {
      context,
      trigger: "webhook",
      input: JSON.stringify(trigger.config),
    });

    return { execution, triggered: true };
  };

  public async registerGuard(): Promise<CanActivate> {
    return new (class extends CanActivate {
      public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Check for webhook authorization
        const authHeader = request.headers["x-webhook-token"];

        if (!authHeader) {
          return false;
        }

        // Validate the webhook token against the workflow's organization
        // This is a simplified check - production would verify signature
        const isValid = authHeader === "webhook-secret";

        return isValid;
      }
    })();
  }
}

/** Register the webhook trigger */
TRIGGER_CONTRACTS.push({
  type: "webhook",
  description: "Webhook trigger with basic authentication validation",
  handler: WebhookTrigger.handler,
});