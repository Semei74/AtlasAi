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

export const PROVIDER_ANTHROPIC = "PROVIDER_ANTHROPIC";

interface AnthropicContent {
  type: "text";
  text: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
}

interface AnthropicResponse {
  id: string;
  model: string;
  type: "message";
  role: "assistant";
  content: AnthropicContent[];
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | null;
  usage?: AnthropicUsage;
}



@Injectable()
export class AnthropicProvider implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "anthropic",
    version: "1.0.0",
    description: "Anthropic provider — real API integration via Messages API",
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
    supportedModels: [
      "claude-sonnet-4",
      "claude-haiku-3.5",
      "claude-opus-4",
    ],
  };

  public readonly configuration: ProviderConfiguration = {

    baseUrl: "https://api.anthropic.com/v1",
    timeout: 60000,
    maxRetries: 3,
  };

  public constructor() {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (apiKey) {
      this.configure({ apiKey });
    }
  }

  public async chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    const startTime = Date.now();
    const key = this.configuration.apiKey;

    if (key === undefined) {
      return { success: false, latency: 0, error: { code: "NO_API_KEY", message: "Anthropic API key not configured", statusCode: 502, provider: "anthropic" } };
    }

    try {
      const systemMessages = request.messages.filter((m) => m.role === "system");
      const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

      const maxRetries = this.configuration.maxRetries;
      const baseUrl = this.configuration.baseUrl ?? "https://api.anthropic.com/v1";

      const body: Record<string, unknown> = {
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        messages: nonSystemMessages.map((m) => ({
          role: m.role,
          content: [{ type: "text" as const, text: m.content }],
        })),
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(systemMessages.length > 0 ? { system: systemMessages.map((m) => m.content).join("\n") } : {}),
      };

      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((r) => { setTimeout(r, 1000 * attempt); });
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => { controller.abort(); }, this.configuration.timeout);

          const response = await fetch(`${baseUrl}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": key ?? "",
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            const msg = `Anthropic API error ${String(response.status)}: ${errorBody}`;
            throw new AiProviderError(msg);
          }

          const data = (await response.json()) as AnthropicResponse;

          const promptTokens = data.usage?.input_tokens ?? 0;
          const completionTokens = data.usage?.output_tokens ?? 0;

          return {
            success: true,
            latency: Date.now() - startTime,
            data: {
              id: data.id,
              model: data.model,
              content: data.content.map((c) => c.text).join(""),
              finishReason: data.stop_reason === "max_tokens" ? "length" : "stop",
              usage: {
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
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
          message: lastError?.message ?? "Anthropic API error",
          statusCode: 502,
          provider: "anthropic",
        },
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: {
          code: "PROVIDER_ERROR",
          message: error instanceof Error ? error.message : "Unknown Anthropic error",
          statusCode: 502,
          provider: "anthropic",
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

      const model = this.capabilities.supportedModels[0] ?? "claude-sonnet-4";
      const baseUrl = this.configuration.baseUrl ?? "https://api.anthropic.com/v1";
      const healthKey = this.configuration.apiKey ?? "";

      const response = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": healthKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model, max_tokens: 1, messages: [{ role: "user" as const, content: [{ type: "text" as const, text: "ping" }] }] }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      return {
        status: response.ok ? "healthy" as const : "unhealthy" as const,
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        ...(response.ok ? {} : { message: `API returned status ${String(response.status)}` }),
      };
    } catch {
      return {
        status: "unhealthy",
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        message: "Cannot reach Anthropic API",
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
