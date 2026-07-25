import { AIProvider } from './AIProvider';
import type {
  ProviderCapabilities,
  ProviderConfig,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderHealth,
} from './types';

export class OllamaProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super('ollama', 'Ollama', {
      baseUrl: 'http://localhost:11434',
      defaultModel: 'llama3',
      timeout: 120000,
      maxRetries: 2,
      ...config,
    });
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      streaming: true,
      vision: false,
      tools: false,
      jsonMode: false,
      functionCalling: false,
      embeddings: true,
      audio: false,
      imageGeneration: false,
      maxContextWindow: 8192,
      maxOutputTokens: 4096,
      supportedModels: ['llama3', 'llama3.1', 'mistral', 'codellama', 'mixtral', 'phi'],
    };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: false,
          options: {
            temperature: request.temperature,
            top_p: request.topP,
            stop: request.stop,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const latency = Date.now() - start;
      const content = data.message?.content ?? '';

      this.recordRequest(latency, content.split(/\s+/).filter(Boolean).length, 0, false);

      return {
        id: `ollama-${data.created_at ?? Date.now()}`,
        model: data.model ?? request.model,
        provider: this.id,
        content,
        finishReason: data.done ? 'stop' : 'error',
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
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
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama stream error: ${response.status}`);
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
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content ?? parsed.response ?? '';
            if (content) {
              fullContent += content;
              yield { type: 'delta', content };
            }
            if (parsed.done) {
              this.recordRequest(Date.now() - start, fullContent.split(/\s+/).filter(Boolean).length, 0, false);
              yield { type: 'done', finishReason: 'stop' };
              return;
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      this.recordRequest(Date.now() - start, 0, 0, true);
      yield { type: 'error', error: err instanceof Error ? err.message : 'Ollama stream error' };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      const data = await response.json();
      return {
        status: response.ok ? 'available' : 'error',
        latency: Date.now() - start,
        lastChecked: new Date().toISOString(),
        models: data.models?.map((m: any) => m.name) ?? [],
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
