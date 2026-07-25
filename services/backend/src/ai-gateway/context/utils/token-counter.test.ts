import { describe, it, expect } from "vitest";
import { TokenCounter } from "./token-counter.js";

describe("TokenCounter", () => {
  const counter = new TokenCounter();

  describe("estimateTokens", () => {
    it("should return 0 for empty string", () => {
      expect(counter.estimateTokens("")).toBe(0);
    });

    it("should return 1 for 4 characters", () => {
      expect(counter.estimateTokens("abcd")).toBe(1);
    });

    it("should return 2 for 8 characters", () => {
      expect(counter.estimateTokens("abcdefgh")).toBe(2);
    });

    it("should round up partial tokens", () => {
      expect(counter.estimateTokens("abcde")).toBe(2);
    });

    it("should handle single character", () => {
      expect(counter.estimateTokens("a")).toBe(1);
    });

    it("should handle long text", () => {
      const text = "a".repeat(1000);
      expect(counter.estimateTokens(text)).toBe(250);
    });
  });
});
