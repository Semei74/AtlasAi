import { describe, it, expect, beforeEach } from "vitest";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(() => {
    const service = new HealthService([]);
    controller = new HealthController(service);
  });

  describe("check", () => {
    it("should return health status", () => {
      const result = controller.check();
      expect(result.status).toBe("ok");
    });
  });

  describe("readiness", () => {
    it("should return degraded when no contributors registered", async () => {
      const result = await controller.readiness();
      expect(result.status).toBe("degraded");
      expect(result.dependencies).toBeDefined();
    });
  });

  describe("liveness", () => {
    it("should return liveness status", () => {
      const result = controller.liveness();
      expect(result.status).toBe("ok");
      expect(result.memory).toBeDefined();
    });
  });
});
