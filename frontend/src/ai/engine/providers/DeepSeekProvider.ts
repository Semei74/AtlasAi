import { AIProvider } from './AIProvider';
import type {
  ProviderCapabilities,
  ProviderConfig,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderHealth,
} from './types';

export class DeepSeekProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super('deepseek', 'DeepSeek', {
      baseUrl: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-chat',
      timeout: 60000,
      maxRetries: 3,
      ...config,
    });
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      streaming: true,
      vision: false,
      tools: false,
      jsonMode: true,
      functionCalling: false,
      embeddings: false,
      audio: false,
      imageGeneration: false,
      maxContextWindow: 128000,
      maxOutputTokens: 8192,
      supportedModels: ['deepseek-chat', 'deepseek-coder'],
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
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          top_p: request.topP,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const latency = Date.now() - start;
      const choice = data.choices?.[0];
      const usage = data.usage;

      this.recordRequest(latency, (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0), 0, false);

      return {
        id: data.id,
        model: data.model,
        provider: this.id,
        content: choice?.message?.content ?? '',
        finishReason: choice?.finish_reason ?? 'stop',
        usage: {
          promptTokens: usage?.prompt_tokens ?? 0,
          completionTokens: usage?.completion_tokens ?? 0,
          totalTokens: (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0),
          estimatedCost: 0,
        },
        latency,
      };
    } catch (err) {
      this.recordRequest(Date.now() - start, 0, 0, true);
      throw err;
    }
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const start = Date.now();
    let fullContent = '';

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: true,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `DeepSeek stream error: ${response.status}`);
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
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            this.recordRequest(Date.now() - start, fullContent.split(/\s+/).filter(Boolean).length, 0, false);
            yield { type: 'done', finishReason: 'stop' };
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              yield { type: 'delta', content };
            }
            if (parsed.choices?.[0]?.finish_reason) {
              this.recordRequest(Date.now() - start, fullContent.split(/\s+/).filter(Boolean).length, 0, false);
              yield { type: 'done', finishReason: parsed.choices[0].finish_reason };
              return;
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      this.recordRequest(Date.now() - start, 0, 0, true);
      yield { type: 'error', error: err instanceof Error ? err.message : 'DeepSeek stream error' };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
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
}
