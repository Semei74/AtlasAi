import { Injectable } from "@nestjs/common";
import { rootLogger } from "@atlas/logger";

export type AuthEventType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "register"
  | "email_verified"
  | "password_change"
  | "password_reset_request"
  | "password_reset"
  | "token_refresh"
  | "account_lockout"
  | "logout_all_sessions"
  | "session_revoked";

export interface AuthEvent {
  readonly type: AuthEventType;
  readonly userId: string | null;
  readonly email: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly timestamp: Date;
}

@Injectable()
export class AuthAuditService {
  public emit(event: AuthEvent): void {
    const logData = {
      audit: true,
      type: event.type,
      userId: event.userId,
      email: event.email,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      ...(event.metadata ? { metadata: event.metadata } : {}),
      timestamp: event.timestamp.toISOString(),
    };

    switch (event.type) {
      case "login_success":
        rootLogger.info("Auth audit: login successful", logData);
        break;
      case "login_failure":
        rootLogger.warn("Auth audit: login failed", logData);
        break;
      case "account_lockout":
        rootLogger.warn("Auth audit: account locked out", logData);
        break;
      case "logout":
        rootLogger.info("Auth audit: user logged out", logData);
        break;
      case "register":
        rootLogger.info("Auth audit: user registered", logData);
        break;
      case "password_change":
        rootLogger.info("Auth audit: password changed", logData);
        break;
      case "password_reset":
        rootLogger.info("Auth audit: password reset", logData);
        break;
      default:
        rootLogger.info(`Auth audit: ${event.type}`, logData);
    }
  }

  public loginSuccess(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "login_success", timestamp: new Date() });
  }

  public loginFailure(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "login_failure", timestamp: new Date() });
  }

  public accountLockout(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "account_lockout", timestamp: new Date() });
  }

  public logout(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "logout", timestamp: new Date() });
  }

  public register(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "register", timestamp: new Date() });
  }

  public emailVerified(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "email_verified", timestamp: new Date() });
  }

  public passwordChange(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "password_change", timestamp: new Date() });
  }

  public passwordReset(event: Omit<AuthEvent, "type" | "timestamp">): void {
    this.emit({ ...event, type: "password_reset", timestamp: new Date() });
  }
}
