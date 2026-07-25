import type { ModelCapabilities } from "../../model-registry/interfaces/model-capabilities.interface.js";

export const MODEL_ROUTER = "MODEL_ROUTER";

export type RoutingStrategy = "cost" | "latency" | "capability" | "balanced";

export interface ModelRoutingRequest {
  readonly model?: string;
  readonly requiredCapabilities?: Readonly<Partial<ModelCapabilities>>;
  readonly minContextWindow?: number;
}

export interface RoutingPreferences {
  readonly strategy?: RoutingStrategy;
  readonly allowedProviders?: readonly string[];
  readonly allowedModels?: readonly string[];
  readonly preferredProvider?: string;
}

export interface ModelRoutingDecision {
  readonly provider: string;
  readonly model: string;
  readonly score: number;
  readonly reason: string;
}

export interface ModelRouter {
  route(request: ModelRoutingRequest, preferences?: RoutingPreferences): Promise<ModelRoutingDecision>;
}

export const ROUTING_STRATEGIES: readonly RoutingStrategy[] = ["cost", "latency", "capability", "balanced"];
