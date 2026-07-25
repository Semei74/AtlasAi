import { describe, it, expect, beforeEach } from "vitest";
import { ContextCollectorService } from "./context-collector.service.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";

function createSource(
  type: ContextSourceType,
  name: string,
  items: ContextItem[],
): ContextSource {
  return {
    type,
    name,
    collect: () => Promise.resolve(items),
    isAvailable: () => true,
  };
}

function createRequest(overrides?: Partial<ContextRequest>): ContextRequest {
  return {
    userId: "user-1",
    organizationId: "org-1",
    maxTokens: 1000,
    ...overrides,
  };
}

function createItem(overrides?: Partial<ContextItem>): ContextItem {
  return {
    id: "item-1",
    sourceType: ContextSourceType.System,
    content: "test content",
    metadata: {},
    tokenCount: 3,
    priority: 50,
    score: 0,
    freshness: new Date(),
    permissions: [],
    ...overrides,
  };
}

describe("ContextCollectorService", () => {
  let service: ContextCollectorService;

  beforeEach(() => {
    service = new ContextCollectorService();
  });

  describe("registerSource", () => {
    it("should register a source", () => {
      const source = createSource(ContextSourceType.System, "System", []);
      service.registerSource(source);
      expect(service.hasSource(ContextSourceType.System)).toBe(true);
    });
  });

  describe("removeSource", () => {
    it("should remove a registered source", () => {
      const source = createSource(ContextSourceType.System, "System", []);
      service.registerSource(source);
      service.removeSource(ContextSourceType.System);
      expect(service.hasSource(ContextSourceType.System)).toBe(false);
    });
  });

  describe("collect", () => {
    it("should collect items from all registered sources", async () => {
      const sysItem = createItem({ id: "sys", sourceType: ContextSourceType.System });
      const userItem = createItem({ id: "user", sourceType: ContextSourceType.User });

      service.registerSource(createSource(ContextSourceType.System, "System", [sysItem]));
      service.registerSource(createSource(ContextSourceType.User, "User", [userItem]));

      const items = await service.collect(createRequest());
      expect(items).toHaveLength(2);
    });

    it("should collect only from requested sources", async () => {
      const sysItem = createItem({ id: "sys", sourceType: ContextSourceType.System });
      const userItem = createItem({ id: "user", sourceType: ContextSourceType.User });

      service.registerSource(createSource(ContextSourceType.System, "System", [sysItem]));
      service.registerSource(createSource(ContextSourceType.User, "User", [userItem]));

      const items = await service.collect(createRequest(), [ContextSourceType.System]);
      expect(items).toHaveLength(1);
      expect(items[0]?.id).toBe("sys");
    });

    it("should skip unavailable sources", async () => {
      const unavailable: ContextSource = {
        type: ContextSourceType.External,
        name: "Unavailable",
        collect: () => Promise.resolve([createItem({ id: "ext" })]),
        isAvailable: () => false,
      };

      service.registerSource(unavailable);
      const items = await service.collect(createRequest());
      expect(items).toHaveLength(0);
    });

    it("should track source metrics", async () => {
      const item = createItem();
      service.registerSource(createSource(ContextSourceType.System, "System", [item]));
      await service.collect(createRequest());

      const metrics = service.getSourceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]?.collectCount).toBe(1);
      expect(metrics[0]?.totalItems).toBe(1);
      expect(metrics[0]?.lastCollectTime).toBeInstanceOf(Date);
    });
  });
});
