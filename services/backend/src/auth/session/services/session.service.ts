import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, UnauthorizedError } from "@atlas/errors";
import crypto from "node:crypto";
import type { Session } from "../interfaces/session.interface.js";
import type { DeviceInfo } from "../interfaces/device-info.interface.js";
import type { SessionConfig } from "../interfaces/session-config.interface.js";
import { SESSION_CONFIG } from "../interfaces/session-config.interface.js";
import type { SessionStore } from "../interfaces/session-store.interface.js";
import { SESSION_STORE } from "../interfaces/session-store.interface.js";

export interface CreateSessionInput {
  readonly userId: string;
  readonly deviceInfo: DeviceInfo;
  readonly ipAddress: string;
  readonly refreshToken: string;
  readonly rememberMe?: boolean | undefined;
}

@Injectable()
export class SessionService {
  public constructor(
    @Inject(SESSION_CONFIG) private readonly config: SessionConfig,
    @Inject(SESSION_STORE) private readonly store: SessionStore,
  ) {}

  public async createSession(input: CreateSessionInput): Promise<string> {
    const refreshTokenHash = this.hashRefreshToken(input.refreshToken);
    const now = new Date();
    const ttl = input.rememberMe ? this.config.rememberMeTimeoutMs : this.config.absoluteTimeoutMs;

    const session: Session = {
      id: crypto.randomUUID(),
      userId: input.userId,
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
      refreshTokenHash,
      createdAt: now,
      lastActivityAt: now,
      expiresAt: new Date(now.getTime() + ttl),
      revokedAt: null,
    };

    await this.store.save(session);

    return session.id;
  }

  public async validateSession(sessionId: string, userId: string): Promise<Session> {
    const session = await this.store.findById(sessionId);

    if (session === null) {
      throw new NotFoundError("Session");
    }

    if (session.userId !== userId) {
      throw new UnauthorizedError("Session user mismatch");
    }

    if (session.revokedAt !== null) {
      throw new UnauthorizedError("Session revoked");
    }

    const now = new Date();

    if (now > session.expiresAt) {
      throw new UnauthorizedError("Session expired");
    }

    const idleMs = now.getTime() - session.lastActivityAt.getTime();

    if (idleMs > this.config.idleTimeoutMs) {
      throw new UnauthorizedError("Session idle timeout");
    }

    return session;
  }

  public async touchSession(sessionId: string): Promise<void> {
    const now = new Date();
    await this.store.updateLastActivity(sessionId, now);
  }

  public async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.store.findById(sessionId);

    if (session === null) {
      throw new NotFoundError("Session");
    }

    if (session.userId !== userId) {
      throw new UnauthorizedError("Session user mismatch");
    }

    await this.store.revoke(sessionId);
  }

  public async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await this.store.revokeAllByUserId(userId, exceptSessionId);
  }

  public async listUserSessions(userId: string): Promise<Session[]> {
    const sessions = await this.store.findByUserId(userId);

    return sessions.filter((s) => s.revokedAt === null);
  }

  public async getActiveSessionCount(userId: string): Promise<number> {
    const sessions = await this.store.findByUserId(userId);

    return sessions.filter((s) => s.revokedAt === null).length;
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
