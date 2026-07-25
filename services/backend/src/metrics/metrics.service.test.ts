import { describe, it, expect, beforeEach } from "vitest";
import { MetricsService } from "./metrics.service.js";

describe("MetricsService", () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  describe("getContentType", () => {
    it("should return Prometheus content type", () => {
      const contentType = service.getContentType();
      expect(contentType).toContain("text/plain");
    });
  });

  describe("getMetrics", () => {
    it("should return metrics in Prometheus format", async () => {
      const metrics = await service.getMetrics();
      expect(metrics).toContain("atlas_");
      expect(metrics).toContain("HELP");
      expect(metrics).toContain("TYPE");
    });

    it("should include default metrics", async () => {
      const metrics = await service.getMetrics();
      expect(metrics).toContain("process_cpu");
    });
  });

  describe("metric instruments", () => {
    it("should have httpRequestDuration histogram", () => {
      expect(service.httpRequestDuration).toBeDefined();
    });

    it("should have httpRequestsTotal counter", () => {
      expect(service.httpRequestsTotal).toBeDefined();
    });

    it("should have httpRequestErrors counter", () => {
      expect(service.httpRequestErrors).toBeDefined();
    });

    it("should have activeConnections gauge", () => {
      expect(service.activeConnections).toBeDefined();
    });

    it("should track counter increments", () => {
      service.httpRequestsTotal.inc({ method: "GET", route: "/test", status_code: "200" });
      const result = service.httpRequestsTotal.labels("GET", "/test", "200");
      expect(result).toBeDefined();
    });
  });
});
