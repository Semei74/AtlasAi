import { describe, it, expect, beforeEach } from "vitest";
import { SystemContextSource } from "./system-context.source.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";

describe("SystemContextSource", () => {
  let source: SystemContextSource;

  function makeRequest(overrides?: Partial<ContextRequest>): ContextRequest {
    return {
      userId: "user-1",
      organizationId: "org-1",
      maxTokens: 1000,
      ...overrides,
    };
  }

  beforeEach(() => {
    source = new SystemContextSource();
  });

  it("should have correct type and name", () => {
    expect(source.type).toBe(ContextSourceType.System);
    expect(source.name).toBe("System Context");
  });

  it("should return system context item with current timestamp", async () => {
    const before = Date.now();
    const items = await source.collect(makeRequest());
    expect(items).toHaveLength(1);
    expect(items[0]?.sourceType).toBe(ContextSourceType.System);
    expect(items[0]?.id).toBe("system:current");
    expect(items[0]?.content).toContain("Current Date/Time");
    expect(items[0]?.content).toContain("Timestamp:");
    expect(items[0]?.permissions).toEqual([]);
    expect(items[0]?.priority).toBe(30);

    const timestampMatch = /Timestamp:\s*(\d+)/.exec(items[0]?.content ?? "");
    expect(timestampMatch).not.toBeNull();
    const timestamp = Number(timestampMatch![1]);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(before + 5000);
  });

  it("should return empty when includeSystemContext is false", async () => {
    const items = await source.collect(makeRequest({
      options: { includeSystemContext: false },
    }));
    expect(items).toHaveLength(0);
  });

  it("should return system context when includeSystemContext is not set", async () => {
    const items = await source.collect(makeRequest());
    expect(items).toHaveLength(1);
  });

  it("should always be available", () => {
    expect(source.isAvailable()).toBe(true);
  });
});
