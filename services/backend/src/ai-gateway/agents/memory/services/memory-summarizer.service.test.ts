import { describe, it, expect, beforeEach } from "vitest";
import { MemorySummarizerService } from "./memory-summarizer.service.js";
import type { MemoryWindow } from "../interfaces/agent-memory-window.interface.js";

function createTestWindow(overrides: Partial<MemoryWindow> = {}): MemoryWindow {
  return {
    agentId: "agent-1",
    type: "session" as const,
    entries: [
      { id: "e1", key: "k1", value: "hello world", tokenCount: 3, timestamp: new Date("2024-01-01"), metadata: {} },
      { id: "e2", key: "k2", value: "foo bar baz", tokenCount: 3, timestamp: new Date("2024-01-02"), metadata: {} },
    ],
    summary: null,
    totalTokens: 6,
    entryCount: 2,
    startTime: new Date("2024-01-01"),
    endTime: new Date("2024-01-02"),
    ...overrides,
  };
}

describe("MemorySummarizerService", () => {
  let summarizer: MemorySummarizerService;

  beforeEach(() => {
    summarizer = new MemorySummarizerService();
  });

  describe("summarize", () => {
    it("should return combined entries when under token limit", async () => {
      const window = createTestWindow({ totalTokens: 30 });
      const result = await summarizer.summarize(window);
      expect(result).toContain("[k1] hello world");
      expect(result).toContain("[k2] foo bar baz");
    });

    it("should truncate when over token limit", async () => {
      const longValue = "x".repeat(400);
      const window = createTestWindow({
        entries: [
          { id: "e1", key: "k1", value: longValue, tokenCount: 100, timestamp: new Date("2024-01-01"), metadata: {} },
          { id: "e2", key: "k2", value: "short", tokenCount: 2, timestamp: new Date("2024-01-02"), metadata: {} },
        ],
        totalTokens: 102,
      });
      const result = await summarizer.summarize(window, 10);
      expect(result).toContain("<summary of");
      expect(result).toContain("truncated");
    });

    it("should include summary header with metadata", async () => {
      const window = createTestWindow({ totalTokens: 100 });
      const result = await summarizer.summarize(window, 1);
      expect(result).toContain("session memory");
      expect(result).toContain("agent-1");
    });

    it("should respect custom maxTokens parameter", async () => {
      const window = createTestWindow({ totalTokens: 50 });
      const result = await summarizer.summarize(window, 100);
      expect(result).toContain("[k1] hello world");
      expect(result).toContain("[k2] foo bar baz");
      expect(result).not.toContain("<summary of");
    });
  });
});
