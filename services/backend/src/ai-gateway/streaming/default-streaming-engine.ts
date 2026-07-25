import { AiProviderError } from "@atlas/errors";
import { Injectable, Inject } from "@nestjs/common";
import { PROVIDER_RESOLVER } from "../providers/resolver/provider-resolver.interface.js";
import type { ProviderResolver } from "../providers/resolver/provider-resolver.interface.js";
import type { AiProvider } from "../providers/interfaces/ai-provider.interface.js";
import type { ProviderChatRequest } from "../providers/interfaces/provider-request.interface.js";
import type { ProviderChatResponse } from "../providers/interfaces/provider-response.interface.js";
import type { StreamingEngine } from "./interfaces/streaming-engine.interface.js";
import type { StreamingChunk } from "./interfaces/streaming-chunk.interface.js";
import type { StreamingRequest } from "./interfaces/streaming-request.interface.js";
import type { StreamingOptions } from "./interfaces/streaming-options.interface.js";

@Injectable()
export class DefaultStreamingEngine implements StreamingEngine {
  private readonly defaultChunkSize = 16;

  public constructor(
    @Inject(PROVIDER_RESOLVER) private readonly resolver: ProviderResolver,
  ) {}

  public async *stream(request: StreamingRequest, options: StreamingOptions = {}): AsyncIterable<StreamingChunk> {
    try {
      this.#throwIfAborted(options.signal);

      const provider = this.resolver.resolve(request.provider);
      const providerRequest: ProviderChatRequest = {
        model: request.model,
        messages: request.messages,
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(request.maxTokens !== undefined ? { maxTokens: request.maxTokens } : {}),
        stream: true,
      };

      const startTime = Date.now();
      const retry = options.retry ?? { attempts: 1, backoffMs: 0 };

      const response = await this.#withTimeout(
        this.#withRetry(() => this.#callChat(provider, providerRequest, options.signal), retry),
        options.timeoutMs,
        options.signal,
      );

      yield* this.#emitBuffered(response, startTime, options.signal, options.chunkSize ?? this.defaultChunkSize);
    } catch (error: unknown) {
      yield { type: "error", error: this.#errorMessage(error) };
    }
  }

  *#emitBuffered(
    response: ProviderChatResponse,
    startTime: number,
    signal: AbortSignal | undefined,
    chunkSize: number,
  ): Iterable<StreamingChunk> {
    const content = response.content;

    for (let offset = 0; offset < content.length; offset += chunkSize) {
      this.#throwIfAborted(signal);
      yield { type: "delta", content: content.slice(offset, offset + chunkSize) };
      this.#throwIfAborted(signal);
    }

    yield {
      type: "done",
      finishReason: response.finishReason,
      usage: {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        estimatedCost: 0,
      },
      latency: Date.now() - startTime,
    };
  }

  async #callChat(
    provider: AiProvider,
    providerRequest: ProviderChatRequest,
    signal: AbortSignal | undefined,
  ): Promise<ProviderChatResponse> {
    this.#throwIfAborted(signal);
    const result = await provider.chat(providerRequest);

    if (!result.success) {
      throw new AiProviderError(result.error.message);
    }

    return result.data;
  }

  async #withRetry<T>(fn: () => Promise<T>, retry: { readonly attempts: number; readonly backoffMs: number }): Promise<T> {
    const attempts = Math.max(1, retry.attempts);
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;

        if (attempt < attempts - 1) {
          await this.#delay(retry.backoffMs * 2 ** attempt);
        }
      }
    }

    throw lastError;
  }

  async #withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number | undefined,
    signal: AbortSignal | undefined,
  ): Promise<T> {
    if (timeoutMs === undefined || timeoutMs <= 0) {
      return promise;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new AiProviderError("Streaming request timed out"));
      }, timeoutMs);

      if (signal !== undefined) {
        signal.addEventListener(
          "abort",
          () => {
            if (timer !== undefined) {
              clearTimeout(timer);
            }
            reject(new AiProviderError("Streaming request aborted"));
          },
          { once: true },
        );
      }
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }

  #throwIfAborted(signal: AbortSignal | undefined): void {
    if (signal?.aborted === true) {
      throw new AiProviderError("Streaming request aborted");
    }
  }

  #delay(ms: number): Promise<void> {
    if (ms <= 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  #errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Streaming failed";
  }
}
