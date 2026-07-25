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
import { MembershipService } from "../services/membership.service.js";
import { CreateMembershipDto } from "../dto/create-membership.dto.js";
import { UpdateMembershipDto } from "../dto/update-membership.dto.js";
import { MembershipResponseDto } from "../dto/membership-response.dto.js";

@ApiTags("Memberships")
@Controller("organizations/:orgId/memberships")
export class MembershipController {
  public constructor(
    @Inject(MembershipService) private readonly membershipService: MembershipService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add a member to an organization" })
  @ApiResponse({ status: 201, description: "Member added" })
  @ApiResponse({ status: 409, description: "User is already a member" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async create(
    @Param("orgId") orgId: string,
    @Body() body: CreateMembershipDto,
    @Req() request: FastifyRequest,
  ): Promise<MembershipResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const membership = await this.membershipService.create(orgId, body, user.sub);

    return MembershipResponseDto.from(membership);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List members of an organization" })
  @ApiResponse({ status: 200, description: "List of members" })
  public async findAll(
    @Param("orgId") orgId: string,
    @Req() request: FastifyRequest,
  ): Promise<MembershipResponseDto[]> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const memberships = await this.membershipService.findByOrganizationId(orgId, user.sub);

    return memberships.map((m) => MembershipResponseDto.from(m));
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a member's role" })
  @ApiResponse({ status: 200, description: "Member role updated" })
  @ApiResponse({ status: 404, description: "Membership not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async update(
    @Param("orgId") _orgId: string,
    @Param("id") id: string,
    @Body() body: UpdateMembershipDto,
    @Req() request: FastifyRequest,
  ): Promise<MembershipResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const membership = await this.membershipService.update(id, body, user.sub);

    return MembershipResponseDto.from(membership);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove a member from an organization" })
  @ApiResponse({ status: 204, description: "Member removed" })
  @ApiResponse({ status: 404, description: "Membership not found" })
  public async delete(
    @Param("orgId") _orgId: string,
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.membershipService.delete(id, user.sub);
  }
}
