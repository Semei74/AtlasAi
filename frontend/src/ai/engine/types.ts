export interface EngineConfig {
  maxRetries: number;
  retryDelay: number;
  streamBufferSize: number;
  defaultModel: string;
  defaultProvider: string;
  tokenBudget: number;
  contextWindowLimit: number;
}

export type EngineEventType =
  | 'conversation:created'
  | 'conversation:updated'
  | 'conversation:deleted'
  | 'message:sent'
  | 'message:received'
  | 'stream:start'
  | 'stream:delta'
  | 'stream:done'
  | 'stream:error'
  | 'stream:abort'
  | 'provider:switched'
  | 'provider:error'
  | 'memory:compressed'
  | 'search:complete'
  | 'error';

export interface EngineEvent {
  type: EngineEventType;
  timestamp: number;
  payload?: unknown;
}

export type EngineEventListener = (event: EngineEvent) => void;

export interface PaginationParams {
  page: number;
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  cursor?: string;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}
