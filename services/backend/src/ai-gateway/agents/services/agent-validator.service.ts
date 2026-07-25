import { Injectable } from "@nestjs/common";
import type { AgentDefinition } from "../interfaces/agent-definition.interface.js";
import type { AgentCapabilities } from "../interfaces/agent-capabilities.interface.js";
import type { AgentPolicy } from "../interfaces/agent-policy.interface.js";
import type { AgentContext } from "../interfaces/agent-context.interface.js";

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
}

@Injectable()
export class AgentValidatorService {
  public validateDefinition(definition: AgentDefinition): ValidationResult {
    const errors: ValidationError[] = [];

    if (!definition.id || definition.id.trim().length === 0) {
      errors.push({ field: "id", message: "Agent id is required" });
    }
    if (!definition.name || definition.name.trim().length === 0) {
      errors.push({ field: "name", message: "Agent name is required" });
    }
    if (!definition.version || definition.version.trim().length === 0) {
      errors.push({ field: "version", message: "Agent version is required" });
    }
    if (!definition.defaultModel || definition.defaultModel.trim().length === 0) {
      errors.push({ field: "defaultModel", message: "Default model is required" });
    }
    if (!definition.defaultProvider || definition.defaultProvider.trim().length === 0) {
      errors.push({ field: "defaultProvider", message: "Default provider is required" });
    }
    if (definition.maxConcurrency < 1) {
      errors.push({ field: "maxConcurrency", message: "maxConcurrency must be at least 1" });
    }
    if (definition.timeoutMs < 1) {
      errors.push({ field: "timeoutMs", message: "timeoutMs must be at least 1" });
    }
    if (definition.maxRetries < 0) {
      errors.push({ field: "maxRetries", message: "maxRetries must be >= 0" });
    }
    if (typeof definition.enabled !== "boolean") {
      errors.push({ field: "enabled", message: "enabled must be a boolean" });
    }

    const capabilityErrors = this.validateCapabilities(definition.capabilities);
    errors.push(...capabilityErrors.errors);

    return { valid: errors.length === 0, errors };
  }

  public validateCapabilities(capabilities: AgentCapabilities): ValidationResult {
    const errors: ValidationError[] = [];

    const capabilityKeys: readonly (keyof AgentCapabilities)[] = [
      "reasoning", "planning", "toolExecution", "fileAnalysis",
      "codeGeneration", "knowledgeRetrieval", "workflowExecution",
      "collaboration", "memory", "streaming",
    ];

    for (const key of capabilityKeys) {
      if (typeof capabilities[key] !== "boolean") {
        errors.push({ field: `capabilities.${key}`, message: `${key} must be a boolean` });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  public validatePolicy(policy: AgentPolicy): ValidationResult {
    const errors: ValidationError[] = [];

    if (!policy.agentId || policy.agentId.trim().length === 0) {
      errors.push({ field: "agentId", message: "Policy agentId is required" });
    }
    if (!policy.organizationId || policy.organizationId.trim().length === 0) {
      errors.push({ field: "organizationId", message: "Policy organizationId is required" });
    }
    if (policy.permissions.maxTokensPerExecution < 1) {
      errors.push({ field: "permissions.maxTokensPerExecution", message: "maxTokensPerExecution must be >= 1" });
    }
    if (policy.permissions.maxStepsPerExecution < 1) {
      errors.push({ field: "permissions.maxStepsPerExecution", message: "maxStepsPerExecution must be >= 1" });
    }
    if (typeof policy.enabled !== "boolean") {
      errors.push({ field: "enabled", message: "enabled must be a boolean" });
    }

    return { valid: errors.length === 0, errors };
  }

  public validateExecutionRequest(context: AgentContext): ValidationResult {
    const errors: ValidationError[] = [];

    if (!context.agentId) {
      errors.push({ field: "agentId", message: "Agent id is required in execution context" });
    }
    if (!context.userId) {
      errors.push({ field: "userId", message: "User id is required in execution context" });
    }
    if (!context.organizationId) {
      errors.push({ field: "organizationId", message: "Organization id is required in execution context" });
    }
    if (!context.requestId) {
      errors.push({ field: "requestId", message: "Request id is required in execution context" });
    }

    return { valid: errors.length === 0, errors };
  }
}
