import { Injectable } from "@nestjs/common";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowNode } from "../interfaces/workflow-node.interface.js";
import type { WorkflowEdge } from "../interfaces/workflow-edge.interface.js";
import type { WorkflowValidationResult, WorkflowValidationError } from "../interfaces/workflow-validator.interface.js";
import type { WorkflowValidator } from "../interfaces/workflow-validator.interface.js";

const DEFAULT_MAX_NODES = 100;

@Injectable()
export class WorkflowValidatorService implements WorkflowValidator {
  public validate(definition: WorkflowDefinition): Promise<WorkflowValidationResult> {
    const errors: WorkflowValidationError[] = [];
    const warnings: string[] = [];

    if (!definition.id) {
      errors.push({ code: "MISSING_ID", message: "Workflow must have an id", nodeId: null, edgeId: null });
    }
    if (!definition.name) {
      errors.push({ code: "MISSING_NAME", message: "Workflow must have a name", nodeId: null, edgeId: null });
    }
    if (!definition.organizationId) {
      errors.push({ code: "MISSING_ORG", message: "Workflow must have an organizationId", nodeId: null, edgeId: null });
    }

    if (definition.nodes.length === 0) {
      errors.push({ code: "NO_NODES", message: "Workflow must have at least one node", nodeId: null, edgeId: null });
    }

    if (definition.nodes.length > DEFAULT_MAX_NODES) {
      errors.push({
        code: "TOO_MANY_NODES",
        message: `Workflow exceeds maximum nodes (${String(definition.nodes.length)} > ${String(DEFAULT_MAX_NODES)})`,
        nodeId: null,
        edgeId: null,
      });
    }

    const nodeIds = new Set(definition.nodes.map((n) => n.id));

    if (nodeIds.size !== definition.nodes.length) {
      errors.push({ code: "DUPLICATE_NODES", message: "Workflow contains duplicate node ids", nodeId: null, edgeId: null });
    }

    for (const node of definition.nodes) {
      const nodeErrors = this.validateNode(node);
      errors.push(...nodeErrors);
    }

    for (const edge of definition.edges) {
      const edgeErrors = this.validateEdge(edge, nodeIds);
      errors.push(...edgeErrors);
    }

    const edgeTargetIds = new Set(definition.edges.map((e) => e.targetNodeId));
    const unreachableNodes = definition.nodes.filter(
      (n) => !edgeTargetIds.has(n.id) && n.type !== "trigger",
    );
    if (unreachableNodes.length > 0) {
      warnings.push(
        `Nodes without incoming edges (and not triggers): ${unreachableNodes.map((n) => n.id).join(", ")}`,
      );
    }

    return Promise.resolve({ valid: errors.length === 0, errors, warnings });
  }

  public validateNode(node: WorkflowNode): readonly WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (!node.id) {
      errors.push({ code: "MISSING_NODE_ID", message: "Node must have an id", nodeId: null, edgeId: null });
    }

    return errors;
  }

  public validateEdge(
    edge: WorkflowEdge,
    nodeIds: ReadonlySet<string>,
  ): readonly WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (!edge.sourceNodeId || !edge.targetNodeId) {
      errors.push({
        code: "INCOMPLETE_EDGE",
        message: `Edge "${edge.id}" is missing source or target`,
        nodeId: null,
        edgeId: edge.id,
      });
    }
    if (edge.sourceNodeId && !nodeIds.has(edge.sourceNodeId)) {
      errors.push({
        code: "INVALID_SOURCE",
        message: `Edge "${edge.id}" references unknown source node "${edge.sourceNodeId}"`,
        nodeId: null,
        edgeId: edge.id,
      });
    }
    if (edge.targetNodeId && !nodeIds.has(edge.targetNodeId)) {
      errors.push({
        code: "INVALID_TARGET",
        message: `Edge "${edge.id}" references unknown target node "${edge.targetNodeId}"`,
        nodeId: null,
        edgeId: edge.id,
      });
    }

    return errors;
  }
}
