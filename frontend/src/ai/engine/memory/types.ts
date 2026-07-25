export interface ConversationSummary {
  conversationId: string;
  summary: string;
  keyPoints: string[];
  tokens: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface RollingContext {
  messages: MemoryMessage[];
  currentTokens: number;
  maxTokens: number;
  strategy: 'trim_oldest' | 'summarize_oldest' | 'truncate';
}

export interface MemoryMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  timestamp: string;
  priority: 'high' | 'normal' | 'low';
}

export interface ContextWindow {
  recentMessages: MemoryMessage[];
  summary: string;
  totalTokens: number;
  budget: number;
  overflow: boolean;
}

export interface TokenBudget {
  allocated: number;
  used: number;
  reserved: number;
  available: number;
}

export interface HistoryCompressionResult {
  summary: string;
  preservedMessages: MemoryMessage[];
  removedCount: number;
  tokensSaved: number;
}

export interface MemoryConfig {
  maxContextTokens: number;
  summaryThreshold: number;
  compressionThreshold: number;
  preserveSystemMessages: boolean;
  preserveToolMessages: boolean;
  highPriorityRoles: ('user' | 'assistant' | 'system')[];
}
