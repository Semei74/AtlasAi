import { Injectable } from "@nestjs/common";
import type { MemoryWindow } from "../interfaces/agent-memory-window.interface.js";
import type { MemorySummarizer } from "../interfaces/agent-memory-summarizer.interface.js";

@Injectable()
export class MemorySummarizerService implements MemorySummarizer {
  public summarize(window: MemoryWindow, maxTokens?: number): Promise<string> {
    const limit = maxTokens ?? Math.ceil(window.totalTokens * 0.3);

    const combined = window.entries
      .map((e) => `[${e.key}] ${e.value}`)
      .join("\n");

    if (this.estimateTokens(combined) <= limit) {
      return Promise.resolve(combined);
    }

    const items: string[] = [];
    let tokenCount = 0;

    for (const entry of window.entries) {
      const line = `[${entry.key}] ${entry.value}`;
      const tokens = this.estimateTokens(line);
      if (tokenCount + tokens > limit) break;
      items.push(line);
      tokenCount += tokens;
    }

    return Promise.resolve(
      `<summary of ${window.type} memory for agent "${window.agentId}" — ${String(window.entryCount)} entries, truncated to ~${String(limit)} tokens>\n\n${items.join("\n")}`,
    );
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
