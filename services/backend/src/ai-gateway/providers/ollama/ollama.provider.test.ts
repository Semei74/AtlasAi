import { describe, it, expect, vi } from "vitest";
import { OllamaProvider } from "./ollama.provider.js";
import type { OllamaClient } from "./ollama.client.js";
import type { ProviderChatRequest } from "../interfaces/provider-request.interface.js";

function mockClient(overrides: Partial<OllamaClient> = {}): OllamaClient {
  return {
    chat: vi.fn(),
    health: vi.fn(),
    ...overrides,
  } as unknown as OllamaClient;
}

describe("OllamaProvider", () => {
  describe("metadata", () => {
    const client = mockClient();
    const provider = new OllamaProvider(client);

    it("should expose metadata", () => {
      expect(provider.metadata.name).toBe("ollama");
      expect(provider.metadata.version).toBe("1.0.0");
      expect(provider.metadata.description).toBeTruthy();
    });

    it("should expose capabilities", () => {
      expect(provider.capabilities.chat).toBe(true);
      expect(provider.capabilities.streaming).toBe(true);
    });

    it("should expose configuration with default baseUrl", () => {
      expect(provider.configuration.timeout).toBe(30000);
      expect(provider.configuration.maxRetries).toBe(0);
    });
  });

  describe("chat", () => {
    it("should return successful response from Ollama", async () => {
      const client = mockClient({
        chat: vi.fn().mockResolvedValue({
          model: "llama3.2",
          created_at: "2024-01-01T00:00:00Z",
          message: { role: "assistant", content: "Hello, human!" },
          done: true,
          prompt_eval_count: 10,
          eval_count: 20,
        }),
      });
      const provider = new OllamaProvider(client);

      const request: ProviderChatRequest = {
        model: "llama3.2",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
        temperature: 0.7,
        maxTokens: 100,
      };

      const result = await provider.chat(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe("llama3.2");
        expect(result.data.content).toBe("Hello, human!");
        expect(result.data.finishReason).toBe("stop");
        expect(result.data.usage.promptTokens).toBe(10);
        expect(result.data.usage.completionTokens).toBe(20);
        expect(result.data.usage.totalTokens).toBe(30);
        expect(result.latency).toBeGreaterThanOrEqual(0);
      }
    });

    it("should map request correctly to Ollama client", async () => {
      const chatMock = vi.fn().mockResolvedValue({
        model: "test",
        created_at: "2024-01-01T00:00:00Z",
        message: { role: "assistant", content: "OK" },
        done: true,
      });
      const client = mockClient({ chat: chatMock });
      const provider = new OllamaProvider(client);

      await provider.chat({
        model: "llama3.2",
        messages: [
          { role: "system", content: "Be helpful" },
          { role: "user", content: "Hi" },
        ],
        stream: false,
        temperature: 0.5,
        maxTokens: 200,
      });

      expect(chatMock).toHaveBeenCalledWith({
        model: "llama3.2",
        messages: [
          { role: "system", content: "Be helpful" },
          { role: "user", content: "Hi" },
        ],
        stream: false,
        options: { temperature: 0.5, num_predict: 200 },
      });
    });

    it("should return error result on client failure", async () => {
      const client = mockClient({
        chat: vi.fn().mockRejectedValue(new Error("Connection refused")),
      });
      const provider = new OllamaProvider(client);

      const request: ProviderChatRequest = {
        model: "llama3.2",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
      };

      const result = await provider.chat(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PROVIDER_ERROR");
        expect(result.error.message).toContain("Connection refused");
        expect(result.error.statusCode).toBe(502);
        expect(result.error.provider).toBe("ollama");
      }
    });

    it("should handle non-Error thrown values", async () => {
      const client = mockClient({
        chat: vi.fn().mockRejectedValue("string error"),
      });
      const provider = new OllamaProvider(client);

      const result = await provider.chat({
        model: "llama3.2",
        messages: [{ role: "user", content: "Hi" }],
        stream: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Unknown Ollama error");
      }
    });
  });

  describe("health", () => {
    it("should return healthy when client health returns true", async () => {
      const client = mockClient({ health: vi.fn().mockResolvedValue(true) });
      const provider = new OllamaProvider(client);

      const health = await provider.health();

      expect(health.status).toBe("healthy");
      expect(typeof health.latency).toBe("number");
      expect(health.lastChecked).toBeInstanceOf(Date);
    });

    it("should return unhealthy when client health returns false", async () => {
      const client = mockClient({ health: vi.fn().mockResolvedValue(false) });
      const provider = new OllamaProvider(client);

      const health = await provider.health();

      expect(health.status).toBe("unhealthy");
      expect(health.message).toBe("Cannot reach Ollama server");
    });
  });

  describe("configure", () => {
    it("should update configuration", () => {
      const client = mockClient();
      const provider = new OllamaProvider(client);

      provider.configure({ timeout: 60000 });
      expect(provider.configuration.timeout).toBe(60000);

      provider.configure({ timeout: 30000 });
      expect(provider.configuration.timeout).toBe(30000);
    });
  });
});
