import type { ChatMessage } from '../../types';

export interface ConversationSettings {
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface ConversationMetadata {
  tokenCount: number;
  messageCount: number;
  lastModel?: string;
  lastProvider?: string;
  duration?: number;
  averageLatency?: number;
  totalCost?: number;
  tags?: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  model: string;
  provider: string;
  messageCount: number;
  tokenCount: number;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ExportOptions {
  format: 'json' | 'markdown' | 'text';
  includeMetadata: boolean;
  includeMessages: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface ImportResult {
  conversationId: string;
  messagesImported: number;
  errors: string[];
}

export interface ConversationFilter {
  search?: string;
  pinned?: boolean;
  archived?: boolean;
  provider?: string;
  model?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sortBy?: 'updatedAt' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ConversationEngineState {
  conversations: Map<string, ConversationData>;
  activeId: string | null;
  filter: ConversationFilter;
}

export interface ConversationData {
  id: string;
  title: string;
  model: string;
  provider: string;
  settings: ConversationSettings;
  messages: ChatMessage[];
  metadata: ConversationMetadata;
  pinned: boolean;
  archived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
