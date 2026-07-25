import { describe, it, expect, beforeEach, vi } from "vitest";
import { ParserController } from "./parser.controller.js";
import type { ParserService } from "../interfaces/parser-service.interface.js";

describe("ParserController", () => {
  let controller: ParserController;
  let mockService: ParserService;

  function mockRequest(): { user: { sub: string; organizationId: string } } {
    return { user: { sub: "user-1", organizationId: "org-1" } };
  }

  beforeEach(() => {
    mockService = {
      parseDocument: vi.fn().mockResolvedValue({
        documentId: "doc-1",
        parseId: "parse-1",
        status: "Completed",
        mimeType: "text/markdown",
        parser: "markdown",
        parserVersion: "1.0.0",
        extractedText: "parsed",
        language: "en",
        pageCount: 1,
        sectionCount: 1,
        headings: [],
        tables: [],
        sections: [],
        statistics: {
          characterCount: 6,
          wordCount: 1,
          lineCount: 1,
          paragraphCount: 1,
          sectionCount: 1,
          headingCount: 0,
          tableCount: 0,
        },
        processingTimeMs: 10,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      }),
      getParseResult: vi.fn().mockResolvedValue(null),
    };

    controller = new ParserController(mockService);
  });

  describe("parseDocument", () => {
    it("should parse a document", async () => {
      const result = await controller.parseDocument("doc-1", mockRequest() as never);

      expect(result).toHaveProperty("status", "Completed");
      expect(mockService.parseDocument).toHaveBeenCalledWith("doc-1", "org-1");
    });

    it("should throw when user not authenticated", async () => {
      await expect(controller.parseDocument("doc-1", { user: undefined } as never)).rejects.toThrow(
        "User not authenticated",
      );
    });
  });

  describe("getParseResult", () => {
    it("should return parsed result when present", async () => {
      mockService.getParseResult = vi.fn().mockResolvedValue({
        documentId: "doc-1",
        parseId: "parse-1",
        status: "Completed",
        mimeType: "text/markdown",
        parser: "markdown",
        parserVersion: "1.0.0",
        extractedText: "parsed",
        language: "en",
        pageCount: 1,
        sectionCount: 1,
        headings: [],
        tables: [],
        sections: [],
        statistics: {
          characterCount: 6,
          wordCount: 1,
          lineCount: 1,
          paragraphCount: 1,
          sectionCount: 1,
          headingCount: 0,
          tableCount: 0,
        },
        processingTimeMs: 10,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      });

      const result = await controller.getParseResult("doc-1", mockRequest() as never);
      expect(result).toHaveProperty("status", "Completed");
    });

    it("should throw not found when no result", async () => {
      await expect(controller.getParseResult("doc-1", mockRequest() as never)).rejects.toThrow(
        "Parse result not found",
      );
    });

    it("should throw when user not authenticated", async () => {
      await expect(controller.getParseResult("doc-1", { user: undefined } as never)).rejects.toThrow(
        "User not authenticated",
      );
    });
  });
});
