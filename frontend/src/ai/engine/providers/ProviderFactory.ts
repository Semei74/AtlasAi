import { AIProvider } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { OllamaProvider } from './OllamaProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import type { ProviderId, ProviderConfig } from './types';

export class ProviderFactory {
  static create(providerId: ProviderId, config?: Partial<ProviderConfig>): AIProvider {
    const baseConfig: ProviderConfig = {
      apiKey: config?.apiKey,
      defaultModel: '',
      timeout: 60000,
      maxRetries: 3,
      ...config,
    };

    switch (providerId) {
      case 'openai':
        return new OpenAIProvider(baseConfig);
      case 'anthropic':
        return new AnthropicProvider(baseConfig);
      case 'gemini':
        return new GeminiProvider(baseConfig);
      case 'deepseek':
        return new DeepSeekProvider(baseConfig);
      case 'ollama':
        return new OllamaProvider(baseConfig);
      case 'openrouter':
        return new OpenRouterProvider(baseConfig);
      default: {
        const exhaustive: never = providerId;
        throw new Error(`Unknown provider: ${exhaustive}`);
      }
    }
  }
}
