import { describe, it, expect } from "vitest";
import { DefaultParserProvider } from "./parser-provider.service.js";

describe("DefaultParserProvider", () => {
  const provider = new DefaultParserProvider();

  it("supports all implemented formats", () => {
    expect(provider.supports("text/plain")).toBe(true);
    expect(provider.supports("text/markdown")).toBe(true);
    expect(provider.supports("text/html")).toBe(true);
    expect(provider.supports("text/csv")).toBe(true);
    expect(provider.supports("application/json")).toBe(true);
    expect(provider.supports("text/xml")).toBe(true);
    expect(provider.supports("application/xml")).toBe(true);
    expect(provider.supports("application/pdf")).toBe(true);
    expect(
      provider.supports("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    ).toBe(true);
    expect(provider.supports("application/epub+zip")).toBe(true);
    expect(
      provider.supports("application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    ).toBe(true);
  });

  it("does not support unsupported formats", () => {
    expect(provider.supports("image/png")).toBe(false);
    expect(provider.supports("application/pdfx")).toBe(false);
    expect(provider.supports("application/octet-stream")).toBe(false);
  });

  it("routes parse to the correct format parser and normalizes mimeType", async () => {
    const result = await provider.parse(Buffer.from("hello world"), "text/plain");

    expect(result.parser).toBe("txt");
    expect(result.mimeType).toBe("text/plain");
    expect(result.extractedText).toContain("hello world");
  });

  it("throws for unsupported mime types", async () => {
    await expect(provider.parse(Buffer.from("x"), "image/png")).rejects.toThrow(
      "Unsupported MIME type for parsing: image/png",
    );
  });
});
