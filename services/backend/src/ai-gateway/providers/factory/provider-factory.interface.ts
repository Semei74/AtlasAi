import type { AiProvider } from "../interfaces/ai-provider.interface.js";

export const PROVIDER_FACTORY = "PROVIDER_FACTORY";

export interface ProviderFactory {
  create(name: string): AiProvider;
  supports(name: string): boolean;
}
