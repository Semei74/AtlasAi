import type { WorkflowNodeType } from "./workflow-node.interface.js";

export interface WorkflowEvent {
  readonly executionId: string;
  readonly timestamp: Date;
  readonly type: string;
}

export interface WorkflowExecutionStartedEvent extends WorkflowEvent {
  readonly type: "executionStarted";
  readonly workflowId: string;
  readonly input: string;
}

export interface WorkflowExecutionCompletedEvent extends WorkflowEvent {
  readonly type: "executionCompleted";
  readonly workflowId: string;
  readonly output: string;
  readonly durationMs: number;
}

export interface WorkflowExecutionFailedEvent extends WorkflowEvent {
  readonly type: "executionFailed";
  readonly workflowId: string;
  readonly error: string;
  readonly stepId: string | null;
}

export interface WorkflowExecutionCancelledEvent extends WorkflowEvent {
  readonly type: "executionCancelled";
  readonly workflowId: string;
}

export interface WorkflowStepStartedEvent extends WorkflowEvent {
  readonly type: "stepStarted";
  readonly nodeId: string;
  readonly nodeType: WorkflowNodeType;
}

export interface WorkflowStepCompletedEvent extends WorkflowEvent {
  readonly type: "stepCompleted";
  readonly nodeId: string;
  readonly nodeType: WorkflowNodeType;
  readonly output: string;
  readonly durationMs: number;
}

export interface WorkflowStepFailedEvent extends WorkflowEvent {
  readonly type: "stepFailed";
  readonly nodeId: string;
  readonly nodeType: WorkflowNodeType;
  readonly error: string;
}

export type WorkflowEvents =
  | WorkflowExecutionStartedEvent
  | WorkflowExecutionCompletedEvent
  | WorkflowExecutionFailedEvent
  | WorkflowExecutionCancelledEvent
  | WorkflowStepStartedEvent
  | WorkflowStepCompletedEvent
  | WorkflowStepFailedEvent;
