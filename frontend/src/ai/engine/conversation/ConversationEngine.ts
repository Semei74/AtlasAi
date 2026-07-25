import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_CONFIG } from '../../config';
import type { ChatMessage } from '../../types';
import type {
  ConversationSettings,
  ConversationMetadata,
  ConversationSummary,
  ConversationFilter,
  ConversationData,
  ConversationEngineState,
  ExportOptions,
  ImportResult,
} from './types';

const DEFAULT_SETTINGS: ConversationSettings = {
  model: 'gpt-4o',
  provider: 'openai',
  temperature: 0.7,
  maxTokens: 4096,
};

export class ConversationEngine {
  private state: ConversationEngineState;
  private storageKey: string;
  private listeners: Set<(convs: ConversationData[]) => void>;

  constructor(storageKey: string = AI_CONFIG.storageKeys.conversations) {
    this.storageKey = storageKey;
    this.listeners = new Set();
    this.state = {
      conversations: new Map(),
      activeId: null,
      filter: {},
    };
  }

  subscribe(listener: (convs: ConversationData[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const convs = Array.from(this.state.conversations.values());
    this.listeners.forEach((fn) => fn(convs));
  }

  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private now(): string {
    return new Date().toISOString();
  }

  async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(this.storageKey);
      if (raw) {
        const convs: ConversationData[] = JSON.parse(raw);
        this.state.conversations = new Map(convs.map((c) => [c.id, c]));
      }
    } catch {
      this.state.conversations = new Map();
    }
    this.notify();
  }

  async persist(): Promise<void> {
    try {
      const convs = Array.from(this.state.conversations.values());
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(convs));
    } catch {
      // non-critical
    }
  }

  create(
    model: string = DEFAULT_SETTINGS.model,
    provider: string = DEFAULT_SETTINGS.provider,
    settings?: Partial<ConversationSettings>,
  ): string {
    const id = this.generateId();
    const now = this.now();
    const conv: ConversationData = {
      id,
      title: 'New conversation',
      model,
      provider,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      messages: [],
      metadata: { tokenCount: 0, messageCount: 0 },
      pinned: false,
      archived: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    this.state.conversations.set(id, conv);
    this.state.activeId = id;
    this.persist();
    this.notify();
    return id;
  }

  delete(id: string): void {
    this.state.conversations.delete(id);
    if (this.state.activeId === id) {
      const remaining = Array.from(this.state.conversations.keys());
      this.state.activeId = remaining[0] ?? null;
    }
    this.persist();
    this.notify();
  }

  rename(id: string, title: string): void {
    const conv = this.state.conversations.get(id);
    if (!conv) return;
    conv.title = title;
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  togglePin(id: string): void {
    const conv = this.state.conversations.get(id);
    if (!conv) return;
    conv.pinned = !conv.pinned;
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  toggleArchive(id: string): void {
    const conv = this.state.conversations.get(id);
    if (!conv) return;
    conv.archived = !conv.archived;
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  setActive(id: string | null): void {
    this.state.activeId = id;
    this.notify();
  }

  get(id: string): ConversationData | undefined {
    return this.state.conversations.get(id);
  }

  getActive(): ConversationData | null {
    if (!this.state.activeId) return null;
    return this.state.conversations.get(this.state.activeId) ?? null;
  }

  getAll(): ConversationData[] {
    return Array.from(this.state.conversations.values());
  }

  getPinned(): ConversationData[] {
    return Array.from(this.state.conversations.values()).filter(
      (c) => c.pinned && !c.archived,
    );
  }

  getArchived(): ConversationData[] {
    return Array.from(this.state.conversations.values()).filter((c) => c.archived);
  }

  getRecent(limit: number = 10): ConversationData[] {
    return Array.from(this.state.conversations.values())
      .filter((c) => !c.archived)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit);
  }

  search(query: string): ConversationData[] {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return Array.from(this.state.conversations.values()).filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.messages.some((m) => m.content.toLowerCase().includes(lower)),
    );
  }

  filter(filter: ConversationFilter): ConversationData[] {
    let results = Array.from(this.state.conversations.values());

    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q)),
      );
    }
    if (filter.pinned !== undefined) {
      results = results.filter((c) => c.pinned === filter.pinned);
    }
    if (filter.archived !== undefined) {
      results = results.filter((c) => c.archived === filter.archived);
    }
    if (filter.provider) {
      results = results.filter((c) => c.provider === filter.provider);
    }
    if (filter.model) {
      results = results.filter((c) => c.model === filter.model);
    }
    if (filter.tags?.length) {
      results = results.filter((c) =>
        filter.tags!.some((t) => c.tags.includes(t)),
      );
    }
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      results = results.filter(
        (c) => new Date(c.updatedAt).getTime() >= from,
      );
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      results = results.filter(
        (c) => new Date(c.updatedAt).getTime() <= to,
      );
    }

    const sortField = filter.sortBy ?? 'updatedAt';
    const sortOrder = filter.sortOrder ?? 'desc';
    results.sort((a, b) => {
      const aVal = new Date(a[sortField]).getTime();
      const bVal = new Date(b[sortField]).getTime();
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return results;
  }

  getSummaries(): ConversationSummary[] {
    return Array.from(this.state.conversations.values()).map((c) => ({
      id: c.id,
      title: c.title,
      preview: c.messages[c.messages.length - 1]?.content.slice(0, 100) ?? '',
      model: c.model,
      provider: c.provider,
      messageCount: c.metadata.messageCount,
      tokenCount: c.metadata.tokenCount,
      pinned: c.pinned,
      archived: c.archived,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      tags: c.tags,
    }));
  }

  addMessage(conversationId: string, message: ChatMessage): void {
    const conv = this.state.conversations.get(conversationId);
    if (!conv) return;

    conv.messages.push(message);
    conv.metadata.messageCount = conv.messages.length;
    if (message.tokens?.totalTokens) {
      conv.metadata.tokenCount += message.tokens.totalTokens;
    }
    if (message.model) conv.metadata.lastModel = message.model;
    if (message.provider) conv.metadata.lastProvider = message.provider;
    conv.updatedAt = this.now();

    if (conv.messages.length === 2) {
      conv.title = message.content.slice(0, 60);
    }

    this.persist();
    this.notify();
  }

  updateMessage(
    conversationId: string,
    messageId: string,
    updates: Partial<ChatMessage>,
  ): void {
    const conv = this.state.conversations.get(conversationId);
    if (!conv) return;

    const idx = conv.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    conv.messages[idx] = { ...conv.messages[idx], ...updates };
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  removeLastAssistantMessage(conversationId: string): ChatMessage | null {
    const conv = this.state.conversations.get(conversationId);
    if (!conv) return null;

    const idx = [...conv.messages]
      .reverse()
      .findIndex((m) => m.role === 'assistant');
    if (idx === -1) return null;

    const actualIdx = conv.messages.length - 1 - idx;
    const removed = conv.messages.splice(actualIdx, 1)[0];
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
    return removed;
  }

  updateSettings(
    id: string,
    settings: Partial<ConversationSettings>,
  ): void {
    const conv = this.state.conversations.get(id);
    if (!conv) return;
    conv.settings = { ...conv.settings, ...settings };
    conv.model = conv.settings.model;
    conv.provider = conv.settings.provider;
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  updateMetadata(
    id: string,
    metadata: Partial<ConversationMetadata>,
  ): void {
    const conv = this.state.conversations.get(id);
    if (!conv) return;
    conv.metadata = { ...conv.metadata, ...metadata };
    this.persist();
  }

  addTag(id: string, tag: string): void {
    const conv = this.state.conversations.get(id);
    if (!conv || conv.tags.includes(tag)) return;
    conv.tags.push(tag);
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  removeTag(id: string, tag: string): void {
    const conv = this.state.conversations.get(id);
    if (!conv) return;
    conv.tags = conv.tags.filter((t) => t !== tag);
    conv.updatedAt = this.now();
    this.persist();
    this.notify();
  }

  async exportConversation(
    id: string,
    options: ExportOptions,
  ): Promise<string> {
    const conv = this.state.conversations.get(id);
    if (!conv) throw new Error(`Conversation ${id} not found`);

    switch (options.format) {
      case 'json':
        return JSON.stringify(
          options.includeMessages ? conv : { ...conv, messages: undefined },
          null,
          2,
        );
      case 'markdown': {
        let md = `# ${conv.title}\n\n`;
        md += `**Model:** ${conv.model} | **Provider:** ${conv.provider}\n`;
        md += `**Created:** ${conv.createdAt} | **Updated:** ${conv.updatedAt}\n\n`;
        if (options.includeMetadata) {
          md += `**Messages:** ${conv.metadata.messageCount} | **Tokens:** ${conv.metadata.tokenCount}\n\n`;
        }
        if (options.includeMessages) {
          md += '---\n\n';
          for (const msg of conv.messages) {
            md += `### ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n`;
            md += `${msg.content}\n\n`;
            if (msg.tokens) {
              md += `*Tokens: ${msg.tokens.totalTokens}*\n\n`;
            }
            md += '---\n\n';
          }
        }
        return md;
      }
      case 'text': {
        let txt = `Conversation: ${conv.title}\n`;
        txt += `Model: ${conv.model} | Provider: ${conv.provider}\n`;
        txt += `${'='.repeat(50)}\n\n`;
        if (options.includeMessages) {
          for (const msg of conv.messages) {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            txt += `[${role}]\n${msg.content}\n\n`;
          }
        }
        return txt;
      }
    }
  }

  async importConversation(data: {
    title?: string;
    model?: string;
    provider?: string;
    messages?: ChatMessage[];
  }): Promise<ImportResult> {
    const errors: string[] = [];
    const id = this.generateId();
    const now = this.now();

    try {
      const conv: ConversationData = {
        id,
        title: data.title ?? 'Imported conversation',
        model: data.model ?? DEFAULT_SETTINGS.model,
        provider: data.provider ?? DEFAULT_SETTINGS.provider,
        settings: { ...DEFAULT_SETTINGS },
        messages: data.messages ?? [],
        metadata: {
          tokenCount: 0,
          messageCount: data.messages?.length ?? 0,
        },
        pinned: false,
        archived: false,
        tags: [],
        createdAt: now,
        updatedAt: now,
      };

      this.state.conversations.set(id, conv);
      this.persist();
      this.notify();
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Import failed');
    }

    return {
      conversationId: id,
      messagesImported: data.messages?.length ?? 0,
      errors,
    };
  }

  destroy(): void {
    this.listeners.clear();
    this.state.conversations.clear();
    this.state.activeId = null;
  }
}
