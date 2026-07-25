import { describe, it, expect } from "vitest";
import { GroqProvider } from "./groq.provider.js";

describe("GroqProvider", () => {
  const provider = new GroqProvider();

  it("should expose metadata", () => {
    expect(provider.metadata.name).toBe("groq");
  });

  it("should expose capabilities", () => {
    expect(provider.capabilities.chat).toBe(true);
    expect(provider.capabilities.streaming).toBe(true);
    expect(provider.capabilities.supportedModels).toContain("llama-4-scout-17b-16e-instruct");
  });

  it("should expose configuration", () => {
    expect(provider.configuration.timeout).toBe(30000);
    expect(provider.configuration.maxRetries).toBe(3);
    expect(provider.configuration.baseUrl).toBe("https://api.groq.com/openai/v1");
  });

  it("should return unhealthy when no API key", async () => {
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
  });

  it("should return provider error on chat when no API key", async () => {
    const result = await provider.chat({ model: "llama-4-scout-17b-16e-instruct", messages: [{ role: "user", content: "Hi" }], stream: false });
    expect(result.success).toBe(false);
  });

  it("should update configuration", () => {
    provider.configure({ timeout: 60000 });
    expect(provider.configuration.timeout).toBe(60000);
    provider.configure({ timeout: 30000 });
  });
});
