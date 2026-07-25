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
import { OrganizationService } from "../services/organization.service.js";
import { CreateOrganizationDto } from "../dto/create-organization.dto.js";
import { UpdateOrganizationDto } from "../dto/update-organization.dto.js";
import { OrganizationResponseDto } from "../dto/organization-response.dto.js";

@ApiTags("Organizations")
@Controller("organizations")
export class OrganizationController {
  public constructor(
    @Inject(OrganizationService) private readonly organizationService: OrganizationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiResponse({ status: 201, description: "Organization created" })
  @ApiResponse({ status: 409, description: "Organization slug already exists" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async create(
    @Body() body: CreateOrganizationDto,
    @Req() request: FastifyRequest,
  ): Promise<OrganizationResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const organization = await this.organizationService.create(body, user.sub);

    return OrganizationResponseDto.from(organization);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List organizations for the current user" })
  @ApiResponse({ status: 200, description: "List of organizations" })
  public async findAll(@Req() request: FastifyRequest): Promise<OrganizationResponseDto[]> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const organizations = await this.organizationService.findAllByUserId(user.sub);

    return organizations.map((org) => OrganizationResponseDto.from(org));
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiResponse({ status: 200, description: "Organization details" })
  @ApiResponse({ status: 404, description: "Organization not found" })
  public async findById(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<OrganizationResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const organization = await this.organizationService.findById(id, user.sub);

    return OrganizationResponseDto.from(organization);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update organization" })
  @ApiResponse({ status: 200, description: "Organization updated" })
  @ApiResponse({ status: 404, description: "Organization not found" })
  @ApiResponse({ status: 409, description: "Organization slug already exists" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async update(
    @Param("id") id: string,
    @Body() body: UpdateOrganizationDto,
    @Req() request: FastifyRequest,
  ): Promise<OrganizationResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const organization = await this.organizationService.update(id, body, user.sub);

    return OrganizationResponseDto.from(organization);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete organization" })
  @ApiResponse({ status: 204, description: "Organization deleted" })
  @ApiResponse({ status: 404, description: "Organization not found" })
  public async delete(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.organizationService.delete(id, user.sub);
  }
}
