import { Injectable } from "@nestjs/common";
import Handlebars from "handlebars";
import type { PromptValidationResult, SchemaValidationResult, TemplateValidator, ValidationError, ValidationWarning } from "../interfaces/prompt-validator.interface.js";

@Injectable()
export class PromptValidatorService implements TemplateValidator {
  public validateTemplates(system?: string, user?: string, assistant?: string): PromptValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const [name, template] of Object.entries({ system, user, assistant })) {
      if (typeof template !== "string") continue;

      if (template.length > 1000000) {
        errors.push({
          field: name,
          message: `Template exceeds maximum length of 1000000 characters`,
          code: "MAX_LENGTH_EXCEEDED",
        });
      }

      try {
        Handlebars.parse(template);
      } catch (error: unknown) {
        errors.push({
          field: name,
          message: error instanceof Error ? error.message : "Template parse error",
          code: "TEMPLATE_SYNTAX_ERROR",
        });
      }

      const ast = Handlebars.parse(template);
      const depth =       this.#countDepth(ast as unknown as Record<string, unknown>);

      if (depth > 5) {
        warnings.push({
          field: name,
          message: `Template recursion depth (${String(depth)}) exceeds recommended maximum of 5`,
          code: "RECURSION_DEPTH_WARNING",
        });
      }

      const blockingPatterns = [
        { pattern: /\{\{\{/g, code: "TRIPLE_STASH", msg: "Template uses triple-stash {{{ which bypasses HTML escaping" },
        { pattern: /\{\{&\s*/g, code: "UNESCAPED_VARIABLE", msg: "Template uses unescaped variable {{& which bypasses HTML escaping" },
      ];

      for (const { pattern, code, msg } of blockingPatterns) {
        if (pattern.test(template)) {
          errors.push({ field: name, message: msg, code });
        }
      }

      const forbiddenPatterns = [
        { pattern: /process\.env/i, code: "ENV_ACCESS", msg: "Template accesses environment variables" },
        { pattern: /require\s*\(/i, code: "REQUIRE_USAGE", msg: "Template uses require()" },
        { pattern: /import\s*\(/i, code: "IMPORT_USAGE", msg: "Template uses dynamic import" },
        { pattern: /eval\s*\(/i, code: "EVAL_USAGE", msg: "Template uses eval()" },
        { pattern: /Function\s*\(/i, code: "FUNCTION_CONSTRUCTOR", msg: "Template uses Function constructor" },
        { pattern: /globalThis/i, code: "GLOBAL_ACCESS", msg: "Template accesses globalThis" },
      ];

      for (const { pattern, code, msg } of forbiddenPatterns) {
        if (pattern.test(template)) {
          warnings.push({ field: name, message: msg, code });
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  public validateVariables(template: string, declaredVariables: readonly string[]): PromptValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const extracted = this.#extractVariables(template);

    for (const v of extracted) {
      if (!declaredVariables.includes(v) && !v.startsWith("_")) {
        warnings.push({
          field: "template",
          message: `Variable "{{${v}}}" is used in template but not declared in schema`,
          code: "UNDECLARED_VARIABLE",
        });
      }
    }

    for (const v of declaredVariables) {
      if (!extracted.includes(v)) {
        warnings.push({
          field: "schema",
          message: `Variable "${v}" is declared in schema but not used in template`,
          code: "UNUSED_VARIABLE",
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  public validateSchema(data: unknown, schema: Record<string, unknown>): SchemaValidationResult {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
      errors.push("Data must be a non-null object");
      return { valid: false, errors };
    }

    const dataRecord = data as Record<string, unknown>;
    const schemaRecord = schema;

    for (const [key, rule] of Object.entries(schemaRecord)) {
      const value: unknown = dataRecord[key];

      if (value === undefined) {
        const ruleObj = rule as Record<string, unknown>;
        if (ruleObj["required"] === true || ruleObj["required"] === undefined) {
          errors.push(`Missing required field: ${key}`);
        }
        continue;
      }

      if (typeof rule === "string") {
        if (typeof value !== rule) {
          errors.push(`Field "${key}" expected type ${rule}, got ${typeof value}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  public validateJsonSchema(schema: unknown): SchemaValidationResult {
    const errors: string[] = [];

    if (typeof schema !== "object" || schema === null) {
      errors.push("JSON Schema must be a non-null object");
      return { valid: false, errors };
    }

    const schemaObj = schema as Record<string, unknown>;
    const allowedTypes = ["string", "number", "integer", "boolean", "array", "object", "null"];

    const schemaType = schemaObj["type"];
    if (schemaType !== undefined && typeof schemaType === "string") {
      if (!allowedTypes.includes(schemaType)) {
        errors.push(`Unsupported schema type: ${schemaType}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  #countDepth(node: Record<string, unknown>, depth = 0): number {
    let maxDepth = depth;

    for (const value of Object.values(node)) {
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === "object" && item !== null) {
              maxDepth = Math.max(maxDepth, this.#countDepth(item as Record<string, unknown>, depth + 1));
            }
          }
        } else {
          maxDepth = Math.max(maxDepth, this.#countDepth(value as Record<string, unknown>, depth + 1));
        }
      }
    }

    return maxDepth;
  }

  #extractVariables(template: string): string[] {
    const variables = new Set<string>();
    const regex = /\{\{([#/^>]?\s*[\w.]+)\s*(.*?)\}\}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(template)) !== null) {
      const name = match[1]?.trim() ?? "";
      const cleaned = name.replace(/^[#/^>]/, "").trim();

      if (cleaned.length > 0 && !cleaned.startsWith("!")) {
        variables.add(cleaned);
      }
    }

    return [...variables];
  }
}
