import type { Chunk, BuiltContext, ContextBuilderConfig, Citation, ContextSource } from './types';
import { CitationBuilder } from './CitationBuilder';

export class ContextBuilder {
  private config: ContextBuilderConfig;
  private citationBuilder: CitationBuilder;

  constructor(config?: Partial<ContextBuilderConfig>) {
    this.config = {
      maxTokens: 4000,
      maxChunks: 10,
      separator: '\n\n---\n\n',
      includeMetadata: true,
      includeCitations: true,
      ...config,
    };
    this.citationBuilder = new CitationBuilder();
  }

  build(chunks: Chunk[], query?: string): BuiltContext {
    const selected: Chunk[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
      const chunkTokens = this.estimateTokens(chunk.content);
      if (totalTokens + chunkTokens > this.config.maxTokens) break;
      if (selected.length >= this.config.maxChunks) break;

      selected.push(chunk);
      totalTokens += chunkTokens;
    }

    const parts: string[] = [];

    for (const chunk of selected) {
      let part = chunk.content;

      if (this.config.includeMetadata) {
        const metaParts: string[] = [];
        if (chunk.metadata.source) metaParts.push(`Source: ${chunk.metadata.source}`);
        if (chunk.metadata.page) metaParts.push(`Page: ${chunk.metadata.page}`);
        if (chunk.metadata.section) metaParts.push(`Section: ${chunk.metadata.section}`);
        if (metaParts.length > 0) {
          part = `[${metaParts.join(' | ')}]\n${part}`;
        }
      }

      parts.push(part);
    }

    let content = parts.join(this.config.separator);

    const citations: Citation[] = this.config.includeCitations
      ? this.citationBuilder.build(selected, query)
      : [];

    return {
      content,
      chunks: selected,
      tokenCount: totalTokens,
      citations,
    };
  }

  buildFromSources(sources: ContextSource[], query?: string): BuiltContext {
    const chunks: Chunk[] = sources.map((source, index) => ({
      id: `ctx_${source.scope}_${index}`,
      documentId: source.id,
      content: source.content,
      metadata: {
        source: source.title,
        tokens: this.estimateTokens(source.content),
        createdAt: new Date().toISOString(),
      },
      position: index,
    }));

    return this.build(chunks, query);
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  updateConfig(config: Partial<ContextBuilderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
