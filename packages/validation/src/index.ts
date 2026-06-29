import { REGEX } from "@atlas/constants";
import { ValidationError } from "@atlas/errors";

export function isEmail(value: string): boolean {
  return REGEX.EMAIL.test(value);
}

export function isUuid(value: string): boolean {
  return REGEX.UUID.test(value);
}

export function isUrl(value: string): boolean {
  return REGEX.URL.test(value);
}

export function isSlug(value: string): boolean {
  return REGEX.SLUG.test(value);
}

export function isPhone(value: string): boolean {
  return REGEX.PHONE.test(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertEmail(value: string): asserts value is string {
  if (!isEmail(value)) {
    throw new ValidationError(`Invalid email: '${value}'`);
  }
}

export function assertUuid(value: string): asserts value is string {
  if (!isUuid(value)) {
    throw new ValidationError(`Invalid UUID: '${value}'`);
  }
}

export function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (!isNonEmptyString(value)) {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }
}

export function assertPositiveInteger(value: unknown, fieldName: string): asserts value is number {
  if (!isPositiveInteger(value)) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
}

export function assertPlainObject(
  value: unknown,
  fieldName: string,
): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new ValidationError(`${fieldName} must be a plain object`);
  }
}

export function validate(
  schema: Record<string, (value: unknown) => boolean>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(schema)) {
    if (!validator(data[field])) {
      errors[field] = `Validation failed for '${field}'`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", { fields: errors });
  }

  return data;
}
