import { ConfigurationError } from "@atlas/errors";

export const JWT_CONFIG = "JWT_CONFIG";

export interface JwtConfig {
  readonly secret: string;
  readonly accessTokenExpiresIn: string;
  readonly refreshTokenExpiresIn: string;
  readonly algorithm: "HS256" | "RS256";
  readonly issuer: string;
  readonly audience: string;
}

export function createJwtConfig(): JwtConfig {
  const secret = process.env["JWT_SECRET"];
  const isDev = process.env["NODE_ENV"] === "development" || process.env["NODE_ENV"] === undefined;

  if (!secret) {
    if (isDev) {
      throw new ConfigurationError(
        "JWT_SECRET environment variable is required. Set it in your .env file.\n"
        + "Example: JWT_SECRET=your-secret-key-minimum-32-characters-long",
      );
    }
    throw new ConfigurationError(
      "JWT_SECRET environment variable is required for production. "
      + "Set a strong random value (minimum 32 characters).",
    );
  }

  if (secret.length < 32) {
    throw new ConfigurationError(
      "JWT_SECRET must be at least 32 characters long for security reasons.",
    );
  }

  return {
    secret,
    accessTokenExpiresIn: process.env["JWT_ACCESS_EXPIRES"] ?? "15m",
    refreshTokenExpiresIn: process.env["JWT_REFRESH_EXPIRES"] ?? "30d",
    algorithm: process.env["JWT_ALGORITHM"] !== undefined ? (process.env["JWT_ALGORITHM"] as "HS256" | "RS256") : "HS256",
    issuer: process.env["JWT_ISSUER"] ?? "atlas-ai",
    audience: process.env["JWT_AUDIENCE"] ?? "atlas-api",
  };
}
