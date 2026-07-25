import { describe, it, expect } from "vitest";
import { HealthService } from "./health.service.js";
import type { HealthContributor, HealthStatusValue } from "./health-contributor.interface.js";

function contributor(name: string, status: HealthStatusValue): HealthContributor {
  return { name, check: async () => status };
}

describe("HealthService", () => {
  describe("check", () => {
    it("should return ok status", () => {
      const service = new HealthService([]);
      const result = service.check();
      expect(result.status).toBe("ok");
    });

    it("should include uptime as a positive number", () => {
      const service = new HealthService([]);
      const result = service.check();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include a valid ISO timestamp", () => {
      const service = new HealthService([]);
      const result = service.check();
      const parsed = new Date(result.timestamp);
      expect(parsed.toISOString()).toBe(result.timestamp);
    });

    it("should include version and build info", () => {
      const service = new HealthService([]);
      const result = service.check();
      expect(result.version).toBeDefined();
      expect(result.build.version).toBeDefined();
      expect(result.build.nodeVersion).toBeDefined();
    });
  });

  describe("readiness", () => {
    it("should return ok when all contributors are connected", async () => {
      const service = new HealthService([
        contributor("database", "connected"),
        contributor("redis", "connected"),
        contributor("storage", "not_checked"),
        contributor("search", "not_checked"),
      ]);
      const result = await service.readiness();
      expect(result.status).toBe("ok");
      expect(result.dependencies.database).toBe("connected");
      expect(result.dependencies.redis).toBe("connected");
      expect(result.dependencies.storage).toBe("not_checked");
      expect(result.dependencies.search).toBe("not_checked");
    });

    it("should return degraded when database is disconnected", async () => {
      const service = new HealthService([
        contributor("database", "disconnected"),
        contributor("redis", "connected"),
      ]);
      const result = await service.readiness();
      expect(result.status).toBe("degraded");
      expect(result.dependencies.database).toBe("disconnected");
    });

    it("should return degraded when storage is disconnected", async () => {
      const service = new HealthService([
        contributor("database", "connected"),
        contributor("redis", "connected"),
        contributor("storage", "disconnected"),
      ]);
      const result = await service.readiness();
      expect(result.status).toBe("degraded");
    });

    it("should default missing contributors to not_checked", async () => {
      const service = new HealthService([
        contributor("database", "connected"),
      ]);
      const result = await service.readiness();
      expect(result.dependencies.redis).toBe("not_checked");
      expect(result.dependencies.storage).toBe("not_checked");
      expect(result.dependencies.search).toBe("not_checked");
    });
  });

  describe("liveness", () => {
    it("should return ok status with memory info", () => {
      const service = new HealthService([]);
      const result = service.liveness();
      expect(result.status).toBe("ok");
      expect(result.memory.heapUsed).toBeGreaterThan(0);
      expect(result.memory.heapTotal).toBeGreaterThan(0);
      expect(result.memory.rss).toBeGreaterThan(0);
    });
  });
});
