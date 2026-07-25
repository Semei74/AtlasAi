import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@atlas/errors";
import { JwtService } from "../../jwt/services/jwt.service.js";
import type { JwtClaims } from "../../jwt/interfaces/jwt-claims.interface.js";
import { SKIP_AUTH_KEY } from "../decorators/skip-auth.decorator.js";

export interface RequestWithUser extends FastifyRequest {
  user?: JwtClaims;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  public constructor(private readonly jwtService: JwtService) {}

  public canActivate(context: ExecutionContext): boolean {
    const skipAuth =
      (Reflect.getOwnMetadata(SKIP_AUTH_KEY, context.getHandler()) as boolean | undefined) ??
      (Reflect.getOwnMetadata(SKIP_AUTH_KEY, context.getClass()) as boolean | undefined);

    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("Missing authorization header");
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new UnauthorizedError("Invalid authorization scheme");
    }

    const token = parts[1];

    if (token === undefined) {
      throw new UnauthorizedError("Invalid authorization scheme");
    }

    try {
      const claims = this.jwtService.verifyAccessToken(token);
      (request as RequestWithUser).user = claims;
      return true;
    } catch (error) {
      this.logger.warn("JWT verification failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }
}
