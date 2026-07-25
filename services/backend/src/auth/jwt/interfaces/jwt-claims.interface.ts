export interface JwtClaims {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly organizationId: string | null;
  readonly workspaceId: string | null;
  readonly sessionId: string | null;
  readonly tokenVersion: number;
  readonly iat: number;
  readonly exp: number;
}

export interface TokenClaimsInput {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly organizationId?: string | null;
  readonly workspaceId?: string | null;
  readonly sessionId?: string | null;
  readonly tokenVersion?: number;
}
