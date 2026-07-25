import {
  Controller,
  Post,
  Get,
  Patch,
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
import { InvitationService } from "../services/invitation.service.js";
import { CreateInvitationDto } from "../dto/create-invitation.dto.js";
import { InvitationResponseDto } from "../dto/invitation-response.dto.js";

@ApiTags("Invitations")
@Controller("invitations")
export class InvitationController {
  public constructor(
    @Inject(InvitationService) private readonly invitationService: InvitationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create an invitation" })
  @ApiResponse({ status: 201, description: "Invitation created" })
  @ApiResponse({ status: 409, description: "Invitation already exists" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async create(
    @Body() body: CreateInvitationDto,
    @Req() request: FastifyRequest,
  ): Promise<InvitationResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const invitation = await this.invitationService.create(body, organizationId, user.sub);

    return InvitationResponseDto.from(invitation);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List invitations for the current organization" })
  @ApiResponse({ status: 200, description: "List of invitations" })
  public async findAll(@Req() request: FastifyRequest): Promise<InvitationResponseDto[]> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const invitations = await this.invitationService.findByOrganizationId(organizationId, user.sub);

    return invitations.map((inv) => InvitationResponseDto.from(inv));
  }

  @Post(":id/accept")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Accept an invitation" })
  @ApiResponse({ status: 200, description: "Invitation accepted" })
  @ApiResponse({ status: 400, description: "Invitation is not pending or expired" })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  public async accept(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.invitationService.accept(id, user.sub, user.email);
  }

  @Patch(":id/revoke")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke an invitation" })
  @ApiResponse({ status: 200, description: "Invitation revoked" })
  @ApiResponse({ status: 400, description: "Invitation is not pending" })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  public async revoke(
    @Param("id") id: string,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.invitationService.revoke(id, user.sub);
  }
}
