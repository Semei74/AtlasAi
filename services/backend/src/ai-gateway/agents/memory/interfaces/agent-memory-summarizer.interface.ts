import type { MemoryWindow } from "./agent-memory-window.interface.js";

export interface MemorySummarizer {
  summarize(window: MemoryWindow, maxTokens?: number): Promise<string>;
}

export const MEMORY_SUMMARIZER = "MEMORY_SUMMARIZER";
