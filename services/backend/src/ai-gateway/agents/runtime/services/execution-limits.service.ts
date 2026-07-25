import { Injectable } from "@nestjs/common";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";
import type { ExecutionLimits } from "../interfaces/execution-limits.interface.js";

export interface LimitsValidationResult {
  readonly withinLimits: boolean;
  readonly violations: readonly string[];
}

@Injectable()
export class ExecutionLimitsService {
  public buildLimits(
    agent: AgentDefinition,
    policy: AgentPolicy,
    requestedProvider?: string,
    requestedModel?: string,
  ): ExecutionLimits {
    const provider = requestedProvider ?? agent.defaultProvider;
    const model = requestedModel ?? agent.defaultModel;

    return {
      timeoutMs: agent.timeoutMs,
      maxTokens: policy.resourceLimits.maxInputTokens + policy.resourceLimits.maxOutputTokens,
      maxSteps: policy.permissions.maxStepsPerExecution,
      maxRetries: agent.maxRetries,
      allowedProviders: [provider],
      allowedModels: [model],
      requireHumanApproval: policy.permissions.requireHumanApproval,
    };
  }

  public validateLimits(
    limits: ExecutionLimits,
    provider: string,
    model: string,
  ): LimitsValidationResult {
    const violations: string[] = [];

    if (limits.timeoutMs < 1000) {
      violations.push(`Timeout (${String(limits.timeoutMs)}ms) is too low, minimum is 1000ms`);
    }

    if (limits.maxTokens < 1) {
      violations.push("Max tokens must be at least 1");
    }

    if (!limits.allowedProviders.includes(provider)) {
      violations.push(`Provider "${provider}" is not in the allowed providers list`);
    }

    if (!limits.allowedModels.includes(model)) {
      violations.push(`Model "${model}" is not in the allowed models list`);
    }

    return {
      withinLimits: violations.length === 0,
      violations,
    };
  }

  public isTimeout(limits: ExecutionLimits, elapsedMs: number): boolean {
    return elapsedMs >= limits.timeoutMs;
  }
}
