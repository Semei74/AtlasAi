import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { JwtService } from "../../auth/jwt/services/jwt.service.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import { SKIP_TENANT_KEY } from "../decorators/skip-tenant.decorator.js";
import type { TenantContext } from "../interfaces/tenant-context.interface.js";
import type { RequestWithTenant } from "../interfaces/request-with-tenant.interface.js";

interface RequestWithUser extends FastifyRequest {
  user?: {
    readonly sub: string;
    readonly email: string;
    readonly role: string;
    readonly organizationId: string | null;
    readonly workspaceId: string | null;
    readonly sessionId: string | null;
    readonly tokenVersion: number;
    readonly iat: number;
    readonly exp: number;
  };
}

@Injectable()
export class TenantScopeGuard implements CanActivate {
  public constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const claims = this.resolveClaims(request);

    if (!claims) {
      return true;
    }

    const { organizationId, workspaceId, sub: userId } = claims;

    if (!organizationId) {
      return true;
    }

    const membership = await this.membershipRepository.findByOrganizationAndUser(
      organizationId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException("User is not a member of this organization");
    }

    if (membership.status !== MembershipStatus.Active) {
      throw new ForbiddenException("User membership is not active");
    }

    const tenant: TenantContext = {
      organizationId,
      workspaceId: workspaceId ?? null,
      userId,
      membershipRole: membership.role,
    };

    (request as RequestWithTenant).tenant = tenant;

    return true;
  }

  private resolveClaims(request: FastifyRequest): NonNullable<RequestWithUser["user"]> | null {
    const existingUser = (request as RequestWithUser).user;

    if (existingUser) {
      return existingUser;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    const token = parts[1];

    if (!token) {
      return null;
    }

    try {
      const decoded = this.jwtService.verifyAccessToken(token);
      return {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
        workspaceId: decoded.workspaceId,
        sessionId: decoded.sessionId,
        tokenVersion: decoded.tokenVersion,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch {
      return null;
    }
  }
}
