import { describe, it, expect } from "vitest";
import { ProviderStub } from "../providers/stub/provider-stub.js";
import type { ProviderChatRequest } from "../providers/interfaces/provider-request.interface.js";

describe("ProviderStub", () => {
  const service = new ProviderStub();

  it("should have valid metadata", () => {
    expect(service.metadata.name).toBe("stub");
    expect(service.metadata.version).toBe("1.0.0");
    expect(service.metadata.description).toBeTruthy();
  });

  it("should have valid capabilities", () => {
    expect(service.capabilities.chat).toBe(true);
    expect(Array.isArray(service.capabilities.supportedModels)).toBe(true);
  });

  describe("chat", () => {
    it("should return a successful ProviderResult with valid data", async () => {
      const request: ProviderChatRequest = {
        model: "gpt-4",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
      };

      const result = await service.chat(request);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toHaveProperty("id");
        expect(result.data.model).toBe("gpt-4");
        expect(result.data.content).toBe("AI Gateway placeholder response.");
        expect(result.data.finishReason).toBe("stop");
        expect(result.data.usage).toEqual({
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        });
        expect(typeof result.latency).toBe("number");
      }
    });
  });

  describe("health", () => {
    it("should report healthy status", async () => {
      const health = await service.health();

      expect(health.status).toBe("healthy");
      expect(typeof health.latency).toBe("number");
      expect(health.lastChecked).toBeInstanceOf(Date);
    });
  });

  describe("configure", () => {
    it("should update configuration", () => {
      service.configure({ timeout: 60000 });

      expect(service.configuration.timeout).toBe(60000);
    });
  });
});
