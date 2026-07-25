import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  ParseUUIDPipe,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../../../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../../../auth/authorization/guards/auth.guard.js";
import { METADATA_SERVICE } from "../interfaces/metadata-service.interface.js";
import type { MetadataService } from "../interfaces/metadata-service.interface.js";
import { UpdateMetadataDto, MergeMetadataDto, DeleteMetadataDto } from "../dto/metadata.dto.js";

@ApiTags("Knowledge Document Metadata")
@Controller("api/v1/knowledge/documents/:id/metadata")
export class MetadataController {
  public constructor(
    @Inject(METADATA_SERVICE)
    private readonly metadataService: MetadataService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get document metadata (auto + custom)" })
  @ApiResponse({ status: 200, description: "Metadata returned" })
  @ApiResponse({ status: 404, description: "Document not found" })
  public async getMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.getMetadata(id, user.organizationId ?? "");
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Overwrite custom metadata" })
  public async updateMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateMetadataDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.updateMetadata(id, user.organizationId ?? "", body.metadata);
  }

  @Post("merge")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Merge custom metadata with existing" })
  public async mergeMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: MergeMetadataDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.mergeMetadata(id, user.organizationId ?? "", body.metadata);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete specific custom metadata keys" })
  public async deleteMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: DeleteMetadataDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.deleteMetadata(id, user.organizationId ?? "", body.keys);
  }

  @Post("rebuild")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Rebuild custom metadata (remove invalid entries)" })
  public async rebuildMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.rebuildMetadata(id, user.organizationId ?? "");
  }

  @Get("history")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get metadata version history" })
  public async getMetadataHistory(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.getMetadataHistory(id, user.organizationId ?? "");
  }

  @Post("rollback/:version")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Rollback metadata to a previous version" })
  public async rollbackMetadata(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("version", ParseIntPipe) version: number,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.metadataService.rollbackMetadata(id, user.organizationId ?? "", version);
  }
}
