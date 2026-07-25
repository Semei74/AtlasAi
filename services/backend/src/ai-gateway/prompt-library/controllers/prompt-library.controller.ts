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
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "../../../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../../../auth/authorization/guards/auth.guard.js";
import { PromptService } from "../services/prompt.service.js";
import type { PromptFilter } from "../interfaces/prompt-library.interface.js";
import { CreatePromptDto } from "../dto/create-prompt.dto.js";
import { UpdatePromptDto } from "../dto/update-prompt.dto.js";
import { CreateVersionDto } from "../dto/create-version.dto.js";
import { RenderPromptDto } from "../dto/render-prompt.dto.js";
import { PreviewPromptDto } from "../dto/preview-prompt.dto.js";
import { PromptFilterDto } from "../dto/prompt-filter.dto.js";
import type { PromptRenderRequest } from "../interfaces/prompt-library.interface.js";

@ApiTags("Prompt Library")
@Controller("api/v1/prompts")
export class PromptLibraryController {
  public constructor(
    @Inject(PromptService) private readonly promptService: PromptService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new prompt" })
  @ApiResponse({ status: 201, description: "Prompt created" })
  @ApiResponse({ status: 409, description: "Prompt slug already exists" })
  public async create(
    @Body() body: CreatePromptDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    return this.promptService.create(
      body,
      user.sub,
      user.organizationId ?? undefined,
      (request.headers as Record<string, string>)["x-workspace-id"],
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List prompts" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "categoryId", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  public async list(
    @Query() filter: PromptFilterDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const listFilter: PromptFilter = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.categoryId !== undefined ? { categoryId: filter.categoryId } : {}),
      ...(filter.search !== undefined ? { search: filter.search } : {}),
      ...(filter.tags !== undefined && filter.tags.length > 0 ? { tags: filter.tags } : {}),
      ...(filter.page !== undefined ? { page: filter.page } : {}),
      ...(filter.limit !== undefined ? { limit: filter.limit } : {}),
      ...(user.organizationId !== null ? { organizationId: user.organizationId } : {}),
    };
    return this.promptService.list(listFilter);
  }

  @Get("categories")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List prompt categories" })
  public async getCategories(): Promise<unknown> {
    return this.promptService.getCategories();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get prompt by ID" })
  @ApiResponse({ status: 404, description: "Prompt not found" })
  public async getById(@Param("id") id: string, @Req() request: RequestWithUser): Promise<unknown> {
    const user = request.user;
    return this.promptService.getById(id, user?.organizationId ?? undefined);
  }

  @Get(":id/versions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get prompt version history" })
  public async getVersions(@Param("id") id: string, @Req() request: RequestWithUser): Promise<unknown> {
    const user = request.user;
    return this.promptService.getVersions(id, user?.organizationId ?? undefined);
  }

  @Get(":id/validate")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Validate prompt templates" })
  public async validate(@Param("id") id: string, @Req() request: RequestWithUser): Promise<unknown> {
    const user = request.user;
    return this.promptService.validate(id, user?.organizationId ?? undefined);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update prompt metadata" })
  public async update(
    @Param("id") id: string,
    @Body() body: UpdatePromptDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    return this.promptService.update(id, body, user?.organizationId ?? undefined);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft-delete a prompt" })
  public async delete(@Param("id") id: string, @Req() request: RequestWithUser): Promise<void> {
    const user = request.user;
    await this.promptService.delete(id, user?.organizationId ?? undefined);
  }

  @Post(":id/versions")
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new version of a prompt" })
  public async createVersion(
    @Param("id") id: string,
    @Body() body: CreateVersionDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    return this.promptService.createVersion(id, body, user.sub, user.organizationId ?? undefined);
  }

  @Post(":id/render")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Render a prompt with variables" })
  public async render(
    @Param("id") id: string,
    @Body() body: RenderPromptDto,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    const renderRequest: PromptRenderRequest = {
      promptId: id,
      ...(body.version !== undefined ? { version: body.version } : {}),
      variables: body.variables,
      ...(body.redactPii !== undefined ? { redactPii: body.redactPii } : {}),
    };
    return this.promptService.render(renderRequest, user?.organizationId ?? undefined);
  }

  @Post("preview")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Preview template rendering" })
  public preview(@Body() body: PreviewPromptDto): unknown {
    return this.promptService.preview(body);
  }

  @Post(":id/publish")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Publish a prompt" })
  public async publish(@Param("id") id: string, @Req() request: RequestWithUser): Promise<unknown> {
    const user = request.user;
    return this.promptService.publish(id, user?.organizationId ?? undefined);
  }

  @Post(":id/archive")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Archive a prompt" })
  public async archive(@Param("id") id: string, @Req() request: RequestWithUser): Promise<unknown> {
    const user = request.user;
    return this.promptService.archive(id, user?.organizationId ?? undefined);
  }

  @Post(":id/restore")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Restore an archived prompt" })
  public async restore(@Param("id") id: string, @Req() request: RequestWithUser): Promise<unknown> {
    const user = request.user;
    return this.promptService.restore(id, user?.organizationId ?? undefined);
  }

  @Post(":id/rollback")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Rollback to a previous version" })
  public async rollback(
    @Param("id") id: string,
    @Req() request: RequestWithUser,
    @Body("version") version?: string,
  ): Promise<unknown> {
    const user = request.user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    if (version === undefined) {
      throw new NotFoundException("version is required");
    }

    return this.promptService.rollback(id, version, user.organizationId ?? undefined);
  }

  @Get(":id/compare")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Compare two versions of a prompt" })
  @ApiQuery({ name: "versionA", required: true })
  @ApiQuery({ name: "versionB", required: true })
  public async compare(
    @Param("id") id: string,
    @Req() request: RequestWithUser,
    @Query("versionA") versionA?: string,
    @Query("versionB") versionB?: string,
  ): Promise<unknown> {
    const user = request.user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    if (versionA === undefined || versionB === undefined) {
      throw new NotFoundException("versionA and versionB are required");
    }

    return this.promptService.compareVersions(id, versionA, versionB, user.organizationId ?? undefined);
  }
}
