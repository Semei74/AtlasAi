import { describe, it, expect } from "vitest";
import { MetricsController } from "./metrics.controller.js";
import { MetricsService } from "./metrics.service.js";

describe("MetricsController", () => {
  const service = new MetricsService();
  const controller = new MetricsController(service);

  describe("metrics", () => {
    it("should return Prometheus metrics string", async () => {
      const result = await controller.metrics();
      expect(result).toContain("atlas_");
      expect(result).toContain("HELP");
      expect(result).toContain("TYPE");
    });

    it("should include default metrics", async () => {
      const result = await controller.metrics();
      expect(result).toContain("process_cpu");
    });
  });
});
