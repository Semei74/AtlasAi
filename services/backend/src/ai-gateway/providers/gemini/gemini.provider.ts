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

export const PROVIDER_GEMINI = "PROVIDER_GEMINI";

interface GeminiContent {
  role?: "user" | "model";
  parts: { text: string }[];
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" | "OTHER";
}

interface GeminiUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata?: GeminiUsage;
}



@Injectable()
export class GeminiProvider implements AiProvider {
  public readonly metadata: ProviderMetadata = {
    name: "gemini",
    version: "1.0.0",
    description: "Google Gemini provider — real API integration via Gemini API",
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
      "gemini-2.5-pro",
      "gemini-2.5-flash",
    ],
  };

  public readonly configuration: ProviderConfiguration = {

    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    timeout: 30000,
    maxRetries: 3,
  };

  public constructor() {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (apiKey) {
      this.configure({ apiKey });
    }
  }

  public async chat(request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    const startTime = Date.now();
    const key = this.configuration.apiKey;

    if (key === undefined) {
      return { success: false, latency: 0, error: { code: "NO_API_KEY", message: "Gemini API key not configured", statusCode: 502, provider: "gemini" } };
    }

    try {
      const maxRetries = this.configuration.maxRetries;
      const baseUrl = this.configuration.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";

      const contents: GeminiContent[] = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: m.content }],
        }));

      const systemInstruction = request.messages
        .filter((m) => m.role === "system")
        .map((m) => m.content)
        .join("\n");

      const generationConfig: Record<string, unknown> = {};
      if (request.temperature !== undefined) {
        generationConfig["temperature"] = request.temperature;
      }
      if (request.maxTokens !== undefined) {
        generationConfig["maxOutputTokens"] = request.maxTokens;
      }

      const body: Record<string, unknown> = {
        contents,
        generationConfig,
      };
      if (systemInstruction) {
        body["systemInstruction"] = { parts: [{ text: systemInstruction }] };
      }

      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((r) => { setTimeout(r, 1000 * attempt); });
          }

          const url = `${baseUrl}/models/${request.model}:generateContent`;

          const controller = new AbortController();
          const timeout = setTimeout(() => { controller.abort(); }, this.configuration.timeout);

          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": key },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            const msg = `Gemini API error ${String(response.status)}: ${errorBody}`;
            throw new AiProviderError(msg);
          }

          const data = (await response.json()) as GeminiResponse;
          const usageMeta: GeminiUsage | undefined = data.usageMetadata;

          const candidate = data.candidates?.[0];
          const finishMap: Record<string, "stop" | "length" | "error"> = {
            STOP: "stop",
            MAX_TOKENS: "length",
          };

          const contentText = candidate?.content?.parts !== undefined
            ? candidate.content.parts.map((p) => p.text).join("")
            : "";

          return {
            success: true,
            latency: Date.now() - startTime,
            data: {
              id: `gemini-${String(startTime)}`,
              model: request.model,
              content: contentText,
              finishReason: candidate?.finishReason !== undefined ? (finishMap[candidate.finishReason] ?? "stop") : "stop",
              usage: {
                promptTokens: usageMeta?.promptTokenCount ?? 0,
                completionTokens: usageMeta?.candidatesTokenCount ?? 0,
                totalTokens: usageMeta?.totalTokenCount ?? 0,
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
          message: lastError?.message ?? "Gemini API error",
          statusCode: 502,
          provider: "gemini",
        },
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: {
          code: "PROVIDER_ERROR",
          message: error instanceof Error ? error.message : "Unknown Gemini error",
          statusCode: 502,
          provider: "gemini",
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
      const model = this.capabilities.supportedModels[0] ?? "gemini-2.5-flash";
      const key = this.configuration.apiKey ?? "";
      const baseUrl = this.configuration.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
      const url = `${baseUrl}/models/${model}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => { controller.abort(); }, 5000);

      const response = await fetch(url, { headers: { "x-goog-api-key": key }, signal: controller.signal });
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
        message: "Cannot reach Gemini API",
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
