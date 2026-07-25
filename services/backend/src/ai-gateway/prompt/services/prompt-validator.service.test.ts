import { describe, it, expect, beforeEach } from "vitest";
import { PromptValidatorService } from "./prompt-validator.service.js";
import { PromptCategory } from "../interfaces/prompt-category.enum.js";
import { PromptStatus } from "../interfaces/prompt-status.enum.js";
import type { Prompt } from "../interfaces/prompt.interface.js";

function validPrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: "test.valid",
    category: PromptCategory.System,
    status: PromptStatus.Published,
    content: "Hello {{name}}, today is {{today}}",
    metadata: {
      name: "Valid Prompt",
      description: "A valid test prompt",
      version: "1.0.0",
      author: "Tester",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      tags: ["test"],
      language: "en",
      providerCompatibility: [],
      modelCompatibility: [],
      variables: ["name", "today"],
    },
    ...overrides,
  };
}

describe("PromptValidatorService", () => {
  let validator: PromptValidatorService;

  beforeEach(() => {
    validator = new PromptValidatorService();
  });

  describe("validateId", () => {
    it("should accept valid IDs", async () => {
      const result = await validator.validateId("atlas.system.default");
      expect(result.valid).toBe(true);
    });

    it("should accept IDs with dots and hyphens", async () => {
      const result = await validator.validateId("org.custom.v1");
      expect(result.valid).toBe(true);
    });

    it("should reject empty IDs", async () => {
      const result = await validator.validateId("");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject IDs starting with non-letter", async () => {
      const result = await validator.validateId("1test");
      expect(result.valid).toBe(false);
    });

    it("should reject IDs with special characters", async () => {
      const result = await validator.validateId("test prompt!");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateContent", () => {
    it("should accept valid content", async () => {
      const result = await validator.validateContent("Hello world");
      expect(result.valid).toBe(true);
    });

    it("should reject empty content", async () => {
      const result = await validator.validateContent("");
      expect(result.valid).toBe(false);
    });

    it("should reject overly long content", async () => {
      const result = await validator.validateContent("x".repeat(100_001));
      expect(result.valid).toBe(false);
    });
  });

  describe("validateVariables", () => {
    it("should accept matching variables", async () => {
      const result = await validator.validateVariables("Hello {{name}}", ["name"]);
      expect(result.valid).toBe(true);
    });

    it("should warn about undeclared placeholders", async () => {
      const result = await validator.validateVariables("Hello {{name}}", []);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should warn about unused declared variables", async () => {
      const result = await validator.validateVariables("Hello", ["unused"]);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("validate (full prompt)", () => {
    it("should accept a completely valid prompt", async () => {
      const result = await validator.validate(validPrompt());
      expect(result.valid).toBe(true);
    });

    it("should reject prompt with empty ID", async () => {
      const result = await validator.validate(validPrompt({ id: "" }));
      expect(result.valid).toBe(false);
    });

    it("should reject prompt with empty content", async () => {
      const result = await validator.validate(validPrompt({ content: "" }));
      expect(result.valid).toBe(false);
    });

    it("should reject prompt with invalid semver", async () => {
      const result = await validator.validate(
        validPrompt({
          metadata: {
            ...validPrompt().metadata,
            version: "not-a-version",
          },
        }),
      );
      expect(result.valid).toBe(false);
    });

    it("should reject prompt missing required metadata fields", async () => {
      const result = await validator.validate(
        validPrompt({
          metadata: {
            ...validPrompt().metadata,
            name: "",
          },
        }),
      );
      expect(result.valid).toBe(false);
    });

    it("should warn about undeclared placeholder in content", async () => {
      const result = await validator.validate(
        validPrompt({
          content: "Hello {{undeclared}}",
          metadata: {
            ...validPrompt().metadata,
            variables: ["something"],
          },
        }),
      );
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should warn about unused declared variable", async () => {
      const result = await validator.validate(
        validPrompt({
          content: "Hello {{name}}",
          metadata: {
            ...validPrompt().metadata,
            variables: ["name", "unused"],
          },
        }),
      );
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
