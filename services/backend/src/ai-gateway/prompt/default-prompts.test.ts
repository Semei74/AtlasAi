import { describe, it, expect } from "vitest";
import { DEFAULT_PROMPTS } from "./default-prompts.js";
import { PromptCategory } from "./interfaces/prompt-category.enum.js";
import { PromptStatus } from "./interfaces/prompt-status.enum.js";

describe("DEFAULT_PROMPTS", () => {
  it("should have at least one default prompt", () => {
    expect(DEFAULT_PROMPTS.length).toBeGreaterThan(0);
  });

  it("should have unique IDs across all prompts", () => {
    const ids = DEFAULT_PROMPTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid semver versions", () => {
    const semverPattern = /^\d+\.\d+\.\d+$/;
    for (const prompt of DEFAULT_PROMPTS) {
      expect(prompt.metadata.version).toMatch(semverPattern);
    }
  });

  it("should have non-empty content", () => {
    for (const prompt of DEFAULT_PROMPTS) {
      expect(prompt.content.length).toBeGreaterThan(0);
    }
  });

  it("should have valid categories", () => {
    const validCategories = Object.values(PromptCategory);
    for (const prompt of DEFAULT_PROMPTS) {
      expect(validCategories).toContain(prompt.category);
    }
  });

  it("should have valid statuses", () => {
    const validStatuses = Object.values(PromptStatus);
    for (const prompt of DEFAULT_PROMPTS) {
      expect(validStatuses).toContain(prompt.status);
    }
  });

  it("should have all required metadata fields", () => {
    for (const prompt of DEFAULT_PROMPTS) {
      expect(prompt.metadata.name).toBeTruthy();
      expect(prompt.metadata.description).toBeTruthy();
      expect(prompt.metadata.author).toBeTruthy();
      expect(prompt.metadata.createdAt).toBeInstanceOf(Date);
      expect(prompt.metadata.updatedAt).toBeInstanceOf(Date);
      expect(Array.isArray(prompt.metadata.tags)).toBe(true);
      expect(typeof prompt.metadata.language).toBe("string");
    }
  });

  it("should have valid placeholder syntax in content", () => {
    const placeholderPattern = /\{\{.+?\}\}/g;
    for (const prompt of DEFAULT_PROMPTS) {
      const matches = prompt.content.match(placeholderPattern) ?? [];
      for (const match of matches) {
        expect(match).toMatch(/^\{\{[a-zA-Z][a-zA-Z0-9]*\}\}$/);
      }
    }
  });

  it("should only use declared variables in content", () => {
    const placeholderPattern = /\{\{(.+?)\}\}/g;
    for (const prompt of DEFAULT_PROMPTS) {
      const declared = new Set(prompt.metadata.variables);
      const matches = prompt.content.matchAll(placeholderPattern);
      for (const match of matches) {
        const varName = match[1]!.trim();
        if (varName !== "today") {
          expect(declared.has(varName)).toBe(true);
        }
      }
    }
  });

  it("should have at least one system prompt", () => {
    const system = DEFAULT_PROMPTS.filter(
      (p) => p.category === PromptCategory.System,
    );
    expect(system.length).toBeGreaterThanOrEqual(1);
  });

  it("should have at least one safety prompt", () => {
    const safety = DEFAULT_PROMPTS.filter(
      (p) => p.category === PromptCategory.Safety,
    );
    expect(safety.length).toBeGreaterThanOrEqual(1);
  });

  it("should have at least one template prompt", () => {
    const templates = DEFAULT_PROMPTS.filter(
      (p) => p.category === PromptCategory.Template,
    );
    expect(templates.length).toBeGreaterThanOrEqual(1);
  });
});
