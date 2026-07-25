import type { ModelInfo } from "./model-info.interface.js";
import type { ModelCapabilities } from "./model-capabilities.interface.js";

export const MODEL_REGISTRY = "MODEL_REGISTRY";

export interface ModelRegistry {
  register(info: ModelInfo): void;
  registerMany(infos: ModelInfo[]): void;
  get(provider: string, modelId: string): ModelInfo | null;
  has(provider: string, modelId: string): boolean;
  remove(provider: string, modelId: string): boolean;
  list(): readonly ModelInfo[];
  listByProvider(provider: string): readonly ModelInfo[];
  findByCapability(capability: Partial<ModelCapabilities>): readonly ModelInfo[];
  findEnabled(): readonly ModelInfo[];
  findDeprecated(): readonly ModelInfo[];
  clear(): void;
}
