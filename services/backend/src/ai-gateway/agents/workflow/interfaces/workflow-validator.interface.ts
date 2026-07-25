import type { WorkflowDefinition } from "./workflow-definition.interface.js";
import type { WorkflowNode } from "./workflow-node.interface.js";
import type { WorkflowEdge } from "./workflow-edge.interface.js";

export interface WorkflowValidationError {
  readonly code: string;
  readonly message: string;
  readonly nodeId: string | null;
  readonly edgeId: string | null;
}

export interface WorkflowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly WorkflowValidationError[];
  readonly warnings: readonly string[];
}

export interface WorkflowValidator {
  validate(definition: WorkflowDefinition): Promise<WorkflowValidationResult>;
  validateNode(node: WorkflowNode): readonly WorkflowValidationError[];
  validateEdge(
    edge: WorkflowEdge,
    nodeIds: ReadonlySet<string>,
  ): readonly WorkflowValidationError[];
}

export const WORKFLOW_VALIDATOR = "WORKFLOW_VALIDATOR";
