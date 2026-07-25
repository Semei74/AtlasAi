import { describe, it, expect } from "vitest";
import { DeepseekProvider } from "./deepseek.provider.js";

describe("DeepseekProvider", () => {
  const provider = new DeepseekProvider();

  it("should expose metadata", () => {
    expect(provider.metadata.name).toBe("deepseek");
    expect(provider.metadata.version).toBe("1.0.0");
  });

  it("should expose capabilities", () => {
    expect(provider.capabilities.chat).toBe(true);
    expect(provider.capabilities.reasoning).toBe(true);
    expect(provider.capabilities.supportedModels).toContain("deepseek-chat");
  });

  it("should expose configuration", () => {
    expect(provider.configuration.timeout).toBe(30000);
    expect(provider.configuration.maxRetries).toBe(3);
    expect(provider.configuration.baseUrl).toBe("https://api.deepseek.com/v1");
  });

  it("should return unhealthy status when no API key", async () => {
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
  });

  it("should return provider error on chat when no API key", async () => {
    const result = await provider.chat({ model: "deepseek-chat", messages: [{ role: "user", content: "Hi" }], stream: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.statusCode).toBe(502);
    }
  });

  it("should update configuration", () => {
    provider.configure({ timeout: 60000 });
    expect(provider.configuration.timeout).toBe(60000);
    provider.configure({ timeout: 30000 });
  });
});
