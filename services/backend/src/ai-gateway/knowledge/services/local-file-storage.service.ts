import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { FileStorage, FileUpload, FileUploadResult } from "../interfaces/file-storage.interface.js";

const STORAGE_DIR = join(process.cwd(), "storage", "knowledge");

@Injectable()
export class LocalFileStorageService implements FileStorage {
  public async store(file: FileUpload, documentId: string): Promise<FileUploadResult> {
    const storagePath = this.getPath(documentId, file.originalName);
    const fullPath = join(STORAGE_DIR, storagePath);

    await mkdir(dirname(fullPath), { recursive: true });

    await writeFile(fullPath, file.buffer);

    const checksum = createHash("sha256").update(file.buffer).digest("hex");

    return { storagePath, checksum };
  }

  public async retrieve(storagePath: string): Promise<Buffer> {
    const fullPath = join(STORAGE_DIR, storagePath);
    await access(fullPath);
    return readFile(fullPath);
  }

  public async delete(storagePath: string): Promise<void> {
    const fullPath = join(STORAGE_DIR, storagePath);
    try {
      await unlink(fullPath);
    } catch {
      // file may already be deleted
    }
  }

  public getPath(documentId: string, originalName: string): string {
    const parts = originalName.split(".");
    const rawExt = parts.length > 1 ? `.${parts[parts.length - 1] ?? ""}` : "";
    const ext = /^\.[a-zA-Z0-9]{1,10}$/.test(rawExt) ? rawExt : "";
    return `${documentId}/${randomUUID()}${ext}`;
  }

  public async exists(storagePath: string): Promise<boolean> {
    const fullPath = join(STORAGE_DIR, storagePath);
    try {
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  public getSignedUrl(_storagePath: string, _expiresInSeconds?: number): Promise<string | null> {
    return Promise.resolve(null);
  }
}
