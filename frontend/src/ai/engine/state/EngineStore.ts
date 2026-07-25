import type {
  EngineState,
  UIState,
  ConversationState,
  StreamingState,
  ProviderState,
  RuntimeState,
  MemoryState,
} from './types';

type Listener = (state: EngineState) => void;

const DEFAULT_UI: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  searchFocused: false,
  activeModal: null,
  activeSheet: null,
  density: 'default',
  theme: 'system',
  reducedMotion: false,
  fontSize: 'medium',
};

const DEFAULT_CONVERSATION: ConversationState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
  filter: { search: '', pinned: null, archived: null },
};

const DEFAULT_STREAMING: StreamingState = {
  status: 'idle',
  content: '',
  error: null,
  startTime: null,
  tokensPerSecond: 0,
  totalTokens: 0,
};

const DEFAULT_PROVIDER: ProviderState = {
  activeProviderId: 'openai',
  providers: {} as Record<string, 'available' | 'unavailable' | 'error' | 'configuring'>,
  availableModels: [],
  isLoading: false,
};

const DEFAULT_RUNTIME: RuntimeState = {
  isInitialized: false,
  isProcessing: false,
  activeTasks: [],
  lastError: null,
  metrics: { totalConversations: 0, totalMessages: 0, totalTokens: 0, uptime: 0 },
};

const DEFAULT_MEMORY: MemoryState = {
  tokenUsage: {},
  contextWindows: {},
  totalCompressions: 0,
  lastCompression: null,
};

export class EngineStore {
  private state: EngineState;
  private listeners: Set<Listener> = new Set();
  private startTime: number = Date.now();

  constructor() {
    this.state = {
      ui: { ...DEFAULT_UI },
      conversation: { ...DEFAULT_CONVERSATION },
      streaming: { ...DEFAULT_STREAMING },
      provider: { ...DEFAULT_PROVIDER },
      runtime: { ...DEFAULT_RUNTIME, metrics: { ...DEFAULT_RUNTIME.metrics } },
      memory: { ...DEFAULT_MEMORY },
    };
  }

  getState(): EngineState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state));
  }

  private update(partial: Partial<EngineState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  getUI(): UIState {
    return this.state.ui;
  }

  updateUI(partial: Partial<UIState>): void {
    this.update({ ui: { ...this.state.ui, ...partial } });
  }

  toggleSidebar(): void {
    this.updateUI({ sidebarOpen: !this.state.ui.sidebarOpen });
  }

  toggleMobileMenu(): void {
    this.updateUI({ mobileMenuOpen: !this.state.ui.mobileMenuOpen });
  }

  setActiveModal(modal: string | null): void {
    this.updateUI({ activeModal: modal });
  }

  setActiveSheet(sheet: string | null): void {
    this.updateUI({ activeSheet: sheet });
  }

  setDensity(density: UIState['density']): void {
    this.updateUI({ density });
  }

  setTheme(theme: UIState['theme']): void {
    this.updateUI({ theme });
  }

  getConversation(): ConversationState {
    return this.state.conversation;
  }

  updateConversation(partial: Partial<ConversationState>): void {
    this.update({ conversation: { ...this.state.conversation, ...partial } });
  }

  setConversations(conversations: ConversationState['conversations']): void {
    this.updateConversation({ conversations });
  }

  setActiveConversation(id: string | null): void {
    this.updateConversation({ activeConversationId: id });
  }

  getStreaming(): StreamingState {
    return this.state.streaming;
  }

  updateStreaming(partial: Partial<StreamingState>): void {
    this.update({ streaming: { ...this.state.streaming, ...partial } });
  }

  setStreamState(status: StreamingState['status']): void {
    this.updateStreaming({ status, startTime: status === 'connecting' ? Date.now() : this.state.streaming.startTime });
  }

  setStreamContent(content: string): void {
    this.updateStreaming({ content });
  }

  getProvider(): ProviderState {
    return this.state.provider;
  }

  updateProvider(partial: Partial<ProviderState>): void {
    this.update({ provider: { ...this.state.provider, ...partial } });
  }

  setActiveProvider(id: ProviderState['activeProviderId']): void {
    this.updateProvider({ activeProviderId: id });
  }

  getRuntime(): RuntimeState {
    return this.state.runtime;
  }

  updateRuntime(partial: Partial<RuntimeState>): void {
    this.update({ runtime: { ...this.state.runtime, ...partial } });
  }

  setProcessing(processing: boolean, task?: string): void {
    const tasks = task
      ? processing
        ? [...this.state.runtime.activeTasks, task]
        : this.state.runtime.activeTasks.filter((t) => t !== task)
      : this.state.runtime.activeTasks;

    this.updateRuntime({
      isProcessing: processing || tasks.length > 0,
      activeTasks: tasks,
    });
  }

  getMemory(): MemoryState {
    return this.state.memory;
  }

  updateMemory(partial: Partial<MemoryState>): void {
    this.update({ memory: { ...this.state.memory, ...partial } });
  }

  recordTokenUsage(conversationId: string, tokens: number): void {
    const current = this.state.memory.tokenUsage[conversationId] ?? 0;
    this.updateMemory({
      tokenUsage: { ...this.state.memory.tokenUsage, [conversationId]: current + tokens },
    });
  }

  reset(): void {
    this.state = {
      ui: { ...DEFAULT_UI },
      conversation: { ...DEFAULT_CONVERSATION },
      streaming: { ...DEFAULT_STREAMING },
      provider: { ...DEFAULT_PROVIDER },
      runtime: { ...DEFAULT_RUNTIME, metrics: { ...DEFAULT_RUNTIME.metrics, uptime: 0 } },
      memory: { ...DEFAULT_MEMORY },
    };
    this.startTime = Date.now();
    this.notify();
  }

  destroy(): void {
    this.listeners.clear();
  }
}

export const engineStore = new EngineStore();
