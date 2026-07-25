import { describe, it, expect, beforeEach } from "vitest";
import { QueryProcessorService } from "./query-processor.service.js";

describe("QueryProcessorService", () => {
  let service: QueryProcessorService;

  beforeEach(() => {
    service = new QueryProcessorService();
  });

  describe("normalize", () => {
    it("should trim whitespace", () => {
      expect(service.normalize("  hello world  ")).toBe("hello world");
    });

    it("should collapse multiple spaces", () => {
      expect(service.normalize("hello    world")).toBe("hello world");
    });

    it("should return empty string for empty input", () => {
      expect(service.normalize("")).toBe("");
    });
  });

  describe("expand", () => {
    it("should return normalized query as first entry", () => {
      const result = service.expand("test query");
      expect(result[0]).toBe("test query");
    });

    it("should expand short queries with question words", () => {
      const result = service.expand("ai safety");
      expect(result.length).toBeGreaterThan(1);
      expect(result).toContain("what ai safety");
    });

    it("should not expand queries with question words", () => {
      const result = service.expand("what is machine learning");
      expect(result).toHaveLength(1);
    });

    it("should not expand long queries", () => {
      const result = service.expand("this is a very long query with many words");
      expect(result).toHaveLength(1);
    });

    it("should return empty array for empty query", () => {
      const result = service.expand("");
      expect(result).toHaveLength(0);
    });
  });
});
