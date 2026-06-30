import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@atlas/errors";
import { JwtService } from "../../jwt/services/jwt.service.js";
import type { JwtClaims } from "../../jwt/interfaces/jwt-claims.interface.js";

export interface RequestWithUser extends FastifyRequest {
  user?: JwtClaims;
}

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly jwtService: JwtService) {}

  public canActivate(context: ExecutionContext): boolean {
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
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }
}
