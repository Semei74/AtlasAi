import { AIProvider } from './AIProvider';
import type {
  ProviderCapabilities,
  ProviderConfig,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderHealth,
} from './types';

export class GeminiProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super('gemini', 'Gemini', {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-pro',
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
      jsonMode: false,
      functionCalling: true,
      embeddings: true,
      audio: false,
      imageGeneration: false,
      maxContextWindow: 128000,
      maxOutputTokens: 8192,
      supportedModels: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
    };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    try {
      const contents = request.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = request.messages.find((m) => m.role === 'system');

      const response = await fetch(
        `${this.config.baseUrl}/models/${request.model || this.config.defaultModel}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction.content }] } } : {}),
            generationConfig: {
              temperature: request.temperature,
              maxOutputTokens: request.maxTokens,
              topP: request.topP,
              stopSequences: request.stop,
            },
          }),
          signal: AbortSignal.timeout(this.config.timeout),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(err.error?.message ?? `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const latency = Date.now() - start;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const usage = data.usageMetadata;

      const promptTokens = usage?.promptTokenCount ?? 0;
      const completionTokens = usage?.candidatesTokenCount ?? 0;
      const cost = this.calculateCost(request.model, promptTokens, completionTokens);

      this.recordRequest(latency, promptTokens + completionTokens, cost, false);

      return {
        id: `gemini-${Date.now()}`,
        model: request.model || this.config.defaultModel,
        provider: this.id,
        content: text,
        finishReason: data.candidates?.[0]?.finishReason ?? 'STOP',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
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
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const contents = request.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const response = await fetch(
        `${this.config.baseUrl}/models/${request.model || this.config.defaultModel}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: request.temperature,
              maxOutputTokens: request.maxTokens,
            },
          }),
          signal: AbortSignal.timeout(this.config.timeout),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(err.error?.message ?? `Gemini stream error: ${response.status}`);
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
            const latency = Date.now() - start;
            const cost = this.calculateCost(request.model, promptTokens, completionTokens);
            this.recordRequest(latency, promptTokens + completionTokens, cost, false);
            yield {
              type: 'done',
              finishReason: 'STOP',
              usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, estimatedCost: cost },
              latency,
            };
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullContent += text;
              completionTokens += text.split(/\s+/).filter(Boolean).length;
              yield { type: 'delta', content: text };
            }

            if (parsed.usageMetadata) {
              promptTokens = parsed.usageMetadata.promptTokenCount ?? 0;
            }

            if (parsed.candidates?.[0]?.finishReason) {
              const latency = Date.now() - start;
              const cost = this.calculateCost(request.model, promptTokens, completionTokens);
              this.recordRequest(latency, promptTokens + completionTokens, cost, false);
              yield {
                type: 'done',
                finishReason: parsed.candidates[0].finishReason,
                usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, estimatedCost: cost },
                latency,
              };
              return;
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      const latency = Date.now() - start;
      this.recordRequest(latency, 0, 0, true);
      yield { type: 'error', error: err instanceof Error ? err.message : 'Gemini stream error' };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(
        `${this.config.baseUrl}/models?key=${this.config.apiKey}`,
        { signal: AbortSignal.timeout(10000) },
      );
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
      'gemini-pro': { input: 0.125 / 1_000_000, output: 0.375 / 1_000_000 },
      'gemini-ultra': { input: 10 / 1_000_000, output: 30 / 1_000_000 },
    };
    const p = pricing[model] ?? pricing['gemini-pro'];
    return inputTokens * p.input + outputTokens * p.output;
  }
}
