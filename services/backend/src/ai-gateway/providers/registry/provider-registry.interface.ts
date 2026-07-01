import type { AiProvider } from "../interfaces/ai-provider.interface.js";

export const PROVIDER_REGISTRY = "PROVIDER_REGISTRY";

export interface ProviderRegistry {
  register(name: string, provider: AiProvider): void;
  get(name: string): AiProvider | null;
  has(name: string): boolean;
  getAll(): ReadonlyMap<string, AiProvider>;
}
