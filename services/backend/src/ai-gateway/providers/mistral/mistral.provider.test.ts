import { describe, it, expect } from "vitest";
import { MistralProvider } from "./mistral.provider.js";

describe("MistralProvider", () => {
  const provider = new MistralProvider();

  it("should expose metadata", () => {
    expect(provider.metadata.name).toBe("mistral");
  });

  it("should expose capabilities", () => {
    expect(provider.capabilities.chat).toBe(true);
    expect(provider.capabilities.embeddings).toBe(true);
    expect(provider.capabilities.toolCalling).toBe(true);
    expect(provider.capabilities.supportedModels).toContain("mistral-large-latest");
  });

  it("should expose configuration", () => {
    expect(provider.configuration.timeout).toBe(30000);
    expect(provider.configuration.maxRetries).toBe(3);
    expect(provider.configuration.baseUrl).toBe("https://api.mistral.ai/v1");
  });

  it("should return unhealthy when no API key", async () => {
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
  });

  it("should return provider error on chat when no API key", async () => {
    const result = await provider.chat({ model: "mistral-large-latest", messages: [{ role: "user", content: "Hi" }], stream: false });
    expect(result.success).toBe(false);
  });

  it("should update configuration", () => {
    provider.configure({ timeout: 60000 });
    expect(provider.configuration.timeout).toBe(60000);
    provider.configure({ timeout: 30000 });
  });
});
