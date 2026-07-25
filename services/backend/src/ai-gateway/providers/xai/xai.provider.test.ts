import { describe, it, expect } from "vitest";
import { XaiProvider } from "./xai.provider.js";

describe("XaiProvider", () => {
  const provider = new XaiProvider();

  it("should expose metadata", () => {
    expect(provider.metadata.name).toBe("xai");
  });

  it("should expose capabilities", () => {
    expect(provider.capabilities.chat).toBe(true);
    expect(provider.capabilities.streaming).toBe(true);
    expect(provider.capabilities.supportedModels).toContain("grok-3");
  });

  it("should expose configuration", () => {
    expect(provider.configuration.timeout).toBe(30000);
    expect(provider.configuration.maxRetries).toBe(3);
    expect(provider.configuration.baseUrl).toBe("https://api.x.ai/v1");
  });

  it("should return unhealthy when no API key", async () => {
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
  });

  it("should return provider error on chat when no API key", async () => {
    const result = await provider.chat({ model: "grok-3", messages: [{ role: "user", content: "Hi" }], stream: false });
    expect(result.success).toBe(false);
  });

  it("should update configuration", () => {
    provider.configure({ timeout: 60000 });
    expect(provider.configuration.timeout).toBe(60000);
    provider.configure({ timeout: 30000 });
  });
});
