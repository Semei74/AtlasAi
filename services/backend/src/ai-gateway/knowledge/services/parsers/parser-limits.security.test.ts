import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { assertArchiveEntriesSafe, assertArchiveWithinSize, assertArchiveActualSize, MAX_TOTAL_DECOMPRESSED_BYTES } from "./parser-limits.js";

async function buildZipWithEntries(count: number): Promise<JSZip> {
  const zip = new JSZip();
  for (let i = 0; i < count; i++) {
    zip.file(`file-${String(i).padStart(6, "0")}.txt`, "x");
  }
  return JSZip.loadAsync(await zip.generateAsync({ type: "nodebuffer" }));
}

async function buildValidZip(): Promise<JSZip> {
  const zip = new JSZip();
  zip.file("META-INF/container.xml", "<container/>");
  zip.file("OEBPS/content.opf", "<package/>");
  return JSZip.loadAsync(await zip.generateAsync({ type: "nodebuffer" }));
}

describe("assertArchiveEntriesSafe — real archive tests (no mocks)", () => {
  it("accepts a small valid archive", async () => {
    const zip = await buildValidZip();
    expect(() => {
      assertArchiveEntriesSafe(zip);
    }).not.toThrow();
  });

  it("accepts an empty archive (no false positive)", async () => {
    const zip = await JSZip.loadAsync(await new JSZip().generateAsync({ type: "nodebuffer" }));
    expect(() => {
      assertArchiveEntriesSafe(zip);
    }).not.toThrow();
  });

  it("rejects archives with too many entries", async () => {
    const zip = await buildZipWithEntries(10_001);
    expect(() => {
      assertArchiveEntriesSafe(zip);
    }).toThrow(/too many entries/);
  }, 30_000);

  it("rejects archives whose decompressed size exceeds the limit (simulated bomb metadata)", async () => {
    const zip = await buildValidZip();
    const entries = Object.values(zip.files).filter((f) => !f.dir);
    expect(entries.length).toBeGreaterThan(0);
    const target = entries[0] as unknown as { _data: { uncompressedSize: number } };
    target._data = { uncompressedSize: 201 * 1024 * 1024 };
    expect(() => {
      assertArchiveEntriesSafe(zip);
    }).toThrow(/decompressed size exceeds/);
  });

  it("accepts an archive whose decompressed size is within the limit", async () => {
    const zip = await buildValidZip();
    const entries = Object.values(zip.files).filter((f) => !f.dir);
    const target = entries[0] as unknown as { _data: { uncompressedSize: number } };
    target._data = { uncompressedSize: 1024 };
    expect(() => {
      assertArchiveEntriesSafe(zip);
    }).not.toThrow();
  });
});

describe("assertArchiveWithinSize", () => {
  it("rejects buffers exceeding the compressed limit", () => {
    expect(() => {
      assertArchiveWithinSize(Buffer.alloc(50 * 1024 * 1024 + 1));
    }).toThrow(/exceeds maximum supported archive size/);
  });

  it("accepts buffers within the compressed limit", () => {
    expect(() => {
      assertArchiveWithinSize(Buffer.alloc(10));
    }).not.toThrow();
  });
});

describe("assertArchiveActualSize — actual decompressed size check (no mocks)", () => {
  it("accepts a small archive whose decompressed content is within the limit", async () => {
    const zip = new JSZip();
    zip.file("small.txt", Buffer.alloc(1024, "a"));
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    const loaded = await JSZip.loadAsync(buf);
    await expect(assertArchiveActualSize(loaded)).resolves.toBeUndefined();
  });

  it("rejects an archive whose actual decompressed content exceeds the limit", async () => {
    const zip = new JSZip();
    zip.file("large.bin", Buffer.alloc(MAX_TOTAL_DECOMPRESSED_BYTES + 1, "a"));
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    const loaded = await JSZip.loadAsync(buf);
    await expect(assertArchiveActualSize(loaded)).rejects.toThrow(/decompressed total size/);
  }, 60_000);
});
