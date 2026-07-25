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

export const PROVIDER_OPENROUTER = "PROVIDER_OPENROUTER";

interface ChatChoice {
  message: { role: string; content: string };
  finish_reason: "stop" | "length";
}

interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface ChatResponse {
  id: string;
  model: string;
  choices: ChatChoice[];
  usage: ChatUsage;
}



@Injectable()
export class OpenrouterProvider implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "openrouter",
    version: "1.0.0",
    description: "OpenRouter provider — real API integration via OpenAI-compatible API",
  };

  public readonly capabilities: ProviderCapabilities = {
    chat: true,
    streaming: true,
    functionCalling: false,
    embeddings: false,
    imageGeneration: false,
    audioTranscription: false,
    toolCalling: false,
    audioGeneration: false,
    moderation: false,
    reasoning: false,
    mcp: false,
    rag: false,
    promptTemplates: false,
    conversationMemory: false,
    maxModels: 0,
    supportedModels: ["openrouter/auto", "anthropic/claude-sonnet-4", "openai/gpt-4o"],
  };

  public readonly configuration: ProviderConfiguration = {

    baseUrl: "https://openrouter.ai/api/v1",
    timeout: 30000,
    maxRetries: 3,
  };

  public constructor() {
    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (apiKey) {
      this.configure({ apiKey });
    }
  }

  public async chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    const startTime = Date.now();
    const key = this.configuration.apiKey;
    if (key === undefined) {
      return { success: false, latency: 0, error: { code: "NO_API_KEY", message: "OpenRouter API key not configured", statusCode: 502, provider: "openrouter" } };
    }
    try {
      const maxRetries = this.configuration.maxRetries;
      const baseUrl = this.configuration.baseUrl ?? "https://openrouter.ai/api/v1";
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
            throw new AiProviderError(`OpenRouter API error ${String(response.status)}: ${errorBody}`);
          }
          const data = (await response.json()) as ChatResponse;
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
      return { success: false, latency: Date.now() - startTime, error: { code: "PROVIDER_ERROR", message: lastError?.message ?? "OpenRouter API error", statusCode: 502, provider: "openrouter" } };
    } catch (error) {
      return { success: false, latency: Date.now() - startTime, error: { code: "PROVIDER_ERROR", message: error instanceof Error ? error.message : "Unknown OpenRouter error", statusCode: 502, provider: "openrouter" } };
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
      const baseUrl = this.configuration.baseUrl ?? "https://openrouter.ai/api/v1";
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
      return { status: "unhealthy", latency: Date.now() - startTime, lastChecked: new Date(), message: "Cannot reach OpenRouter API" };
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
