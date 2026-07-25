import { describe, it, expect, beforeEach } from "vitest";
import { LocalFileStorageService } from "./local-file-storage.service.js";

describe("LocalFileStorageService", () => {
  let service: LocalFileStorageService;

  beforeEach(() => {
    service = new LocalFileStorageService();
  });

  it("should store and retrieve a file", async () => {
    const result = await service.store(
      { originalName: "test.txt", mimeType: "text/plain", size: 11, buffer: Buffer.from("hello world") },
      "doc-1",
    );

    expect(result.storagePath).toContain("doc-1/");
    expect(result.checksum).toBeTruthy();
    expect(result.storagePath).toMatch(/\.txt$/);

    const retrieved = await service.retrieve(result.storagePath);
    expect(retrieved.toString()).toBe("hello world");

    await service.delete(result.storagePath);
  });

  it("should generate unique paths for the same document", async () => {
    const r1 = await service.store(
      { originalName: "a.txt", mimeType: "text/plain", size: 1, buffer: Buffer.from("a") },
      "doc-1",
    );
    const r2 = await service.store(
      { originalName: "a.txt", mimeType: "text/plain", size: 1, buffer: Buffer.from("a") },
      "doc-1",
    );

    expect(r1.storagePath).not.toBe(r2.storagePath);
  });

  it("should preserve file extension", () => {
    const path = service.getPath("doc-1", "report.pdf");
    expect(path).toMatch(/\.pdf$/);
  });

  it("should handle files without extension", () => {
    const path = service.getPath("doc-1", "Makefile");
    expect(path).not.toMatch(/\.[a-z]+$/);
  });

  it("should check if file exists", async () => {
    const result = await service.store(
      { originalName: "exists.txt", mimeType: "text/plain", size: 4, buffer: Buffer.from("test") },
      "doc-1",
    );

    expect(await service.exists(result.storagePath)).toBe(true);
    expect(await service.exists("nonexistent/path.txt")).toBe(false);

    await service.delete(result.storagePath);
  });

  it("should return null for signed URL on local storage", async () => {
    const url = await service.getSignedUrl("doc-1/file.txt");
    expect(url).toBeNull();
  });
});
