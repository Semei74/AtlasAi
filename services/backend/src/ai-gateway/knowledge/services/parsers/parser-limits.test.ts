import { describe, it, expect } from "vitest";
import { assertArchiveWithinSize, MAX_ARCHIVE_SIZE_BYTES } from "./parser-limits.js";

describe("parser-limits", () => {
  it("allows buffers within the limit", () => {
    expect(() => {
      assertArchiveWithinSize(Buffer.alloc(10));
    }).not.toThrow();
    expect(() => {
      assertArchiveWithinSize(Buffer.alloc(MAX_ARCHIVE_SIZE_BYTES));
    }).not.toThrow();
  });

  it("rejects buffers exceeding the limit", () => {
    expect(() => {
      assertArchiveWithinSize(Buffer.alloc(MAX_ARCHIVE_SIZE_BYTES + 1));
    }).toThrow(/exceeds maximum supported archive size/);
  });
});
