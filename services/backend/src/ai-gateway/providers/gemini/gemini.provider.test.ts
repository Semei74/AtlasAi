import { describe, it, expect } from "vitest";
import { GeminiProvider } from "./gemini.provider.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";

describe("GeminiProvider", () => {
  const provider = new GeminiProvider();

  it("should expose metadata", () => {
    expect(provider.metadata.name).toBe("gemini");
    expect(provider.metadata.version).toBe("1.0.0");
    expect(provider.metadata.description).toBeTruthy();
  });

  it("should expose capabilities", () => {
    expect(provider.capabilities.chat).toBe(true);
    expect(provider.capabilities.streaming).toBe(true);
    expect(provider.capabilities.embeddings).toBe(true);
    expect(provider.capabilities.supportedModels).toContain("gemini-2.5-pro");
    expect(provider.capabilities.supportedModels).toContain("gemini-2.5-flash");
  });

  it("should expose configuration", () => {
    expect(provider.configuration.timeout).toBe(30000);
    expect(provider.configuration.maxRetries).toBe(3);
    expect(provider.configuration.baseUrl).toBe("https://generativelanguage.googleapis.com/v1beta");
  });

  it("should return unhealthy status when no API key is set", async () => {
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(typeof health.latency).toBe("number");
    expect(health.lastChecked).toBeInstanceOf(Date);
  });

  it("should return provider error on chat when no API key is set", async () => {
    const request: ProviderChatRequest = {
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: "Hello" }],
      stream: false,
    };

    const result = await provider.chat(request);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBeTruthy();
      expect(result.error.statusCode).toBe(502);
      expect(result.error.provider).toBe("gemini");
    }
  });

  it("should update configuration on configure", () => {
    provider.configure({ timeout: 60000 });
    expect(provider.configuration.timeout).toBe(60000);

    provider.configure({ timeout: 30000 });
    expect(provider.configuration.timeout).toBe(30000);
  });
});
