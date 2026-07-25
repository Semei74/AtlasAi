import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
  PayloadTooLargeException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { AuthGuard } from "../../../auth/authorization/guards/auth.guard.js";
import { RolesGuard } from "../../../auth/authorization/guards/roles.guard.js";
import { Roles } from "../../../auth/authorization/decorators/roles.decorator.js";
import type { RequestWithUser } from "../../../auth/authorization/guards/auth.guard.js";
import { DOCUMENT_SERVICE } from "../interfaces/document-service.interface.js";
import type { DocumentService } from "../interfaces/document-service.interface.js";
import { CreateDocumentDto } from "../dto/create-document.dto.js";
import { UpdateDocumentDto } from "../dto/update-document.dto.js";
import { DocumentFilterDto } from "../dto/document-filter.dto.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function isMultipartFileTooLarge(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "FST_REQ_FILE_TOO_LARGE"
  );
}

@ApiTags("Knowledge Documents")
@Controller("api/v1/knowledge/documents")
export class DocumentController {
  public constructor(
    @Inject(DOCUMENT_SERVICE)
    private readonly documentService: DocumentService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Owner", "Admin", "Manager", "User")
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a document" })
  @ApiResponse({ status: 201, description: "Document uploaded" })
  public async create(
    @Body() body: CreateDocumentDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");
    if (user.organizationId === null) throw new BadRequestException("User organization not found");

    const multipart = await (request as unknown as FastifyRequest).file();
    if (multipart === undefined) {
      throw new BadRequestException("File is required");
    }

    let buffer: Buffer;
    try {
      buffer = await multipart.toBuffer();
    } catch (error) {
      if (isMultipartFileTooLarge(error)) {
        throw new PayloadTooLargeException("File exceeds the maximum allowed size of 50 MB");
      }
      throw error;
    }

    const file = {
      originalName: multipart.filename,
      mimeType: multipart.mimetype,
      size: buffer.byteLength,
      buffer,
    };

    if (!ALLOWED_MIME_TYPES.has(file.mimeType)) {
      throw new BadRequestException(
        `File type '${file.mimeType}' is not allowed. Allowed types: ${[...ALLOWED_MIME_TYPES].join(", ")}`,
      );
    }

    const input: { organizationId: string; ownerId: string; workspaceId?: string; classification?: string; tags?: readonly string[]; metadata?: Record<string, unknown> } = {
      organizationId: user.organizationId,
      ownerId: user.sub,
    };
    if (body.workspaceId !== undefined) input.workspaceId = body.workspaceId;
    if (body.classification !== undefined) input.classification = body.classification;
    if (body.tags !== undefined) input.tags = body.tags;
    if (body.metadata !== undefined) input.metadata = body.metadata;

    return this.documentService.create(
      {
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        buffer: file.buffer,
      },
      input,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List documents" })
  public async findMany(
    @Query() filter: DocumentFilterDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    const docFilter: { organizationId: string; workspaceId?: string; ownerId?: string; status?: string; search?: string; mimeType?: string; tags?: readonly string[]; sortBy?: string; sortOrder?: string; offset?: number; limit?: number } = {
      organizationId: user.organizationId ?? "",
    };
    if (filter.workspaceId !== undefined) docFilter.workspaceId = filter.workspaceId;
    if (filter.ownerId !== undefined) docFilter.ownerId = filter.ownerId;
    if (filter.status !== undefined) docFilter.status = filter.status;
    if (filter.search !== undefined) docFilter.search = filter.search;
    if (filter.mimeType !== undefined) docFilter.mimeType = filter.mimeType;
    if (filter.tags !== undefined) docFilter.tags = filter.tags;
    if (filter.sortBy !== undefined) docFilter.sortBy = filter.sortBy;
    if (filter.sortOrder !== undefined) docFilter.sortOrder = filter.sortOrder;
    if (filter.offset !== undefined) docFilter.offset = filter.offset;
    if (filter.limit !== undefined) docFilter.limit = filter.limit;

    return this.documentService.findMany(docFilter as never);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get document by ID" })
  @ApiResponse({ status: 200, description: "Document found" })
  @ApiResponse({ status: 404, description: "Document not found" })
  public async findById(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    const document = await this.documentService.findById(id, user.organizationId ?? "");
    if (document === null) throw new NotFoundException("Document not found");

    return document;
  }

  @Patch(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Owner", "Admin", "Manager", "User")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update document metadata" })
  public async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateDocumentDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.documentService.update(id, user.organizationId ?? "", body);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Owner", "Admin", "Manager", "User")
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft-delete a document" })
  @ApiResponse({ status: 204, description: "Document deleted" })
  public async delete(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<void> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    await this.documentService.delete(id, user.organizationId ?? "");
  }

  @Post(":id/archive")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Owner", "Admin", "Manager", "User")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Archive a document" })
  public async archive(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.documentService.archive(id, user.organizationId ?? "");
  }

  @Post(":id/restore")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Owner", "Admin", "Manager", "User")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Restore a deleted document" })
  public async restore(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.documentService.restore(id, user.organizationId ?? "");
  }

  @Get(":id/download")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Download a document" })
  public async download(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    const result = await this.documentService.download(id, user.organizationId ?? "");
    return result;
  }
}
