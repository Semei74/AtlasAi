import { describe, it, expect, beforeEach } from "vitest";
import { AgentVersionService } from "./agent-version.service.js";
import type { AgentVersionInfo } from "../interfaces/agent-version.interface.js";

function createVersion(overrides?: Partial<AgentVersionInfo>): AgentVersionInfo {
  return {
    agentId: "agent-1",
    version: "1.0.0",
    createdAt: new Date("2025-01-01"),
    changelog: "Initial release",
    deprecated: false,
    deprecationMessage: null,
    compatibility: {
      minRuntimeVersion: "1.0.0",
      maxRuntimeVersion: "99.0.0",
      breakingChanges: [],
    },
    ...overrides,
  };
}

describe("AgentVersionService", () => {
  let service: AgentVersionService;

  beforeEach(() => {
    service = new AgentVersionService();
  });

  describe("registerVersion", () => {
    it("should register a version", async () => {
      await service.registerVersion(createVersion());
      const history = await service.getVersionHistory("agent-1");
      expect(history).toHaveLength(1);
    });

    it("should reject duplicate versions", async () => {
      await service.registerVersion(createVersion());
      await expect(service.registerVersion(createVersion())).rejects.toThrow("already registered");
    });

    it("should support multiple versions", async () => {
      await service.registerVersion(createVersion({ version: "1.0.0" }));
      await service.registerVersion(createVersion({ version: "2.0.0", createdAt: new Date("2025-06-01") }));
      const history = await service.getVersionHistory("agent-1");
      expect(history).toHaveLength(2);
    });
  });

  describe("getVersionHistory", () => {
    it("should return empty array for unknown agent", async () => {
      const history = await service.getVersionHistory("unknown");
      expect(history).toHaveLength(0);
    });

    it("should return all versions in sorted order", async () => {
      await service.registerVersion(createVersion({ version: "2.0.0", createdAt: new Date("2025-06-01") }));
      await service.registerVersion(createVersion({ version: "1.0.0", createdAt: new Date("2025-01-01") }));
      const history = await service.getVersionHistory("agent-1");
      expect(history[0]?.version).toBe("2.0.0");
      expect(history[1]?.version).toBe("1.0.0");
    });
  });

  describe("getLatestVersion", () => {
    it("should return null for unknown agent", async () => {
      const version = await service.getLatestVersion("unknown");
      expect(version).toBeNull();
    });

    it("should return the most recent version", async () => {
      await service.registerVersion(createVersion({ version: "1.0.0", createdAt: new Date("2025-01-01") }));
      await service.registerVersion(createVersion({ version: "2.0.0", createdAt: new Date("2025-06-01") }));
      const latest = await service.getLatestVersion("agent-1");
      expect(latest?.version).toBe("2.0.0");
    });
  });

  describe("deprecateVersion", () => {
    it("should mark a version as deprecated", async () => {
      await service.registerVersion(createVersion());
      await service.deprecateVersion("agent-1", "1.0.0", "Use 2.0.0 instead");
      const history = await service.getVersionHistory("agent-1");
      expect(history[0]?.deprecated).toBe(true);
      expect(history[0]?.deprecationMessage).toBe("Use 2.0.0 instead");
    });

    it("should reject for unknown agent", async () => {
      await expect(service.deprecateVersion("unknown", "1.0.0", "reason")).rejects.toThrow("No versions found");
    });
  });

  describe("removeAgentVersions", () => {
    it("should remove all versions for an agent", async () => {
      await service.registerVersion(createVersion());
      await service.removeAgentVersions("agent-1");
      const history = await service.getVersionHistory("agent-1");
      expect(history).toHaveLength(0);
    });

    it("should not throw for unknown agent", async () => {
      await service.removeAgentVersions("unknown");
    });
  });
});
