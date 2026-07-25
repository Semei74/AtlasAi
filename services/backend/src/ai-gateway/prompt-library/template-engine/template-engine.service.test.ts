import { describe, it, expect, beforeEach } from "vitest";
import { TemplateEngineService } from "./template-engine.service.js";
import type { TemplateEngineConfig } from "../interfaces/template-engine.interface.js";

describe("TemplateEngineService", () => {
  let service: TemplateEngineService;

  beforeEach(() => {
    service = new TemplateEngineService();
  });

  describe("config", () => {
    it("should expose default configuration", () => {
      const config: TemplateEngineConfig = service.config;

      expect(config.strictMode).toBe(true);
      expect(config.noEscape).toBe(false);
      expect(config.maxLength).toBe(1000000);
      expect(config.maxRecursionDepth).toBe(5);
    });
  });

  describe("render", () => {
    it("should substitute simple variables", () => {
      const result = service.render("Hello {{name}}", { name: "World" });

      expect(result.content).toBe("Hello World");
      expect(result.usedVariables).toEqual(["name"]);
      expect(result.missingVariables).toEqual([]);
      expect(result.unknownVariables).toEqual([]);
    });

    it("should detect unknown variables", () => {
      const result = service.render("Hello {{name}}", {
        name: "World",
        extra: "foo",
      });

      expect(result.content).toBe("Hello World");
      expect(result.usedVariables).toEqual(["name"]);
      expect(result.missingVariables).toEqual([]);
      expect(result.unknownVariables).toEqual(["extra"]);
    });

    it("should handle multiple variables", () => {
      const result = service.render("{{greeting}} {{target}}!", {
        greeting: "Hi",
        target: "there",
      });

      expect(result.content).toBe("Hi there!");
      expect(result.usedVariables).toEqual(["greeting", "target"]);
      expect(result.missingVariables).toEqual([]);
      expect(result.unknownVariables).toEqual([]);
    });

    it("should throw on missing variables in strict mode", () => {
      expect(() => service.render("Hello {{name}}", {})).toThrow();
    });

    it("should pass through content with no variables", () => {
      const result = service.render("Hello World", {});

      expect(result.content).toBe("Hello World");
      expect(result.usedVariables).toEqual([]);
      expect(result.missingVariables).toEqual([]);
      expect(result.unknownVariables).toEqual([]);
    });

    it("should work with built-in #if helper", () => {
      const result = service.render("{{#if show}}visible{{/if}}", {
        show: true,
      });

      expect(result.content).toBe("visible");
    });

    it("should render nothing when #if helper condition is false", () => {
      const result = service.render("{{#if show}}visible{{/if}}", {
        show: false,
      });

      expect(result.content).toBe("");
    });

    it("should work with built-in #each helper", () => {
      const result = service.render("{{#each items}}{{.}}{{/each}}", {
        items: ["a", "b", "c"],
      });

      expect(result.content).toBe("abc");
    });

    it("should HTML-escape values by default", () => {
      const result = service.render("{{value}}", {
        value: "<script>alert('xss')</script>",
      });

      expect(result.content).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
    });

    it("should handle empty template string", () => {
      const result = service.render("", { any: "value" });

      expect(result.content).toBe("");
      expect(result.usedVariables).toEqual([]);
      expect(result.missingVariables).toEqual([]);
      expect(result.unknownVariables).toEqual(["any"]);
    });

    it("should handle special characters in variable names", () => {
      const result = service.render("{{greeting}}! {{name}}.", {
        greeting: "Hello",
        name: "World",
      });

      expect(result.content).toBe("Hello! World.");
    });
  });

  describe("extractVariables", () => {
    it("should extract variable names from a template", () => {
      const result = service.extractVariables("Hello {{name}}, you are {{age}}");

      expect(result).toEqual(["name", "age"]);
    });

    it("should return an empty array for a template with no variables", () => {
      const result = service.extractVariables("Hello World");

      expect(result).toEqual([]);
    });

    it("should return an empty array for an empty string", () => {
      const result = service.extractVariables("");

      expect(result).toEqual([]);
    });

    it("should return each variable only once", () => {
      const result = service.extractVariables("{{name}} {{name}} {{name}}");

      expect(result).toEqual(["name"]);
    });

    it("should skip Handlebars comment variables", () => {
      const result = service.extractVariables("{{! comment}} visible {{name}}");

      expect(result).toEqual(["name"]);
    });

    it("should strip block helper prefixes (#, /, ^, >)", () => {
      const result = service.extractVariables("{{#each items}}{{/each}}{{^empty}}{{>partial}}");

      expect(result).toEqual(["each", "empty", "partial"]);
    });

    it("should handle dotted variable paths", () => {
      const result = service.extractVariables("{{user.name}} {{user.age}}");

      expect(result).toEqual(["user.name", "user.age"]);
    });
  });

  describe("compile", () => {
    it("should return a CompiledTemplate with a render function", () => {
      const compiled = service.compile("Hello {{name}}");

      expect(compiled).toBeDefined();
      expect(typeof compiled.render).toBe("function");
    });

    it("should pre-extract variables on the compiled template", () => {
      const compiled = service.compile("{{greeting}} {{target}}");

      expect(compiled.variables).toEqual(["greeting", "target"]);
    });

    it("should render when the returned function is called", () => {
      const compiled = service.compile("Hello {{name}}");
      const output = compiled.render({ name: "World" });

      expect(output).toBe("Hello World");
    });

    it("should have no variables for a template without variables", () => {
      const compiled = service.compile("Static content");

      expect(compiled.variables).toEqual([]);
    });
  });

  describe("validate", () => {
    it("should return valid for a simple template", () => {
      const result = service.validate("Hello {{name}}");

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it("should extract variables during validation", () => {
      const result = service.validate("{{a}} and {{b}}");

      expect(result.variables).toEqual(["a", "b"]);
    });

    it("should return invalid for a malformed template", () => {
      const result = service.validate("{{#each}}");

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.variables).toEqual([]);
      expect(result.usedPartials).toEqual([]);
    });

    it("should return invalid for unclosed braces", () => {
      const result = service.validate("Hello {{name");

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should report empty usedPartials when knownPartials is empty", () => {
      const result = service.validate("{{> header}}");

      expect(result.usedPartials).toEqual([]);
    });

    it("should handle an empty string as valid", () => {
      const result = service.validate("");

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.variables).toEqual([]);
    });
  });
});
