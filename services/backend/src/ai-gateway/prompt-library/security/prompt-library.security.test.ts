import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { createHash } from "node:crypto";

import { PromptValidatorService } from "../validation/prompt-validator.service.js";
import { TemplateEngineService } from "../template-engine/template-engine.service.js";
import { PrismaPromptRepository } from "../repositories/prompt.repository.js";
import { PromptService } from "../services/prompt.service.js";
import { CreatePromptDto } from "../dto/create-prompt.dto.js";
import { PreviewPromptDto } from "../dto/preview-prompt.dto.js";
import { PromptFilterDto } from "../dto/prompt-filter.dto.js";
import { PromptVisibility } from "../../../generated/prisma/enums.js";
import { PromptStatus } from "../../../generated/prisma/enums.js";
import type { TemplateRenderResult } from "../interfaces/template-engine.interface.js";
import type {
  PromptValidationResult,
  SchemaValidationResult,
} from "../interfaces/prompt-validator.interface.js";

/* ====================================================================== */
/*  Constants                                                              */
/* ====================================================================== */

const TEST_PROMPT_ID = "prompt-1";
const TEST_VERSION_ID = "version-1";
const TEST_CATEGORY_ID = "cat-1";
const TEST_OWNER_ID = "owner-1";
const TEST_ORG_ID = "org-1";
const TEST_WORKSPACE_ID = "ws-1";
const TEST_SLUG = "my-test-prompt";

/* ====================================================================== */
/*  Helper: build deeply nested Handlebars template                        */
/* ====================================================================== */

function buildNestedTemplate(levels: number): string {
  let tmpl = "";
  for (let i = 0; i < levels; i++) {
    tmpl += `{{#if level${String(i)}}}level${String(i)}`;
  }
  for (let i = 0; i < levels; i++) {
    tmpl += "{{/if}}";
  }
  return tmpl;
}

function buildNestedEach(levels: number): string {
  let tmpl = "";
  for (let i = 0; i < levels; i++) {
    tmpl += `{{#each items${String(i)}}}`;
  }
  tmpl += "x";
  for (let i = 0; i < levels; i++) {
    tmpl += "{{/each}}";
  }
  return tmpl;
}

/* ====================================================================== */
/*  Mock helpers for PromptService tests                                   */
/* ====================================================================== */

function createPromptRecord(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return {
    id: TEST_PROMPT_ID,
    slug: TEST_SLUG,
    name: "My Test Prompt",
    description: "A test prompt",
    categoryId: TEST_CATEGORY_ID,
    ownerId: TEST_OWNER_ID,
    organizationId: TEST_ORG_ID,
    workspaceId: TEST_WORKSPACE_ID,
    status: "Published",
    visibility: "Workspace",
    tags: [],
    metadata: {},
    currentVersionId: TEST_VERSION_ID,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createVersionRecord(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return {
    id: TEST_VERSION_ID,
    promptId: TEST_PROMPT_ID,
    version: "1.0.0",
    systemTemplate: "Hello {{name}}",
    userTemplate: null,
    assistantTemplate: null,
    variables: [{ name: "name", type: "string", required: true }],
    schema: null,
    changelog: "Initial version",
    checksum: "abc123",
    createdBy: TEST_OWNER_ID,
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createCategoryRecord(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return {
    id: TEST_CATEGORY_ID,
    name: "General",
    slug: "general",
    description: "General category",
    organizationId: null,
    ...overrides,
  };
}

class MockPromptRepo {
  public prompts = new Map<string, Record<string, unknown>>();

  public create(dto: Record<string, unknown>): Promise<Record<string, unknown>> {
    const now = new Date();
    const record: Record<string, unknown> = {
      id: `prompt-${String(this.prompts.size + 1)}`,
      slug: dto["slug"],
      name: dto["name"],
      description: dto["description"] ?? null,
      categoryId: dto["categoryId"],
      ownerId: dto["ownerId"],
      organizationId: dto["organizationId"] ?? null,
      workspaceId: dto["workspaceId"] ?? null,
      status: "Draft",
      visibility: dto["visibility"] ?? "Workspace",
      tags: dto["tags"] ?? [],
      metadata: dto["metadata"] ?? {},
      currentVersionId: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.prompts.set(record["id"] as string, record);
    return Promise.resolve(record);
  }

  public findById(id: string, organizationId?: string): Promise<Record<string, unknown> | null> {
    const record = this.prompts.get(id);
    if (record === undefined) return Promise.resolve(null);
    if (record["deletedAt"] !== null) return Promise.resolve(null);
    if (organizationId !== undefined && record["organizationId"] !== organizationId) return Promise.resolve(null);
    return Promise.resolve(record);
  }

  public findBySlug(slug: string, organizationId?: string): Promise<Record<string, unknown> | null> {
    for (const record of this.prompts.values()) {
      if (record["deletedAt"] !== null) continue;
      if (record["slug"] !== slug) continue;
      if (organizationId !== undefined && record["organizationId"] !== organizationId) continue;
      return Promise.resolve(record);
    }
    return Promise.resolve(null);
  }

  public update(id: string, dto: Record<string, unknown>): Promise<Record<string, unknown>> {
    const existing = this.prompts.get(id);
    if (existing === undefined) throw new Error("Not found");
    const updated = { ...existing, ...dto, updatedAt: new Date() };
    this.prompts.set(id, updated);
    return Promise.resolve(updated);
  }

  public updateStatus(id: string, status: string): Promise<Record<string, unknown>> {
    const existing = this.prompts.get(id);
    if (existing === undefined) throw new Error("Not found");
    const updated = { ...existing, status, updatedAt: new Date() };
    this.prompts.set(id, updated);
    return Promise.resolve(updated);
  }

  public setCurrentVersion(promptId: string, versionId: string): Promise<void> {
    const existing = this.prompts.get(promptId);
    if (existing !== undefined) {
      this.prompts.set(promptId, { ...existing, currentVersionId: versionId, updatedAt: new Date() });
    }
    return Promise.resolve();
  }

  public softDelete(id: string): Promise<void> {
    const existing = this.prompts.get(id);
    if (existing !== undefined) {
      this.prompts.set(id, { ...existing, deletedAt: new Date(), updatedAt: new Date() });
    }
    return Promise.resolve();
  }

  public findMany(_filter: Record<string, unknown>): Promise<{
    data: readonly Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return Promise.resolve({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  }
}

class MockVersionRepo {
  public versions = new Map<string, Record<string, unknown>>();

  public create(promptId: string, dto: Record<string, unknown>): Promise<Record<string, unknown>> {
    const combined = [
      dto["systemTemplate"] as string | undefined ?? "",
      dto["userTemplate"] as string | undefined ?? "",
      dto["assistantTemplate"] as string | undefined ?? "",
    ].join("|");
    const checksum = createHash("sha256").update(combined).digest("hex");
    const record: Record<string, unknown> = {
      id: `version-${String(this.versions.size + 1)}`,
      promptId,
      version: "1.0.0",
      systemTemplate: dto["systemTemplate"] ?? null,
      userTemplate: dto["userTemplate"] ?? null,
      assistantTemplate: dto["assistantTemplate"] ?? null,
      variables: dto["variables"] ?? [],
      schema: dto["schema"] ?? null,
      changelog: dto["changelog"] ?? null,
      checksum,
      createdBy: dto["createdBy"] ?? "unknown",
      createdAt: new Date(),
    };
    this.versions.set(record["id"] as string, record);
    return Promise.resolve(record);
  }

  public findById(id: string): Promise<Record<string, unknown> | null> {
    return Promise.resolve(this.versions.get(id) ?? null);
  }

  public findByVersion(promptId: string, version: string): Promise<Record<string, unknown> | null> {
    for (const v of this.versions.values()) {
      if (v["promptId"] === promptId && v["version"] === version) return Promise.resolve(v);
    }
    return Promise.resolve(null);
  }

  public existsWithChecksum(promptId: string, checksum: string): Promise<boolean> {
    return Promise.resolve(
      Array.from(this.versions.values()).some(
        (v) => v["promptId"] === promptId && v["checksum"] === checksum,
      ),
    );
  }
}

class MockCategoryRepo {
  public categories = new Map<string, Record<string, unknown>>();

  public findById(id: string): Promise<Record<string, unknown> | null> {
    return Promise.resolve(this.categories.get(id) ?? null);
  }

  public findMany(): Promise<readonly Record<string, unknown>[]> {
    return Promise.resolve(Array.from(this.categories.values()));
  }
}

class MockExecutionRepo {
  public create = vi.fn().mockResolvedValue({});
}

class MockThrowingTemplateEngine {
  public render(_template: string, _variables: Record<string, unknown>): TemplateRenderResult {
    throw new Error("Internal: system template contains suspicious content '{{{user_input}}}'");
  }
}

class MockValidator implements Pick<PromptValidatorService, "validateTemplates" | "validateVariables" | "validateJsonSchema" | "validateSchema"> {
  public validateTemplates(
    _system?: string,
    _user?: string,
    _assistant?: string,
  ): PromptValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  public validateVariables(
    _template: string,
    _declaredVariables: readonly string[],
  ): PromptValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  public validateJsonSchema(_schema: unknown): SchemaValidationResult {
    return { valid: true, errors: [] };
  }

  public validateSchema(
    _data: unknown,
    _schema: Record<string, unknown>,
  ): SchemaValidationResult {
    return { valid: true, errors: [] };
  }
}

class MockCacheService {
  private readonly store = new Map<string, unknown>();

  public getRender(_promptId: string, _version: string, _variablesHash: string): Promise<unknown> {
    return Promise.resolve(this.store.get("render") ?? null);
  }

  public setRender(_promptId: string, _version: string, _variablesHash: string, data: unknown): Promise<void> {
    this.store.set("render", data);
    return Promise.resolve();
  }

  public getCategories(): Promise<unknown> {
    return Promise.resolve(this.store.get("categories") ?? null);
  }

  public setCategories(data: unknown): Promise<void> {
    this.store.set("categories", data);
    return Promise.resolve();
  }

  public invalidatePrompt(_promptId: string): Promise<void> {
    return Promise.resolve();
  }

  public invalidateRender(_promptId: string): Promise<void> {
    return Promise.resolve();
  }

  public invalidateCategories(): Promise<void> {
    this.store.delete("categories");
    return Promise.resolve();
  }
}

class MockPiiRedactor {
  public redact = vi.fn().mockImplementation((text: string) => ({
    text,
    redactedFields: [] as readonly string[],
    redactionCount: 0,
  }));
}

class MockMetricsService {
  public aiGatewayRequestsTotal = { inc: vi.fn() };
  public aiGatewayDurationSeconds = { observe: vi.fn() };
  public aiGatewayCacheHitsTotal = { inc: vi.fn() };
  public aiGatewayCacheMissesTotal = { inc: vi.fn() };
}

/* ====================================================================== */
/*  Security Tests                                                         */
/* ====================================================================== */

describe("Prompt Library — Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ================================================================ */
  /*  1. Triple-stash XSS prevention (PromptValidatorService)          */
  /* ================================================================ */

  describe("1. Triple-stash / unescaped variable XSS prevention", () => {
    let validator: PromptValidatorService;

    beforeEach(() => {
      validator = new PromptValidatorService();
    });

    it("should ERROR on triple-stash {{{userInput}}} — TRIPLE_STASH code", () => {
      const result = validator.validateTemplates("{{{userInput}}}");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
      const tripleStashError = result.errors.find((e) => e.code === "TRIPLE_STASH");
      expect(tripleStashError).toBeDefined();
      expect(tripleStashError?.field).toBe("system");
      expect(tripleStashError?.message).toMatch(/triple-stash|HTML escaping/i);
    });

    it("should ERROR on unescaped variable {{& userInput}} — UNESCAPED_VARIABLE code", () => {
      const result = validator.validateTemplates(undefined, "{{& userInput}}");
      expect(result.valid).toBe(false);
      const unescapedError = result.errors.find((e) => e.code === "UNESCAPED_VARIABLE");
      expect(unescapedError).toBeDefined();
      expect(unescapedError?.field).toBe("user");
    });

    it("should PASS normal double-stash {{userInput}} (HTML-escaped)", () => {
      const result = validator.validateTemplates("{{userInput}}");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should FAIL a mix of safe and unsafe patterns", () => {
      const result = validator.validateTemplates(
        "Safe: {{name}}",
        "Unsafe: {{{raw}}}",
      );
      expect(result.valid).toBe(false);
      const tripleStashError = result.errors.find((e) => e.code === "TRIPLE_STASH");
      expect(tripleStashError).toBeDefined();
    });

    it("should detect multiple unsafe patterns simultaneously", () => {
      const result = validator.validateTemplates(
        "{{{triple}}} and {{& unescaped}}",
      );
      expect(result.valid).toBe(false);
      const codes = result.errors.map((e) => e.code);
      expect(codes).toContain("TRIPLE_STASH");
      expect(codes).toContain("UNESCAPED_VARIABLE");
    });

    it("should detect triple-stash in assistant template too", () => {
      const result = validator.validateTemplates(
        undefined,
        undefined,
        "{{{xss}}}",
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.code).toBe("TRIPLE_STASH");
      expect(result.errors[0]?.field).toBe("assistant");
    });

    it("should flag {{{ and {{& in the same template string", () => {
      const result = validator.validateTemplates("{{{a}}} and {{& b}}");
      const codes = result.errors.map((e) => e.code).sort();
      expect(codes).toEqual(["TRIPLE_STASH", "UNESCAPED_VARIABLE"]);
    });

    it("should detect unescaped variable with no space {{&x}}", () => {
      const result = validator.validateTemplates("{{&x}}");
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.code).toBe("UNESCAPED_VARIABLE");
    });
  });

  /* ================================================================ */
  /*  2. Recursion depth protection (TemplateEngineService)            */
  /* ================================================================ */

  describe("2. Recursion depth protection", () => {
    let engine: TemplateEngineService;

    beforeEach(() => {
      engine = new TemplateEngineService();
    });

    it("should THROW on compile() for deeply nested blocks (>5 levels of #if)", () => {
      const template = buildNestedTemplate(6);
      expect(() => engine.compile(template)).toThrow("recursion depth");
    });

    it("should THROW for 7 levels of nested each", () => {
      const template = buildNestedEach(7);
      expect(() => engine.compile(template)).toThrow("recursion depth");
    });

    it("should SUCCEED on compile() for shallow nesting (1 level)", () => {
      const template = "{{#if show}}visible{{/if}}";
      const compiled = engine.compile(template);
      expect(compiled.render({ show: true })).toBe("visible");
    });

    it("should SUCCEED for 2 levels of nesting", () => {
      const template = "{{#if a}}{{#if b}}deep{{/if}}{{/if}}";
      const compiled = engine.compile(template);
      expect(compiled.render({ a: true, b: true })).toBe("deep");
    });

    it("should SUCCEED for exactly 5 levels (the boundary)", () => {
      const template = buildNestedTemplate(5);
      const compiled = engine.compile(template);
      const vars: Record<string, boolean> = {};
      for (let i = 0; i < 5; i++) vars[`level${String(i)}`] = true;
      expect(compiled.render(vars)).toBe("level0level1level2level3level4");
    });

    it("should SUCCEED for {{#each}} with simple content", () => {
      const template = "{{#each items}}{{.}}{{/each}}";
      const compiled = engine.compile(template);
      expect(compiled.render({ items: ["a", "b"] })).toBe("ab");
    });

    it("validate() should return WARNING (not error) for deep recursion", () => {
      const template = buildNestedTemplate(6);
      const result = engine.validate(template);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThanOrEqual(1);
      expect(result.warnings[0]).toMatch(/recursion depth/i);
    });

    it("validate() should NOT warn for shallow recursion", () => {
      const template = "{{#if show}}ok{{/if}}";
      const result = engine.validate(template);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  /* ================================================================ */
  /*  3. Template length limits                                        */
  /* ================================================================ */

  describe("3. Template length limits", () => {
    let engine: TemplateEngineService;
    let validator: PromptValidatorService;

    beforeEach(() => {
      engine = new TemplateEngineService();
      validator = new PromptValidatorService();
    });

    it("compile() should THROW for templates exceeding 1000000 characters", () => {
      const oversized = "x".repeat(1_000_001);
      expect(() => engine.compile(oversized)).toThrow("exceeds maximum length");
    });

    it("compile() should PASS for templates at exactly 1000000 characters", () => {
      const justRight = "x".repeat(1_000_000);
      const compiled = engine.compile(justRight);
      expect(compiled.render({})).toBe(justRight);
    });

    it("validateTemplates() should return error for templates exceeding maxLength", () => {
      const oversized = "y".repeat(1_000_001);
      const result = validator.validateTemplates(oversized);
      expect(result.valid).toBe(false);
      const lengthError = result.errors.find((e) => e.code === "MAX_LENGTH_EXCEEDED");
      expect(lengthError).toBeDefined();
      expect(lengthError?.field).toBe("system");
    });

    it("validateTemplates() should PASS for legitimate-sized templates", () => {
      const result = validator.validateTemplates("Hello {{name}}");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("validateTemplates() should detect oversized templates in all three slots", () => {
      const big = "z".repeat(1_000_001);
      const result = validator.validateTemplates(big, big, big);
      const lengthErrors = result.errors.filter((e) => e.code === "MAX_LENGTH_EXCEEDED");
      expect(lengthErrors).toHaveLength(3);
      expect(lengthErrors.map((e) => e.field)).toEqual(["system", "user", "assistant"]);
    });
  });

  /* ================================================================ */
  /*  4. Tenant isolation (repository)                                 */
  /* ================================================================ */

  describe("4. Tenant isolation (PrismaPromptRepository)", () => {
    let repo: PrismaPromptRepository;
    let mockFindUnique: ReturnType<typeof vi.fn>;
    let mockCreate: ReturnType<typeof vi.fn>;
    let mockFindFirst: ReturnType<typeof vi.fn>;
    let mockUpdate: ReturnType<typeof vi.fn>;
    let mockFindMany: ReturnType<typeof vi.fn>;
    let mockCount: ReturnType<typeof vi.fn>;

    function setupMockPrisma(store: Map<string, Record<string, unknown>>): void {
      mockFindUnique = vi.fn().mockImplementation((args: { where: Record<string, unknown> }) => {
        const { where } = args;
        const id = where["id"] as string;
        const record = store.get(id);
        if (record === undefined) return Promise.resolve(null);
        if (record["deletedAt"] !== null) return Promise.resolve(null);
        if (where["organizationId"] !== undefined && record["organizationId"] !== where["organizationId"]) {
          return Promise.resolve(null);
        }
        return Promise.resolve(record);
      });
      mockCreate = vi.fn();
      mockFindFirst = vi.fn();
      mockUpdate = vi.fn();
      mockFindMany = vi.fn();
      mockCount = vi.fn();

      repo = new PrismaPromptRepository({
        prompt: {
          create: mockCreate,
          findUnique: mockFindUnique,
          findFirst: mockFindFirst,
          update: mockUpdate,
          findMany: mockFindMany,
          count: mockCount,
        },
      } as never);
    }

    it("findById(id, orgId) should return prompt matching the organization", async () => {
      const store = new Map<string, Record<string, unknown>>();
      store.set("p1", { id: "p1", organizationId: "org-a", deletedAt: null });
      store.set("p2", { id: "p2", organizationId: "org-b", deletedAt: null });
      setupMockPrisma(store);

      const result = await repo.findById("p1", "org-a");
      expect(result).not.toBeNull();
      expect(result).not.toBeNull();
      if (result !== null) expect(result["id"]).toBe("p1");
    });

    it("findById(id, differentOrgId) should return null for cross-tenant access", async () => {
      const store = new Map<string, Record<string, unknown>>();
      store.set("p1", { id: "p1", organizationId: "org-a", deletedAt: null });
      setupMockPrisma(store);

      const result = await repo.findById("p1", "org-b");
      expect(result).toBeNull();
    });

    it("findById(id) without orgId should return the prompt regardless of org", async () => {
      const store = new Map<string, Record<string, unknown>>();
      store.set("p1", { id: "p1", organizationId: "org-a", deletedAt: null });
      setupMockPrisma(store);

      const result = await repo.findById("p1");
      expect(result).not.toBeNull();
      if (result !== null) expect(result["id"]).toBe("p1");
    });

    it("findById(id, orgId) should reject deleted prompts ", async () => {
      const store = new Map<string, Record<string, unknown>>();
      store.set("p1", { id: "p1", organizationId: "org-a", deletedAt: new Date() });
      setupMockPrisma(store);

      const result = await repo.findById("p1", "org-a");
      expect(result).toBeNull();
    });

    it("findById(id, undefined) should not include organizationId in the where clause", async () => {
      const store = new Map<string, Record<string, unknown>>();
      store.set("p1", { id: "p1", organizationId: "org-a", deletedAt: null });
      setupMockPrisma(store);

      await repo.findById("p1", undefined);
      const callArg = mockFindUnique.mock.calls[0]?.[0] as { where: Record<string, unknown> } | undefined;
      const where = callArg?.where ?? {};
      expect(where).not.toHaveProperty("organizationId");
    });
  });

  /* ================================================================ */
  /*  5. Input validation (DTOs)                                      */
  /* ================================================================ */

  describe("5. Input validation (DTO decorators)", () => {
    describe("CreatePromptDto", () => {
      it("should reject invalid visibility enum values", async () => {
        const dto = plainToClass(CreatePromptDto, {
          slug: "valid-slug",
          name: "Test",
          categoryId: "550e8400-e29b-41d4-a716-446655440000",
          visibility: "InvalidVisibility",
        });
        const errors = await validate(dto);
        const visibilityError = errors.find((e) => e.property === "visibility");
        expect(visibilityError).toBeDefined();
      });

      it("should accept valid visibility enum values", async () => {
        const dto = plainToClass(CreatePromptDto, {
          slug: "valid-slug",
          name: "Test",
          categoryId: "550e8400-e29b-41d4-a716-446655440000",
          visibility: PromptVisibility.Workspace,
        });
        const errors = await validate(dto);
        const visibilityError = errors.find((e) => e.property === "visibility");
        expect(visibilityError).toBeUndefined();
      });

      it("should reject non-UUID strings for categoryId", async () => {
        const dto = plainToClass(CreatePromptDto, {
          slug: "valid-slug",
          name: "Test",
          categoryId: "not-a-uuid",
        });
        const errors = await validate(dto);
        const uuidError = errors.find((e) => e.property === "categoryId");
        expect(uuidError).toBeDefined();
      });

      it("should accept valid UUID for categoryId", async () => {
        const dto = plainToClass(CreatePromptDto, {
          slug: "valid-slug",
          name: "Test",
          categoryId: "550e8400-e29b-41d4-a716-446655440000",
        });
        const errors = await validate(dto);
        const uuidError = errors.find((e) => e.property === "categoryId");
        expect(uuidError).toBeUndefined();
      });

      it("should reject invalid slug patterns", async () => {
        const invalidSlugs = [
          "UPPERCASE",
          "has_underscore",
          "trailing-dash-",
          "-leading-dash",
          "spaces in slug",
          "",
        ];
        for (const slug of invalidSlugs) {
          const dto = plainToClass(CreatePromptDto, {
            slug,
            name: "Test",
            categoryId: "550e8400-e29b-41d4-a716-446655440000",
          });
          const errors = await validate(dto);
          const slugError = errors.find((e) => e.property === "slug");
          expect(slugError).toBeDefined();
        }
      });

      it("should accept valid slug patterns", async () => {
        const validSlugs = [
          "valid-slug",
          "simple",
          "multi-level-slug",
          "a0b1c2",
        ];
        for (const slug of validSlugs) {
          const dto = plainToClass(CreatePromptDto, {
            slug,
            name: "Test",
            categoryId: "550e8400-e29b-41d4-a716-446655440000",
          });
          const errors = await validate(dto);
          const slugError = errors.find((e) => e.property === "slug");
          expect(slugError).toBeUndefined();
        }
      });

      it("should reject slug that is too short (minLength 2)", async () => {
        const dto = plainToClass(CreatePromptDto, {
          slug: "a",
          name: "Test",
          categoryId: "550e8400-e29b-41d4-a716-446655440000",
        });
        const errors = await validate(dto);
        const slugError = errors.find((e) => e.property === "slug");
        expect(slugError).toBeDefined();
      });
    });

    describe("PreviewPromptDto", () => {
      it("should reject templates exceeding @MaxLength(1000000)", async () => {
        const dto = plainToClass(PreviewPromptDto, {
          systemTemplate: "x".repeat(1_000_001),
          variables: {},
        });
        const errors = await validate(dto);
        const templateError = errors.find((e) => e.property === "systemTemplate");
        expect(templateError).toBeDefined();
      });

      it("should accept valid-length templates", async () => {
        const dto = plainToClass(PreviewPromptDto, {
          systemTemplate: "x".repeat(1_000_000),
          variables: {},
        });
        const errors = await validate(dto);
        const templateError = errors.find((e) => e.property === "systemTemplate");
        expect(templateError).toBeUndefined();
      });

      it("should reject if variables is missing (required @IsObject)", async () => {
        const dto = plainToClass(PreviewPromptDto, {
          systemTemplate: "Hello",
        });
        const errors = await validate(dto);
        const varError = errors.find((e) => e.property === "variables");
        expect(varError).toBeDefined();
      });
    });

    describe("PromptFilterDto", () => {
      it("should reject invalid status enum values", async () => {
        const dto = plainToClass(PromptFilterDto, {
          status: "UnknownStatus",
        });
        const errors = await validate(dto);
        const statusError = errors.find((e) => e.property === "status");
        expect(statusError).toBeDefined();
      });

      it("should accept valid status enum values", async () => {
        const dto = plainToClass(PromptFilterDto, {
          status: PromptStatus.Published,
        });
        const errors = await validate(dto);
        const statusError = errors.find((e) => e.property === "status");
        expect(statusError).toBeUndefined();
      });

      it("should enforce @MaxLength(200) on search field", async () => {
        const dto = plainToClass(PromptFilterDto, {
          search: "x".repeat(201),
        });
        const errors = await validate(dto);
        const searchError = errors.find((e) => e.property === "search");
        expect(searchError).toBeDefined();
      });

      it("should accept search field within length limit", async () => {
        const dto = plainToClass(PromptFilterDto, {
          search: "x".repeat(200),
        });
        const errors = await validate(dto);
        const searchError = errors.find((e) => e.property === "search");
        expect(searchError).toBeUndefined();
      });

      it("should accept optional fields being undefined", async () => {
        const dto = plainToClass(PromptFilterDto, {});
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });
  });

  /* ================================================================ */
  /*  6. Error message sanitization (PromptService.render)             */
  /* ================================================================ */

  describe("6. Error message sanitization", () => {
    let service: PromptService;
    let mockPromptRepo: MockPromptRepo;
    let mockVersionRepo: MockVersionRepo;
    let mockCategoryRepo: MockCategoryRepo;
    let mockExecutionRepo: MockExecutionRepo;
    let mockTemplateEngine: MockThrowingTemplateEngine;
    let mockValidator: MockValidator;
    let mockCache: MockCacheService;
    let mockPiiRedactor: MockPiiRedactor;
    let mockMetrics: MockMetricsService;

    beforeEach(() => {
      mockPromptRepo = new MockPromptRepo();
      mockVersionRepo = new MockVersionRepo();
      mockCategoryRepo = new MockCategoryRepo();
      mockExecutionRepo = new MockExecutionRepo();
      mockTemplateEngine = new MockThrowingTemplateEngine();
      mockValidator = new MockValidator();
      mockCache = new MockCacheService();
      mockPiiRedactor = new MockPiiRedactor();
      mockMetrics = new MockMetricsService();

      mockCategoryRepo.categories.set(TEST_CATEGORY_ID, createCategoryRecord());

      service = new PromptService(
        mockPromptRepo as never,
        mockVersionRepo as never,
        mockCategoryRepo as never,
        mockExecutionRepo as never,
        mockTemplateEngine as never,
        mockValidator as never,
        mockCache as never,
        mockPiiRedactor as never,
        mockMetrics as never,
      );
    });

    it("should throw BadRequestException with generic message when template rendering fails", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());
      mockVersionRepo.versions.set(TEST_VERSION_ID, createVersionRecord({
        systemTemplate: "Hello {{name}}",
        variables: [{ name: "name", type: "string", required: true }],
      }));

      try {
        await service.render({ promptId: TEST_PROMPT_ID, variables: { name: "World" } });
        expect.unreachable("Expected render to throw");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = (error as BadRequestException).getResponse();
        const message = typeof response === "string" ? response : (response as Record<string, unknown>)["message"];
        expect((Array.isArray(message) ? message[0] : message)).toBe("Template rendering failed");
      }
    });

    it("should NOT leak template content in the error message", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());
      mockVersionRepo.versions.set(TEST_VERSION_ID, createVersionRecord({
        systemTemplate: "{{{user_input}}}",
        variables: [{ name: "name", type: "string", required: true }],
      }));

      try {
        await service.render({ promptId: TEST_PROMPT_ID, variables: { name: "World" } });
        expect.unreachable("Expected render to throw");
      } catch (error: unknown) {
        const response = (error as BadRequestException).getResponse();
        const message = typeof response === "string" ? response : (response as Record<string, unknown>)["message"];
        const msgStr = Array.isArray(message) ? message.join(" ") : String(message);
        expect(msgStr).not.toContain("{{{");
        expect(msgStr).not.toContain("user_input");
        expect(msgStr).not.toContain("suspicious content");
        expect(msgStr).toBe("Template rendering failed");
      }
    });
  });

  /* ================================================================ */
  /*  7. Cache key hash strength                                      */
  /* ================================================================ */

  describe("7. Cache key hash strength", () => {
    let engine: TemplateEngineService;

    beforeEach(() => {
      engine = new TemplateEngineService();
    });

    it("createChecksum should use sha256 (not md5)", () => {
      const template = "Hello {{name}}";
      const checksum = engine.createChecksum(template);
      expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    });

    it("createChecksum should produce deterministic output", () => {
      const template = "Hello {{name}}";
      const a = engine.createChecksum(template);
      const b = engine.createChecksum(template);
      expect(a).toBe(b);
    });

    it("createChecksum should differ for different templates", () => {
      const a = engine.createChecksum("Hello {{name}}");
      const b = engine.createChecksum("Hello {{world}}");
      expect(a).not.toBe(b);
    });

    it("PromptService.render uses sha256 for variables hash (64 char hex)", async () => {
      const mockCache2 = new (class extends MockCacheService {
        public capturedHash = "";
        public override setRender(
          _promptId: string,
          _version: string,
          variablesHash: string,
          _data: unknown,
        ): Promise<void> {
          this.capturedHash = variablesHash;
          return Promise.resolve();
        }
      })();

      const mockPromptRepo2 = new MockPromptRepo();
      const mockVersionRepo2 = new MockVersionRepo();
      const mockCategoryRepo2 = new MockCategoryRepo();
      const mockExecutionRepo2 = new MockExecutionRepo();
      const mockTemplateEngine2 = new class {
        public render(template: string, _variables: Record<string, unknown>): TemplateRenderResult {
          return { content: template, usedVariables: [], missingVariables: [], unknownVariables: [] };
        }
      }();
      const mockValidator2 = new MockValidator();
      const mockPiiRedactor2 = new MockPiiRedactor();
      const mockMetrics2 = new MockMetricsService();

      mockCategoryRepo2.categories.set(TEST_CATEGORY_ID, createCategoryRecord());
      mockPromptRepo2.prompts.set(TEST_PROMPT_ID, createPromptRecord());
      mockVersionRepo2.versions.set(TEST_VERSION_ID, createVersionRecord({
        systemTemplate: "Hello {{name}}",
        variables: [{ name: "name", type: "string", required: true }],
      }));

      const svc = new PromptService(
        mockPromptRepo2 as never,
        mockVersionRepo2 as never,
        mockCategoryRepo2 as never,
        mockExecutionRepo2 as never,
        mockTemplateEngine2 as never,
        mockValidator2 as never,
        mockCache2 as never,
        mockPiiRedactor2 as never,
        mockMetrics2 as never,
      );

      await svc.render({ promptId: TEST_PROMPT_ID, variables: { name: "World" } });

      expect(mockCache2.capturedHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
