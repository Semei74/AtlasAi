import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OllamaClient } from "./ollama.client.js";

describe("OllamaClient", () => {
  let client: OllamaClient;
  let originalEnv: typeof process.env;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete (process.env as Record<string, string | undefined>)['OLLAMA_BASE_URL'];
    client = new OllamaClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("chat", () => {
    it("should send a POST request to /api/chat and return the response", async () => {
      const mockResponse = {
        model: "llama3.2",
        created_at: "2024-01-01T00:00:00Z",
        message: { role: "assistant", content: "Hello, human!" },
        done: true,
        prompt_eval_count: 10,
        eval_count: 20,
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await client.chat({
        model: "llama3.2",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
        options: { temperature: 0.7, num_predict: 100 },
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:11434/api/chat",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );

      const callArg = mockFetch.mock.calls[0] as [string, RequestInit];
      const body: Record<string, unknown> = JSON.parse(callArg[1].body as string) as Record<string, unknown>;
      expect(body).toMatchObject({
        model: "llama3.2",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
        options: { temperature: 0.7, num_predict: 100 },
      });
    });

    it("should throw on non-ok response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("model not found"),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        client.chat({
          model: "nonexistent",
          messages: [{ role: "user", content: "Hi" }],
          stream: false,
        }),
      ).rejects.toThrow("Ollama API error: 404");
    });

    it("should use OLLAMA_BASE_URL from environment", async () => {
      (process.env as Record<string, string | undefined>)['OLLAMA_BASE_URL'] = "http://custom:8080";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            model: "test",
            created_at: "2024-01-01T00:00:00Z",
            message: { role: "assistant", content: "OK" },
            done: true,
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await client.chat({
        model: "test",
        messages: [{ role: "user", content: "Hi" }],
        stream: false,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://custom:8080/api/chat",
        expect.any(Object),
      );
    });
  });

  describe("health", () => {
    it("should return true when /api/tags responds ok", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", mockFetch);

      const result = await client.health();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:11434/api/tags",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should return false when /api/tags responds with error", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false });
      vi.stubGlobal("fetch", mockFetch);

      const result = await client.health();

      expect(result).toBe(false);
    });

    it("should return false when fetch throws", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Connection refused")));

      const result = await client.health();

      expect(result).toBe(false);
    });
  });
});
