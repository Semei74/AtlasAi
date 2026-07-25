import { AIProvider } from './AIProvider';
import type {
  ProviderCapabilities,
  ProviderConfig,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderHealth,
} from './types';

export class AnthropicProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super('anthropic', 'Anthropic', {
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3.5-sonnet',
      timeout: 60000,
      maxRetries: 3,
      ...config,
    });
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      streaming: true,
      vision: true,
      tools: true,
      jsonMode: true,
      functionCalling: true,
      embeddings: false,
      audio: false,
      imageGeneration: false,
      maxContextWindow: 200000,
      maxOutputTokens: 8192,
      supportedModels: [
        'claude-3.5-sonnet',
        'claude-3.5-haiku',
        'claude-3-opus',
        'claude-3-sonnet',
        'claude-3-haiku',
      ],
    };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    try {
      const systemMsg = request.messages.find((m) => m.role === 'system');
      const otherMessages = request.messages.filter((m) => m.role !== 'system');

      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
          ...this.config.extraHeaders,
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: otherMessages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          ...(systemMsg ? { system: systemMsg.content } : {}),
          max_tokens: request.maxTokens ?? 4096,
          temperature: request.temperature,
          top_p: request.topP,
          stop_sequences: request.stop,
          ...(request.tools
            ? { tools: request.tools.map((t) => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters })) }
            : {}),
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(err.error?.message ?? `Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const latency = Date.now() - start;
      const content = data.content?.find((c: any) => c.type === 'text')?.text ?? '';
      const inputTokens = data.usage?.input_tokens ?? 0;
      const outputTokens = data.usage?.output_tokens ?? 0;
      const cost = this.calculateCost(request.model, inputTokens, outputTokens);

      this.recordRequest(latency, inputTokens + outputTokens, cost, false);

      return {
        id: data.id,
        model: data.model,
        provider: this.id,
        content,
        finishReason: data.stop_reason ?? 'end_turn',
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
          estimatedCost: cost,
        },
        latency,
      };
    } catch (err) {
      const latency = Date.now() - start;
      this.recordRequest(latency, 0, 0, true);
      throw err;
    }
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const start = Date.now();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const systemMsg = request.messages.find((m) => m.role === 'system');
      const otherMessages = request.messages.filter((m) => m.role !== 'system');

      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
          ...this.config.extraHeaders,
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: otherMessages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          ...(systemMsg ? { system: systemMsg.content } : {}),
          max_tokens: request.maxTokens ?? 4096,
          temperature: request.temperature,
          stream: true,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(err.error?.message ?? `Anthropic stream error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event: ')) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullContent += parsed.delta.text;
                outputTokens++;
                yield { type: 'delta', content: parsed.delta.text };
              }

              if (parsed.type === 'message_start' && parsed.message?.usage) {
                inputTokens = parsed.message.usage.input_tokens ?? 0;
              }

              if (parsed.type === 'message_delta') {
                outputTokens = parsed.usage?.output_tokens ?? outputTokens;
              }

              if (parsed.type === 'message_stop') {
                const latency = Date.now() - start;
                const cost = this.calculateCost(request.model, inputTokens, outputTokens);
                this.recordRequest(latency, inputTokens + outputTokens, cost, false);
                yield {
                  type: 'done',
                  finishReason: 'end_turn',
                  usage: {
                    promptTokens: inputTokens,
                    completionTokens: outputTokens,
                    totalTokens: inputTokens + outputTokens,
                    estimatedCost: cost,
                  },
                  latency,
                };
                return;
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (err) {
      const latency = Date.now() - start;
      this.recordRequest(latency, 0, 0, true);
      yield {
        type: 'error',
        error: err instanceof Error ? err.message : 'Anthropic stream error',
      };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        signal: AbortSignal.timeout(10000),
      });
      return {
        status: response.ok ? 'available' : 'error',
        latency: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'unavailable',
        latency: Date.now() - start,
        lastChecked: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Health check failed',
      };
    }
  }

  async testConnection(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status === 'available';
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3.5-sonnet': { input: 3 / 1_000_000, output: 15 / 1_000_000 },
      'claude-3.5-haiku': { input: 0.8 / 1_000_000, output: 4 / 1_000_000 },
      'claude-3-opus': { input: 15 / 1_000_000, output: 75 / 1_000_000 },
    };
    const p = pricing[model] ?? pricing['claude-3.5-sonnet'];
    return inputTokens * p.input + outputTokens * p.output;
  }
}
