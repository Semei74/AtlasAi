import { describe, it, expect } from "vitest";
import { LocalFileStorageService } from "./local-file-storage.service.js";
import { S3FileStorageService } from "./s3-file-storage.service.js";

describe("FileStorage.getPath — path traversal defense", () => {
  const local = new LocalFileStorageService();
  const s3 = new S3FileStorageService({
    region: "us-east-1",
    bucket: "b",
    accessKeyId: "x",
    secretAccessKey: "y",
  });
  const docId = "doc-0001";

  for (const [name, storage] of [
    ["Local", local],
    ["S3", s3],
  ] as const) {
    it(`${name}: never emits '..' regardless of originalName`, () => {
      const samples = [
        "../../../etc/passwd",
        "a/b/c.txt",
        "x.txt/../../etc/passwd",
        "/abs/path/file.pdf",
        "normal.pdf",
        ".env",
        "no-extension",
      ];
      for (const originalName of samples) {
        const path = storage.getPath(docId, originalName);
        expect(path).not.toContain("..");
        expect(path.startsWith(`${docId}/`)).toBe(true);
      }
    });

    it(`${name}: keeps a safe alphanumeric extension`, () => {
      expect(storage.getPath(docId, "report.PDF")).toMatch(/\.PDF$/);
      expect(storage.getPath(docId, "a.b.c.gz")).toMatch(/\.gz$/);
    });

    it(`${name}: drops unsafe extension characters`, () => {
      const path = storage.getPath(docId, "x.txt%00.jpg");
      expect(path).not.toContain("%00");
      expect(path).not.toContain("..");
    });

    it(`${name}: confines storage under the document directory and preserves only a safe extension`, () => {
      const path = storage.getPath(docId, "../../../../var/www/html/shell.php");
      expect(path.startsWith(`${docId}/`)).toBe(true);
      expect(path).not.toContain("..");
      expect(path).toMatch(/\.php$/);
    });
  }
});
