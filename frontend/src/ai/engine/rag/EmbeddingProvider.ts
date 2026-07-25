import type { EmbeddingRequest, EmbeddingResponse } from '../providers/types';

export interface IEmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getDimensions(): number;
  getModel(): string;
}

export class EmbeddingProviderAdapter implements IEmbeddingProvider {
  private provider: { embed(req: EmbeddingRequest): Promise<EmbeddingResponse> };
  private dimensions: number;
  private model: string;

  constructor(
    provider: { embed(req: EmbeddingRequest): Promise<EmbeddingResponse> },
    dimensions: number = 1536,
    model: string = 'text-embedding-3-small',
  ) {
    this.provider = provider;
    this.dimensions = dimensions;
    this.model = model;
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.provider.embed({
      input: text,
      model: this.model,
    });
    return response.embeddings[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.provider.embed({
      input: texts,
      model: this.model,
    });
    return response.embeddings;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  getModel(): string {
    return this.model;
  }
}
