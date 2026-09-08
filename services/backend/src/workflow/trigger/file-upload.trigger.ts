import { Injectable } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { TriggerHandler } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

@Injectable()
export class FileUploadTrigger {
  public readonly triggerType = "file-upload";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // File upload trigger - placeholder for future file system integration
    // In a production system, this would integrate with a file storage service
    // (S3, MinIO, etc.) and trigger on file creation/modification events
    const execution = await this.workflowRuntime.execute(definition, {
      context,
      trigger: "file-upload",
      input: trigger.config?.["input"] ?? "file upload trigger",
    });

    return { execution, triggered: true };
  };
}

/** Register the file-upload trigger */
TRIGGER_CONTRACTS.push({
  type: "file-upload",
  description: "File upload trigger - placeholder for future file storage event integration",
  handler: FileUploadTrigger.handler,
});