export { ChatProvider, useChat } from './context/ChatContext';

export {
  useChatMutation,
  usePrompts,
  usePrompt,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useDeletePromptMutation,
  usePromptCategories,
  usePromptVersions,
  useCreatePromptVersionMutation,
  usePublishPromptMutation,
  useArchivePromptMutation,
  useDocuments,
  useDocument,
  useDeleteDocumentMutation,
  useProjects,
  useProject,
  useCreateProjectMutation,
  useRecentProjects,
  AI_QUERY_KEYS,
} from './hooks';

export { aiApi, AiApiError } from './api';
export { AI_CONFIG } from './config';

export type {
  ChatMessage,
  Conversation,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  TokenUsage,
  ToolCall,
  Prompt,
  PromptVersion,
  PromptCategory,
  PromptStatus,
  PromptVisibility,
  KnowledgeDocument,
  DocumentStatus,
  Agent,
  AgentStatus,
  Project,
  ProjectStatus,
  SearchResult,
  AIProvider,
  AIModel,
} from './types';

export * from './engine';
