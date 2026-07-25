import type { Chunk, ChunkMetadata, ChunkerConfig } from './types';

export class Chunker {
  private config: ChunkerConfig;

  constructor(config?: Partial<ChunkerConfig>) {
    this.config = {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '.', ' ', ''],
      preserveParagraphs: true,
      ...config,
    };
  }

  chunk(text: string, documentId: string, metadata: Partial<ChunkMetadata>): Chunk[] {
    const chunks: Chunk[] = [];
    const normalizedText = text.trim();
    if (!normalizedText) return chunks;

    const segments = this.splitIntoParagraphs(normalizedText);
    let currentChunk = '';
    let position = 0;

    for (const segment of segments) {
      if ((currentChunk + segment).length <= this.config.chunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + segment;
      } else {
        if (currentChunk) {
          chunks.push(this.createChunk(currentChunk, documentId, metadata, position++));
        }
        currentChunk = segment;
      }
    }

    if (currentChunk) {
      chunks.push(this.createChunk(currentChunk, documentId, metadata, position));
    }

    return chunks;
  }

  private splitIntoParagraphs(text: string): string[] {
    if (!this.config.preserveParagraphs) {
      return [text];
    }

    const paragraphs: string[] = [];
    const lines = text.split('\n');
    let currentParagraph = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph);
          currentParagraph = '';
        }
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
      }
    }

    if (currentParagraph) {
      paragraphs.push(currentParagraph);
    }

    return paragraphs.length > 0 ? paragraphs : [text];
  }

  private createChunk(
    content: string,
    documentId: string,
    metadata: Partial<ChunkMetadata>,
    position: number,
  ): Chunk {
    return {
      id: `chunk_${documentId}_${position}_${Date.now()}`,
      documentId,
      content: content.trim(),
      metadata: {
        source: metadata.source ?? '',
        page: metadata.page,
        section: metadata.section,
        heading: metadata.heading,
        tokens: this.estimateTokens(content),
        createdAt: new Date().toISOString(),
        ...metadata,
      },
      position,
    };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  updateConfig(config: Partial<ChunkerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): Readonly<ChunkerConfig> {
    return { ...this.config };
  }
}
