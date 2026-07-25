import { Injectable, Inject } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";
import type { ProviderChatResponse } from "../interfaces/provider-response.interface.js";
import type { ProviderResult } from "../interfaces/provider-result.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderMetadata } from "../interfaces/provider-metadata.interface.js";
import type { ProviderCapabilities } from "../interfaces/provider-capabilities.interface.js";
import type { ProviderConfiguration } from "../interfaces/provider-configuration.interface.js";
import { OllamaClient } from "./ollama.client.js";

export const PROVIDER_OLLAMA = "PROVIDER_OLLAMA";

@Injectable()
export class OllamaProvider implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "ollama",
    version: "1.0.0",
    description: "Ollama provider — local LLM inference via Ollama API",
  };

  public readonly capabilities: ProviderCapabilities = {
    chat: true,
    streaming: true,
    functionCalling: false,
    embeddings: false,
    imageGeneration: false,
    audioTranscription: false,
    toolCalling: true,
    audioGeneration: false,
    moderation: false,
    reasoning: false,
    mcp: false,
    rag: false,
    promptTemplates: false,
    conversationMemory: false,
    maxModels: 0,
    supportedModels: [],
  };

  public readonly configuration: ProviderConfiguration = {
    baseUrl: (process.env as Record<string, string | undefined>)['OLLAMA_BASE_URL'] ?? "http://localhost:11434",
    timeout: 30000,
    maxRetries: 0,
  };

  public constructor(
    @Inject(OllamaClient) private readonly client: OllamaClient,
  ) {}

  public async chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: request.stream,
        options: {
          ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
          ...(request.maxTokens !== undefined ? { num_predict: request.maxTokens } : {}),
        },
      });

      return {
        success: true,
        latency: Date.now() - startTime,
        data: {
          id: response.created_at ?? randomUUID(),
          model: response.model,
          content: response.message.content,
          toolResult: response.parsedToolResult,
          finishReason: response.done ? "stop" : "error",
          usage: {
            promptTokens: response.prompt_eval_count ?? 0,
            completionTokens: response.eval_count ?? 0,
            totalTokens: (response.prompt_eval_count ?? 0) + (response.eval_count ?? 0),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: {
          code: "PROVIDER_ERROR",
          message: error instanceof Error ? error.message : "Unknown Ollama error",
          statusCode: 502,
          provider: "ollama",
        },
      };
    }
  }

  public async health(): Promise<ProviderHealth> {
    const startTime = Date.now();
    const isUp = await this.client.health();

    return {
      status: isUp ? "healthy" : "unhealthy",
      latency: Date.now() - startTime,
      lastChecked: new Date(),
      ...(isUp ? {} : { message: "Cannot reach Ollama server" }),
    };
  }

  public configure(config: Partial<ProviderConfiguration>): void {
    Object.assign(this.configuration, config);
  }

  private initialized = false;

  public initialize(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }

    this.initialized = true;

    return Promise.resolve();
  }
}
