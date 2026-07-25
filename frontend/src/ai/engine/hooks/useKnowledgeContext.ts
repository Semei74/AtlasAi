import { useQuery, useMutation } from '@tanstack/react-query';
import { Retriever, Chunker, ContextBuilder } from '../rag';
import type { RetrievalQuery, RetrievalResult, BuiltContext } from '../rag';

const retriever = new Retriever();
const chunker = new Chunker();
const contextBuilder = new ContextBuilder();

export const KNOWLEDGE_QUERY_KEYS = {
  retrieve: ['engine', 'knowledge', 'retrieve'] as const,
  context: ['engine', 'knowledge', 'context'] as const,
};

export function useKnowledgeRetrieval() {
  return useMutation({
    mutationFn: async (query: RetrievalQuery): Promise<RetrievalResult> => {
      return retriever.retrieve(query);
    },
  });
}

export function useBuildContext() {
  return useMutation({
    mutationFn: async ({
      chunks,
      query,
    }: {
      chunks: import('../rag').Chunk[];
      query?: string;
    }): Promise<BuiltContext> => {
      return contextBuilder.build(chunks, query);
    },
  });
}

export function useAddChunks() {
  return useMutation({
    mutationFn: async (chunks: import('../rag').Chunk[]) => {
      retriever.addChunks(chunks);
    },
  });
}

export function useChunkDocument() {
  return useMutation({
    mutationFn: async ({
      text,
      documentId,
      source,
    }: {
      text: string;
      documentId: string;
      source: string;
    }) => {
      return chunker.chunk(text, documentId, { source });
    },
  });
}

export { retriever, chunker, contextBuilder };
