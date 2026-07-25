import {
  Controller,
  Post,
  Get,
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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../auth/authorization/guards/auth.guard.js";
import { RolesGuard } from "../auth/authorization/guards/roles.guard.js";
import type { RequestWithUser } from "../auth/authorization/guards/auth.guard.js";
import { SkipTenant } from "../tenant/decorators/skip-tenant.decorator.js";
import type { RequestWithTenant } from "../tenant/interfaces/request-with-tenant.interface.js";
import { Roles } from "../auth/authorization/decorators/roles.decorator.js";
import { ProjectService } from "./project.service.js";
import { CreateProjectDto } from "./dto/create-project.dto.js";
import { UpdateProjectDto } from "./dto/update-project.dto.js";
import { ProjectResponseDto } from "./dto/project-response.dto.js";
import { ProjectListResponseDto } from "./dto/project-list-response.dto.js";
import { ProjectDetailResponseDto } from "./dto/project-detail-response.dto.js";
import { ProjectListQueryDto } from "./dto/project-list-query.dto.js";
import { RecentProjectsQueryDto } from "./dto/recent-projects-query.dto.js";

@ApiTags("Projects")
@Controller("projects")
export class ProjectController {
  public constructor(
    @Inject(ProjectService) private readonly projectService: ProjectService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Manager", "Admin", "Owner")
  @SkipTenant()
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new project" })
  @ApiResponse({ status: 201, description: "Project created", type: ProjectResponseDto })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async create(
    @Body() body: CreateProjectDto,
    @Req() request: FastifyRequest,
  ): Promise<ProjectResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    return this.projectService.create(body, organizationId, user.sub);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Viewer", "User", "Manager", "Admin", "Owner")
  @SkipTenant()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List projects for the current organization with pagination, search, and filters" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20, description: "Items per page" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search term for name or description" })
  @ApiQuery({ name: "status", required: false, enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"], description: "Filter by status" })
  @ApiQuery({ name: "workspaceId", required: false, type: String, description: "Filter by workspace ID" })
  @ApiQuery({ name: "sort", required: false, enum: ["updatedAt", "createdAt", "name"], description: "Sort field" })
  @ApiQuery({ name: "order", required: false, enum: ["asc", "desc"], description: "Sort order" })
  @ApiResponse({ status: 200, description: "Paginated list of projects", type: ProjectListResponseDto })
  public async findAll(
    @Query() query: ProjectListQueryDto,
    @Req() request: FastifyRequest,
  ): Promise<ProjectListResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    return this.projectService.findAllPaginated(query, organizationId, user.sub);
  }

  @Get("recent")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Viewer", "User", "Manager", "Admin", "Owner")
  @SkipTenant()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List recent projects for the current organization" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: "List of recent projects", type: [ProjectResponseDto] })
  public async findRecent(
    @Query() query: RecentProjectsQueryDto,
    @Req() request: FastifyRequest,
  ): Promise<ProjectResponseDto[]> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const limit = query.limit ?? 10;

    return this.projectService.findRecent(organizationId, user.sub, limit);
  }

  @Get(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Viewer", "User", "Manager", "Admin", "Owner")
  @SkipTenant()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get project by ID with full details" })
  @ApiResponse({ status: 200, description: "Project details with activity logs", type: ProjectDetailResponseDto })
  @ApiResponse({ status: 404, description: "Project not found" })
  public async findById(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<ProjectDetailResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    return this.projectService.findByIdDetail(id, user.sub);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Manager", "Admin", "Owner")
  @SkipTenant()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update project" })
  @ApiResponse({ status: 200, description: "Project updated", type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async update(
    @Param("id") id: string,
    @Body() body: UpdateProjectDto,
    @Req() request: FastifyRequest,
  ): Promise<ProjectResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    return this.projectService.update(id, body, user.sub);
  }

  @Patch(":id/archive")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Manager", "Admin", "Owner")
  @SkipTenant()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Archive a project" })
  @ApiResponse({ status: 200, description: "Project archived", type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 409, description: "Project is already archived" })
  public async archive(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<ProjectResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    return this.projectService.archive(id, user.sub);
  }

  @Patch(":id/restore")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Manager", "Admin", "Owner")
  @SkipTenant()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Restore an archived project" })
  @ApiResponse({ status: 200, description: "Project restored", type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 409, description: "Project is not archived" })
  public async restore(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<ProjectResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    return this.projectService.restore(id, user.sub);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Manager", "Admin", "Owner")
  @SkipTenant()
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft-delete project" })
  @ApiResponse({ status: 204, description: "Project archived" })
  @ApiResponse({ status: 404, description: "Project not found" })
  public async delete(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.projectService.delete(id, user.sub);
  }
}
