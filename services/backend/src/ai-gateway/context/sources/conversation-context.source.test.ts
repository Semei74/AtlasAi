import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConversationContextSource } from "./conversation-context.source.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

describe("ConversationContextSource", () => {
  let source: ConversationContextSource;
  let mockDb: { aiRequest: { findMany: ReturnType<typeof vi.fn> } };

  function makeRequest(overrides?: Partial<ContextRequest>): ContextRequest {
    return {
      userId: "user-1",
      organizationId: "org-1",
      workspaceId: "ws-1",
      conversationId: "conv-1",
      maxTokens: 1000,
      ...overrides,
    };
  }

  beforeEach(() => {
    mockDb = {
      aiRequest: {
        findMany: vi.fn(),
      },
    };
    source = new ConversationContextSource(mockDb as unknown as PrismaService);
  });

  it("should have correct type and name", () => {
    expect(source.type).toBe(ContextSourceType.Conversation);
    expect(source.name).toBe("Conversation History");
  });

  it("should return conversation items from AiRequest records", async () => {
    const now = new Date();
    mockDb.aiRequest.findMany.mockResolvedValue([
      { id: "req-2", model: "claude-3", provider: "anthropic", promptTokens: 30, completionTokens: 60, totalTokens: 90, duration: 300, success: true, createdAt: now, userId: "user-1", organizationId: "org-1", workspaceId: "ws-1" },
      { id: "req-1", model: "gpt-4", provider: "openai", promptTokens: 50, completionTokens: 100, totalTokens: 150, duration: 500, success: true, createdAt: new Date(now.getTime() - 60000), userId: "user-1", organizationId: "org-1", workspaceId: "ws-1" },
    ]);

    const items = await source.collect(makeRequest());

    expect(items).toHaveLength(2);
    expect(items[0]?.sourceType).toBe(ContextSourceType.Conversation);
    expect(items[0]?.content).toContain("gpt-4");
    expect(items[0]?.permissions).toContain("conversation:read");
    expect(items[1]?.content).toContain("claude-3");
  });

  it("should return empty when no conversationId", async () => {
    const items = await source.collect(makeRequest({ conversationId: undefined as unknown as string }));
    expect(items).toHaveLength(0);
  });

  it("should return empty when includeConversationHistory is false", async () => {
    const items = await source.collect(makeRequest({
      options: { includeConversationHistory: false },
    }));
    expect(items).toHaveLength(0);
  });

  it("should return fallback when no AiRequest records found", async () => {
    mockDb.aiRequest.findMany.mockResolvedValue([]);

    const items = await source.collect(makeRequest());

    expect(items).toHaveLength(1);
    expect(items[0]?.content).toContain("Conversation");
    expect(items[0]?.content).toContain("conv-1");
  });

  it("should return fallback on database error", async () => {
    mockDb.aiRequest.findMany.mockRejectedValue(new Error("DB error"));

    const items = await source.collect(makeRequest());

    expect(items).toHaveLength(1);
    expect(items[0]?.content).toContain("Conversation");
  });

  it("should query AiRequests with correct filters", async () => {
    mockDb.aiRequest.findMany.mockResolvedValue([]);

    await source.collect(makeRequest());

    expect(mockDb.aiRequest.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        organizationId: "org-1",
        workspaceId: "ws-1",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  });

  it("should be always available", () => {
    expect(source.isAvailable()).toBe(true);
  });
});
