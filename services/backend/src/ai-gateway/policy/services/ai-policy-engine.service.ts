import { Injectable, Inject } from "@nestjs/common";
import { ORGANIZATION_SETTINGS_REPOSITORY } from "../../../organization/interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettingsRepository } from "../../../organization/interfaces/organization-settings-repository.interface.js";
import { MODEL_REGISTRY } from "../../model-registry/interfaces/model-registry.interface.js";
import type { ModelRegistry } from "../../model-registry/interfaces/model-registry.interface.js";
import type { AiProviderSettings } from "../../../organization/interfaces/ai-provider-settings.interface.js";
import type { RegionalSettings } from "../../../organization/interfaces/regional-settings.interface.js";
import type { ModelCapabilities } from "../../model-registry/interfaces/model-capabilities.interface.js";
import type { AiPolicyEngine } from "../interfaces/ai-policy-engine.interface.js";
import type { AiPolicyContext } from "../interfaces/ai-policy-context.interface.js";
import type { AiPolicyResult } from "../interfaces/ai-policy-result.interface.js";
import type { AiPolicyViolation } from "../interfaces/ai-policy-violation.interface.js";

const RESTRICTED_REGIONS = ["RU", "BY", "KP", "IR", "CU", "SY"] as const;
const DATA_RESIDENCY_REGIONS = ["EU", "US", "RU"] as const;

@Injectable()
export class AiPolicyEngineService implements AiPolicyEngine {
  public constructor(
    @Inject(ORGANIZATION_SETTINGS_REPOSITORY)
    private readonly orgSettingsRepo: OrganizationSettingsRepository,
    @Inject(MODEL_REGISTRY)
    private readonly modelRegistry: ModelRegistry,
  ) {}

  public async evaluate(context: AiPolicyContext): Promise<AiPolicyResult> {
    const settings = context.settings ?? await this.orgSettingsRepo.findByOrganizationId(context.organizationId);

    if (settings === null) {
      return {
        allowed: false,
        violations: [
          {
            policy: "engine",
            code: "ORGANIZATION_NOT_CONFIGURED",
            reason: "Organization settings not configured",
            severity: "error",
          },
        ],
        evaluatedPolicies: [],
      };
    }

    const violations: AiPolicyViolation[] = [];

    this.evaluateProviderPolicy(settings.ai, context.provider, violations);
    this.evaluateModelPolicy(settings.ai, context.model, violations);
    this.evaluateModelRegistry(context.model, violations);
    this.evaluateCapabilityPolicy(settings.ai, context.requestedCapabilities, violations);
    this.evaluateRegionalPolicy(settings.regional, context.provider, violations);

    const allowed = violations.every((v) => v.severity !== "error");

    const evaluatedPolicies: string[] = ["provider", "model", "capability", "regional"];

    return { allowed, violations, evaluatedPolicies };
  }

  private evaluateProviderPolicy(
    ai: AiProviderSettings,
    provider: string,
    violations: AiPolicyViolation[],
  ): void {
    if (ai.blockedProviders.includes(provider)) {
      violations.push({
        policy: "provider",
        code: "PROVIDER_NOT_ALLOWED",
        reason: `Provider '${provider}' is blocked for this organization`,
        severity: "error",
      });
      return;
    }

    if (ai.enabledProviders.length > 0 && !ai.enabledProviders.includes(provider)) {
      violations.push({
        policy: "provider",
        code: "PROVIDER_NOT_ALLOWED",
        reason: `Provider '${provider}' is not allowed for this organization`,
        severity: "error",
      });
    }
  }

  private evaluateModelPolicy(
    ai: AiProviderSettings,
    model: string,
    violations: AiPolicyViolation[],
  ): void {
    if (ai.blockedModels.includes(model)) {
      violations.push({
        policy: "model",
        code: "MODEL_NOT_ALLOWED",
        reason: `Model '${model}' is blocked for this organization`,
        severity: "error",
      });
      return;
    }

    if (ai.allowedModels.length > 0 && !ai.allowedModels.includes(model)) {
      violations.push({
        policy: "model",
        code: "MODEL_NOT_ALLOWED",
        reason: `Model '${model}' is not allowed for this organization`,
        severity: "error",
      });
    }
  }

  private evaluateModelRegistry(
    model: string,
    violations: AiPolicyViolation[],
  ): void {
    const found = this.modelRegistry.list().some((m) => m.id === model);

    if (!found) {
      violations.push({
        policy: "model",
        code: "MODEL_UNKNOWN",
        reason: `Model '${model}' is not registered in the model registry`,
        severity: "warning",
      });
    }
  }

  private evaluateCapabilityPolicy(
    ai: AiProviderSettings,
    requested: Partial<ModelCapabilities>,
    violations: AiPolicyViolation[],
  ): void {
    const capabilityMap: Record<string, { setting: keyof AiProviderSettings; code: string }> = {
      streaming: { setting: "allowStreaming", code: "STREAMING_NOT_ALLOWED" },
      toolCalling: { setting: "allowTools", code: "TOOLS_NOT_ALLOWED" },
      embeddings: { setting: "allowEmbeddings", code: "EMBEDDINGS_NOT_ALLOWED" },
      imageGeneration: { setting: "allowImageGeneration", code: "IMAGE_NOT_ALLOWED" },
      audio: { setting: "allowAudioGeneration", code: "AUDIO_NOT_ALLOWED" },
    };

    for (const [capability, config] of Object.entries(capabilityMap)) {
      if (requested[capability as keyof ModelCapabilities] === true) {
        if (ai[config.setting] === false) {
          violations.push({
            policy: "capability",
            code: config.code,
            reason: `${capability} is not allowed for this organization`,
            severity: "error",
          });
        }
      }
    }
  }

  private evaluateRegionalPolicy(
    regional: RegionalSettings,
    provider: string,
    violations: AiPolicyViolation[],
  ): void {
    if (!("dataResidencyRegion" in regional)) {
      return;
    }

    const region: string = regional.dataResidencyRegion;

    if (region.trim() === "") {
      return;
    }

    if (provider === "ollama") {
      return;
    }

    const isRestrictedRegion = RESTRICTED_REGIONS.some(
      (r) => r === regional.legalRegion || r === regional.privacyRegion || r === region,
    );

    if (isRestrictedRegion) {
      violations.push({
        policy: "regional",
        code: "CLOUD_AI_RESTRICTED",
        reason: "Cloud AI providers are restricted in this region. Only local providers (ollama) are allowed.",
        severity: "error",
      });
      return;
    }

    const isValidRegion = (DATA_RESIDENCY_REGIONS as readonly string[]).includes(region);

    if (!isValidRegion) {
      violations.push({
        policy: "regional",
        code: "DATA_RESIDENCY_MISMATCH",
        reason: `Data residency region '${region}' is not recognized. Cloud AI processing not allowed.`,
        severity: "error",
      });
      return;
    }

    if (region === "RU") {
      violations.push({
        policy: "regional",
        code: "DATA_RESIDENCY_RESTRICTED",
        reason: `Data residency in Russia requires local processing. Cloud provider '${provider}' is not allowed.`,
        severity: "error",
      });
    }
  }
}
