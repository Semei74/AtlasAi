import { describe, it, expect, beforeEach, vi } from "vitest";
import { OcrController } from "./ocr.controller.js";
import type { OcrService } from "../interfaces/ocr-service.interface.js";

describe("OcrController", () => {
  let controller: OcrController;
  let mockService: OcrService;

  function mockRequest(): { user: { sub: string; organizationId: string } } {
    return { user: { sub: "user-1", organizationId: "org-1" } };
  }

  beforeEach(() => {
    mockService = {
      processDocument: vi.fn().mockResolvedValue({
        documentId: "doc-1",
        ocrId: "ocr-1",
        status: "Completed",
        extractedText: "OCR text",
        confidence: 95.0,
        detectedLanguage: "eng",
        pages: 1,
        processingTimeMs: 300,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      }),
      getOcrResult: vi.fn().mockResolvedValue(null),
    };

    controller = new OcrController(mockService);
  });

  describe("processDocument", () => {
    it("should process OCR for a document", async () => {
      const result = await controller.processDocument("doc-1", mockRequest() as never);

      expect(result).toHaveProperty("status", "Completed");
      expect(mockService.processDocument).toHaveBeenCalledWith("doc-1", "org-1");
    });

    it("should throw when user not authenticated", async () => {
      await expect(controller.processDocument("doc-1", { user: undefined } as never)).rejects.toThrow(
        "User not authenticated",
      );
    });
  });

  describe("getOcrResult", () => {
    it("should return OCR result when it exists", async () => {
      mockService.getOcrResult = vi.fn().mockResolvedValue({
        documentId: "doc-1",
        ocrId: "ocr-1",
        status: "Completed",
        extractedText: "text",
        confidence: 90.0,
        detectedLanguage: "eng",
        pages: 2,
        processingTimeMs: 500,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      });

      const result = await controller.getOcrResult("doc-1", mockRequest() as never);

      expect(result).toHaveProperty("status", "Completed");
    });

    it("should throw not found when no OCR result exists", async () => {
      await expect(controller.getOcrResult("doc-1", mockRequest() as never)).rejects.toThrow(
        "OCR result not found",
      );
    });

    it("should throw when user not authenticated", async () => {
      await expect(controller.getOcrResult("doc-1", { user: undefined } as never)).rejects.toThrow(
        "User not authenticated",
      );
    });
  });
});
