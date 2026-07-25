import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TesseractOcrProvider } from "./tesseract-ocr-provider.service.js";

vi.mock("tesseract.js", () => ({
  createWorker: vi.fn().mockResolvedValue({
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: "Hello world\nThis is OCR text.",
        confidence: 92.5,
        blocks: [
          { text: "Hello world", confidence: 95.0 },
          { text: "This is OCR text.", confidence: 90.0 },
        ],
        version: "5.0.0",
      },
    }),
    terminate: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("TesseractOcrProvider", () => {
  let provider: TesseractOcrProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new TesseractOcrProvider();
  });

  afterEach(async () => {
    await provider.onModuleDestroy();
  });

  describe("supports", () => {
    it("should support PNG images", () => {
      expect(provider.supports("image/png")).toBe(true);
    });

    it("should support JPEG images", () => {
      expect(provider.supports("image/jpeg")).toBe(true);
    });

    it("should support WEBP images", () => {
      expect(provider.supports("image/webp")).toBe(true);
    });

    it("should support TIFF images", () => {
      expect(provider.supports("image/tiff")).toBe(true);
    });

    it("should support BMP images", () => {
      expect(provider.supports("image/bmp")).toBe(true);
    });

    it("should not support PDF documents", () => {
      expect(provider.supports("application/pdf")).toBe(false);
    });

    it("should not support text files", () => {
      expect(provider.supports("text/plain")).toBe(false);
    });
  });

  describe("recognize", () => {
    it("should return extracted text with confidence", async () => {
      const result = await provider.recognize(Buffer.from("fake-image-data"));

      expect(result.text).toBe("Hello world\nThis is OCR text.");
      expect(result.confidence).toBe(92.5);
    });

    it("should return page-level results", async () => {
      const result = await provider.recognize(Buffer.from("fake-image-data"));

      expect(result.pages.length).toBeGreaterThan(0);
      expect(result.pages[0]?.text).toBeTruthy();
      expect(result.pages[0]?.confidence).toBeGreaterThan(0);
    });

    it("should include processing time", async () => {
      const result = await provider.recognize(Buffer.from("fake-image-data"));

      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should accept custom language options", async () => {
      const tesseract = await import("tesseract.js");

      await provider.recognize(Buffer.from("data"), { language: "deu" });

      expect(tesseract.createWorker).toHaveBeenCalledWith("deu");
    });

    it("should reuse the worker across multiple recognitions", async () => {
      const tesseract = await import("tesseract.js");

      await provider.recognize(Buffer.from("first"));
      await provider.recognize(Buffer.from("second"));

      expect(tesseract.createWorker).toHaveBeenCalledTimes(1);
    });

    it("should create a new worker if language changes", async () => {
      const tesseract = await import("tesseract.js");

      await provider.recognize(Buffer.from("data"), { language: "deu" });
      expect(tesseract.createWorker).toHaveBeenCalledWith("deu");

      await provider.recognize(Buffer.from("data"), { language: "fra" });
      expect(tesseract.createWorker).toHaveBeenCalledWith("fra");
      expect(tesseract.createWorker).toHaveBeenCalledTimes(2);
    });

    it("should terminate the worker on module destroy", async () => {
      const tesseract = await import("tesseract.js");

      await provider.recognize(Buffer.from("data"));

      await provider.onModuleDestroy();

      const worker = await tesseract.createWorker();
      expect(worker.terminate).toHaveBeenCalled();
    });
  });
});
