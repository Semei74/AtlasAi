export type MemoryStrategy = "sliding_window" | "token_budget" | "summary" | "semantic";

export interface ConversationMessage {
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
  readonly timestamp: string;
  readonly tokenCount: number | null;
}

export interface ConversationMemory {
  readonly addMessage: (conversationId: string, message: ConversationMessage) => Promise<void>;
  readonly getHistory: (conversationId: string) => Promise<readonly ConversationMessage[]>;
  readonly clear: (conversationId: string) => Promise<void>;
  readonly getContextWindow: (conversationId: string, maxTokens: number) => Promise<readonly ConversationMessage[]>;
  readonly strategy: MemoryStrategy;
}
