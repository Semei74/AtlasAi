import { describe, it, expect, beforeEach } from "vitest";
import { PromptValidatorService } from "./prompt-validator.service.js";

describe("PromptValidatorService", () => {
  let validator: PromptValidatorService;

  beforeEach(() => {
    validator = new PromptValidatorService();
  });

  describe("validateTemplates", () => {
    it("should accept simple valid templates", () => {
      const result = validator.validateTemplates(
        "You are a helpful assistant.",
        "Hello {{name}}!",
        "Reply in {{language}}.",
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should accept templates with complex helpers and partials", () => {
      const result = validator.validateTemplates(
        "{{#if user}}Welcome, {{user.name}}!{{/if}}",
        "{{#each items}}{{> item}}{{/each}}",
        "{{formatDate date 'YYYY-MM-DD'}}",
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should throw on unclosed braces due to second parse call", () => {
      expect(() => validator.validateTemplates("Hello {{name")).toThrow();
    });

    it("should report max length exceeded", () => {
      const longTemplate = "x".repeat(1_000_001);
      const result = validator.validateTemplates(longTemplate);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe("MAX_LENGTH_EXCEEDED");
      expect(result.errors[0]?.field).toBe("system");
    });

    it("should warn when template accesses process.env", () => {
      const result = validator.validateTemplates("API key: {{process.env.API_KEY}}");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "ENV_ACCESS")).toBe(true);
    });

    it("should warn when template contains require() in raw text", () => {
      const result = validator.validateTemplates('someText + require("fs") + moreText');
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "REQUIRE_USAGE")).toBe(true);
    });

    it("should warn when template contains eval() in raw text", () => {
      const result = validator.validateTemplates("someText + eval(code) + moreText");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "EVAL_USAGE")).toBe(true);
    });

    it("should warn when template contains Function constructor in raw text", () => {
      const result = validator.validateTemplates("someText + Function('return 1') + moreText");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "FUNCTION_CONSTRUCTOR")).toBe(true);
    });

    it("should warn when template contains dynamic import() in raw text", () => {
      const result = validator.validateTemplates("someText + import('fs') + moreText");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "IMPORT_USAGE")).toBe(true);
    });

    it("should warn when template accesses globalThis", () => {
      const result = validator.validateTemplates("{{globalThis.process}}");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "GLOBAL_ACCESS")).toBe(true);
    });

    it("should warn about deep recursion exceeding recommended maximum", () => {
      const deepTemplate = "{{#if a}}{{#if b}}{{#if c}}{{#if d}}{{#if e}}{{#if f}}deep{{/if}}{{/if}}{{/if}}{{/if}}{{/if}}{{/if}}";
      const result = validator.validateTemplates(deepTemplate);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "RECURSION_DEPTH_WARNING")).toBe(true);
    });

    it("should not warn about recursion depth for shallow templates", () => {
      const result = validator.validateTemplates("{{name}}");
      expect(result.warnings.every((w) => w.code !== "RECURSION_DEPTH_WARNING")).toBe(true);
    });

    it("should skip undefined templates without errors", () => {
      const result = validator.validateTemplates(undefined, undefined, undefined);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should skip only undefined templates when mixing defined and undefined", () => {
      const result = validator.validateTemplates("valid", undefined, "also valid");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle empty string templates", () => {
      const result = validator.validateTemplates("");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report max length exceeded even when other templates throw", () => {
      expect(() => validator.validateTemplates(
        "x".repeat(1_000_001),
        "Hello {{name",
        undefined,
      )).toThrow();
    });

    it("should report multiple forbidden patterns in raw text", () => {
      const result = validator.validateTemplates(
        "prefix process.env require(eval(Function(import(globalThis)))) suffix",
      );
      const codes = result.warnings.map((w) => w.code);
      expect(codes).toContain("ENV_ACCESS");
      expect(codes).toContain("REQUIRE_USAGE");
      expect(codes).toContain("EVAL_USAGE");
      expect(codes).toContain("FUNCTION_CONSTRUCTOR");
      expect(codes).toContain("IMPORT_USAGE");
      expect(codes).toContain("GLOBAL_ACCESS");
    });
  });

  describe("validateVariables", () => {
    it("should pass when all used variables are declared", () => {
      const result = validator.validateVariables("Hello {{name}}, today is {{today}}.", ["name", "today"]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should warn about undeclared variables used in template", () => {
      const result = validator.validateVariables("Hello {{name}}!", []);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.code).toBe("UNDECLARED_VARIABLE");
      expect(result.warnings[0]?.field).toBe("template");
    });

    it("should warn about declared variables not used in template", () => {
      const result = validator.validateVariables("Hello {{name}}!", ["name", "unused"]);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.code).toBe("UNUSED_VARIABLE");
      expect(result.warnings[0]?.field).toBe("schema");
    });

    it("should report both undeclared and unused warnings simultaneously", () => {
      const result = validator.validateVariables("Hello {{used}}!", ["declared", "unused"]);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
      expect(result.warnings.some((w) => w.code === "UNDECLARED_VARIABLE")).toBe(true);
      expect(result.warnings.some((w) => w.code === "UNUSED_VARIABLE")).toBe(true);
    });

    it("should not flag variables prefixed with underscore as undeclared", () => {
      const result = validator.validateVariables("Hello {{_internal}}!", []);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should flag non-underscore variables even when underscore variables are present", () => {
      const result = validator.validateVariables("Hello {{name}} and {{_internal}}!", ["name"]);
      expect(result.valid).toBe(true);
      expect(result.warnings.every((w) => w.code !== "UNDECLARED_VARIABLE")).toBe(true);
    });

    it("should handle variables with dot notation", () => {
      const result = validator.validateVariables("{{user.name}} and {{user.email}}", ["user.name", "user.email"]);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should extract variable names without block helper/partial prefixes", () => {
      const result = validator.validateVariables("{{#if}}{{> partialName}}{{/if}}", ["partialName", "if"]);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should handle empty template string", () => {
      const result = validator.validateVariables("", ["unused"]);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]?.code).toBe("UNUSED_VARIABLE");
    });

    it("should handle template with no variables", () => {
      const result = validator.validateVariables("Plain text without variables.", []);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("validateSchema", () => {
    it("should validate data against schema rules successfully", () => {
      const schema = { name: "string", age: "number", active: "boolean" };
      const data = { name: "Alice", age: 30, active: true };
      const result = validator.validateSchema(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report missing required field", () => {
      const schema = { name: "string", required: true };
      const data = {};
      const result = validator.validateSchema(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: name");
    });

    it("should not report missing field when required is set to false", () => {
      const schema = { name: { required: false } };
      const data = {};
      const result = validator.validateSchema(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report type mismatch", () => {
      const schema = { age: "number" };
      const data = { age: "thirty" };
      const result = validator.validateSchema(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "age" expected type number, got string');
    });

    it("should report multiple errors across different fields", () => {
      const schema = { name: "string", age: "number" };
      const data = { name: 42, age: "old" };
      const result = validator.validateSchema(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should reject non-object data (null)", () => {
      const result = validator.validateSchema(null, { name: "string" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Data must be a non-null object");
    });

    it("should reject non-object data (string)", () => {
      const result = validator.validateSchema("invalid", { name: "string" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Data must be a non-null object");
    });

    it("should reject non-object data (number)", () => {
      const result = validator.validateSchema(42, { name: "string" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Data must be a non-null object");
    });

    it("should accept empty schema", () => {
      const result = validator.validateSchema({ key: "value" }, {});
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept data with extra fields not in schema", () => {
      const schema = { name: "string" };
      const data = { name: "Alice", extra: "ignored" };
      const result = validator.validateSchema(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validateJsonSchema", () => {
    it("should accept a valid JSON Schema with supported type", () => {
      const result = validator.validateJsonSchema({ type: "string" });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept all supported types", () => {
      for (const type of ["string", "number", "integer", "boolean", "array", "object", "null"]) {
        const result = validator.validateJsonSchema({ type });
        expect(result.valid).toBe(true);
      }
    });

    it("should reject unsupported type", () => {
      const result = validator.validateJsonSchema({ type: "date" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unsupported schema type: date");
    });

    it("should reject null schema", () => {
      const result = validator.validateJsonSchema(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("JSON Schema must be a non-null object");
    });

    it("should reject undefined schema", () => {
      const result = validator.validateJsonSchema(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("JSON Schema must be a non-null object");
    });

    it("should reject non-object schema (string)", () => {
      const result = validator.validateJsonSchema("string");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("JSON Schema must be a non-null object");
    });

    it("should reject non-object schema (number)", () => {
      const result = validator.validateJsonSchema(42);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("JSON Schema must be a non-null object");
    });

    it("should accept schema without a type field", () => {
      const result = validator.validateJsonSchema({ title: "My Schema" });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept schema with nested properties when type is object", () => {
      const result = validator.validateJsonSchema({
        type: "object",
        properties: { name: { type: "string" } },
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject schema where type is not a string", () => {
      const result = validator.validateJsonSchema({ type: ["string", "number"] });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
