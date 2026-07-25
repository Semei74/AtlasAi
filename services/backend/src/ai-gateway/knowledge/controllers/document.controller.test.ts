import { describe, it, expect, beforeEach, vi } from "vitest";
import { DocumentController } from "./document.controller.js";
import type { DocumentService } from "../interfaces/document-service.interface.js";
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";

describe("DocumentController", () => {
  let controller: DocumentController;
  let mockService: DocumentService;

  function mockUser(overrides: Partial<{ sub: string; organizationId: string | null }> = {}): {
    sub: string;
    organizationId: string | null;
  } {
    return { sub: "user-1", organizationId: "org-1", ...overrides };
  }

  function mockMultipart(opts: {
    filename?: string;
    mimetype?: string;
    buffer?: Buffer;
    toBufferRejects?: Error;
  } = {}): {
    filename: string;
    mimetype: string;
    toBuffer: ReturnType<typeof vi.fn>;
  } {
    return {
      filename: opts.filename ?? "doc.txt",
      mimetype: opts.mimetype ?? "text/plain",
      toBuffer: opts.toBufferRejects
        ? vi.fn().mockRejectedValue(opts.toBufferRejects)
        : vi.fn().mockResolvedValue(opts.buffer ?? Buffer.from("hello world")),
    };
  }

  function mockRequest(
    user: { sub: string; organizationId: string | null },
    multipart?: ReturnType<typeof mockMultipart>,
  ): never {
    return {
      user,
      file: () => Promise.resolve(multipart),
    } as never;
  }

  const baseBody = {
    workspaceId: "ws-1",
    classification: "public",
    tags: ["tag-a"],
    metadata: { source: "audit" },
  };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: "doc-1" }),
      findById: vi.fn().mockResolvedValue({ id: "doc-1" }),
      findMany: vi.fn().mockResolvedValue({ items: [], total: 0, offset: 0, limit: 20 }),
      update: vi.fn().mockResolvedValue({ id: "doc-1" }),
      delete: vi.fn().mockResolvedValue(undefined),
      archive: vi.fn().mockResolvedValue({ id: "doc-1" }),
      restore: vi.fn().mockResolvedValue({ id: "doc-1" }),
      download: vi.fn().mockResolvedValue({
        stream: Buffer.from("data"),
        mimeType: "text/plain",
        originalName: "test.txt",
      }),
    };

    controller = new DocumentController(mockService);
  });

  describe("create() — upload (CRITICAL path)", () => {
    it("successfully uploads an allowed file and forwards token-derived identity + metadata", async () => {
      const mp = mockMultipart({
        filename: "report.txt",
        mimetype: "text/plain",
        buffer: Buffer.from("file-content"),
      });

      const result =       await controller.create(baseBody as never, mockRequest(mockUser(), mp));

      expect(mockService.create).toHaveBeenCalledTimes(1);
      expect(mockService.create).toHaveBeenCalledWith(
        {
          originalName: "report.txt",
          mimeType: "text/plain",
          size: 12,
          buffer: expect.any(Buffer),
        },
        {
          organizationId: "org-1",
          ownerId: "user-1",
          workspaceId: "ws-1",
          classification: "public",
          tags: ["tag-a"],
          metadata: { source: "audit" },
        },
      );
      expect(result).toEqual({ id: "doc-1" });
    });

    it("derives organizationId from the token, ignoring any body-provided value", async () => {
      const mp = mockMultipart();
      const bodyWithOrg = {
        ...baseBody,
        organizationId: "attacker-org",
      } as never;

      await controller.create(bodyWithOrg as never, mockRequest(mockUser(), mp));

      const input = (mockService.create as ReturnType<typeof vi.fn>).mock.calls[0]![1] as {
        organizationId: string;
      };
      expect(input.organizationId).toBe("org-1");
      expect(input.organizationId).not.toBe("attacker-org");
    });

    it("omits optional fields when they are absent from the body", async () => {
      const mp = mockMultipart();
      const minimalBody = { organizationId: "org-1" } as never;

      await controller.create(minimalBody, mockRequest(mockUser(), mp));

      const input = (mockService.create as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      expect(input["workspaceId"]).toBeUndefined();
      expect(input["classification"]).toBeUndefined();
      expect(input["tags"]).toBeUndefined();
      expect(input["metadata"]).toBeUndefined();
    });

    it("rejects a disallowed MIME type with 400", async () => {
      const mp = mockMultipart({
        filename: "malware.exe",
        mimetype: "application/x-msdownload",
      });

      await expect(controller.create(baseBody as never, mockRequest(mockUser(), mp))).rejects.toThrow(
        BadRequestException,
      );
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it("rejects an oversized upload with 413 (PayloadTooLarge)", async () => {
      const mp = mockMultipart({
        toBufferRejects: Object.assign(new Error("request file too large"), {
          code: "FST_REQ_FILE_TOO_LARGE",
        }),
      });

      await expect(controller.create(baseBody as never, mockRequest(mockUser(), mp))).rejects.toThrow(
        PayloadTooLargeException,
      );
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it("rejects when no file part is present", async () => {
      const req = mockRequest(mockUser(), undefined);

      await expect(controller.create(baseBody as never, req)).rejects.toThrow(/File is required/);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it("propagates unexpected multipart errors", async () => {
      const mp = mockMultipart({ toBufferRejects: new Error("stream corrupted") });

      await expect(controller.create(baseBody as never, mockRequest(mockUser(), mp))).rejects.toThrow(
        /stream corrupted/,
      );
    });

    it("propagates service errors (workspace/org not found, etc.)", async () => {
      (mockService.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Workspace not found"),
      );
      const mp = mockMultipart();

      await expect(controller.create(baseBody as never, mockRequest(mockUser(), mp))).rejects.toThrow(
        /Workspace not found/,
      );
    });

    it("rejects when the user is not authenticated", async () => {
      const req = { user: undefined } as never;

      await expect(controller.create(baseBody as never, req)).rejects.toThrow(/User not authenticated/);
    });

    it("rejects when the user has no organization", async () => {
      const mp = mockMultipart();
      const req = mockRequest({ sub: "user-1", organizationId: null }, mp);

      await expect(controller.create(baseBody as never, req)).rejects.toThrow(/User organization not found/);
    });
  });

  it("should list documents", async () => {
    const result = await controller.findMany(
      { sortBy: "createdAt", sortOrder: "desc" },
      mockRequest(mockUser(), undefined),
    );

    expect(result).toEqual({ items: [], total: 0, offset: 0, limit: 20 });
  });

  it("should get document by id", async () => {
    const result = await controller.findById("doc-1", mockRequest(mockUser(), undefined));
    expect((result as Record<string, unknown>)["id"]).toBe("doc-1");
  });

  it("should throw 404 when document not found", async () => {
    mockService.findById = vi.fn().mockResolvedValue(null);

    await expect(controller.findById("doc-1", mockRequest(mockUser(), undefined))).rejects.toThrow(
      "Document not found",
    );
  });

  it("should archive a document", async () => {
    const result = await controller.archive("doc-1", mockRequest(mockUser(), undefined));
    expect((result as Record<string, unknown>)["id"]).toBe("doc-1");
  });

  it("should restore a document", async () => {
    const result = await controller.restore("doc-1", mockRequest(mockUser(), undefined));
    expect((result as Record<string, unknown>)["id"]).toBe("doc-1");
  });

  it("should download a document", async () => {
    const result = await controller.download("doc-1", mockRequest(mockUser(), undefined));
    expect((result as Record<string, unknown>)["originalName"]).toBe("test.txt");
  });

  it("should throw when user not authenticated", async () => {
    const req = { user: undefined } as never;

    await expect(controller.findById("doc-1", req)).rejects.toThrow("User not authenticated");
    await expect(controller.archive("doc-1", req)).rejects.toThrow("User not authenticated");
    await expect(controller.restore("doc-1", req)).rejects.toThrow("User not authenticated");
    await expect(controller.download("doc-1", req)).rejects.toThrow("User not authenticated");
  });
});
