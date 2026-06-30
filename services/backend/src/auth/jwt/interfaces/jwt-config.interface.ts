export const JWT_CONFIG = "JWT_CONFIG";

export interface JwtConfig {
  readonly secret: string;
  readonly accessTokenExpiresIn: string;
  readonly refreshTokenExpiresIn: string;
  readonly algorithm: "HS256" | "RS256";
  readonly issuer: string;
  readonly audience: string;
}

export const DEFAULT_JWT_CONFIG: JwtConfig = {
  secret: "development-secret-change-in-production",
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "30d",
  algorithm: "HS256",
  issuer: "atlas-ai",
  audience: "atlas-api",
};
