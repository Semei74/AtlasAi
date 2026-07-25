import { describe, it, expect, beforeEach } from "vitest";
import { AgentHealthService } from "./agent-health.service.js";

describe("AgentHealthService", () => {
  let service: AgentHealthService;

  beforeEach(() => {
    service = new AgentHealthService();
  });

  describe("getHealth", () => {
    it("should return unknown for unregistered agent", async () => {
      const health = await service.getHealth("unknown");
      expect(health.status).toBe("unknown");
      expect(health.lastChecked).toBeNull();
      expect(health.responseTimeMs).toBeNull();
      expect(health.lastError).toBeNull();
      expect(health.consecutiveFailures).toBe(0);
    });

    it("should return stored health", async () => {
      await service.updateHealth("agent-1", { status: "healthy" });
      const health = await service.getHealth("agent-1");
      expect(health.status).toBe("healthy");
    });
  });

  describe("updateHealth", () => {
    it("should merge partial updates", async () => {
      await service.updateHealth("agent-1", { status: "degraded", lastChecked: new Date("2025-01-01") });
      const health = await service.getHealth("agent-1");
      expect(health.status).toBe("degraded");
      expect(health.lastChecked).toEqual(new Date("2025-01-01"));
      expect(health.responseTimeMs).toBeNull();
    });

    it("should overwrite previous values", async () => {
      await service.updateHealth("agent-1", { status: "healthy", responseTimeMs: 100 });
      await service.updateHealth("agent-1", { status: "unhealthy" });
      const health = await service.getHealth("agent-1");
      expect(health.status).toBe("unhealthy");
      expect(health.responseTimeMs).toBe(100);
    });
  });

  describe("reportError", () => {
    it("should set status to unhealthy and increment failures", async () => {
      await service.reportError("agent-1", "Connection failed");
      const health = await service.getHealth("agent-1");
      expect(health.status).toBe("unhealthy");
      expect(health.lastError).toBe("Connection failed");
      expect(health.consecutiveFailures).toBe(1);
      expect(health.lastChecked).not.toBeNull();
    });

    it("should increment consecutive failures", async () => {
      await service.reportError("agent-1", "Error 1");
      await service.reportError("agent-1", "Error 2");
      const health = await service.getHealth("agent-1");
      expect(health.consecutiveFailures).toBe(2);
    });
  });

  describe("getAllHealthStates", () => {
    it("should return empty map initially", () => {
      const map = service.getAllHealthStates();
      expect(map.size).toBe(0);
    });

    it("should return all tracked health states", async () => {
      await service.updateHealth("a", { status: "healthy" });
      await service.updateHealth("b", { status: "degraded" });
      const map = service.getAllHealthStates();
      expect(map.size).toBe(2);
      expect(map.get("a")?.status).toBe("healthy");
      expect(map.get("b")?.status).toBe("degraded");
    });
  });
});
