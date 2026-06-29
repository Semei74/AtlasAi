import { describe, it, expect } from "vitest";
import { HealthService } from "./health.service.js";

describe("HealthService", () => {
  const service = new HealthService();

  describe("check", () => {
    it("should return ok status", () => {
      const result = service.check();
      expect(result.status).toBe("ok");
    });

    it("should include uptime as a positive number", () => {
      const result = service.check();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include a valid ISO timestamp", () => {
      const result = service.check();
      const parsed = new Date(result.timestamp);
      expect(parsed.toISOString()).toBe(result.timestamp);
    });
  });

  describe("readiness", () => {
    it("should return ok status with dependency checks", () => {
      const result = service.readiness();
      expect(result.status).toBe("ok");
      expect(result.dependencies.database).toBe("not_checked");
      expect(result.dependencies.redis).toBe("not_checked");
      expect(result.dependencies.storage).toBe("not_checked");
    });
  });

  describe("liveness", () => {
    it("should return ok status with memory info", () => {
      const result = service.liveness();
      expect(result.status).toBe("ok");
      expect(result.memory.heapUsed).toBeGreaterThan(0);
      expect(result.memory.heapTotal).toBeGreaterThan(0);
      expect(result.memory.rss).toBeGreaterThan(0);
    });
  });
});
