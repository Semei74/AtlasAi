import { Injectable } from "@nestjs/common";
import { ValidationError } from "@atlas/errors";
import { AgentState } from "../interfaces/agent-state.enum.js";
import type { AgentLifecycleHooks } from "../interfaces/agent-lifecycle.interface.js";
import type { AgentDefinition } from "../interfaces/agent-definition.interface.js";
import type { AgentExecutionRequest } from "../interfaces/agent-execution.interface.js";
import type { AgentResult } from "../interfaces/agent-result.interface.js";

const ALLOWED_TRANSITIONS: Record<AgentState, readonly AgentState[]> = {
  [AgentState.Idle]: [AgentState.Initializing, AgentState.Disabled],
  [AgentState.Initializing]: [AgentState.Ready, AgentState.Failed],
  [AgentState.Ready]: [AgentState.Executing, AgentState.Disabled, AgentState.Idle],
  [AgentState.Executing]: [AgentState.Completed, AgentState.Failed, AgentState.Paused],
  [AgentState.Paused]: [AgentState.Executing, AgentState.Failed, AgentState.Ready],
  [AgentState.Completed]: [AgentState.Ready, AgentState.Idle],
  [AgentState.Failed]: [AgentState.Ready, AgentState.Idle],
  [AgentState.Disabled]: [AgentState.Idle],
};

type StateChangeHandler = (from: AgentState, to: AgentState) => void;

@Injectable()
export class AgentLifecycleService implements AgentLifecycleHooks {
  private readonly states = new Map<string, AgentState>();
  private readonly stateChangeListeners = new Map<string, StateChangeHandler[]>();

  public async onInitialize(agent: AgentDefinition): Promise<void> {
    this.states.set(agent.id, AgentState.Initializing);
    await this.transition(agent.id, AgentState.Ready);
  }

  public onBeforeExecute(request: AgentExecutionRequest): Promise<AgentExecutionRequest> {
    return Promise.resolve(request);
  }

  public onAfterExecute(result: AgentResult): Promise<AgentResult> {
    return Promise.resolve(result);
  }

  public onStateChange(agentId: string, from: AgentState, to: AgentState): Promise<void> {
    const listeners = this.stateChangeListeners.get(agentId);
    if (listeners) {
      for (const listener of listeners) {
        listener(from, to);
      }
    }
    return Promise.resolve();
  }

  public onError(agentId: string, _error: Error): Promise<void> {
    this.states.set(agentId, AgentState.Failed);
    return Promise.resolve();
  }

  public onDispose(agentId: string): Promise<void> {
    this.states.delete(agentId);
    this.stateChangeListeners.delete(agentId);
    return Promise.resolve();
  }

  public getState(agentId: string): Promise<AgentState> {
    return Promise.resolve(this.states.get(agentId) ?? AgentState.Idle);
  }

  public async transition(agentId: string, to: AgentState): Promise<void> {
    const from = await this.getState(agentId);
    if (!this.validateTransition(from, to)) {
      throw new ValidationError(`Invalid state transition: ${from} → ${to} for agent "${agentId}"`);
    }
    this.states.set(agentId, to);
    await this.onStateChange(agentId, from, to);
  }

  public validateTransition(from: AgentState, to: AgentState): boolean {
    const allowed = ALLOWED_TRANSITIONS[from];
    return allowed.includes(to);
  }

  public onStateChangeEvent(
    agentId: string,
    listener: (from: AgentState, to: AgentState) => void,
  ): void {
    const existing = this.stateChangeListeners.get(agentId) ?? [];
    existing.push(listener);
    this.stateChangeListeners.set(agentId, existing);
  }

  public removeStateChangeListener(
    agentId: string,
    listener: (from: AgentState, to: AgentState) => void,
  ): void {
    const existing = this.stateChangeListeners.get(agentId);
    if (existing) {
      this.stateChangeListeners.set(
        agentId,
        existing.filter((l) => l !== listener),
      );
    }
  }
}
