import { ValidationError } from "@atlas/errors";
import { Injectable } from "@nestjs/common";
import type { ExecutionStatus } from "../interfaces/workflow-state.interface.js";
import { VALID_TRANSITIONS } from "../interfaces/workflow-state.interface.js";

@Injectable()
export class WorkflowStateService {
  private readonly statuses = new Map<string, ExecutionStatus>();

  public getStatus(executionId: string): ExecutionStatus {
    return this.statuses.get(executionId) ?? "pending";
  }

  public transition(executionId: string, to: ExecutionStatus): void {
    const from = this.getStatus(executionId);
    const allowed = VALID_TRANSITIONS[from];

    if (!allowed.includes(to)) {
      throw new ValidationError(
        `Invalid state transition: ${from} → ${to} for execution "${executionId}"`,
      );
    }

    this.statuses.set(executionId, to);
  }

  public validateTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed.includes(to);
  }

  public canExecute(status: ExecutionStatus): boolean {
    return status === "pending" || status === "paused";
  }

  public isTerminal(status: ExecutionStatus): boolean {
    return status === "completed" || status === "failed" || status === "cancelled";
  }

  public remove(executionId: string): void {
    this.statuses.delete(executionId);
  }

  public clear(): void {
    this.statuses.clear();
  }
}
