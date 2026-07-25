import { Injectable } from "@nestjs/common";
import { AiProviderError } from "@atlas/errors";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";
import type { ProviderChatResponse } from "../interfaces/provider-response.interface.js";
import type { ProviderResult } from "../interfaces/provider-result.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderMetadata } from "../interfaces/provider-metadata.interface.js";
import type { ProviderCapabilities } from "../interfaces/provider-capabilities.interface.js";
import type { ProviderConfiguration } from "../interfaces/provider-configuration.interface.js";

export const PROVIDER_MISTRAL = "PROVIDER_MISTRAL";

interface MistralChoice {
  message: { role: string; content: string };
  finish_reason: "stop" | "length";
}

interface MistralUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface MistralResponse {
  id: string;
  model: string;
  choices: MistralChoice[];
  usage: MistralUsage;
}



@Injectable()
export class MistralProvider implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "mistral",
    version: "1.0.0",
    description: "Mistral AI provider — real API integration via OpenAI-compatible API",
  };

  public readonly capabilities: ProviderCapabilities = {
    chat: true,
    streaming: true,
    functionCalling: false,
    embeddings: true,
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
    supportedModels: ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
  };

  public readonly configuration: ProviderConfiguration = {

    baseUrl: "https://api.mistral.ai/v1",
    timeout: 30000,
    maxRetries: 3,
  };

  public constructor() {
    const apiKey = process.env["MISTRAL_API_KEY"];
    if (apiKey) {
      this.configure({ apiKey });
    }
  }

  public async chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    const startTime = Date.now();
    const key = this.configuration.apiKey;
    if (key === undefined) {
      return { success: false, latency: 0, error: { code: "NO_API_KEY", message: "Mistral API key not configured", statusCode: 502, provider: "mistral" } };
    }
    try {
      const maxRetries = this.configuration.maxRetries;
      const baseUrl = this.configuration.baseUrl ?? "https://api.mistral.ai/v1";
      const body = {
        model: request.model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: false,
      };
      let lastError: Error | undefined;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) { await new Promise((r) => { setTimeout(r, 1000 * attempt); }); }
          const controller = new AbortController();
          const timeout = setTimeout(() => { controller.abort(); }, this.configuration.timeout);
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            throw new AiProviderError(`Mistral API error ${String(response.status)}: ${errorBody}`);
          }
          const data = (await response.json()) as MistralResponse;
          return {
            success: true,
            latency: Date.now() - startTime,
            data: {
              id: data.id,
              model: data.model,
              content: data.choices[0]?.message?.content ?? "",
              finishReason: data.choices[0]?.finish_reason === "length" ? "length" : "stop",
              usage: {
                promptTokens: data.usage?.prompt_tokens ?? 0,
                completionTokens: data.usage?.completion_tokens ?? 0,
                totalTokens: data.usage?.total_tokens ?? 0,
              },
            },
          };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (attempt < maxRetries) { continue; }
          break;
        }
      }
      return { success: false, latency: Date.now() - startTime, error: { code: "PROVIDER_ERROR", message: lastError?.message ?? "Mistral API error", statusCode: 502, provider: "mistral" } };
    } catch (error) {
      return { success: false, latency: Date.now() - startTime, error: { code: "PROVIDER_ERROR", message: error instanceof Error ? error.message : "Unknown Mistral error", statusCode: 502, provider: "mistral" } };
    }
  }

  public async health(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.configuration.apiKey) {
      return { status: "unhealthy", latency: 0, lastChecked: new Date(), message: "No API key configured" };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => { controller.abort(); }, 5000);
      const key = this.configuration.apiKey ?? "";
      const baseUrl = this.configuration.baseUrl ?? "https://api.mistral.ai/v1";
      const response = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return {
        status: response.ok ? "healthy" : "unhealthy",
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        ...(response.ok ? {} : { message: `API returned status ${String(response.status)}` }),
      };
    } catch {
      return { status: "unhealthy", latency: Date.now() - startTime, lastChecked: new Date(), message: "Cannot reach Mistral API" };
    }
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
