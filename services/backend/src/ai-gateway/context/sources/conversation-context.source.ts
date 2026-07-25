import { Injectable } from "@nestjs/common";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import { PrismaService } from "../../../prisma/prisma.service.js";
import { TokenCounter } from "../utils/token-counter.js";

const MAX_CONVERSATION_ITEMS = 20;

@Injectable()
export class ConversationContextSource implements ContextSource {
  public readonly type = ContextSourceType.Conversation;
  public readonly name = "Conversation History";
  private readonly tokenCounter = new TokenCounter();

  public constructor(private readonly prisma: PrismaService) {}

  public async collect(request: ContextRequest): Promise<readonly ContextItem[]> {
    if (request.conversationId === undefined || request.options?.includeConversationHistory === false) {
      return [];
    }

    try {
      const requests = await this.prisma.aiRequest.findMany({
        where: {
          userId: request.userId,
          organizationId: request.organizationId,
          ...(request.workspaceId !== undefined ? { workspaceId: request.workspaceId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: MAX_CONVERSATION_ITEMS,
      });

      if (requests.length === 0) {
        return this.#buildFallbackItem(request);
      }

      const items: ContextItem[] = requests.reverse().map((req, index) => {
        const content = `[${req.model}] ${req.success ? "OK" : "FAIL"} — prompt: ${String(req.promptTokens)}t, completion: ${String(req.completionTokens)}t`;
        const tokenCount = this.tokenCounter.estimateTokens(content);

        return {
          id: `ai-request:${req.id}`,
          sourceType: ContextSourceType.Conversation,
          content,
          metadata: {
            requestId: req.id,
            model: req.model,
            provider: req.provider,
            promptTokens: req.promptTokens,
            completionTokens: req.completionTokens,
            totalTokens: req.totalTokens,
            duration: req.duration,
            success: req.success,
            createdAt: req.createdAt.toISOString(),
            label: `Request ${String(index + 1)}`,
          },
          tokenCount,
          priority: 50,
          score: 0,
          freshness: req.createdAt,
          permissions: ["conversation:read"],
        };
      });

      return items;
    } catch {
      return this.#buildFallbackItem(request);
    }
  }

  public isAvailable(): boolean {
    return true;
  }

  #buildFallbackItem(request: ContextRequest): ContextItem[] {
    const convId = request.conversationId ?? "";
    const content = `[Conversation: ${convId}]\nConversation context will be populated when conversation history is available.`;
    return [{
      id: `conv:${convId}`,
      sourceType: ContextSourceType.Conversation,
      content,
      metadata: { conversationId: request.conversationId, label: "Previous Conversation" },
      tokenCount: this.tokenCounter.estimateTokens(content),
      priority: 50,
      score: 0,
      freshness: new Date(),
      permissions: ["conversation:read"],
    }];
  }
}
