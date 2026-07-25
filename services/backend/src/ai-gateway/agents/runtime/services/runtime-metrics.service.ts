import { Injectable } from "@nestjs/common";
import type { RuntimeMetrics } from "../interfaces/runtime-metrics.interface.js";
import type { ExecutionResult } from "../interfaces/execution-result.interface.js";

@Injectable()
export class RuntimeMetricsService {
  private totalExecutions = 0;
  private completedExecutions = 0;
  private failedExecutions = 0;
  private cancelledExecutions = 0;
  private timedOutExecutions = 0;
  private totalDurationMs = 0;
  private totalTokensUsed = 0;
  private totalCost = 0;
  private activeCount = 0;

  public recordExecutionStart(): void {
    this.activeCount++;
  }

  public recordExecutionComplete(result: ExecutionResult): void {
    this.totalExecutions++;
    this.activeCount = Math.max(0, this.activeCount - 1);

    switch (result.status) {
      case "completed":
        this.completedExecutions++;
        break;
      case "cancelled":
        this.cancelledExecutions++;
        break;
      case "timeout":
        this.timedOutExecutions++;
        break;
      case "failed":
        this.failedExecutions++;
        break;
    }

    this.totalDurationMs += result.durationMs;
    this.totalTokensUsed += result.totalTokens;
    this.totalCost += result.totalCost;
  }

  public recordExecutionError(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  public getMetrics(): RuntimeMetrics {
    const completed = this.completedExecutions + this.failedExecutions
      + this.cancelledExecutions + this.timedOutExecutions;

    return {
      totalExecutions: this.totalExecutions,
      completedExecutions: this.completedExecutions,
      failedExecutions: this.failedExecutions,
      cancelledExecutions: this.cancelledExecutions,
      timedOutExecutions: this.timedOutExecutions,
      totalDurationMs: this.totalDurationMs,
      totalTokensUsed: this.totalTokensUsed,
      totalCost: this.totalCost,
      averageDurationMs: completed > 0 ? Math.round(this.totalDurationMs / completed) : 0,
      averageTokensPerExecution: completed > 0 ? Math.round(this.totalTokensUsed / completed) : 0,
      activeExecutions: this.activeCount,
    };
  }
}
