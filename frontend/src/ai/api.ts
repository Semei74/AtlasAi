import { AI_CONFIG } from './config';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  Prompt,
  PromptCategory,
  PromptVersion,
  KnowledgeDocument,
  Agent,
  Project,
} from './types';

class AiApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string = 'UNKNOWN') {
    super(message);
    this.name = 'AiApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${AI_CONFIG.apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.message ?? data.error ?? 'Request failed';
    const code = data.code ?? 'UNKNOWN';
    throw new AiApiError(message, response.status, code);
  }

  return data as T;
}

export const aiApi = {
  async chat(body: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return request<ChatCompletionResponse>(AI_CONFIG.endpoints.chat, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async* chatStream(body: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('atlas_access_token')
        : null;

    const response = await fetch(`${AI_CONFIG.apiUrl}${AI_CONFIG.endpoints.chatStream}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...body, stream: true }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new AiApiError(
        data.message ?? 'Stream request failed',
        response.status,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new AiApiError('No response body', 0);

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const chunk: StreamChunk = JSON.parse(line.slice(6));
            yield chunk;
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  },

  async getPrompts(params?: { categoryId?: string; search?: string; status?: string }): Promise<Prompt[]> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<Prompt[]>(`${AI_CONFIG.endpoints.prompts}${qs ? `?${qs}` : ''}`);
  },

  async getPrompt(id: string): Promise<Prompt> {
    return request<Prompt>(AI_CONFIG.endpoints.promptById(id));
  },

  async createPrompt(data: Partial<Prompt>): Promise<Prompt> {
    return request<Prompt>(AI_CONFIG.endpoints.prompts, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt> {
    return request<Prompt>(AI_CONFIG.endpoints.promptById(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deletePrompt(id: string): Promise<void> {
    return request<void>(AI_CONFIG.endpoints.promptById(id), {
      method: 'DELETE',
    });
  },

  async getPromptCategories(): Promise<PromptCategory[]> {
    return request<PromptCategory[]>(AI_CONFIG.endpoints.promptCategories);
  },

  async getPromptVersions(id: string): Promise<PromptVersion[]> {
    return request<PromptVersion[]>(AI_CONFIG.endpoints.promptVersions(id));
  },

  async createPromptVersion(id: string, data: { systemTemplate: string; userTemplate: string; changelog: string }): Promise<PromptVersion> {
    return request<PromptVersion>(AI_CONFIG.endpoints.promptVersions(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async renderPrompt(id: string, variables: Record<string, string>): Promise<{ rendered: string }> {
    return request<{ rendered: string }>(AI_CONFIG.endpoints.promptRender(id), {
      method: 'POST',
      body: JSON.stringify({ variables }),
    });
  },

  async publishPrompt(id: string): Promise<Prompt> {
    return request<Prompt>(AI_CONFIG.endpoints.promptPublish(id), { method: 'POST' });
  },

  async archivePrompt(id: string): Promise<Prompt> {
    return request<Prompt>(AI_CONFIG.endpoints.promptArchive(id), { method: 'POST' });
  },

  async restorePrompt(id: string): Promise<Prompt> {
    return request<Prompt>(AI_CONFIG.endpoints.promptRestore(id), { method: 'POST' });
  },

  async getDocuments(params?: { search?: string; status?: string; tags?: string[] }): Promise<KnowledgeDocument[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.tags?.length) query.set('tags', params.tags.join(','));
    const qs = query.toString();
    return request<KnowledgeDocument[]>(`${AI_CONFIG.endpoints.documents}${qs ? `?${qs}` : ''}`);
  },

  async getDocument(id: string): Promise<KnowledgeDocument> {
    return request<KnowledgeDocument>(AI_CONFIG.endpoints.documentById(id));
  },

  async deleteDocument(id: string): Promise<void> {
    return request<void>(AI_CONFIG.endpoints.documentById(id), { method: 'DELETE' });
  },

  async archiveDocument(id: string): Promise<KnowledgeDocument> {
    return request<KnowledgeDocument>(AI_CONFIG.endpoints.documentArchive(id), { method: 'POST' });
  },

  async restoreDocument(id: string): Promise<KnowledgeDocument> {
    return request<KnowledgeDocument>(AI_CONFIG.endpoints.documentRestore(id), { method: 'POST' });
  },

  async getProjects(params?: { search?: string; status?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<Project[]>(`${AI_CONFIG.endpoints.projects}${qs ? `?${qs}` : ''}`);
  },

  async getProject(id: string): Promise<Project> {
    return request<Project>(AI_CONFIG.endpoints.projectById(id));
  },

  async createProject(data: { name: string; description?: string }): Promise<Project> {
    return request<Project>(AI_CONFIG.endpoints.projects, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getRecentProjects(): Promise<Project[]> {
    return request<Project[]>(AI_CONFIG.endpoints.projectRecent);
  },
};

export { AiApiError };
