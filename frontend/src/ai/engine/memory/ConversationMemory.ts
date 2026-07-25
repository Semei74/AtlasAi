import type {
  ConversationSummary,
  RollingContext,
  MemoryMessage,
  ContextWindow,
  TokenBudget,
  HistoryCompressionResult,
  MemoryConfig,
} from './types';

export class ConversationMemory {
  private config: MemoryConfig;
  private summaries: Map<string, ConversationSummary> = new Map();
  private contexts: Map<string, RollingContext> = new Map();

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      maxContextTokens: 8000,
      summaryThreshold: 6000,
      compressionThreshold: 7000,
      preserveSystemMessages: true,
      preserveToolMessages: false,
      highPriorityRoles: ['system'],
      ...config,
    };
  }

  initializeContext(conversationId: string, maxTokens?: number): RollingContext {
    const ctx: RollingContext = {
      messages: [],
      currentTokens: 0,
      maxTokens: maxTokens ?? this.config.maxContextTokens,
      strategy: 'trim_oldest',
    };
    this.contexts.set(conversationId, ctx);
    return ctx;
  }

  addMessage(conversationId: string, message: MemoryMessage): void {
    let ctx = this.contexts.get(conversationId);
    if (!ctx) {
      ctx = this.initializeContext(conversationId);
    }

    ctx.messages.push(message);
    ctx.currentTokens += message.tokens;

    if (ctx.currentTokens >= this.config.compressionThreshold) {
      this.compress(conversationId);
    }
  }

  getContextWindow(conversationId: string): ContextWindow {
    const ctx = this.contexts.get(conversationId);
    if (!ctx) {
      return {
        recentMessages: [],
        summary: '',
        totalTokens: 0,
        budget: this.config.maxContextTokens,
        overflow: false,
      };
    }

    const summary = this.summaries.get(conversationId);

    return {
      recentMessages: ctx.messages,
      summary: summary?.summary ?? '',
      totalTokens: ctx.currentTokens,
      budget: ctx.maxTokens,
      overflow: ctx.currentTokens > ctx.maxTokens,
    };
  }

  getTokenBudget(conversationId: string): TokenBudget {
    const ctx = this.contexts.get(conversationId);
    const used = ctx?.currentTokens ?? 0;
    return {
      allocated: this.config.maxContextTokens,
      used,
      reserved: Math.round(this.config.maxContextTokens * 0.1),
      available: this.config.maxContextTokens - used - Math.round(this.config.maxContextTokens * 0.1),
    };
  }

  compress(conversationId: string): HistoryCompressionResult {
    const ctx = this.contexts.get(conversationId);
    if (!ctx || ctx.messages.length === 0) {
      return {
        summary: '',
        preservedMessages: [],
        removedCount: 0,
        tokensSaved: 0,
      };
    }

    const preserved: MemoryMessage[] = [];
    const toRemove: MemoryMessage[] = [];
    let tokensSaved = 0;

    for (const msg of ctx.messages) {
      if (msg.role === 'system' && this.config.preserveSystemMessages) {
        preserved.push(msg);
        continue;
      }

      if (msg.priority === 'high') {
        preserved.push(msg);
        continue;
      }

      toRemove.push(msg);
      tokensSaved += msg.tokens;
    }

    const oldestToKeep = Math.max(
      preserved.length,
      Math.ceil(ctx.messages.length * 0.3),
    );

    while (preserved.length < oldestToKeep && toRemove.length > 0) {
      const restored = toRemove.shift()!;
      preserved.push(restored);
      tokensSaved -= restored.tokens;
    }

    const summaryText = this.buildSummary(toRemove);

    ctx.messages = preserved;
    ctx.currentTokens = preserved.reduce((sum, m) => sum + m.tokens, 0);

    if (summaryText) {
      this.summaries.set(conversationId, {
        conversationId,
        summary: summaryText,
        keyPoints: this.extractKeyPoints(toRemove),
        tokens: tokensSaved,
        createdAt: this.summaries.get(conversationId)?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: (this.summaries.get(conversationId)?.version ?? 0) + 1,
      });
    }

    return {
      summary: summaryText,
      preservedMessages: preserved,
      removedCount: toRemove.length,
      tokensSaved,
    };
  }

  getSummary(conversationId: string): ConversationSummary | undefined {
    return this.summaries.get(conversationId);
  }

  private buildSummary(removedMessages: MemoryMessage[]): string {
    if (removedMessages.length === 0) return '';
    const userMessages = removedMessages.filter((m) => m.role === 'user');
    const assistantMessages = removedMessages.filter((m) => m.role === 'assistant');

    const parts: string[] = [];
    if (userMessages.length > 0) {
      parts.push(`User asked about: ${userMessages.map((m) => m.content.slice(0, 50)).join(', ')}`);
    }
    if (assistantMessages.length > 0) {
      parts.push(`Assistant covered: ${assistantMessages.length} responses`);
    }

    return parts.join('. ');
  }

  private extractKeyPoints(messages: MemoryMessage[]): string[] {
    return messages
      .filter((m) => m.role === 'assistant' && m.content.length > 100)
      .slice(0, 3)
      .map((m) => m.content.slice(0, 100) + '...');
  }

  clear(conversationId: string): void {
    this.contexts.delete(conversationId);
    this.summaries.delete(conversationId);
  }

  clearAll(): void {
    this.contexts.clear();
    this.summaries.clear();
  }

  getContext(conversationId: string): RollingContext | undefined {
    return this.contexts.get(conversationId);
  }

  updateConfig(config: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    this.clearAll();
  }
}
