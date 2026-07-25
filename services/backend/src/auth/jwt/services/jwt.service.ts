import { Inject, Injectable } from "@nestjs/common";
import { UnauthorizedError } from "@atlas/errors";
import { rootLogger } from "@atlas/logger";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import type { JwtConfig } from "../interfaces/jwt-config.interface.js";
import { JWT_CONFIG } from "../interfaces/jwt-config.interface.js";
import type { TokenClaimsInput } from "../interfaces/jwt-claims.interface.js";
import type { JwtClaims } from "../interfaces/jwt-claims.interface.js";
import type { RefreshTokenStore } from "../interfaces/refresh-token-store.interface.js";
import { REFRESH_TOKEN_STORE } from "../interfaces/refresh-token-store.interface.js";
import type { TokenPair } from "../dto/token-pair.dto.js";

const REFRESH_TOKEN_BYTES = 32;

@Injectable()
export class JwtService {
  private readonly config: JwtConfig;

  public constructor(
    @Inject(JWT_CONFIG) config: JwtConfig,
    @Inject(REFRESH_TOKEN_STORE) private readonly refreshStore: RefreshTokenStore,
  ) {
    this.config = config;
  }

  public generateAccessToken(claims: TokenClaimsInput): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtClaims = {
      sub: claims.sub,
      email: claims.email,
      role: claims.role,
      organizationId: claims.organizationId ?? null,
      workspaceId: claims.workspaceId ?? null,
      sessionId: claims.sessionId ?? null,
      tokenVersion: claims.tokenVersion ?? 1,
      iat: now,
      exp: now + this.parseExpiration(this.config.accessTokenExpiresIn),
    };

    return jwt.sign(payload, this.config.secret, {
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience,
    });
  }

  public generateRefreshToken(): string {
    return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  }

  public async generateTokenPair(claims: TokenClaimsInput, tokenFamily?: string): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(claims);
    const refreshToken = this.generateRefreshToken();
    const family = tokenFamily ?? crypto.randomUUID();

    const expiresAt = new Date(
      Date.now() + this.parseExpirationMs(this.config.refreshTokenExpiresIn),
    );

    await this.refreshStore.save(refreshToken, claims.sub, expiresAt, family);

    return { accessToken, refreshToken, expiresAt };
  }

  public verifyAccessToken(token: string): JwtClaims {
    try {
      const decoded = jwt.verify(token, this.config.secret, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as JwtClaims;

      return decoded;
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }

  public decodeAccessToken(token: string): JwtClaims | null {
    try {
      return jwt.decode(token) as JwtClaims | null;
    } catch {
      return null;
    }
  }

  public async rotateRefreshToken(
    oldRefreshToken: string,
    claims: TokenClaimsInput,
  ): Promise<TokenPair> {
    const oldData = await this.refreshStore.find(oldRefreshToken);

    if (!oldData) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (oldData.consumed) {
      await this.refreshStore.invalidateFamily(oldData.tokenFamily);
      rootLogger.warn("Token replay detected — invalidated token family", {
        userId: oldData.userId,
        tokenFamily: oldData.tokenFamily,
      });
      throw new UnauthorizedError("Refresh token already consumed — all sessions invalidated due to suspected token theft");
    }

    if (Date.now() > oldData.expiresAt.getTime()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    if (oldData.userId !== claims.sub) {
      throw new UnauthorizedError("Refresh token user mismatch");
    }

    const consumed = await this.refreshStore.consume(oldRefreshToken);
    if (!consumed) {
      await this.refreshStore.invalidateFamily(oldData.tokenFamily);
      rootLogger.warn("Token replay detected — invalidated token family", {
        userId: oldData.userId,
        tokenFamily: oldData.tokenFamily,
      });
      throw new UnauthorizedError("Refresh token already consumed — all sessions invalidated due to suspected token theft");
    }

    return this.generateTokenPair(claims, oldData.tokenFamily);
  }

  public async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshStore.markConsumed(token);
  }

  public async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshStore.invalidateByUser(userId);
  }

  public getAccessTokenExpiration(): string {
    return this.config.accessTokenExpiresIn;
  }

  public getRefreshTokenExpiration(): string {
    return this.config.refreshTokenExpiresIn;
  }

  private parseExpiration(expiresIn: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = regex.exec(expiresIn);
    if (!match) return 900;

    const raw = match[1];
    if (raw === undefined) return 900;
    const value = parseInt(raw, 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 60 * 60 * 24;
      default:
        return 900;
    }
  }

  private parseExpirationMs(expiresIn: string): number {
    return this.parseExpiration(expiresIn) * 1000;
  }
}
