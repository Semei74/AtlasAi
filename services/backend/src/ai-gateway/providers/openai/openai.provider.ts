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

export const PROVIDER_OPENAI = "PROVIDER_OPENAI";

interface OpenAiChoice {
  message: { role: string; content: string };
  finish_reason: "stop" | "length";
}

interface OpenAiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAiChatResponse {
  id: string;
  model: string;
  choices: OpenAiChoice[];
  usage: OpenAiUsage;
}

@Injectable()
export class OpenaiProvider implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "openai",
    version: "1.0.0",
    description: "OpenAI provider — real API integration",
  };

  public readonly capabilities: ProviderCapabilities = {
    chat: true,
    streaming: true,
    functionCalling: false,
    embeddings: true,
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
    supportedModels: [
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "gpt-4o",
      "gpt-4o-mini",
      "o3",
      "o4-mini",
    ],
  };

  public readonly configuration: ProviderConfiguration = {
    baseUrl: "https://api.openai.com/v1",
    timeout: 30000,
    maxRetries: 3,
  };

  public constructor() {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (apiKey) {
      this.configure({ apiKey });
    }
  }

  public async chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    const startTime = Date.now();
    const key = this.configuration.apiKey;

    if (key === undefined) {
      return { success: false, latency: 0, error: { code: "NO_API_KEY", message: "OpenAI API key not configured", statusCode: 502, provider: "openai" } };
    }

    try {
      const maxRetries = this.configuration.maxRetries;
      const baseUrl = this.configuration.baseUrl ?? "https://api.openai.com/v1";

      const body: Record<string, unknown> = {
        model: request.model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: false,
      };

      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((r) => { setTimeout(r, 1000 * attempt); });
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => { controller.abort(); }, this.configuration.timeout);

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key ?? ""}`,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            const msg = `OpenAI API error ${String(response.status)}: ${errorBody}`;
            throw new AiProviderError(msg);
          }

          const data = (await response.json()) as OpenAiChatResponse;

          const promptTokens = data.usage?.prompt_tokens ?? 0;
          const completionTokens = data.usage?.completion_tokens ?? 0;

          return {
            success: true,
            latency: Date.now() - startTime,
            data: {
              id: data.id,
              model: data.model,
              content: data.choices[0]?.message?.content ?? "",
              finishReason: data.choices[0]?.finish_reason === "length" ? "length" : "stop",
              usage: {
                promptTokens,
                completionTokens,
                totalTokens: data.usage?.total_tokens ?? (promptTokens + completionTokens),
              },
            },
          };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (attempt < maxRetries) {
            continue;
          }
          break;
        }
      }

      return {
        success: false,
        latency: Date.now() - startTime,
        error: {
          code: "PROVIDER_ERROR",
          message: lastError?.message ?? "OpenAI API error",
          statusCode: 502,
          provider: "openai",
        },
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: {
          code: "PROVIDER_ERROR",
          message: error instanceof Error ? error.message : "Unknown OpenAI error",
          statusCode: 502,
          provider: "openai",
        },
      };
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
      const baseUrl = this.configuration.baseUrl ?? "https://api.openai.com/v1";

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
      return {
        status: "unhealthy",
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        message: "Cannot reach OpenAI API",
      };
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
