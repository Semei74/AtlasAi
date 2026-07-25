import { describe, it, expect, beforeEach } from "vitest";
import { UserContextSource } from "./user-context.source.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";

describe("UserContextSource", () => {
  let source: UserContextSource;

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
    source = new UserContextSource();
  });

  it("should have correct type and name", () => {
    expect(source.type).toBe(ContextSourceType.User);
    expect(source.name).toBe("User Context");
  });

  it("should return user context item", async () => {
    const items = await source.collect(makeRequest());

    expect(items).toHaveLength(1);
    expect(items[0]?.sourceType).toBe(ContextSourceType.User);
    expect(items[0]?.content).toContain("user-1");
    expect(items[0]?.content).toContain("org-1");
    expect(items[0]?.content).toContain("ws-1");
    expect(items[0]?.permissions).toContain("user:profile:read");
    expect(items[0]?.priority).toBe(40);
  });

  it("should include workspace info when workspaceId is provided", async () => {
    const items = await source.collect(makeRequest({ workspaceId: "custom-ws" }));
    expect(items[0]?.content).toContain("custom-ws");
  });

  it("should omit workspace info when workspaceId is undefined", async () => {
    const items = await source.collect({ userId: "user-1", organizationId: "org-1", maxTokens: 1000 });
    expect(items[0]?.content).not.toContain("Workspace ID:");
  });

  it("should return empty when includeUserContext is false", async () => {
    const items = await source.collect(makeRequest({
      options: { includeUserContext: false },
    }));
    expect(items).toHaveLength(0);
  });

  it("should return user context when includeUserContext is not set", async () => {
    const items = await source.collect(makeRequest());
    expect(items).toHaveLength(1);
  });

  it("should set metadata with user and org IDs", async () => {
    const items = await source.collect(makeRequest());
    const meta = items[0]?.metadata as Record<string, unknown>;
    expect(meta["userId"]).toBe("user-1");
    expect(meta["organizationId"]).toBe("org-1");
    expect(meta["label"]).toBe("User Information");
  });

  it("should always be available", () => {
    expect(source.isAvailable()).toBe(true);
  });
});
