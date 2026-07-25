export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

interface JsonSchema {
  readonly type?: unknown;
  readonly properties?: Record<string, JsonSchema>;
  readonly required?: readonly unknown[];
  readonly enum?: readonly unknown[];
}

function formatType(type: unknown): string {
  return typeof type === "string" ? type : JSON.stringify(type);
}

function isType(value: unknown, type: unknown): boolean {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
    case "null":
      return value === null;
    default:
      return true;
  }
}

export function validateToolArguments(schema: JsonSchema | undefined, args: Record<string, unknown>): SchemaValidationResult {
  if (schema?.type === undefined) {
    return { valid: true };
  }
  if (schema.type !== "object") {
    return { valid: false, error: `Unsupported root schema type: ${formatType(schema.type)}` };
  }

  const properties = schema.properties ?? {};
  const required = schema.required ?? [];
  for (const entry of required) {
    if (typeof entry !== "string") {
      continue;
    }
    if (!(entry in args)) {
      return { valid: false, error: `Missing required property: ${entry}` };
    }
  }

  for (const [key, value] of Object.entries(args)) {
    const propSchema = properties[key];
    if (!propSchema) {
      continue;
    }
    if (propSchema.type !== undefined && !isType(value, propSchema.type)) {
      return { valid: false, error: `Invalid type for "${key}": expected ${formatType(propSchema.type)}` };
    }
    if (Array.isArray(propSchema.enum) && !propSchema.enum.includes(value)) {
      return { valid: false, error: `"${key}" must be one of: ${propSchema.enum.join(", ")}` };
    }
  }

  return { valid: true };
}
