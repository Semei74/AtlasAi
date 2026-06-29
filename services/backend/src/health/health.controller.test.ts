import { describe, it, expect } from "vitest";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
  const service = new HealthService();
  const controller = new HealthController(service);

  describe("check", () => {
    it("should return health status", () => {
      const result = controller.check();
      expect(result.status).toBe("ok");
    });
  });

  describe("readiness", () => {
    it("should return readiness status", () => {
      const result = controller.readiness();
      expect(result.status).toBe("ok");
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
