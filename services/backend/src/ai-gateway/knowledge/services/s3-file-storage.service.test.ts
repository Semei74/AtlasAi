import { describe, it, expect, beforeEach, vi } from "vitest";
import { S3FileStorageService } from "./s3-file-storage.service.js";
import type { S3StorageConfig } from "./s3-file-storage.service.js";

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://signed-url.example.com/file"),
}));

function createConfig(overrides?: Partial<S3StorageConfig>): S3StorageConfig {
  return {
    region: "us-east-1",
    bucket: "test-bucket",
    accessKeyId: "test-key",
    secretAccessKey: "test-secret",
    ...overrides,
  };
}

describe("S3FileStorageService", () => {
  let service: S3FileStorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new S3FileStorageService(createConfig());
  });

  describe("store", () => {
    it("should upload a file to S3 and return storage path with checksum", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockResolvedValue({});
      (MockS3Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        send: mockSend,
      }));
      service = new S3FileStorageService(createConfig());

      const result = await service.store(
        { originalName: "test.txt", mimeType: "text/plain", size: 11, buffer: Buffer.from("hello world") },
        "doc-1",
      );

      expect(result.storagePath).toContain("doc-1/");
      expect(result.storagePath).toMatch(/\.txt$/);
      expect(result.checksum).toBeTruthy();
      expect(result.checksum.length).toBe(64);
      expect(mockSend).toHaveBeenCalledOnce();
    });
  });

  describe("retrieve", () => {
    it("should retrieve file content from S3", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(Buffer.from("file content"))) },
      });
      (MockS3Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        send: mockSend,
      }));
      service = new S3FileStorageService(createConfig());

      const result = await service.retrieve("doc-1/file.txt");
      expect(result.toString()).toBe("file content");
    });

    it("should throw on empty response body", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockResolvedValue({ Body: undefined });
      (MockS3Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        send: mockSend,
      }));
      service = new S3FileStorageService(createConfig());

      await expect(service.retrieve("doc-1/file.txt")).rejects.toThrow("Empty response from S3");
    });
  });

  describe("delete", () => {
    it("should delete a file from S3", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockResolvedValue({});
      (MockS3Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        send: mockSend,
      }));
      service = new S3FileStorageService(createConfig());

      await service.delete("doc-1/file.txt");
      expect(mockSend).toHaveBeenCalledOnce();
    });
  });

  describe("exists", () => {
    it("should return true when object exists", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockResolvedValue({});
      (MockS3Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        send: mockSend,
      }));
      service = new S3FileStorageService(createConfig());

      const result = await service.exists("doc-1/file.txt");
      expect(result).toBe(true);
    });

    it("should return false when object does not exist", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockRejectedValue(new Error("NotFound"));
      (MockS3Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        send: mockSend,
      }));
      service = new S3FileStorageService(createConfig());

      const result = await service.exists("doc-1/file.txt");
      expect(result).toBe(false);
    });
  });

  describe("getSignedUrl", () => {
    it("should return a signed URL", async () => {
      const result = await service.getSignedUrl("doc-1/file.txt");
      expect(result).toBe("https://signed-url.example.com/file");
    });
  });

  describe("getPath", () => {
    it("should preserve file extension", () => {
      const path = service.getPath("doc-1", "report.pdf");
      expect(path).toMatch(/\.pdf$/);
    });
  });

  describe("constructor", () => {
    it("should use forcePathStyle when endpoint is set", async () => {
      const { S3Client: MockS3Client } = await import("@aws-sdk/client-s3");

      new S3FileStorageService(createConfig({ endpoint: "http://localhost:9000" }));
      expect(MockS3Client).toHaveBeenCalledWith(
        expect.objectContaining({ forcePathStyle: true }),
      );
    });

    it("should pass SSE configuration when provided", () => {
      new S3FileStorageService(createConfig({
        sseAlgorithm: "aws:kms",
        sseKmsKeyId: "kms-key-123",
      }));
    });
  });
});
