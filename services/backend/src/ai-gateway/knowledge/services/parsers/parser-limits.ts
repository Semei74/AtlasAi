import { ValidationError } from "@atlas/errors";
import type JSZip from "jszip";

export const MAX_ARCHIVE_SIZE_BYTES = 50 * 1024 * 1024;

export const MAX_ARCHIVE_ENTRIES = 10_000;

export const MAX_TOTAL_DECOMPRESSED_BYTES = 200 * 1024 * 1024;

export function assertArchiveWithinSize(buffer: Buffer): void {
  if (buffer.byteLength > MAX_ARCHIVE_SIZE_BYTES) {
    throw new ValidationError(
      `Document size ${String(buffer.byteLength)} bytes exceeds maximum supported archive size of ${String(MAX_ARCHIVE_SIZE_BYTES)} bytes`,
    );
  }
}

export function assertArchiveEntriesSafe(zip: JSZip): void {
  const entries = Object.values(zip.files).filter((file) => !file.dir);

  if (entries.length > MAX_ARCHIVE_ENTRIES) {
    throw new ValidationError(
      `Archive contains too many entries (${String(entries.length)} > ${String(MAX_ARCHIVE_ENTRIES)})`,
    );
  }

  let totalUncompressed = 0;
  for (const entry of entries) {
    const uncompressed = (
      entry as unknown as { _data?: { uncompressedSize?: number } }
    )._data?.uncompressedSize;
    if (typeof uncompressed === "number") {
      totalUncompressed += uncompressed;
      if (totalUncompressed > MAX_TOTAL_DECOMPRESSED_BYTES) {
        throw new ValidationError("Archive decompressed size exceeds maximum supported limit");
      }
    }
  }
}

export async function assertArchiveActualSize(zip: JSZip): Promise<void> {
  const entries = Object.values(zip.files).filter((f) => !f.dir);
  let total = 0;
  for (const entry of entries) {
    const buf = await entry.async("nodebuffer");
    total += buf.byteLength;
    if (total > MAX_TOTAL_DECOMPRESSED_BYTES) {
      throw new ValidationError(
        `Document decompressed total size (${String(total)} bytes) exceeds maximum supported limit`,
      );
    }
  }
}
