export interface RagSource {
  readonly id: string;
  readonly name: string;
  readonly type: "document" | "knowledge_base" | "web" | "vector_store" | "custom";
  readonly enabled: boolean;
}

export interface RagQuery {
  readonly query: string;
  readonly sourceIds: readonly string[];
  readonly topK: number;
  readonly minScore: number;
  readonly filter: Record<string, unknown> | null;
}

export interface RagResult {
  readonly chunks: readonly RagChunk[];
  readonly totalChunks: number;
  readonly queryTimeMs: number;
}

export interface RagChunk {
  readonly id: string;
  readonly content: string;
  readonly sourceId: string;
  readonly score: number;
  readonly metadata: Record<string, unknown>;
}

export interface RagEngine {
  readonly query: (request: RagQuery) => Promise<RagResult>;
  readonly indexSource: (source: RagSource) => Promise<void>;
  readonly removeSource: (sourceId: string) => Promise<void>;
}
