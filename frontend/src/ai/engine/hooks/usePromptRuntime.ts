import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromptRuntime } from '../prompt';
import type { PromptDefinition, PromptContext, PromptMergeResult } from '../prompt';

const promptRuntime = new PromptRuntime();

export const PROMPT_QUERY_KEYS = {
  all: ['engine', 'prompts'] as const,
  detail: (id: string) => ['engine', 'prompts', id] as const,
};

export function useRegisteredPrompts() {
  return useQuery({
    queryKey: PROMPT_QUERY_KEYS.all,
    queryFn: () => promptRuntime.getAll(),
    staleTime: 1000 * 60,
  });
}

export function useRegisterPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prompt: PromptDefinition) => {
      promptRuntime.register(prompt);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMPT_QUERY_KEYS.all });
    },
  });
}

export function useRenderPrompt() {
  return useMutation({
    mutationFn: ({
      promptId,
      variables,
    }: {
      promptId: string;
      variables: Record<string, string>;
    }) => {
      const result = promptRuntime.render(promptId, variables);
      return Promise.resolve(result);
    },
  });
}

export function useValidatePrompt() {
  return useMutation({
    mutationFn: ({
      promptId,
      variables,
    }: {
      promptId: string;
      variables: Record<string, string>;
    }) => {
      const result = promptRuntime.validate(promptId, variables);
      return Promise.resolve(result);
    },
  });
}

export function usePreviewPrompt() {
  return useMutation({
    mutationFn: ({
      promptId,
      variables,
    }: {
      promptId: string;
      variables: Record<string, string>;
    }) => {
      const result = promptRuntime.preview(promptId, variables);
      return Promise.resolve(result);
    },
  });
}

export function useMergePrompts() {
  return useMutation({
    mutationFn: (context: PromptContext) => {
      const result = promptRuntime.merge(context);
      return Promise.resolve(result);
    },
  });
}
