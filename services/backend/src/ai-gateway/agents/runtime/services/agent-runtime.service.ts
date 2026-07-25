import { Injectable } from "@nestjs/common";
import { AgentRuntimeState } from "../interfaces/agent-runtime-state.interface.js";
import type { AgentRuntime, RuntimeEventListener } from "../interfaces/agent-runtime.interface.js";
import type { AgentRuntimeRequest } from "../interfaces/agent-runtime-request.interface.js";
import type { AgentRuntimeResult } from "../interfaces/agent-runtime-result.interface.js";
import type { ExecutionContext } from "../interfaces/execution-context.interface.js";
import type { ExecutionResult } from "../interfaces/execution-result.interface.js";
import type { RuntimeMetrics } from "../interfaces/runtime-metrics.interface.js";
import { ExecutionValidatorService } from "./execution-validator.service.js";
import { ExecutionLimitsService } from "./execution-limits.service.js";
import { AgentExecutionService } from "./agent-execution.service.js";
import { RuntimeMetricsService } from "./runtime-metrics.service.js";

@Injectable()
export class AgentRuntimeService implements AgentRuntime {
  #state: AgentRuntimeState = AgentRuntimeState.Idle;
  readonly #listeners = new Set<RuntimeEventListener>();
  readonly #executions = new Map<string, AbortController>();

  public constructor(
    private readonly validator: ExecutionValidatorService,
    private readonly limitsService: ExecutionLimitsService,
    private readonly executionService: AgentExecutionService,
    private readonly metricsService: RuntimeMetricsService,
  ) {}

  public async execute(request: AgentRuntimeRequest): Promise<AgentRuntimeResult> {
    const executionId = request.context.agent.id + "-" + String(Date.now());
    const startTime = Date.now();
    const controller = new AbortController();
    this.#executions.set(executionId, controller);

    this.#updateState(AgentRuntimeState.Executing);
    this.metricsService.recordExecutionStart();
    this.#emit({ executionId, timestamp: new Date(), type: "executionStart", request });

    try {
      const validationResult = await this.validator.validate(request.context);
      if (!validationResult.valid) {
        const errorMessages = validationResult.errors.map((e) => e.message).join("; ");
        this.metricsService.recordExecutionComplete({
          output: "",
          status: "failed",
          totalTokens: 0,
          totalCost: 0,
          durationMs: Date.now() - startTime,
          modelUsed: "",
          providerUsed: "",
          finishedAt: new Date(),
          error: errorMessages,
        });
        this.#updateState(AgentRuntimeState.Completed);
        this.#emit({ executionId, timestamp: new Date(), type: "executionFailed", error: errorMessages });
        return {
          executionId,
          context: request.context,
          result: {
            output: "",
            status: "failed",
            totalTokens: 0,
            totalCost: 0,
            durationMs: Date.now() - startTime,
            modelUsed: "",
            providerUsed: "",
            finishedAt: new Date(),
            error: errorMessages,
          },
          durationMs: Date.now() - startTime,
        };
      }

      const limits = this.limitsService.buildLimits(
        request.context.agent,
        request.context.policy,
        request.context.provider,
        request.context.model,
      );

      const signal = request.signal ?? controller.signal;

      if (signal.aborted) {
        this.metricsService.recordExecutionComplete({
          output: "",
          status: "cancelled",
          totalTokens: 0,
          totalCost: 0,
          durationMs: Date.now() - startTime,
          modelUsed: "",
          providerUsed: "",
          finishedAt: new Date(),
          error: "Execution was cancelled",
        });
        this.#updateState(AgentRuntimeState.Completed);
        this.#emit({ executionId, timestamp: new Date(), type: "executionCancelled" });
        return {
          executionId,
          context: request.context,
          result: {
            output: "",
            status: "cancelled",
            totalTokens: 0,
            totalCost: 0,
            durationMs: Date.now() - startTime,
            modelUsed: "",
            providerUsed: "",
            finishedAt: new Date(),
            error: "Execution was cancelled",
          },
          durationMs: Date.now() - startTime,
        };
      }

      const executionContext: ExecutionContext = {
        executionId,
        agent: request.context.agent,
        policy: request.context.policy,
        context: {
          agentId: request.context.agent.id,
          userId: request.context.userId,
          organizationId: request.context.organizationId,
          workspaceId: request.context.workspaceId ?? null,
          conversationId: request.context.conversationId ?? null,
          requestId: executionId,
          input: request.context.input,
          metadata: request.context.metadata,
        },
        limits,
        signal,
        startedAt: new Date(startTime),
      };

      const result: ExecutionResult = await this.executionService.execute(executionContext);

      this.metricsService.recordExecutionComplete(result);
      this.#updateState(AgentRuntimeState.Completed);
      this.#emit({ executionId, timestamp: new Date(), type: "executionComplete", result });

      return {
        executionId,
        context: request.context,
        result,
        durationMs: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      this.metricsService.recordExecutionComplete({
        output: "",
        status: "failed",
        totalTokens: 0,
        totalCost: 0,
        durationMs: Date.now() - startTime,
        modelUsed: "",
        providerUsed: "",
        finishedAt: new Date(),
        error: errorMessage,
      });
      this.#updateState(AgentRuntimeState.Failed);
      this.#emit({ executionId, timestamp: new Date(), type: "executionFailed", error: errorMessage });

      return {
        executionId,
        context: request.context,
        result: {
          output: "",
          status: "failed",
          totalTokens: 0,
          totalCost: 0,
          durationMs: Date.now() - startTime,
          modelUsed: "",
          providerUsed: "",
          finishedAt: new Date(),
          error: errorMessage,
        },
        durationMs: Date.now() - startTime,
      };
    } finally {
      this.#executions.delete(executionId);
    }
  }

  public cancel(executionId: string): Promise<boolean> {
    const controller = this.#executions.get(executionId);
    if (controller === undefined) {
      return Promise.resolve(false);
    }
    controller.abort();
    this.#updateState(AgentRuntimeState.Cancelling);
    this.#emit({ executionId, timestamp: new Date(), type: "executionCancelled" });
    return Promise.resolve(true);
  }

  public getState(): AgentRuntimeState {
    return this.#state;
  }

  public getMetrics(): RuntimeMetrics {
    return this.metricsService.getMetrics();
  }

  public onEvent(listener: RuntimeEventListener): void {
    this.#listeners.add(listener);
  }

  public removeEventListener(listener: RuntimeEventListener): void {
    this.#listeners.delete(listener);
  }

  #emit(event: unknown): void {
    for (const listener of this.#listeners) {
      try {
        listener(event);
      } catch {
        // ignore listener errors
      }
    }
  }

  #updateState(newState: AgentRuntimeState): void {
    const from = this.#state;
    this.#state = newState;
    this.#emit({
      executionId: "",
      timestamp: new Date(),
      type: "stateChange",
      from,
      to: newState,
    });
  }
}
