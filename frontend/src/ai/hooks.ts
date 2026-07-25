import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi, AiApiError } from './api';
import { AI_CONFIG } from './config';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  Prompt,
  PromptCategory,
  PromptVersion,
  KnowledgeDocument,
  Project,
} from './types';

export const AI_QUERY_KEYS = {
  prompts: ['ai', 'prompts'] as const,
  prompt: (id: string) => ['ai', 'prompts', id] as const,
  promptCategories: ['ai', 'prompts', 'categories'] as const,
  promptVersions: (id: string) => ['ai', 'prompts', id, 'versions'] as const,
  documents: ['ai', 'documents'] as const,
  document: (id: string) => ['ai', 'documents', id] as const,
  projects: ['ai', 'projects'] as const,
  project: (id: string) => ['ai', 'projects', id] as const,
  recentProjects: ['ai', 'projects', 'recent'] as const,
  agents: ['ai', 'agents'] as const,
} as const;

export function useChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChatCompletionRequest) => aiApi.chat(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'requests'] });
    },
  });
}

export function usePrompts(params?: { categoryId?: string; search?: string; status?: string }) {
  return useQuery({
    queryKey: [...AI_QUERY_KEYS.prompts, params],
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getPrompts(params);
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.prompt(id),
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getPrompt(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreatePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Prompt>) => aiApi.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompts });
    },
  });
}

export function useUpdatePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prompt> }) =>
      aiApi.updatePrompt(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompts });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompt(result.id) });
    },
  });
}

export function useDeletePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiApi.deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompts });
    },
  });
}

export function usePromptCategories() {
  return useQuery({
    queryKey: AI_QUERY_KEYS.promptCategories,
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getPromptCategories();
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  });
}

export function usePromptVersions(id: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.promptVersions(id),
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getPromptVersions(id);
    },
    enabled: !!id,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreatePromptVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { systemTemplate: string; userTemplate: string; changelog: string } }) =>
      aiApi.createPromptVersion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.promptVersions(variables.id) });
    },
  });
}

export function usePublishPromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiApi.publishPrompt(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompts });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompt(result.id) });
    },
  });
}

export function useArchivePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiApi.archivePrompt(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompts });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.prompt(result.id) });
    },
  });
}

export function useDocuments(params?: { search?: string; status?: string; tags?: string[] }) {
  return useQuery({
    queryKey: [...AI_QUERY_KEYS.documents, params],
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getDocuments(params);
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.document(id),
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getDocument(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.documents });
    },
  });
}

export function useProjects(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...AI_QUERY_KEYS.projects, params],
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getProjects(params);
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.project(id),
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getProject(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => aiApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.projects });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.recentProjects });
    },
  });
}

export function useRecentProjects() {
  return useQuery({
    queryKey: AI_QUERY_KEYS.recentProjects,
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return aiApi.getRecentProjects();
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export type { AiApiError };
