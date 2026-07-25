import { AIProvider } from './AIProvider';
import type { ProviderId, ProviderConfig, ProviderHealth, ModelInfo } from './types';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { OllamaProvider } from './OllamaProvider';
import { OpenRouterProvider } from './OpenRouterProvider';

export class ProviderRegistry {
  private providers: Map<ProviderId, AIProvider> = new Map();
  private activeProviderId: ProviderId = 'openai';
  private listeners: Set<(providerId: ProviderId) => void> = new Set();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: ProviderId): void {
    this.providers.delete(providerId);
    if (this.activeProviderId === providerId) {
      const first = this.providers.keys().next().value;
      this.activeProviderId = first ?? 'openai';
    }
  }

  get(providerId: ProviderId): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  getActive(): AIProvider {
    const provider = this.providers.get(this.activeProviderId);
    if (!provider) throw new Error(`Active provider ${this.activeProviderId} not registered`);
    return provider;
  }

  setActive(providerId: ProviderId): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} not registered`);
    }
    this.activeProviderId = providerId;
    this.listeners.forEach((fn) => fn(providerId));
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getAllIds(): ProviderId[] {
    return Array.from(this.providers.keys());
  }

  getActiveId(): ProviderId {
    return this.activeProviderId;
  }

  has(providerId: ProviderId): boolean {
    return this.providers.has(providerId);
  }

  async checkAllHealth(): Promise<Record<ProviderId, ProviderHealth>> {
    const results: Record<string, ProviderHealth> = {};
    const checks = Array.from(this.providers.entries()).map(async ([id, provider]) => {
      try {
        results[id] = await provider.checkHealth();
      } catch {
        results[id] = {
          status: 'unavailable',
          latency: 0,
          lastChecked: new Date().toISOString(),
          error: 'Health check failed',
        };
      }
    });
    await Promise.allSettled(checks);
    return results;
  }

  getModels(): ModelInfo[] {
    const models: ModelInfo[] = [];
    this.providers.forEach((provider) => {
      const caps = provider.getCapabilities();
      caps.supportedModels.forEach((modelId) => {
        models.push({
          id: modelId,
          name: modelId,
          provider: provider.id,
          capabilities: caps,
          contextWindow: caps.maxContextWindow,
          maxTokens: caps.maxOutputTokens,
          pricing: { input: 0, output: 0, currency: 'USD' },
          streaming: caps.streaming,
        });
      });
    });
    return models;
  }

  getProviderCapabilities(providerId: ProviderId) {
    return this.providers.get(providerId)?.getCapabilities();
  }

  subscribe(listener: (providerId: ProviderId) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onProviderSwitched(listener: (providerId: ProviderId) => void): () => void {
    return this.subscribe(listener);
  }

  destroy(): void {
    this.providers.clear();
    this.listeners.clear();
  }
}

export function createDefaultRegistry(configs?: Partial<Record<ProviderId, Partial<ProviderConfig>>>): ProviderRegistry {
  const registry = new ProviderRegistry();

  registry.register(new OpenAIProvider({
    apiKey: configs?.openai?.apiKey ?? process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    ...configs?.openai,
  }));

  registry.register(new AnthropicProvider({
    apiKey: configs?.anthropic?.apiKey ?? process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    ...configs?.anthropic,
  }));

  registry.register(new GeminiProvider({
    apiKey: configs?.gemini?.apiKey ?? process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    ...configs?.gemini,
  }));

  registry.register(new DeepSeekProvider({
    apiKey: configs?.deepseek?.apiKey,
    ...configs?.deepseek,
  }));

  registry.register(new OllamaProvider(configs?.ollama));

  registry.register(new OpenRouterProvider({
    apiKey: configs?.openrouter?.apiKey,
    ...configs?.openrouter,
  }));

  return registry;
}
