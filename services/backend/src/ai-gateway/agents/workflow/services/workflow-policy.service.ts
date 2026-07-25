import { Injectable } from "@nestjs/common";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowAccessPolicy } from "../interfaces/workflow-policy.interface.js";

@Injectable()
export class WorkflowPolicyService implements WorkflowAccessPolicy {
  public canExecute(definition: WorkflowDefinition, context: AgentContext): boolean {
    if (definition.organizationId !== context.organizationId) return false;
    if (definition.workspaceId !== null && definition.workspaceId !== context.workspaceId) return false;
    if (definition.status !== "published") return false;
    return true;
  }

  public canCreate(definition: WorkflowDefinition, context: AgentContext): boolean {
    return definition.organizationId === context.organizationId;
  }

  public canUpdate(definition: WorkflowDefinition, context: AgentContext): boolean {
    if (definition.organizationId !== context.organizationId) return false;
    if (definition.workspaceId !== null && definition.workspaceId !== context.workspaceId) return false;
    return true;
  }

  public canDelete(definition: WorkflowDefinition, context: AgentContext): boolean {
    if (definition.organizationId !== context.organizationId) return false;
    return true;
  }
}
