const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_PREFIX = '/api/v1';

export const AI_CONFIG = {
  apiUrl: `${API_BASE_URL}${API_PREFIX}`,
  endpoints: {
    chat: '/ai/chat',
    chatStream: '/ai/chat/stream',
    prompts: '/prompts',
    promptCategories: '/prompts/categories',
    promptPreview: '/prompts/preview',
    promptById: (id: string) => `/prompts/${id}`,
    promptVersions: (id: string) => `/prompts/${id}/versions`,
    promptRender: (id: string) => `/prompts/${id}/render`,
    promptValidate: (id: string) => `/prompts/${id}/validate`,
    promptPublish: (id: string) => `/prompts/${id}/publish`,
    promptArchive: (id: string) => `/prompts/${id}/archive`,
    promptRestore: (id: string) => `/prompts/${id}/restore`,
    promptRollback: (id: string) => `/prompts/${id}/rollback`,
    promptCompare: (id: string) => `/prompts/${id}/compare`,
    documents: '/knowledge/documents',
    documentById: (id: string) => `/knowledge/documents/${id}`,
    documentArchive: (id: string) => `/knowledge/documents/${id}/archive`,
    documentRestore: (id: string) => `/knowledge/documents/${id}/restore`,
    documentDownload: (id: string) => `/knowledge/documents/${id}/download`,
    documentParse: (id: string) => `/knowledge/documents/${id}/parse`,
    documentParseProcess: (id: string) => `/knowledge/documents/${id}/parse/process`,
    documentOcr: (id: string) => `/knowledge/documents/${id}/ocr`,
    documentOcrProcess: (id: string) => `/knowledge/documents/${id}/ocr/process`,
    documentMetadata: (id: string) => `/knowledge/documents/${id}/metadata`,
    projects: '/projects',
    projectById: (id: string) => `/projects/${id}`,
    projectArchive: (id: string) => `/projects/${id}/archive`,
    projectRestore: (id: string) => `/projects/${id}/restore`,
    projectRecent: '/projects/recent',
    projectActivity: (id: string) => `/projects/${id}/activity`,
  },
  storageKeys: {
    conversations: 'atlas_conversations',
    recentSearches: 'atlas_recent_searches',
    favoritePrompts: 'atlas_favorite_prompts',
  },
} as const;

export const AI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
] as const;
