import { Injectable } from "@nestjs/common";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextSourceType } from "../interfaces/context-source-type.enum.js";

@Injectable()
export class ContextComposerService {
  public compose(items: readonly ContextItem[]): string {
    const grouped = this.groupBySource(items);
    const parts: string[] = [];

    for (const [sourceType, groupItems] of grouped) {
      const header = this.formatSourceHeader(sourceType);

      const contents = groupItems.map((item) => {
        const label = item.metadata["label"];
        if (label !== undefined) {
          return `[${label as string}]\n${item.content}`;
        }
        return item.content;
      });

      parts.push(`${header}\n${contents.join("\n\n")}`);
    }

    return parts.join("\n\n");
  }

  public computeSourceBreakdown(
    items: readonly ContextItem[],
  ): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const item of items) {
      const key = item.sourceType;
      breakdown[key] = (breakdown[key] ?? 0) + item.tokenCount;
    }
    return breakdown;
  }

  private groupBySource(
    items: readonly ContextItem[],
  ): Map<ContextSourceType, ContextItem[]> {
    const grouped = new Map<ContextSourceType, ContextItem[]>();
    for (const item of items) {
      const group = grouped.get(item.sourceType);
      if (group === undefined) {
        grouped.set(item.sourceType, [item]);
      } else {
        group.push(item);
      }
    }
    return grouped;
  }

  private formatSourceHeader(sourceType: ContextSourceType): string {
    const labels: Record<string, string> = {
      conversation: "Conversation History",
      user: "User Context",
      workspace: "Workspace Context",
      document: "Documents",
      knowledgeBase: "Knowledge Base",
      agentMemory: "Agent Memory",
      system: "System Context",
      external: "External Data",
      cached: "Cached Results",
      runtime: "Runtime Variables",
    };

    const label = labels[sourceType] ?? sourceType;
    const separator = "=".repeat(label.length + 4);
    return `${separator}\n  ${label}\n${separator}`;
  }
}
