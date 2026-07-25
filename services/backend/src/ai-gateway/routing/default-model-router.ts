import { Injectable, Inject, Logger } from "@nestjs/common";
import { MODEL_REGISTRY } from "../model-registry/interfaces/model-registry.interface.js";
import type { ModelRegistry } from "../model-registry/interfaces/model-registry.interface.js";
import type { ModelInfo } from "../model-registry/interfaces/model-info.interface.js";
import type { ModelCapabilities } from "../model-registry/interfaces/model-capabilities.interface.js";
import { PROVIDER_REGISTRY } from "../providers/registry/provider-registry.interface.js";
import type { ProviderRegistry } from "../providers/registry/provider-registry.interface.js";
import { HEALTH_MONITOR_SERVICE } from "../health-monitor/interfaces/health-monitor.interface.js";
import type { HealthMonitorService } from "../health-monitor/interfaces/health-monitor.interface.js";
import {
  type ModelRouter,
  type ModelRoutingDecision,
  type ModelRoutingRequest,
  type RoutingPreferences,
  type RoutingStrategy,
} from "./interfaces/model-router.interface.js";

interface ScoredCandidate {
  readonly model: ModelInfo;
  readonly score: number;
}

const CONTEXT_WINDOW_NORMALIZER = 1_000_000;
const LATENCY_NORMALIZER_MS = 1000;
const PREFERRED_PROVIDER_BONUS = 0.1;
const BALANCED_WEIGHTS = {
  cost: 0.4,
  capability: 0.2,
  context: 0.2,
  latency: 0.2,
} as const;

@Injectable()
export class DefaultModelRouter implements ModelRouter {
  private readonly logger = new Logger(DefaultModelRouter.name);

  public constructor(
    @Inject(MODEL_REGISTRY) private readonly modelRegistry: ModelRegistry,
    @Inject(PROVIDER_REGISTRY) private readonly providerRegistry: ProviderRegistry,
    @Inject(HEALTH_MONITOR_SERVICE) private readonly healthMonitor: HealthMonitorService,
  ) {}

  public route(request: ModelRoutingRequest, preferences: RoutingPreferences = {}): Promise<ModelRoutingDecision> {
    const strategy = preferences.strategy ?? "balanced";
    let candidates = this.modelRegistry.list().filter((model) => this.isSelectable(model));

    if (preferences.allowedModels && preferences.allowedModels.length > 0) {
      const allowed = new Set(preferences.allowedModels);
      candidates = candidates.filter((model) => allowed.has(model.id));
    }
    if (preferences.allowedProviders && preferences.allowedProviders.length > 0) {
      const allowed = new Set(preferences.allowedProviders);
      candidates = candidates.filter((model) => allowed.has(model.provider));
    }
    if (request.requiredCapabilities) {
      const required = request.requiredCapabilities;
      candidates = candidates.filter((model) => this.matchesCapabilities(model.capabilities, required));
    }
    if (request.minContextWindow !== undefined) {
      const minContextWindow = request.minContextWindow;
      candidates = candidates.filter((model) => model.limits.contextWindow >= minContextWindow);
    }

    if (candidates.length === 0) {
      return Promise.reject(new Error("No model satisfies the routing constraints"));
    }

    const scored = candidates.map((model): ScoredCandidate => ({
      model,
      score: this.score(model, strategy, preferences.preferredProvider),
    }));
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best) {
      return Promise.reject(new Error("No model selected"));
    }
    this.logger.debug(
      `Routed to ${best.model.provider}/${best.model.id} (score=${best.score.toFixed(3)}, strategy=${strategy}) from ${String(candidates.length)} candidate(s)`,
    );
    return Promise.resolve({
      provider: best.model.provider,
      model: best.model.id,
      score: best.score,
      reason: `Selected via ${strategy} strategy from ${String(candidates.length)} candidate(s)`,
    });
  }

  private isSelectable(model: ModelInfo): boolean {
    if (!model.enabled || model.deprecated) {
      return false;
    }
    return this.providerRegistry.isEnabled(model.provider) && this.healthMonitor.isAvailable(model.provider);
  }

  private matchesCapabilities(capabilities: ModelCapabilities, required: Readonly<Partial<ModelCapabilities>>): boolean {
    return (Object.keys(required) as readonly (keyof ModelCapabilities)[]).every((key) => capabilities[key]);
  }

  private score(model: ModelInfo, strategy: RoutingStrategy, preferredProvider?: string): number {
    const cost = model.pricing.inputPerToken + model.pricing.outputPerToken;
    const capabilityCount = Object.values(model.capabilities).filter((value): value is true => value === true).length;
    const context = model.limits.contextWindow;
    const latency = this.healthMonitor.getHealth(model.provider)?.latency ?? 0;

    const costScore = 1 / (1 + cost);
    const capabilityScore = capabilityCount / Object.keys(model.capabilities).length;
    const contextScore = Math.min(context / CONTEXT_WINDOW_NORMALIZER, 1);
    const latencyScore = latency > 0 ? 1 / (1 + latency / LATENCY_NORMALIZER_MS) : 0.5;

    let score: number;
    switch (strategy) {
      case "cost":
        score = costScore;
        break;
      case "latency":
        score = latencyScore;
        break;
      case "capability":
        score = capabilityScore;
        break;
      case "balanced":
      default:
        score =
          costScore * BALANCED_WEIGHTS.cost +
          capabilityScore * BALANCED_WEIGHTS.capability +
          contextScore * BALANCED_WEIGHTS.context +
          latencyScore * BALANCED_WEIGHTS.latency;
        break;
    }

    if (preferredProvider && model.provider === preferredProvider) {
      score += PREFERRED_PROVIDER_BONUS;
    }
    return score;
  }
}
