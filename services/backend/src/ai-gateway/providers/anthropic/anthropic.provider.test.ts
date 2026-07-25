import { describe, it, expect } from "vitest";
import { AnthropicProvider } from "./anthropic.provider.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";

describe("AnthropicProvider", () => {
  const provider = new AnthropicProvider();

  it("should expose metadata", () => {
    expect(provider.metadata.name).toBe("anthropic");
    expect(provider.metadata.version).toBe("1.0.0");
    expect(provider.metadata.description).toBeTruthy();
  });

  it("should expose capabilities", () => {
    expect(provider.capabilities.chat).toBe(true);
    expect(provider.capabilities.streaming).toBe(true);
    expect(provider.capabilities.functionCalling).toBe(false);
    expect(provider.capabilities.supportedModels).toContain("claude-sonnet-4");
    expect(provider.capabilities.supportedModels).toContain("claude-haiku-3.5");
  });

  it("should expose configuration", () => {
    expect(provider.configuration.timeout).toBe(60000);
    expect(provider.configuration.maxRetries).toBe(3);
    expect(provider.configuration.baseUrl).toBe("https://api.anthropic.com/v1");
  });

  it("should return unhealthy status when no API key is set", async () => {
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(typeof health.latency).toBe("number");
    expect(health.lastChecked).toBeInstanceOf(Date);
  });

  it("should return provider error on chat when no API key is set", async () => {
    const request: ProviderChatRequest = {
      model: "claude-sonnet-4",
      messages: [{ role: "user", content: "Hello" }],
      stream: false,
    };

    const result = await provider.chat(request);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBeTruthy();
      expect(result.error.statusCode).toBe(502);
      expect(result.error.provider).toBe("anthropic");
    }
  });

  it("should update configuration on configure", () => {
    provider.configure({ timeout: 120000 });
    expect(provider.configuration.timeout).toBe(120000);

    provider.configure({ timeout: 60000 });
    expect(provider.configuration.timeout).toBe(60000);
  });
});
