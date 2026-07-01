import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";
import type { ProviderChatResponse } from "../interfaces/provider-response.interface.js";
import type { ProviderResult } from "../interfaces/provider-result.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderMetadata } from "../interfaces/provider-metadata.interface.js";
import type { ProviderCapabilities } from "../interfaces/provider-capabilities.interface.js";
import type { ProviderConfiguration } from "../interfaces/provider-configuration.interface.js";

export const PROVIDER_STUB = "PROVIDER_STUB";

@Injectable()
export class ProviderStub implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "stub",
    version: "1.0.0",
    description: "Stub AI provider for testing and development",
  };

  public readonly capabilities: ProviderCapabilities = {
    chat: true,
    streaming: false,
    functionCalling: false,
    embeddings: false,
    imageGeneration: false,
    audioTranscription: false,
    maxModels: Infinity,
    supportedModels: [],
  };

  public readonly configuration: ProviderConfiguration = {
    timeout: 30000,
    maxRetries: 0,
  };

  public chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    return Promise.resolve({
      success: true,
      latency: 0,
      data: {
        id: randomUUID(),
        model: request.model,
        content: "AI Gateway placeholder response.",
        finishReason: "stop",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      },
    });
  }

  public health(): Promise<ProviderHealth> {
    return Promise.resolve({
      status: "healthy",
      latency: 0,
      lastChecked: new Date(),
    });
  }

  public configure(config: Partial<ProviderConfiguration>): void {
    Object.assign(this.configuration, config);
  }
}
