/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PromptService } from "./prompt.service.js";
import { createHash } from "node:crypto";
import type {
  CreatePromptDto,
  UpdatePromptDto,
  CreateVersionDto,
  PromptFilter,
} from "../interfaces/prompt-library.interface.js";
import type { TemplateRenderResult } from "../interfaces/template-engine.interface.js";
import type {
  PromptValidationResult,
  SchemaValidationResult,
  ValidationError,
  ValidationWarning,
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
/*  Helper factories                                                       */
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
    status: "Draft",
    visibility: "Workspace",
    tags: [],
    metadata: {},
    currentVersionId: null,
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
    systemTemplate: "System template {{name}}",
    userTemplate: "User template {{name}}",
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

/* ====================================================================== */
/*  Mock implementations                                                   */
/* ====================================================================== */

class MockPromptRepository {
  public prompts = new Map<string, Record<string, unknown>>();

  public create(
    dto: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
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

  public findById(
    id: string,
  ): Promise<Record<string, unknown> | null> {
    const record = this.prompts.get(id);
    if (record === undefined) return Promise.resolve(null);
    if (record["deletedAt"] !== null) return Promise.resolve(null);
    return Promise.resolve(record);
  }

  public findBySlug(
    slug: string,
    organizationId?: string,
  ): Promise<Record<string, unknown> | null> {
    for (const record of this.prompts.values()) {
      if (record["deletedAt"] !== null) continue;
      if (record["slug"] !== slug) continue;
      if (organizationId !== undefined && record["organizationId"] !== organizationId) continue;
      return Promise.resolve(record);
    }
    return Promise.resolve(null);
  }

  public update(
    id: string,
    dto: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const existing = this.prompts.get(id);
    if (existing === undefined) throw new Error("Not found");
    const updated = { ...existing, ...dto, updatedAt: new Date() };
    this.prompts.set(id, updated);
    return Promise.resolve(updated);
  }

  public updateStatus(
    id: string,
    status: string,
  ): Promise<Record<string, unknown>> {
    const existing = this.prompts.get(id);
    if (existing === undefined) throw new Error("Not found");
    const updated = { ...existing, status, updatedAt: new Date() };
    this.prompts.set(id, updated);
    return Promise.resolve(updated);
  }

  public setCurrentVersion(
    promptId: string,
    versionId: string,
  ): Promise<void> {
    const existing = this.prompts.get(promptId);
    if (existing !== undefined) {
      this.prompts.set(promptId, {
        ...existing,
        currentVersionId: versionId,
        updatedAt: new Date(),
      });
    }
    return Promise.resolve();
  }

  public softDelete(id: string): Promise<void> {
    const existing = this.prompts.get(id);
    if (existing !== undefined) {
      this.prompts.set(id, {
        ...existing,
        deletedAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return Promise.resolve();
  }

  public findMany(
    filter: PromptFilter,
  ): Promise<{
    data: readonly Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let results = Array.from(this.prompts.values()).filter(
      (r) => r["deletedAt"] === null,
    );

    if (filter.status !== undefined) {
      results = results.filter((r) => r["status"] === filter.status);
    }
    if (filter.categoryId !== undefined) {
      results = results.filter((r) => r["categoryId"] === filter.categoryId);
    }
    if (filter.organizationId !== undefined) {
      results = results.filter(
        (r) => r["organizationId"] === filter.organizationId,
      );
    }
    if (filter.workspaceId !== undefined) {
      results = results.filter(
        (r) => r["workspaceId"] === filter.workspaceId,
      );
    }
    if (filter.ownerId !== undefined) {
      results = results.filter((r) => r["ownerId"] === filter.ownerId);
    }
    if (filter.search !== undefined && filter.search.length > 0) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (r) =>
          (r["name"] as string | undefined ?? "").toLowerCase().includes(q) ||
          (r["description"] as string | undefined ?? "").toLowerCase().includes(q),
      );
    }
    if (filter.tags !== undefined && filter.tags.length > 0) {
      results = results.filter((r) => {
        const tags = r["tags"] as string[];
        return filter.tags?.some((t) => tags.includes(t)) ?? false;
      });
    }

    results.sort(
      (a, b) =>
        new Date(String(b["updatedAt"])).getTime() -
        new Date(String(a["updatedAt"])).getTime(),
    );

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const data = results.slice(skip, skip + limit);

    return Promise.resolve({ data, total, page, limit, totalPages });
  }
}

class MockVersionRepository {
  public versions = new Map<string, Record<string, unknown>>();
  private counter = 1;

  public create(
    promptId: string,
    dto: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const combined = [
      dto["systemTemplate"] as string | undefined ?? "",
      dto["userTemplate"] as string | undefined ?? "",
      dto["assistantTemplate"] as string | undefined ?? "",
    ].join("|");
    const checksum = createHash("sha256").update(combined).digest("hex");
    const versionNumber = this.#nextVersion(promptId);

    const record: Record<string, unknown> = {
      id: `version-${String(this.counter++)}`,
      promptId,
      version: versionNumber,
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

  #nextVersion(promptId: string): string {
    const existing = Array.from(this.versions.values())
      .filter((v) => v["promptId"] === promptId)
      .sort(
        (a, b) =>
          new Date(String(b["createdAt"])).getTime() -
          new Date(String(a["createdAt"])).getTime(),
      );

    if (existing.length === 0) return "1.0.0";
    const latest = existing[0] as Record<string, unknown>;
    const parts = String(latest["version"]).split(".").map(Number);
    const patch = (parts[2] ?? 0) + 1;
    return `${String(parts[0] ?? 1)}.${String(parts[1] ?? 0)}.${String(patch)}`;
  }

  public findById(
    id: string,
  ): Promise<Record<string, unknown> | null> {
    return Promise.resolve(this.versions.get(id) ?? null);
  }

  public findByVersion(
    promptId: string,
    version: string,
  ): Promise<Record<string, unknown> | null> {
    for (const v of this.versions.values()) {
      if (v["promptId"] === promptId && v["version"] === version) return Promise.resolve(v);
    }
    return Promise.resolve(null);
  }

  public findLatest(
    promptId: string,
  ): Promise<Record<string, unknown> | null> {
    const all = Array.from(this.versions.values())
      .filter((v) => v["promptId"] === promptId)
      .sort(
        (a, b) =>
          new Date(String(b["createdAt"])).getTime() -
          new Date(String(a["createdAt"])).getTime(),
      );
    return Promise.resolve(all[0] ?? null);
  }

  public findMany(
    promptId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return Promise.resolve(
      Array.from(this.versions.values())
        .filter((v) => v["promptId"] === promptId)
        .sort(
          (a, b) =>
            new Date(String(b["createdAt"])).getTime() -
            new Date(String(a["createdAt"])).getTime(),
        ),
    );
  }

  public async compareVersions(
    promptId: string,
    versionA: string,
    versionB: string,
  ): Promise<{
    versionA: string;
    versionB: string;
    systemChanged: boolean;
    userChanged: boolean;
    assistantChanged: boolean;
    variablesChanged: boolean;
    schemaChanged: boolean;
  }> {
    const a = await this.findByVersion(promptId, versionA);
    const b = await this.findByVersion(promptId, versionB);
    if (a === null || b === null) throw new Error("Version not found");

    return {
      versionA,
      versionB,
      systemChanged: a["systemTemplate"] !== b["systemTemplate"],
      userChanged: a["userTemplate"] !== b["userTemplate"],
      assistantChanged: a["assistantTemplate"] !== b["assistantTemplate"],
      variablesChanged:
        JSON.stringify(a["variables"]) !== JSON.stringify(b["variables"]),
      schemaChanged:
        JSON.stringify(a["schema"]) !== JSON.stringify(b["schema"]),
    };
  }

  public existsWithChecksum(
    promptId: string,
    checksum: string,
  ): Promise<boolean> {
    return Promise.resolve(
      Array.from(this.versions.values()).some(
        (v) => v["promptId"] === promptId && v["checksum"] === checksum,
      ),
    );
  }
}

class MockCategoryRepository {
  public categories = new Map<string, Record<string, unknown>>();

  public findById(
    id: string,
  ): Promise<Record<string, unknown> | null> {
    return Promise.resolve(this.categories.get(id) ?? null);
  }

  public findMany(): Promise<readonly Record<string, unknown>[]> {
    return Promise.resolve(Array.from(this.categories.values()));
  }
}

class MockExecutionRepository {
  public create = vi.fn().mockResolvedValue({});
}

class MockTemplateEngine {
  public renderCallCount = 0;

  public render(
    template: string,
    variables: Record<string, unknown>,
  ): TemplateRenderResult {
    this.renderCallCount++;
    const regex = /\{\{([^}]+)\}\}/g;
    const extracted: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(template)) !== null) {
      extracted.push(match[1]?.trim() ?? "");
    }

    const inputKeys = Object.keys(variables);
    const usedVariables: string[] = [];
    const missingVariables: string[] = [];
    const unknownVariables: string[] = [];

    for (const v of extracted) {
      if (v in variables) {
        usedVariables.push(v);
      } else {
        missingVariables.push(v);
      }
    }

    for (const key of inputKeys) {
      if (!extracted.includes(key)) {
        unknownVariables.push(key);
      }
    }

    let content = template;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        String(value),
      );
    }

    return { content, usedVariables, missingVariables, unknownVariables };
  }
}

class MockValidator {
  public validateTemplates(
    system?: string,
    user?: string,
    assistant?: string,
  ): PromptValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const [name, template] of Object.entries({
      system,
      user,
      assistant,
    })) {
      if (typeof template !== "string") continue;

      if (template.includes("INVALID")) {
        errors.push({
          field: name,
          message: `Template "${name}" contains invalid content`,
          code: "INVALID_CONTENT",
        });
      }
      if (template.includes("DANGEROUS")) {
        warnings.push({
          field: name,
          message: `Template "${name}" has dangerous pattern`,
          code: "DANGEROUS_PATTERN",
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  public validateVariables(
    template: string,
    declaredVariables: readonly string[],
  ): PromptValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const regex = /\{\{([^}]+)\}\}/g;
    const usedVars: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(template)) !== null) {
      usedVars.push(match[1]?.trim() ?? "");
    }

    for (const v of usedVars) {
      if (!declaredVariables.includes(v) && !v.startsWith("_")) {
        warnings.push({
          field: "template",
          message: `Variable "${v}" is used in template but not declared in schema`,
          code: "UNDECLARED_VARIABLE",
        });
      }
    }

    for (const v of declaredVariables) {
      if (!usedVars.includes(v)) {
        warnings.push({
          field: "schema",
          message: `Variable "${v}" is declared in schema but not used in template`,
          code: "UNUSED_VARIABLE",
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  public validateJsonSchema(schema: unknown): SchemaValidationResult {
    if (typeof schema !== "object" || schema === null) {
      return {
        valid: false,
        errors: ["JSON Schema must be a non-null object"],
      };
    }
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

  public getRender(
    promptId: string,
    version: string,
    variablesHash: string,
  ): Promise<unknown> {
    const key = `render:${promptId}:${version}:${variablesHash}`;
    return Promise.resolve(this.store.get(key) ?? null);
  }

  public setRender(
    promptId: string,
    version: string,
    variablesHash: string,
    data: unknown,
  ): Promise<void> {
    const key = `render:${promptId}:${version}:${variablesHash}`;
    this.store.set(key, data);
    return Promise.resolve();
  }

  public getCategories(): Promise<unknown> {
    return Promise.resolve(this.store.get("categories") ?? null);
  }

  public setCategories(data: unknown): Promise<void> {
    this.store.set("categories", data);
    return Promise.resolve();
  }

  public invalidatePrompt(promptId: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.includes(promptId)) {
        this.store.delete(key);
      }
    }
    return Promise.resolve();
  }

  public invalidateRender(promptId: string): Promise<void> {
    const prefix = `render:${promptId}:`;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
    return Promise.resolve();
  }

  public invalidateCategories(): Promise<void> {
    this.store.delete("categories");
    return Promise.resolve();
  }

  public clear(): void {
    this.store.clear();
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
/*  Tests                                                                  */
/* ====================================================================== */

describe("PromptService", () => {
  let service: PromptService;
  let mockPromptRepo: MockPromptRepository;
  let mockVersionRepo: MockVersionRepository;
  let mockCategoryRepo: MockCategoryRepository;
  let mockExecutionRepo: MockExecutionRepository;
  let mockTemplateEngine: MockTemplateEngine;
  let mockValidator: MockValidator;
  let mockCache: MockCacheService;
  let mockPiiRedactor: MockPiiRedactor;
  let mockMetrics: MockMetricsService;

  beforeEach(() => {
    mockPromptRepo = new MockPromptRepository();
    mockVersionRepo = new MockVersionRepository();
    mockCategoryRepo = new MockCategoryRepository();
    mockExecutionRepo = new MockExecutionRepository();
    mockTemplateEngine = new MockTemplateEngine();
    mockValidator = new MockValidator();
    mockCache = new MockCacheService();
    mockPiiRedactor = new MockPiiRedactor();
    mockMetrics = new MockMetricsService();

    mockCategoryRepo.categories.set(
      TEST_CATEGORY_ID,
      createCategoryRecord(),
    );

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

  /* ==================================================================== */
  /*  CRUD                                                                 */
  /* ==================================================================== */

  describe("create", () => {
    const createDto: CreatePromptDto = {
      slug: TEST_SLUG,
      name: "My Test Prompt",
      description: "A test prompt",
      categoryId: TEST_CATEGORY_ID,
      tags: ["test"],
      metadata: { env: "prod" },
    };

    it("creates a prompt with valid data", async () => {
      const result = await service.create(
        createDto,
        TEST_OWNER_ID,
        TEST_ORG_ID,
        TEST_WORKSPACE_ID,
      );

      expect(result.id).toBeTruthy();
      expect(result.version).toBe("0.0.0");
      expect(mockMetrics.aiGatewayRequestsTotal.inc).toHaveBeenCalledWith({
        provider: "prompt_library",
        model: "create",
      });

      const stored = (await mockPromptRepo.findById(result.id)) as Record<string, unknown>;
      expect(stored["slug"]).toBe(TEST_SLUG);
      expect(stored["organizationId"]).toBe(TEST_ORG_ID);
    });

    it("throws ConflictException if slug exists", async () => {
      mockPromptRepo.prompts.set("existing", createPromptRecord({ id: "existing" }));

      await expect(
        service.create(createDto, TEST_OWNER_ID, TEST_ORG_ID),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.create(createDto, TEST_OWNER_ID, TEST_ORG_ID),
      ).rejects.toThrow(`Prompt with slug "${TEST_SLUG}" already exists`);
    });

    it("throws BadRequestException if category not found", async () => {
      mockCategoryRepo.categories.clear();

      await expect(
        service.create(createDto, TEST_OWNER_ID, TEST_ORG_ID),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(createDto, TEST_OWNER_ID, TEST_ORG_ID),
      ).rejects.toThrow(`Category "${TEST_CATEGORY_ID}" not found`);
    });
  });

  describe("update", () => {
    it("updates prompt metadata", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      const dto: UpdatePromptDto = {
        name: "Updated Name",
        description: "Updated desc",
      };
      const result = await service.update(TEST_PROMPT_ID, dto);

      expect(result.id).toBe(TEST_PROMPT_ID);
      expect(result.version).toBe("0.0.0");

      const stored = (await mockPromptRepo.findById(TEST_PROMPT_ID)) as Record<string, unknown>;
      expect(stored["name"]).toBe("Updated Name");
      expect(stored["description"]).toBe("Updated desc");
    });

    it("throws NotFoundException if not found", async () => {
      await expect(
        service.update("nonexistent", { name: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("soft-deletes prompt", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      await service.delete(TEST_PROMPT_ID);

      const stored = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(stored["deletedAt"]).not.toBeNull();

      const found = await mockPromptRepo.findById(TEST_PROMPT_ID);
      expect(found).toBeNull();
    });

    it("throws NotFoundException if not found", async () => {
      await expect(service.delete("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getById", () => {
    it("returns prompt", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: TEST_VERSION_ID }),
      );
      mockVersionRepo.versions.set(
        TEST_VERSION_ID,
        createVersionRecord(),
      );

      const result = await service.getById(TEST_PROMPT_ID);

      expect(result.id).toBe(TEST_PROMPT_ID);
      expect(result.version).toBe("1.0.0");
    });

    it("throws NotFoundException if not found", async () => {
      await expect(service.getById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("list", () => {
    it("returns paginated results with filtering", async () => {
      mockPromptRepo.prompts.set(
        "p1",
        createPromptRecord({
          id: "p1",
          slug: "prompt-a",
          name: "Alpha",
          status: "Draft",
        }),
      );
      mockPromptRepo.prompts.set(
        "p2",
        createPromptRecord({
          id: "p2",
          slug: "prompt-b",
          name: "Beta",
          status: "Published",
        }),
      );
      mockPromptRepo.prompts.set(
        "p3",
        createPromptRecord({
          id: "p3",
          slug: "prompt-c",
          name: "Gamma",
          status: "Draft",
        }),
      );

      const filter: PromptFilter = { status: "Draft", page: 1, limit: 10 };
      const result = await service.list(filter);

      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.data.map((r) => r.id).sort()).toEqual(
        ["p1", "p3"].sort(),
      );
    });

    it("returns empty list when no matches", async () => {
      const result = await service.list({ status: "Published" });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  /* ==================================================================== */
  /*  Version Management                                                   */
  /* ==================================================================== */

  describe("createVersion", () => {
    const versionDto: CreateVersionDto = {
      systemTemplate: "Hello {{name}}",
      userTemplate: "User {{name}}",
      assistantTemplate: "Assistant {{name}}",
      variables: [{ name: "name", type: "string", required: true }],
      changelog: "Added variables",
    };

    it("creates version with valid templates", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      const result = await service.createVersion(
        TEST_PROMPT_ID,
        versionDto,
        TEST_OWNER_ID,
      );

      expect(result.version).toBe("1.0.0");
      expect(result.createdBy).toBe(TEST_OWNER_ID);
      expect(result.checksum).toBeTruthy();
      expect(mockMetrics.aiGatewayRequestsTotal.inc).toHaveBeenCalledWith({
        provider: "prompt_library",
        model: "create_version",
      });

      const prompt = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(prompt["currentVersionId"]).toBe(result.id);
    });

    it("throws BadRequestException if no templates", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      await expect(
        service.createVersion(
          TEST_PROMPT_ID,
          { variables: [] },
          TEST_OWNER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws ConflictException if duplicate templates", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      await service.createVersion(TEST_PROMPT_ID, versionDto, TEST_OWNER_ID);

      await expect(
        service.createVersion(TEST_PROMPT_ID, versionDto, TEST_OWNER_ID),
      ).rejects.toThrow(ConflictException);
    });

    it("throws BadRequestException if validation fails", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      const invalidDto: CreateVersionDto = {
        systemTemplate: "Hello {{name}} INVALID",
        userTemplate: "User template",
      };

      await expect(
        service.createVersion(TEST_PROMPT_ID, invalidDto, TEST_OWNER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it("sets as current version", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      const result = await service.createVersion(
        TEST_PROMPT_ID,
        versionDto,
        TEST_OWNER_ID,
      );

      const prompt = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(prompt["currentVersionId"]).toBe(result.id);
    });
  });

  describe("getVersions", () => {
    it("returns version history", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());
      mockVersionRepo.versions.set(
        "v1",
        createVersionRecord({ id: "v1", version: "1.0.0" }),
      );
      mockVersionRepo.versions.set(
        "v2",
        createVersionRecord({ id: "v2", version: "1.0.1" }),
      );

      const versions = (await service.getVersions(
        TEST_PROMPT_ID,
      )) as unknown as readonly Record<string, unknown>[];

      expect(versions).toHaveLength(2);
      expect(versions.map((v) => v["version"]).sort()).toEqual(
        ["1.0.0", "1.0.1"].sort(),
      );
    });
  });

  describe("rollback", () => {
    it("rolls back to previous version", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: "v2" }),
      );
      mockVersionRepo.versions.set(
        "v1",
        createVersionRecord({ id: "v1", version: "1.0.0" }),
      );
      mockVersionRepo.versions.set(
        "v2",
        createVersionRecord({ id: "v2", version: "1.0.1" }),
      );

      const result = await service.rollback(TEST_PROMPT_ID, "1.0.0");

      expect(result.version).toBe("1.0.0");

      const prompt = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(prompt["currentVersionId"]).toBe("v1");
    });

    it("throws NotFoundException if version not found", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      await expect(
        service.rollback(TEST_PROMPT_ID, "9.9.9"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* ==================================================================== */
  /*  Publishing Lifecycle                                                 */
  /* ==================================================================== */

  describe("publish", () => {
    it("publishes prompt", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: TEST_VERSION_ID }),
      );

      const result = await service.publish(TEST_PROMPT_ID);

      expect(result.id).toBe(TEST_PROMPT_ID);
      expect(result.version).toBe("published");

      const stored = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(stored["status"]).toBe("Published");
    });

    it("throws BadRequestException if no current version", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: null }),
      );

      await expect(service.publish(TEST_PROMPT_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("archive", () => {
    it("archives prompt", async () => {
      mockPromptRepo.prompts.set(TEST_PROMPT_ID, createPromptRecord());

      const result = await service.archive(TEST_PROMPT_ID);

      expect(result.id).toBe(TEST_PROMPT_ID);
      expect(result.version).toBe("archived");

      const stored = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(stored["status"]).toBe("Archived");
    });
  });

  describe("restore", () => {
    it("restores from archived", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ status: "Archived" }),
      );

      const result = await service.restore(TEST_PROMPT_ID);

      expect(result.id).toBe(TEST_PROMPT_ID);
      expect(result.version).toBe("restored");

      const stored = mockPromptRepo.prompts.get(TEST_PROMPT_ID) as Record<string, unknown>;
      expect(stored["status"]).toBe("Draft");
    });
  });

  /* ==================================================================== */
  /*  Rendering                                                            */
  /* ==================================================================== */

  describe("render", () => {
    const variables = { name: "World" };

    beforeEach(() => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({
          status: "Published",
          currentVersionId: TEST_VERSION_ID,
        }),
      );
      mockVersionRepo.versions.set(
        TEST_VERSION_ID,
        createVersionRecord({
          systemTemplate: "Hello {{name}}",
          userTemplate: "Hi {{name}}",
          assistantTemplate: null,
          variables: [{ name: "name", type: "string", required: true }],
        }),
      );
    });

    it("renders with variables", async () => {
      const result = await service.render({
        promptId: TEST_PROMPT_ID,
        variables,
      });

      expect(result.id).toBe(TEST_PROMPT_ID);
      expect(result.version).toBe("1.0.0");
      expect(result.system).toBe("Hello World");
      expect(result.user).toBe("Hi World");
      expect(result.assistant).toBeUndefined();
      expect(result.variables).toEqual(["name"]);
    });

    it("throws if prompt not published", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({
          status: "Draft",
          currentVersionId: TEST_VERSION_ID,
        }),
      );

      await expect(
        service.render({ promptId: TEST_PROMPT_ID, variables }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws if version not found", async () => {
      mockVersionRepo.versions.clear();

      await expect(
        service.render({ promptId: TEST_PROMPT_ID, variables }),
      ).rejects.toThrow(NotFoundException);
    });

    it("caches result and hits cache on repeated call", async () => {
      await service.render({ promptId: TEST_PROMPT_ID, variables });

      expect(mockMetrics.aiGatewayCacheMissesTotal.inc).toHaveBeenCalled();
      expect(mockTemplateEngine.renderCallCount).toBe(2);

      await service.render({ promptId: TEST_PROMPT_ID, variables });

      expect(mockMetrics.aiGatewayCacheHitsTotal.inc).toHaveBeenCalled();
      expect(mockTemplateEngine.renderCallCount).toBe(2);
    });

    it("redacts PII when enabled", async () => {
      mockPiiRedactor.redact.mockClear();
      mockPiiRedactor.redact.mockImplementation((text: string) => ({
        text: text.replace(/World/g, "[REDACTED]"),
        redactedFields: ["name" as string],
        redactionCount: 1,
      }));

      const result = await service.render({
        promptId: TEST_PROMPT_ID,
        variables,
        redactPii: true,
      });

      expect(mockPiiRedactor.redact).toHaveBeenCalled();
      expect(result.system).toBe("Hello [REDACTED]");
      expect(result.user).toBe("Hi [REDACTED]");
    });

    it("does not redact PII when disabled", async () => {
      await service.render({
        promptId: TEST_PROMPT_ID,
        variables,
        redactPii: false,
      });

      expect(mockPiiRedactor.redact).not.toHaveBeenCalled();
    });
  });

  describe("preview", () => {
    it("previews template without saving", () => {
      const result = service.preview({
        systemTemplate: "Hello {{name}}",
        userTemplate: "Hi {{name}}",
        variables: { name: "World" },
      });

      expect(result.id).toBe("preview");
      expect(result.system).toBe("Hello World");
      expect(result.user).toBe("Hi World");
      expect(result.assistant).toBeUndefined();
    });

    it("reports missing and unknown variables", () => {
      const result = service.preview({
        systemTemplate: "Hello {{name}} {{missing}}",
        variables: { name: "World", extraVar: "value" },
      });

      expect(result.missingVariables).toEqual(["missing"]);
      expect(result.unknownVariables).toEqual(["extraVar"]);
    });
  });

  /* ==================================================================== */
  /*  Validation & Comparison                                              */
  /* ==================================================================== */

  describe("validate", () => {
    it("returns valid for correct templates", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: TEST_VERSION_ID }),
      );
      mockVersionRepo.versions.set(
        TEST_VERSION_ID,
        createVersionRecord({
          systemTemplate: "Hello {{name}}",
          userTemplate: "Hi {{name}}",
          variables: [{ name: "name", type: "string", required: true }],
        }),
      );

      const result = await service.validate(TEST_PROMPT_ID);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns errors for invalid templates", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: TEST_VERSION_ID }),
      );
      mockVersionRepo.versions.set(
        TEST_VERSION_ID,
        createVersionRecord({
          systemTemplate: "Hello {{name}} INVALID",
          userTemplate: "Hi {{name}}",
          variables: [{ name: "name", type: "string", required: true }],
        }),
      );

      const result = await service.validate(TEST_PROMPT_ID);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("returns not valid when no version exists", async () => {
      mockPromptRepo.prompts.set(
        TEST_PROMPT_ID,
        createPromptRecord({ currentVersionId: null }),
      );

      const result = await service.validate(TEST_PROMPT_ID);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("No version exists for this prompt");
    });

    it("throws NotFoundException if prompt not found", async () => {
      await expect(service.validate("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("compareVersions", () => {
    it("compares two versions", async () => {
      mockVersionRepo.versions.set(
        "v1",
        createVersionRecord({
          id: "v1",
          version: "1.0.0",
          systemTemplate: "Hello",
        }),
      );
      mockVersionRepo.versions.set(
        "v2",
        createVersionRecord({
          id: "v2",
          version: "1.0.1",
          systemTemplate: "Hello Updated",
        }),
      );

      const result = await service.compareVersions(
        TEST_PROMPT_ID,
        "1.0.0",
        "1.0.1",
      );

      expect(result.versionA).toBe("1.0.0");
      expect(result.versionB).toBe("1.0.1");
      expect(result.systemChanged).toBe(true);
      expect(result.userChanged).toBe(false);
    });
  });

  describe("getCategories", () => {
    it("returns categories from cache when available", async () => {
      const cachedCategories = [
        { id: "c1", name: "Cached Cat", slug: "cached-cat" },
      ];
      await mockCache.setCategories(cachedCategories);

      const result = await service.getCategories();

      expect(result).toEqual(cachedCategories);
    });

    it("fetches and caches categories when cache is empty", async () => {
      mockCategoryRepo.categories.clear();
      mockCategoryRepo.categories.set("c1", {
        id: "c1",
        name: "General",
        slug: "general",
      });
      mockCategoryRepo.categories.set("c2", {
        id: "c2",
        name: "Expert",
        slug: "expert",
      });

      const result = await service.getCategories();

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.name).sort()).toEqual(
        ["Expert", "General"].sort(),
      );

      const cached = await mockCache.getCategories();
      expect(cached).not.toBeNull();
    });
  });

  /* ==================================================================== */
  /*  Not-found edge cases                                                 */
  /* ==================================================================== */

  describe("not-found edge cases", () => {
    it("throws NotFoundException on publish for missing prompt", async () => {
      await expect(service.publish("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws NotFoundException on archive for missing prompt", async () => {
      await expect(service.archive("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws NotFoundException on restore for missing prompt", async () => {
      await expect(service.restore("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws NotFoundException on getVersions for missing prompt", async () => {
      await expect(service.getVersions("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws NotFoundException on render for missing prompt", async () => {
      await expect(
        service.render({ promptId: "nonexistent", variables: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
