import { ConfigurationError } from "@atlas/errors";

interface RequiredSecret {
  readonly key: string;
  readonly minLength: number;
  readonly description: string;
}

interface ConditionalSecret {
  readonly key: string;
  readonly condition: string;
  readonly description: string;
}

const REQUIRED_SECRETS: RequiredSecret[] = [
  { key: "JWT_SECRET", minLength: 32, description: "JWT signing secret" },
  { key: "COOKIE_SECRET", minLength: 32, description: "Cookie signing secret (falls back to JWT_SECRET)" },
  { key: "DB_PASSWORD", minLength: 1, description: "Database password" },
  { key: "REDIS_PASSWORD", minLength: 1, description: "Redis password" },
  { key: "STORAGE_ACCESS_KEY", minLength: 1, description: "MinIO/S3 access key" },
  { key: "STORAGE_SECRET_KEY", minLength: 1, description: "MinIO/S3 secret key" },
];

const CONDITIONAL_SECRETS: ConditionalSecret[] = [
  { key: "SEARCH_USERNAME", condition: "SEARCH_HOST", description: "OpenSearch username" },
  { key: "SEARCH_PASSWORD", condition: "SEARCH_HOST", description: "OpenSearch password" },
  { key: "SMTP_USER", condition: "SMTP_HOST", description: "SMTP username" },
  { key: "SMTP_PASS", condition: "SMTP_HOST", description: "SMTP password" },
];

export function validateSecrets(): void {
  const errors: string[] = [];

  for (const secret of REQUIRED_SECRETS) {
    const value = process.env[secret.key];
    const effectiveValue = secret.key === "COOKIE_SECRET"
      ? (value ?? process.env["JWT_SECRET"])
      : value;

    if (!effectiveValue || effectiveValue.trim().length === 0) {
      errors.push(`Missing required secret: ${secret.key} — ${secret.description}`);
    } else if (effectiveValue.length < secret.minLength) {
      errors.push(
        `Secret ${secret.key} too short (${String(effectiveValue.length)} chars, minimum ${String(secret.minLength)}) — ${secret.description}`,
      );
    }
  }

  for (const secret of CONDITIONAL_SECRETS) {
    const conditionValue = process.env[secret.condition];
    if (conditionValue && conditionValue.trim().length > 0) {
      const value = process.env[secret.key];
      if (!value || value.trim().length === 0) {
        errors.push(
          `Missing required secret: ${secret.key} — required when ${secret.condition} is set — ${secret.description}`,
        );
      }
    }
  }

  const wildcardCors = process.env["CORS_ORIGIN"];
  if (wildcardCors === "*") {
    errors.push("Wildcard CORS origin (*) is not allowed in production");
  }

  if (errors.length > 0) {
    throw new ConfigurationError(
      `Production secrets validation failed:\n${errors.map((e) => `  ✗ ${e}`).join("\n")}`,
    );
  }
}