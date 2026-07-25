import { Injectable, Inject } from "@nestjs/common";
import { AGENT_REGISTRY } from "../../interfaces/agent-registry.interface.js";
import type { AgentRegistry } from "../../interfaces/agent-registry.interface.js";
import { AI_POLICY_ENGINE } from "../../../policy/interfaces/ai-policy-engine.interface.js";
import type { AiPolicyEngine } from "../../../policy/interfaces/ai-policy-engine.interface.js";
import type { AiPolicyContext } from "../../../policy/interfaces/ai-policy-context.interface.js";
import type { AgentRuntimeContext } from "../interfaces/agent-runtime-context.interface.js";

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
}

@Injectable()
export class ExecutionValidatorService {
  public constructor(
    @Inject(AGENT_REGISTRY)
    private readonly agentRegistry: AgentRegistry,
    @Inject(AI_POLICY_ENGINE)
    private readonly policyEngine: AiPolicyEngine,
  ) {}

  public async validate(context: AgentRuntimeContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    await this.validateAgent(context, errors);
    this.validateContext(context, errors);
    this.validateProviderModel(context, errors);
    await this.validatePolicy(context, errors);
    return { valid: errors.length === 0, errors };
  }

  private async validateAgent(
    context: AgentRuntimeContext,
    errors: ValidationError[],
  ): Promise<void> {
    const exists = await this.agentRegistry.exists(context.agent.id);
    if (!exists) {
      errors.push({ field: "agent", message: `Agent "${context.agent.id}" is not registered` });
      return;
    }

    const definition = await this.agentRegistry.get(context.agent.id);
    if (definition === null) {
      errors.push({ field: "agent", message: `Agent "${context.agent.id}" not found` });
      return;
    }

    if (!definition.enabled) {
      errors.push({ field: "agent", message: `Agent "${context.agent.id}" is disabled` });
    }

    if (context.conversationId !== null && !context.conversationId.trim()) {
      errors.push({ field: "conversationId", message: "Conversation id must not be empty" });
    }
  }

  private validateContext(
    context: AgentRuntimeContext,
    errors: ValidationError[],
  ): void {
    if (!context.userId || context.userId.trim().length === 0) {
      errors.push({ field: "userId", message: "User id is required" });
    }
    if (!context.organizationId || context.organizationId.trim().length === 0) {
      errors.push({ field: "organizationId", message: "Organization id is required" });
    }
    if (!context.input || context.input.trim().length === 0) {
      errors.push({ field: "input", message: "Input is required" });
    }
  }

  private validateProviderModel(
    context: AgentRuntimeContext,
    errors: ValidationError[],
  ): void {
    const provider = context.provider ?? context.agent.defaultProvider;
    const model = context.model ?? context.agent.defaultModel;

    if (!context.agent.supportedProviders.includes(provider)) {
      errors.push({
        field: "provider",
        message: `Provider "${provider}" is not supported by agent "${context.agent.id}"`,
      });
    }
    if (!context.agent.supportedModels.includes(model)) {
      errors.push({
        field: "model",
        message: `Model "${model}" is not supported by agent "${context.agent.id}"`,
      });
    }
  }

  private async validatePolicy(
    context: AgentRuntimeContext,
    errors: ValidationError[],
  ): Promise<void> {
    const policyContext: AiPolicyContext = {
      organizationId: context.organizationId,
      workspaceId: context.workspaceId,
      userId: context.userId,
      provider: context.provider ?? context.agent.defaultProvider,
      model: context.model ?? context.agent.defaultModel,
      requestedCapabilities: {},
      metadata: { ...context.metadata, agentId: context.agent.id },
    };

    const policyResult = await this.policyEngine.evaluate(policyContext);

    if (!policyResult.allowed) {
      for (const violation of policyResult.violations) {
        if (violation.severity === "error") {
          errors.push({
            field: "policy",
            message: `Policy violation: ${violation.reason}`,
          });
        }
      }
    }
  }
}
