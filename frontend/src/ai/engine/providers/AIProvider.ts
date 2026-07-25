import type {
  ProviderId,
  ProviderCapabilities,
  ProviderConfig,
  ProviderHealth,
  ProviderStats,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  EmbeddingRequest,
  EmbeddingResponse,
} from './types';

export abstract class AIProvider {
  readonly id: ProviderId;
  readonly name: string;
  protected config: ProviderConfig;
  protected stats: ProviderStats;

  constructor(id: ProviderId, name: string, config: ProviderConfig) {
    this.id = id;
    this.name = name;
    this.config = config;
    this.stats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      errorRate: 0,
      lastRequest: '',
    };
  }

  abstract getCapabilities(): ProviderCapabilities;

  abstract chat(request: ChatRequest): Promise<ChatResponse>;

  abstract chatStream(request: ChatRequest): AsyncGenerator<StreamChunk>;

  abstract embed?(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  abstract checkHealth(): Promise<ProviderHealth>;

  updateConfig(config: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): Readonly<ProviderConfig> {
    return { ...this.config };
  }

  getStats(): Readonly<ProviderStats> {
    return { ...this.stats };
  }

  protected recordRequest(latency: number, tokens: number, cost: number, error: boolean): void {
    this.stats.totalRequests++;
    this.stats.totalTokens += tokens;
    this.stats.totalCost += cost;
    this.stats.lastRequest = new Date().toISOString();
    this.stats.averageLatency =
      (this.stats.averageLatency * (this.stats.totalRequests - 1) + latency) /
      this.stats.totalRequests;
    if (error) {
      const errors = this.stats.errorRate * (this.stats.totalRequests - 1) + 1;
      this.stats.errorRate = errors / this.stats.totalRequests;
    }
  }

  abstract testConnection(): Promise<boolean>;
}
