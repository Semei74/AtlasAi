import { describe, it, expect, beforeEach } from "vitest";
import { PromptManagerService } from "./prompt-manager.service.js";
import { PromptLoaderService } from "./prompt-loader.service.js";
import { PromptCacheService } from "./prompt-cache.service.js";
import { PromptValidatorService } from "./prompt-validator.service.js";
import { PromptCategory } from "../interfaces/prompt-category.enum.js";
import { PromptStatus } from "../interfaces/prompt-status.enum.js";
import type { Prompt } from "../interfaces/prompt.interface.js";

function createPrompt(overrides: Partial<Prompt> & { id: string }): Prompt {
  return {
    category: PromptCategory.System,
    status: PromptStatus.Published,
    content: "Hello {{name}}, welcome to {{organization}}",
    metadata: {
      name: "Test",
      description: "Test prompt",
      version: "1.0.0",
      author: "Tester",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      tags: ["test"],
      language: "en",
      providerCompatibility: [],
      modelCompatibility: [],
      variables: ["name", "organization"],
    },
    ...overrides,
  };
}

describe("PromptManagerService", () => {
  let loader: PromptLoaderService;
  let cache: PromptCacheService;
  let validator: PromptValidatorService;
  let manager: PromptManagerService;

  beforeEach(() => {
    loader = new PromptLoaderService();
    cache = new PromptCacheService(60_000, 100);
    validator = new PromptValidatorService();
    manager = new PromptManagerService(loader, cache, validator);
  });

  describe("get", () => {
    it("should load a prompt by ID", async () => {
      loader.register(createPrompt({ id: "test.greeting" }));
      const result = await manager.get("test.greeting");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("test.greeting");
    });

    it("should return null for non-existent prompt", async () => {
      const result = await manager.get("non.existent");
      expect(result).toBeNull();
    });

    it("should cache prompt after first load", async () => {
      loader.register(createPrompt({ id: "test.cached" }));
      await manager.get("test.cached");

      const cached = await cache.get("test.cached", "1.0.0");
      expect(cached).not.toBeNull();
    });
  });

  describe("render", () => {
    it("should render a prompt with variables", async () => {
      loader.register(createPrompt({ id: "test.render" }));

      const result = await manager.render("test.render", {
        name: "Alice",
        organization: "Atlas Corp",
      });

      expect(result).not.toBeNull();
      expect(result!.content).toBe("Hello Alice, welcome to Atlas Corp");
    });

    it("should return null for non-existent prompt", async () => {
      const result = await manager.render("non.existent", {});
      expect(result).toBeNull();
    });

    it("should return rendered prompt metadata", async () => {
      loader.register(createPrompt({ id: "test.meta" }));

      const result = await manager.render("test.meta", {
        name: "Bob",
        organization: "Acme",
      });

      expect(result!.metadata.name).toBe("Test");
      expect(result!.metadata.variables).toContain("name");
    });

    it("should resolve {{today}} placeholder automatically", async () => {
      const prompt = createPrompt({
        id: "test.today",
        content: "Today is {{today}}",
        metadata: {
          ...createPrompt({ id: "test.today" }).metadata,
          variables: [],
        },
      });
      loader.register(prompt);

      const result = await manager.render("test.today", {});
      const today = new Date().toISOString().split("T")[0];
      expect(result!.content).toBe(`Today is ${today}`);
    });

    it("should sanitize variable values to prevent injection", async () => {
      const prompt = createPrompt({
        id: "test.inject",
        content: "{{input}}",
        metadata: {
          ...createPrompt({ id: "test.inject" }).metadata,
          variables: ["input"],
        },
      });
      loader.register(prompt);

      const result = await manager.render("test.inject", {
        input: "<script>alert('xss')</script>",
      });

      expect(result!.content).not.toContain("<script>");
      expect(result!.content).toContain("&lt;script&gt;");
    });

    it("should render a specific version when requested", async () => {
      const v1 = createPrompt({
        id: "test.ver",
        content: "Version 1",
        metadata: {
          ...createPrompt({ id: "test.ver" }).metadata,
          version: "1.0.0",
          createdAt: new Date("2026-01-01"),
        },
      });
      const v2 = createPrompt({
        id: "test.ver",
        content: "Version 2",
        metadata: {
          ...createPrompt({ id: "test.ver" }).metadata,
          version: "2.0.0",
          createdAt: new Date("2026-06-01"),
        },
      });

      loader.register(v1);
      loader.register(v2);

      const r1 = await manager.render("test.ver", {}, "1.0.0");
      const r2 = await manager.render("test.ver", {});

      expect(r1!.content).toBe("Version 1");
      expect(r2!.content).toBe("Version 2");
    });
  });

  describe("exists", () => {
    it("should return true for existing prompt", async () => {
      loader.register(createPrompt({ id: "test.exists" }));
      expect(await manager.exists("test.exists")).toBe(true);
    });

    it("should return false for non-existent prompt", async () => {
      expect(await manager.exists("nope")).toBe(false);
    });
  });

  describe("list", () => {
    it("should list all prompts", async () => {
      loader.register(createPrompt({ id: "test.a" }));
      loader.register(createPrompt({ id: "test.b" }));

      const all = await manager.list();
      expect(all).toHaveLength(2);
    });
  });

  describe("listByCategory", () => {
    it("should filter by category", async () => {
      loader.register(
        createPrompt({ id: "test.sys", category: PromptCategory.System }),
      );
      loader.register(
        createPrompt({ id: "test.safe", category: PromptCategory.Safety }),
      );

      const sys = await manager.listByCategory(PromptCategory.System);
      expect(sys).toHaveLength(1);
    });
  });

  describe("listByStatus", () => {
    it("should filter by status", async () => {
      loader.register(
        createPrompt({ id: "test.pub", status: PromptStatus.Published }),
      );
      loader.register(
        createPrompt({ id: "test.draft", status: PromptStatus.Draft }),
      );

      const published = await manager.listByStatus(PromptStatus.Published);
      expect(published).toHaveLength(1);
    });
  });

  describe("validate", () => {
    it("should validate an existing prompt", async () => {
      loader.register(createPrompt({ id: "test.val" }));
      const result = await manager.validate("test.val");
      expect(result.valid).toBe(true);
    });

    it("should return errors for non-existent prompt", async () => {
      const result = await manager.validate("nope");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should return errors for invalid prompt", async () => {
      loader.register(createPrompt({ id: "test.bad", content: "" }));
      const result = await manager.validate("test.bad");
      expect(result.valid).toBe(false);
    });
  });

  describe("getLatestVersion", () => {
    it("should return latest version string", async () => {
      const v1 = createPrompt({
        id: "test.lv",
        metadata: {
          ...createPrompt({ id: "test.lv" }).metadata,
          version: "1.0.0",
          createdAt: new Date("2026-01-01"),
        },
      });
      const v2 = createPrompt({
        id: "test.lv",
        metadata: {
          ...createPrompt({ id: "test.lv" }).metadata,
          version: "2.0.0",
          createdAt: new Date("2026-06-01"),
        },
      });

      loader.register(v1);
      loader.register(v2);

      expect(await manager.getLatestVersion("test.lv")).toBe("2.0.0");
    });

    it("should return null for non-existent prompt", async () => {
      expect(await manager.getLatestVersion("nope")).toBeNull();
    });
  });
});
