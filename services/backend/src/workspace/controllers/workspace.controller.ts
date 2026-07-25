import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../../auth/authorization/guards/auth.guard.js";
import type { RequestWithTenant } from "../../tenant/interfaces/request-with-tenant.interface.js";
import { WorkspaceService } from "../services/workspace.service.js";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto.js";
import { UpdateWorkspaceDto } from "../dto/update-workspace.dto.js";
import { WorkspaceResponseDto } from "../dto/workspace-response.dto.js";

@ApiTags("Workspaces")
@Controller("workspaces")
export class WorkspaceController {
  public constructor(
    @Inject(WorkspaceService) private readonly workspaceService: WorkspaceService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new workspace" })
  @ApiResponse({ status: 201, description: "Workspace created" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async create(
    @Body() body: CreateWorkspaceDto,
    @Req() request: FastifyRequest,
  ): Promise<WorkspaceResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const workspace = await this.workspaceService.create(body, organizationId, user.sub);

    return WorkspaceResponseDto.from(workspace);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List workspaces for the current organization" })
  @ApiResponse({ status: 200, description: "List of workspaces" })
  public async findAll(@Req() request: FastifyRequest): Promise<WorkspaceResponseDto[]> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const workspaces = await this.workspaceService.findByOrganizationId(organizationId, user.sub);

    return workspaces.map((ws) => WorkspaceResponseDto.from(ws));
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get workspace by ID" })
  @ApiResponse({ status: 200, description: "Workspace details" })
  @ApiResponse({ status: 404, description: "Workspace not found" })
  public async findById(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<WorkspaceResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const workspace = await this.workspaceService.findById(id, user.sub);

    return WorkspaceResponseDto.from(workspace);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update workspace" })
  @ApiResponse({ status: 200, description: "Workspace updated" })
  @ApiResponse({ status: 404, description: "Workspace not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async update(
    @Param("id") id: string,
    @Body() body: UpdateWorkspaceDto,
    @Req() request: FastifyRequest,
  ): Promise<WorkspaceResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const workspace = await this.workspaceService.update(id, body, user.sub);

    return WorkspaceResponseDto.from(workspace);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete workspace" })
  @ApiResponse({ status: 204, description: "Workspace deleted" })
  @ApiResponse({ status: 404, description: "Workspace not found" })
  public async delete(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.workspaceService.delete(id, user.sub);
  }
}
