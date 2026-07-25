import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { WorkflowDefinition } from "./workflow-definition.interface.js";

export interface WorkflowAccessPolicy {
  canExecute(definition: WorkflowDefinition, context: AgentContext): boolean;
  canCreate(definition: WorkflowDefinition, context: AgentContext): boolean;
  canUpdate(definition: WorkflowDefinition, context: AgentContext): boolean;
  canDelete(definition: WorkflowDefinition, context: AgentContext): boolean;
}

export const WORKFLOW_POLICY = "WORKFLOW_POLICY";
