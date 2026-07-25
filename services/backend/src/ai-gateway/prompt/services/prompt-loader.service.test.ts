import { describe, it, expect, beforeEach } from "vitest";
import { PromptLoaderService } from "./prompt-loader.service.js";
import { PromptCategory } from "../interfaces/prompt-category.enum.js";
import { PromptStatus } from "../interfaces/prompt-status.enum.js";
import type { Prompt } from "../interfaces/prompt.interface.js";

function createPrompt(overrides: Partial<Prompt> & { id: string }): Prompt {
  return {
    category: PromptCategory.System,
    status: PromptStatus.Published,
    content: "Test content",
    metadata: {
      name: "Test Prompt",
      description: "A test prompt",
      version: "1.0.0",
      author: "Test Author",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      tags: ["test"],
      language: "en",
      providerCompatibility: [],
      modelCompatibility: [],
      variables: [],
    },
    ...overrides,
  };
}

describe("PromptLoaderService", () => {
  let service: PromptLoaderService;

  beforeEach(() => {
    service = new PromptLoaderService();
  });

  describe("register", () => {
    it("should register a prompt", () => {
      const prompt = createPrompt({ id: "test.1" });
      service.register(prompt);

      expect(service.exists("test.1")).resolves.toBe(true);
    });

    it("should register multiple versions of the same prompt", () => {
      const v1 = createPrompt({
        id: "test.multi",
        metadata: {
          ...createPrompt({ id: "test.multi" }).metadata,
          version: "1.0.0",
          createdAt: new Date("2026-01-01"),
        },
      });
      const v2 = createPrompt({
        id: "test.multi",
        content: "Updated content",
        metadata: {
          ...createPrompt({ id: "test.multi" }).metadata,
          version: "2.0.0",
          createdAt: new Date("2026-06-01"),
        },
      });

      service.register(v1);
      service.register(v2);

      expect(service.exists("test.multi")).resolves.toBe(true);
    });
  });

  describe("load", () => {
    it("should load the latest version when no version is specified", async () => {
      const v1 = createPrompt({
        id: "test.latest",
        content: "v1",
        metadata: {
          ...createPrompt({ id: "test.latest" }).metadata,
          version: "1.0.0",
          createdAt: new Date("2026-01-01"),
        },
      });
      const v2 = createPrompt({
        id: "test.latest",
        content: "v2",
        metadata: {
          ...createPrompt({ id: "test.latest" }).metadata,
          version: "2.0.0",
          createdAt: new Date("2026-06-01"),
        },
      });

      service.register(v1);
      service.register(v2);

      const result = await service.load("test.latest");
      expect(result).not.toBeNull();
      expect(result!.metadata.version).toBe("2.0.0");
      expect(result!.content).toBe("v2");
    });

    it("should load a specific version when specified", async () => {
      const v1 = createPrompt({
        id: "test.specific",
        content: "v1 content",
        metadata: {
          ...createPrompt({ id: "test.specific" }).metadata,
          version: "1.0.0",
          createdAt: new Date("2026-01-01"),
        },
      });

      service.register(v1);

      const result = await service.load("test.specific", "1.0.0");
      expect(result).not.toBeNull();
      expect(result!.content).toBe("v1 content");
    });

    it("should return null for non-existent prompt", async () => {
      const result = await service.load("non.existent");
      expect(result).toBeNull();
    });

    it("should return null for non-existent version", async () => {
      const prompt = createPrompt({ id: "test.versioned" });
      service.register(prompt);

      const result = await service.load("test.versioned", "99.0.0");
      expect(result).toBeNull();
    });
  });

  describe("exists", () => {
    it("should return true for registered prompts", async () => {
      service.register(createPrompt({ id: "test.exists" }));
      expect(await service.exists("test.exists")).toBe(true);
    });

    it("should return false for unregistered prompts", async () => {
      expect(await service.exists("non.existent")).toBe(false);
    });
  });

  describe("list", () => {
    it("should return all registered prompts", async () => {
      service.register(createPrompt({ id: "test.a" }));
      service.register(createPrompt({ id: "test.b" }));

      const all = await service.list();
      expect(all).toHaveLength(2);
    });

    it("should return each version as separate entry", async () => {
      const v1 = createPrompt({
        id: "test.multiversion",
        metadata: {
          ...createPrompt({ id: "test.multiversion" }).metadata,
          version: "1.0.0",
        },
      });
      const v2 = createPrompt({
        id: "test.multiversion",
        metadata: {
          ...createPrompt({ id: "test.multiversion" }).metadata,
          version: "2.0.0",
        },
      });

      service.register(v1);
      service.register(v2);

      const all = await service.list();
      expect(all).toHaveLength(2);
    });
  });

  describe("listByCategory", () => {
    it("should filter prompts by category", async () => {
      service.register(createPrompt({ id: "test.sys", category: PromptCategory.System }));
      service.register(
        createPrompt({ id: "test.safe", category: PromptCategory.Safety }),
      );
      service.register(createPrompt({ id: "test.agent", category: PromptCategory.Agent }));

      const systemPrompts = await service.listByCategory(PromptCategory.System);
      expect(systemPrompts).toHaveLength(1);
      expect(systemPrompts[0]!.id).toBe("test.sys");
    });

    it("should return empty for category with no prompts", async () => {
      const result = await service.listByCategory(PromptCategory.Workflow);
      expect(result).toHaveLength(0);
    });
  });

  describe("getLatestVersion", () => {
    it("should return the latest version string", async () => {
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

      service.register(v1);
      service.register(v2);

      expect(await service.getLatestVersion("test.lv")).toBe("2.0.0");
    });

    it("should return null for non-existent prompt", async () => {
      expect(await service.getLatestVersion("non.existent")).toBeNull();
    });
  });

  describe("getVersion", () => {
    it("should return a specific version", async () => {
      const prompt = createPrompt({ id: "test.gv" });
      service.register(prompt);

      const result = await service.getVersion("test.gv", "1.0.0");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("test.gv");
    });

    it("should return null for missing version", async () => {
      service.register(createPrompt({ id: "test.gv" }));
      expect(await service.getVersion("test.gv", "99.0.0")).toBeNull();
    });
  });
});
