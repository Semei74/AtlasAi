import type { AgentRuntimeState } from "./agent-runtime-state.interface.js";
import type { AgentRuntimeRequest } from "./agent-runtime-request.interface.js";
import type { AgentRuntimeResult } from "./agent-runtime-result.interface.js";

export interface AgentRuntimeEvent {
  readonly executionId: string;
  readonly timestamp: Date;
  readonly type: string;
}

export interface AgentRuntimeStateChangeEvent extends AgentRuntimeEvent {
  readonly type: "stateChange";
  readonly from: AgentRuntimeState;
  readonly to: AgentRuntimeState;
}

export interface AgentRuntimeExecutionStartEvent extends AgentRuntimeEvent {
  readonly type: "executionStart";
  readonly request: AgentRuntimeRequest;
}

export interface AgentRuntimeExecutionCompleteEvent extends AgentRuntimeEvent {
  readonly type: "executionComplete";
  readonly result: AgentRuntimeResult;
}

export interface AgentRuntimeExecutionFailedEvent extends AgentRuntimeEvent {
  readonly type: "executionFailed";
  readonly error: string;
}

export interface AgentRuntimeExecutionCancelledEvent extends AgentRuntimeEvent {
  readonly type: "executionCancelled";
}

export interface AgentRuntimeExecutionTimedOutEvent extends AgentRuntimeEvent {
  readonly type: "executionTimedOut";
  readonly timeoutMs: number;
}

export type AgentRuntimeEvents =
  | AgentRuntimeStateChangeEvent
  | AgentRuntimeExecutionStartEvent
  | AgentRuntimeExecutionCompleteEvent
  | AgentRuntimeExecutionFailedEvent
  | AgentRuntimeExecutionCancelledEvent
  | AgentRuntimeExecutionTimedOutEvent;
