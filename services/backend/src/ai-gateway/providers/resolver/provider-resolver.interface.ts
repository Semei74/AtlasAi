import type { AiProvider } from "../interfaces/ai-provider.interface.js";

export const PROVIDER_RESOLVER = "PROVIDER_RESOLVER";

export interface ProviderResolver {
  resolve(name: string): AiProvider;
}
