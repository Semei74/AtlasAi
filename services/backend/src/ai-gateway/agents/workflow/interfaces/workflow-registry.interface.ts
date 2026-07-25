import type { WorkflowDefinition, WorkflowStatus } from "./workflow-definition.interface.js";

export interface WorkflowFilter {
  readonly tags?: readonly string[];
  readonly status?: WorkflowStatus;
  readonly organizationId?: string;
  readonly workspaceId?: string;
}

export interface WorkflowRegistry {
  register(definition: WorkflowDefinition): Promise<WorkflowDefinition>;
  unregister(id: string): Promise<boolean>;
  get(id: string): Promise<WorkflowDefinition | null>;
  list(filter?: WorkflowFilter): Promise<readonly WorkflowDefinition[]>;
  update(
    id: string,
    definition: Partial<WorkflowDefinition>,
  ): Promise<WorkflowDefinition>;
  exists(id: string): Promise<boolean>;
  count(organizationId?: string): Promise<number>;
}

export const WORKFLOW_REGISTRY = "WORKFLOW_REGISTRY";
