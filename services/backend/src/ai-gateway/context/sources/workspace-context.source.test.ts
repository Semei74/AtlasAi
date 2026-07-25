import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkspaceContextSource } from "./workspace-context.source.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

describe("WorkspaceContextSource", () => {
  let source: WorkspaceContextSource;
  let mockDb: { workspace: { findUnique: ReturnType<typeof vi.fn> } };

  function makeRequest(overrides?: Partial<ContextRequest>): ContextRequest {
    return {
      userId: "user-1",
      organizationId: "org-1",
      workspaceId: "ws-1",
      maxTokens: 1000,
      ...overrides,
    };
  }

  beforeEach(() => {
    mockDb = {
      workspace: {
        findUnique: vi.fn(),
      },
    };
    source = new WorkspaceContextSource(mockDb as unknown as PrismaService);
  });

  it("should have correct type and name", () => {
    expect(source.type).toBe(ContextSourceType.Workspace);
    expect(source.name).toBe("Workspace Context");
  });

  it("should return workspace context when workspaceId is provided", async () => {
    mockDb.workspace.findUnique.mockResolvedValue({
      id: "ws-1",
      organizationId: "org-1",
      name: "My Workspace",
      description: "A test workspace",
      color: "#ff0000",
      icon: null,
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const items = await source.collect(makeRequest());

    expect(items).toHaveLength(1);
    expect(items[0]?.sourceType).toBe(ContextSourceType.Workspace);
    expect(items[0]?.content).toContain("My Workspace");
    expect(items[0]?.content).toContain("A test workspace");
    expect(items[0]?.content).toContain("#ff0000");
    expect(items[0]?.permissions).toContain("workspace:read");
  });

  it("should return empty when no workspaceId", async () => {
    const items = await source.collect(makeRequest({ workspaceId: undefined as unknown as string }));
    expect(items).toHaveLength(0);
  });

  it("should return empty when workspace not found", async () => {
    mockDb.workspace.findUnique.mockResolvedValue(null);

    const items = await source.collect(makeRequest());
    expect(items).toHaveLength(0);
  });

  it("should handle missing description", async () => {
    mockDb.workspace.findUnique.mockResolvedValue({
      id: "ws-1",
      organizationId: "org-1",
      name: "Minimal",
      description: null,
      color: null,
      icon: null,
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const items = await source.collect(makeRequest());
    expect(items).toHaveLength(1);
    expect(items[0]?.content).toContain("Minimal");
    expect(items[0]?.content).not.toContain("Description:");
  });

  it("should handle database errors gracefully", async () => {
    mockDb.workspace.findUnique.mockRejectedValue(new Error("DB error"));

    const items = await source.collect(makeRequest());
    expect(items).toHaveLength(0);
  });

  it("should always be available", () => {
    expect(source.isAvailable()).toBe(true);
  });

  it("should query the correct workspace ID", async () => {
    mockDb.workspace.findUnique.mockResolvedValue({
      id: "ws-1",
      organizationId: "org-1",
      name: "Test",
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await source.collect(makeRequest());

    expect(mockDb.workspace.findUnique).toHaveBeenCalledWith({
      where: { id: "ws-1" },
    });
  });
});
