import type { ProviderMetadata } from "./provider-metadata.interface.js";
import type { ProviderCapabilities } from "./provider-capabilities.interface.js";
import type { ProviderConfiguration } from "./provider-configuration.interface.js";
import type { ProviderChatRequest } from "./provider-request.interface.js";
import type { ProviderChatResponse } from "./provider-response.interface.js";
import type { ProviderResult } from "./provider-result.interface.js";
import type { ProviderHealth } from "./provider-health.interface.js";

export interface AiProvider {
  readonly metadata: ProviderMetadata;
  readonly capabilities: ProviderCapabilities;
  readonly configuration: ProviderConfiguration;

  chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>>;
  health(): Promise<ProviderHealth>;
  configure(config: Partial<ProviderConfiguration>): void;
}
