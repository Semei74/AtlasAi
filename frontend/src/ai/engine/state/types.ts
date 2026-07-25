import type { StreamState } from '../streaming/types';
import type { ProviderId, ProviderStatus } from '../providers/types';
import type { ConversationData } from '../conversation/types';

export interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchFocused: boolean;
  activeModal: string | null;
  activeSheet: string | null;
  density: 'comfortable' | 'default' | 'compact';
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface ConversationState {
  conversations: ConversationData[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    search: string;
    pinned: boolean | null;
    archived: boolean | null;
  };
}

export interface StreamingState {
  status: StreamState;
  content: string;
  error: string | null;
  startTime: number | null;
  tokensPerSecond: number;
  totalTokens: number;
}

export interface ProviderState {
  activeProviderId: ProviderId;
  providers: Record<ProviderId, ProviderStatus>;
  availableModels: string[];
  isLoading: boolean;
}

export interface RuntimeState {
  isInitialized: boolean;
  isProcessing: boolean;
  activeTasks: string[];
  lastError: string | null;
  metrics: {
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    uptime: number;
  };
}

export interface MemoryState {
  tokenUsage: Record<string, number>;
  contextWindows: Record<string, number>;
  totalCompressions: number;
  lastCompression: string | null;
}

export interface EngineState {
  ui: UIState;
  conversation: ConversationState;
  streaming: StreamingState;
  provider: ProviderState;
  runtime: RuntimeState;
  memory: MemoryState;
}
