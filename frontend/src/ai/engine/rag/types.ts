export type RetrievalStrategy = 'similarity' | 'keyword' | 'hybrid';

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  metadata: ChunkMetadata;
  embedding?: number[];
  position: number;
}

export interface ChunkMetadata {
  source: string;
  page?: number;
  section?: string;
  heading?: string;
  tokens: number;
  createdAt: string;
}

export interface RetrievalQuery {
  text: string;
  topK: number;
  minScore: number;
  strategy: RetrievalStrategy;
  documentIds?: string[];
  filters?: Record<string, unknown>;
}

export interface RetrievalResult {
  chunks: ScoredChunk[];
  query: string;
  latency: number;
  totalResults: number;
}

export interface ScoredChunk {
  chunk: Chunk;
  score: number;
  explanation?: string;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getDimensions(): number;
  getModel(): string;
}

export interface ContextBuilderConfig {
  maxTokens: number;
  maxChunks: number;
  separator: string;
  includeMetadata: boolean;
  includeCitations: boolean;
}

export interface BuiltContext {
  content: string;
  chunks: Chunk[];
  tokenCount: number;
  citations: Citation[];
}

export interface Citation {
  id: string;
  source: string;
  text: string;
  page?: number;
  section?: string;
  relevanceScore: number;
}

export interface RetrieverPipelineStep {
  name: string;
  process(query: RetrievalQuery, chunks: ScoredChunk[]): Promise<ScoredChunk[]>;
}

export type ContextScope = 'conversation' | 'workspace' | 'knowledge' | 'document';

export interface ContextSource {
  scope: ContextScope;
  id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface ChunkerConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];
  preserveParagraphs: boolean;
}
