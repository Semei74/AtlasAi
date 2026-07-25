import { describe, it, expect } from "vitest";
import { DefaultStreamingEngine } from "./default-streaming-engine.js";
import type { StreamingChunk } from "./interfaces/streaming-chunk.interface.js";
import type { StreamingRequest } from "./interfaces/streaming-request.interface.js";
import type { ProviderResolver } from "../providers/resolver/provider-resolver.interface.js";
import type { AiProvider } from "../providers/interfaces/ai-provider.interface.js";
import type { ProviderResult } from "../providers/interfaces/provider-result.interface.js";
import type { ProviderChatRequest } from "../providers/interfaces/provider-request.interface.js";
import type { ProviderChatResponse } from "../providers/interfaces/provider-response.interface.js";
import type { ProviderHealth } from "../providers/interfaces/provider-health.interface.js";

const METADATA = { name: "test", version: "1.0.0", description: "" } as const;

const CAPABILITIES = {
  chat: true,
  streaming: true,
  functionCalling: false,
  toolCalling: false,
  embeddings: false,
  imageGeneration: false,
  audioGeneration: false,
  audioTranscription: false,
  moderation: false,
  reasoning: false,
  mcp: false,
  rag: false,
  promptTemplates: false,
  conversationMemory: false,
  maxModels: 100,
  supportedModels: ["m1"],
} as const;

const CONFIGURATION = { apiKey: "x", baseUrl: "x", timeout: 30000, maxRetries: 3 } as const;

class OkProvider implements AiProvider {
  public readonly metadata = METADATA;
  public readonly capabilities = CAPABILITIES;
  public configuration = CONFIGURATION;

  public constructor(private readonly content = "Hello world, this is streaming.") {}

  public chat(_request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    return Promise.resolve({
      success: true,
      latency: 1,
      data: {
        id: "r1",
        model: "m1",
        content: this.content,
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      },
    });
  }

  public health(): Promise<ProviderHealth> {
    return Promise.resolve({ status: "healthy", latency: 1, lastChecked: new Date() });
  }

  public configure(): void {
    return;
  }

  public async initialize(): Promise<void> {
    await Promise.resolve();
  }
}

class FailProvider implements AiProvider {
  public readonly metadata = METADATA;
  public readonly capabilities = CAPABILITIES;
  public configuration = CONFIGURATION;

  public chat(_request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    return Promise.resolve({
      success: false,
      latency: 1,
      error: { code: "UPSTREAM", message: "boom", statusCode: 502 },
    });
  }

  public health(): Promise<ProviderHealth> {
    return Promise.resolve({ status: "healthy", latency: 1, lastChecked: new Date() });
  }

  public configure(): void {
    return;
  }

  public async initialize(): Promise<void> {
    await Promise.resolve();
  }
}

class HangProvider implements AiProvider {
  public readonly metadata = METADATA;
  public readonly capabilities = CAPABILITIES;
  public configuration = CONFIGURATION;

  public chat(_request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    return new Promise<ProviderResult<ProviderChatResponse>>(() => {
      return;
    });
  }

  public health(): Promise<ProviderHealth> {
    return Promise.resolve({ status: "healthy", latency: 1, lastChecked: new Date() });
  }

  public configure(): void {
    return;
  }

  public async initialize(): Promise<void> {
    await Promise.resolve();
  }
}

class RetryProvider implements AiProvider {
  public readonly metadata = METADATA;
  public readonly capabilities = CAPABILITIES;
  public configuration = CONFIGURATION;
  private attempts = 0;

  public constructor(private readonly succeedAfter: number) {}

  public chat(_request: ProviderChatRequest): Promise<ProviderResult<ProviderChatResponse>> {
    this.attempts += 1;

    if (this.attempts < this.succeedAfter) {
      return Promise.resolve({
        success: false,
        latency: 1,
        error: { code: "TEMP", message: "retry", statusCode: 503 },
      });
    }

    return Promise.resolve({
      success: true,
      latency: 1,
      data: {
        id: "r",
        model: "m1",
        content: "recovered",
        finishReason: "stop",
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      },
    });
  }

  public health(): Promise<ProviderHealth> {
    return Promise.resolve({ status: "healthy", latency: 1, lastChecked: new Date() });
  }

  public configure(): void {
    return;
  }

  public async initialize(): Promise<void> {
    await Promise.resolve();
  }
}

function makeEngine(provider: AiProvider): DefaultStreamingEngine {
  const resolver = { resolve: (): AiProvider => provider } as unknown as ProviderResolver;
  return new DefaultStreamingEngine(resolver);
}

async function collect(
  engine: DefaultStreamingEngine,
  request: StreamingRequest,
  options?: { signal?: AbortSignal; timeoutMs?: number; retry?: { attempts: number; backoffMs: number }; chunkSize?: number },
): Promise<StreamingChunk[]> {
  const chunks: StreamingChunk[] = [];

  for await (const chunk of engine.stream(request, options)) {
    chunks.push(chunk);
  }

  return chunks;
}

const baseRequest: StreamingRequest = {
  provider: "test",
  model: "m1",
  messages: [{ role: "user", content: "hi" }],
};

const isDelta = (c: StreamingChunk): c is Extract<StreamingChunk, { type: "delta" }> => c.type === "delta";
const isDone = (c: StreamingChunk): c is Extract<StreamingChunk, { type: "done" }> => c.type === "done";
const isError = (c: StreamingChunk): c is Extract<StreamingChunk, { type: "error" }> => c.type === "error";

describe("DefaultStreamingEngine", () => {
  it("should emit incremental delta chunks for a buffered provider", async () => {
    const engine = makeEngine(new OkProvider("Hello world, this is streaming."));

    const chunks = await collect(engine, baseRequest, { chunkSize: 5 });
    const joined = chunks.filter(isDelta).map((d) => d.content).join("");
    const last = chunks.at(-1);

    expect(joined).toBe("Hello world, this is streaming.");
    expect(last !== undefined && isDone(last)).toBe(true);
  });

  it("should include usage in the final done chunk", async () => {
    const engine = makeEngine(new OkProvider("payload"));

    const chunks = await collect(engine, baseRequest);
    const done = chunks.find(isDone);

    expect(done).toBeDefined();
    expect(done?.usage).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30, estimatedCost: 0 });
    expect(done?.latency).toBeGreaterThanOrEqual(0);
  });

  it("should yield an error chunk when the provider returns a failure result", async () => {
    const engine = makeEngine(new FailProvider());

    const chunks = await collect(engine, baseRequest);
    const error = chunks.find(isError);

    expect(chunks.length).toBe(1);
    expect(error).toBeDefined();
    expect(error?.error).toBe("boom");
  });

  it("should honor an already-aborted signal", async () => {
    const engine = makeEngine(new OkProvider("should not stream"));
    const controller = new AbortController();
    controller.abort();

    const chunks = await collect(engine, baseRequest, { signal: controller.signal });

    expect(chunks.length).toBe(1);
    expect(chunks.find(isError)).toBeDefined();
  });

  it("should abort mid-stream for a buffered provider", async () => {
    const engine = makeEngine(new OkProvider("one two three"));
    const controller = new AbortController();

    const chunks: StreamingChunk[] = [];
    for await (const chunk of engine.stream(baseRequest, { signal: controller.signal })) {
      chunks.push(chunk);
      if (chunk.type === "delta") {
        controller.abort();
      }
    }

    expect(chunks.filter(isDelta).length).toBeGreaterThanOrEqual(1);
    const last = chunks.at(-1);
    expect(last !== undefined && isError(last)).toBe(true);
  });

  it("should yield an error chunk on timeout", async () => {
    const engine = makeEngine(new HangProvider());

    const chunks = await collect(engine, baseRequest, { timeoutMs: 10 });
    const error = chunks.find(isError);

    expect(error).toBeDefined();
    expect(error?.error).toBe("Streaming request timed out");
  });

  it("should retry and succeed after transient failures", async () => {
    const engine = makeEngine(new RetryProvider(3));

    const chunks = await collect(engine, baseRequest, { retry: { attempts: 3, backoffMs: 1 } });
    const last = chunks.at(-1);

    expect(last !== undefined && isDone(last)).toBe(true);
  });

  it("should split content into the requested chunk size", async () => {
    const engine = makeEngine(new OkProvider("abcdef"));

    const chunks = await collect(engine, baseRequest, { chunkSize: 1 });
    const deltas = chunks.filter(isDelta);

    expect(deltas.map((d) => d.content).join("")).toBe("abcdef");
    expect(deltas.length).toBe(6);
    expect(chunks.find(isDone)).toBeDefined();
  });
});
