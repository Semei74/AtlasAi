import { AIProvider } from './AIProvider';
import type {
  ProviderCapabilities,
  ProviderConfig,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderHealth,
} from './types';

export class OpenAIProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super('openai', 'OpenAI', {
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o',
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
      embeddings: true,
      audio: false,
      imageGeneration: true,
      maxContextWindow: 128000,
      maxOutputTokens: 16384,
      supportedModels: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
        'o1',
        'o1-mini',
        'o3-mini',
      ],
    };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...this.config.extraHeaders,
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.name ? { name: m.name } : {}),
            ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
            ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
          })),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          top_p: request.topP,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
          stop: request.stop,
          ...(request.tools ? { tools: request.tools } : {}),
          ...(request.toolChoice ? { tool_choice: request.toolChoice } : {}),
          ...(request.responseFormat
            ? { response_format: request.responseFormat }
            : {}),
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(err.error?.message ?? `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const usage = data.usage;

      const latency = Date.now() - start;
      const promptTokens = usage?.prompt_tokens ?? 0;
      const completionTokens = usage?.completion_tokens ?? 0;
      const cost = this.calculateCost(request.model, promptTokens, completionTokens);

      this.recordRequest(latency, promptTokens + completionTokens, cost, false);

      return {
        id: data.id,
        model: data.model,
        provider: this.id,
        content: choice?.message?.content ?? '',
        finishReason: choice?.finish_reason ?? 'stop',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          estimatedCost: cost,
        },
        latency,
        toolCalls: choice?.message?.tool_calls?.map((tc: any) => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.function.name, arguments: tc.function.arguments },
        })),
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
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...this.config.extraHeaders,
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          top_p: request.topP,
          stream: true,
          ...(request.tools ? { tools: request.tools } : {}),
          ...(request.toolChoice ? { tool_choice: request.toolChoice } : {}),
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(err.error?.message ?? `OpenAI stream error: ${response.status}`);
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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            const latency = Date.now() - start;
            const cost = this.calculateCost(request.model, promptTokens, completionTokens);
            this.recordRequest(latency, promptTokens + completionTokens, cost, false);
            yield {
              type: 'done',
              finishReason: 'stop',
              usage: {
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
                estimatedCost: cost,
              },
              latency,
            };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            const finishReason = parsed.choices?.[0]?.finish_reason;

            if (delta?.content) {
              fullContent += delta.content;
              completionTokens++;
              yield { type: 'delta', content: delta.content };
            }

            if (finishReason) {
              const latency = Date.now() - start;
              const usage = parsed.usage;
              promptTokens = usage?.prompt_tokens ?? 0;
              completionTokens = usage?.completion_tokens ?? completionTokens;
              const cost = this.calculateCost(request.model, promptTokens, completionTokens);
              this.recordRequest(latency, promptTokens + completionTokens, cost, false);
              yield {
                type: 'done',
                finishReason,
                usage: {
                  promptTokens,
                  completionTokens,
                  totalTokens: promptTokens + completionTokens,
                  estimatedCost: cost,
                },
                latency,
              };
              return;
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      const latency = Date.now() - start;
      this.recordRequest(latency, 0, 0, true);
      yield {
        type: 'error',
        error: err instanceof Error ? err.message : 'OpenAI stream error',
      };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      const data = await response.json();
      return {
        status: response.ok ? 'available' : 'error',
        latency: Date.now() - start,
        lastChecked: new Date().toISOString(),
        models: data.data?.map((m: any) => m.id) ?? [],
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

  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
      'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
      'gpt-4-turbo': { input: 10 / 1_000_000, output: 30 / 1_000_000 },
      'gpt-3.5-turbo': { input: 0.5 / 1_000_000, output: 1.5 / 1_000_000 },
    };
    const p = pricing[model] ?? pricing['gpt-4o'];
    return promptTokens * p.input + completionTokens * p.output;
  }
}
