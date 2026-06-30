import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { ForbiddenError } from "@atlas/errors";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { AuthorizationService } from "../services/authorization.service.js";
import type { RequestWithUser } from "./auth.guard.js";

@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) as string[] | undefined;

    if (requiredRoles === undefined) {
      return true;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new ForbiddenError("Authentication required");
    }

    const hasRole = requiredRoles.some((required) =>
      this.authorizationService.requireRole(user.role, required),
    );

    if (!hasRole) {
      throw new ForbiddenError("Insufficient permissions");
    }

    return true;
  }
}
