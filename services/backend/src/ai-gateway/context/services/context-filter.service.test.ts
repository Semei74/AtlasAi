import { describe, it, expect, beforeEach } from "vitest";
import { ContextFilterService } from "./context-filter.service.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";

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

function createRequest(overrides?: Partial<ContextRequest>): ContextRequest {
  return {
    userId: "user-1",
    organizationId: "org-1",
    maxTokens: 1000,
    ...overrides,
  };
}

describe("ContextFilterService", () => {
  let service: ContextFilterService;

  beforeEach(() => {
    service = new ContextFilterService();
  });

  describe("filter", () => {
    it("should keep items with no permissions", () => {
      const item = createItem({ permissions: [] });
      const result = service.filter([item], createRequest());
      expect(result).toHaveLength(1);
    });

    it("should keep items matching user permissions", () => {
      const item = createItem({ permissions: ["doc:read"] });
      const request = createRequest({
        options: { securityContext: { roles: [], permissions: ["doc:read"] } },
      });
      const result = service.filter([item], request);
      expect(result).toHaveLength(1);
    });

    it("should filter out items without matching permissions", () => {
      const item = createItem({ permissions: ["admin:access"] });
      const request = createRequest({
        options: { securityContext: { roles: [], permissions: ["doc:read"] } },
      });
      const result = service.filter([item], request);
      expect(result).toHaveLength(0);
    });

    it("should keep items when no security context is provided", () => {
      const item = createItem({ permissions: ["admin:access"] });
      const result = service.filter([item], createRequest());
      expect(result).toHaveLength(1);
    });
  });

  describe("maskSensitiveData", () => {
    it("should mask email addresses", () => {
      const item = createItem({ content: "Contact: user@example.com" });
      const result = service.maskSensitiveData([item]);
      expect(result[0]?.content).toContain("[EMAIL]");
      expect(result[0]?.content).not.toContain("user@example.com");
    });

    it("should mask phone numbers", () => {
      const item = createItem({ content: "Call: 555-123-4567" });
      const result = service.maskSensitiveData([item]);
      expect(result[0]?.content).toContain("[PHONE]");
    });

    it("should mask SSNs", () => {
      const item = createItem({ content: "SSN: 123-45-6789" });
      const result = service.maskSensitiveData([item]);
      expect(result[0]?.content).toContain("[SSN]");
    });

    it("should handle content with no sensitive data", () => {
      const item = createItem({ content: "Just regular content" });
      const result = service.maskSensitiveData([item]);
      expect(result[0]?.content).toBe("Just regular content");
    });
  });
});
