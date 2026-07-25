import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from "@nestjs/common";
import { rootLogger } from "@atlas/logger";
import { PrismaPromptRepository } from "../repositories/prompt.repository.js";
import { PrismaPromptVersionRepository } from "../repositories/prompt-version.repository.js";
import { PrismaPromptCategoryRepository } from "../repositories/prompt-category.repository.js";
import { PrismaPromptExecutionRepository } from "../repositories/prompt-execution.repository.js";
import { TemplateEngineService } from "../template-engine/template-engine.service.js";
import { PromptValidatorService } from "../validation/prompt-validator.service.js";
import { PromptLibraryCacheService } from "../cache/prompt-cache.service.js";
import { PII_REDACTOR } from "../../pii/interfaces/pii-redactor.interface.js";
import type { PiiRedactor } from "../../pii/interfaces/pii-redactor.interface.js";
import { MetricsService } from "../../../metrics/metrics.service.js";
import type { CreatePromptDto, UpdatePromptDto, CreateVersionDto, PromptRenderRequest, PromptRenderResult, PreviewRequest, VersionComparison, PromptFilter, PaginatedResult, PromptVersion } from "../interfaces/prompt-library.interface.js";
import { createHash } from "node:crypto";

interface PromptRecord {
  id: string;
  currentVersionId: string | null;
  status: string;
  name: string;
  slug: string;
}

interface VersionRecord {
  id: string;
  version: string;
  systemTemplate: string | null;
  userTemplate: string | null;
  assistantTemplate: string | null;
  variables: unknown;
  schema: unknown;
}

@Injectable()
export class PromptService {
  readonly #logger = rootLogger.child({ service: "PromptService" });

  public constructor(
    private readonly promptRepo: PrismaPromptRepository,
    private readonly versionRepo: PrismaPromptVersionRepository,
    private readonly categoryRepo: PrismaPromptCategoryRepository,
    private readonly executionRepo: PrismaPromptExecutionRepository,
    private readonly templateEngine: TemplateEngineService,
    private readonly validator: PromptValidatorService,
    private readonly cache: PromptLibraryCacheService,
    @Inject(PII_REDACTOR) private readonly piiRedactor: PiiRedactor,
    private readonly metrics: MetricsService,
  ) {}

  public async create(dto: CreatePromptDto, ownerId: string, organizationId?: string, workspaceId?: string): Promise<PromptRenderResult> {
    const existing = await this.promptRepo.findBySlug(dto.slug, organizationId);

    if (existing !== null) {
      throw new ConflictException(`Prompt with slug "${dto.slug}" already exists`);
    }

    const category = await this.categoryRepo.findById(dto.categoryId);
    if (category === null) {
      throw new BadRequestException(`Category "${dto.categoryId}" not found`);
    }

    const prompt = (await this.promptRepo.create({
      ...dto,
      ownerId,
      organizationId,
      workspaceId,
    } as unknown as CreatePromptDto & { ownerId: string; organizationId?: string; workspaceId?: string })) as unknown as PromptRecord;

    this.metrics.aiGatewayRequestsTotal.inc({ provider: "prompt_library", model: "create" });

    return this.#toRenderResult(prompt.id, "0.0.0", [], [], []);
  }

  public async update(id: string, dto: UpdatePromptDto, organizationId?: string): Promise<PromptRenderResult> {
    const prompt = (await this.promptRepo.findById(id, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${id}" not found`);
    }

    const updated = (await this.promptRepo.update(id, dto)) as unknown as PromptRecord;
    await this.cache.invalidatePrompt(id);

    return this.#toRenderResult(
      updated.id,
      updated.currentVersionId !== null ? "current" : "0.0.0",
      [], [], [],
    );
  }

  public async createVersion(promptId: string, dto: CreateVersionDto, createdBy: string, organizationId?: string): Promise<PromptVersion> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    const templates = [dto.systemTemplate ?? "", dto.userTemplate ?? "", dto.assistantTemplate ?? ""].filter(Boolean);
    if (templates.length === 0) {
      throw new BadRequestException("At least one template is required");
    }

    const combinedChecksum = createHash("sha256").update(templates.join("|")).digest("hex");
    const exists = await this.versionRepo.existsWithChecksum(promptId, combinedChecksum);

    if (exists) {
      throw new ConflictException("A version with identical templates already exists");
    }

    const validation = this.validator.validateTemplates(
      dto.systemTemplate,
      dto.userTemplate,
      dto.assistantTemplate,
    );

    if (!validation.valid) {
      throw new BadRequestException(
        `Template validation failed: ${validation.errors.map((e) => e.message).join("; ")}`,
      );
    }

    const version = (await this.versionRepo.create(promptId, { ...dto, createdBy })) as unknown as VersionRecord;

    await this.promptRepo.setCurrentVersion(promptId, version.id);
    await this.cache.invalidatePrompt(promptId);

    this.metrics.aiGatewayRequestsTotal.inc({ provider: "prompt_library", model: "create_version" });

    return version as unknown as PromptVersion;
  }

  public async publish(promptId: string, organizationId?: string): Promise<PromptRenderResult> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    if (prompt.currentVersionId === null) {
      throw new BadRequestException("Cannot publish a prompt without a version");
    }

    const updated = (await this.promptRepo.updateStatus(promptId, "Published")) as unknown as PromptRecord;
    await this.cache.invalidatePrompt(promptId);

    this.metrics.aiGatewayRequestsTotal.inc({ provider: "prompt_library", model: "publish" });

    return this.#toRenderResult(updated.id, "published", [], [], []);
  }

  public async archive(promptId: string, organizationId?: string): Promise<PromptRenderResult> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    const updated = (await this.promptRepo.updateStatus(promptId, "Archived")) as unknown as PromptRecord;
    await this.cache.invalidatePrompt(promptId);

    this.metrics.aiGatewayRequestsTotal.inc({ provider: "prompt_library", model: "archive" });

    return this.#toRenderResult(updated.id, "archived", [], [], []);
  }

  public async restore(promptId: string, organizationId?: string): Promise<PromptRenderResult> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    const updated = (await this.promptRepo.updateStatus(promptId, "Draft")) as unknown as PromptRecord;
    await this.cache.invalidatePrompt(promptId);

    this.metrics.aiGatewayRequestsTotal.inc({ provider: "prompt_library", model: "restore" });

    return this.#toRenderResult(updated.id, "restored", [], [], []);
  }

  public async delete(promptId: string, organizationId?: string): Promise<void> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    await this.promptRepo.softDelete(promptId);
    await this.cache.invalidatePrompt(promptId);
  }

  public async getById(id: string, organizationId?: string): Promise<PromptRenderResult> {
    const prompt = (await this.promptRepo.findById(id, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${id}" not found`);
    }

    const currentVersion: VersionRecord | null = prompt.currentVersionId !== null
      ? (await this.versionRepo.findById(prompt.currentVersionId)) as unknown as VersionRecord | null
      : null;

    return this.#toRenderResult(
      prompt.id,
      currentVersion?.version ?? "0.0.0",
      [], [], [],
    );
  }

  public async list(filter: PromptFilter): Promise<PaginatedResult<PromptRenderResult>> {
    const result = await this.promptRepo.findMany(filter);

    return {
      data: result.data.map((p) =>
        this.#toRenderResult((p as unknown as PromptRecord).id, "0.0.0", [], [], []),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async render(request: PromptRenderRequest, organizationId?: string): Promise<PromptRenderResult> {
    const { promptId, version: versionStr, variables, redactPii } = request;

    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;
    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    if (prompt.status !== "Published") {
      throw new BadRequestException(`Prompt "${promptId}" is not published`);
    }

    const version: VersionRecord | null = versionStr !== undefined
      ? (await this.versionRepo.findByVersion(promptId, versionStr)) as unknown as VersionRecord | null
      : prompt.currentVersionId !== null
        ? (await this.versionRepo.findById(prompt.currentVersionId)) as unknown as VersionRecord | null
        : null;

    if (version === null) {
      throw new NotFoundException(`Version not found for prompt "${promptId}"`);
    }

    const variablesHash = createHash("sha256").update(JSON.stringify(variables)).digest("hex");
    const cached = await this.cache.getRender(promptId, version.version, variablesHash);

    if (cached !== null) {
      this.metrics.aiGatewayCacheHitsTotal.inc({ provider: "prompt_library" });
      return cached as PromptRenderResult;
    }

    this.metrics.aiGatewayCacheMissesTotal.inc({ provider: "prompt_library" });

    const startTime = Date.now();

    let system: string | undefined;
    let user: string | undefined;
    let assistant: string | undefined;

    const allVariables = version.variables as Record<string, unknown>[];
    const declaredVarNames = allVariables.map((v) => v["name"] as string);

    try {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- version is unknown */
      if (version.systemTemplate !== null && version.systemTemplate !== undefined) {
        const result = this.templateEngine.render(version.systemTemplate, variables);
        system = redactPii === true ? this.piiRedactor.redact(result.content).text : result.content;
      }

      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- version is unknown */
      if (version.userTemplate !== null && version.userTemplate !== undefined) {
        const result = this.templateEngine.render(version.userTemplate, variables);
        user = redactPii === true ? this.piiRedactor.redact(result.content).text : result.content;
      }

      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- version is unknown */
      if (version.assistantTemplate !== null && version.assistantTemplate !== undefined) {
        const result = this.templateEngine.render(version.assistantTemplate, variables);
        assistant = redactPii === true ? this.piiRedactor.redact(result.content).text : result.content;
      }
    } catch (error: unknown) {
      this.#logger.error(`Template render error: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException("Template rendering failed");
    }

    const latency = Date.now() - startTime;

    const result = {
      id: promptId,
      version: version.version,
      system,
      user,
      assistant,
      variables: declaredVarNames,
      missingVariables: [],
      unknownVariables: [],
    } as PromptRenderResult;

    await this.cache.setRender(promptId, version.version, variablesHash, result);

    void this.executionRepo.create({
      promptId,
      versionId: version.id,
      variables,
      renderedPrompt: system ?? user ?? assistant,
      latencyMs: latency,
      success: true,
    } as Parameters<typeof this.executionRepo.create>[0]);

    this.metrics.aiGatewayDurationSeconds.observe({ provider: "prompt_library", model: "render" }, latency / 1000);

    return result;
  }

  public preview(request: PreviewRequest): PromptRenderResult {
    const validation = this.validator.validateTemplates(
      request.systemTemplate,
      request.userTemplate,
      request.assistantTemplate,
    );
    if (!validation.valid) {
      throw new BadRequestException(
        `Template validation failed: ${validation.errors.map((e) => e.message).join("; ")}`,
      );
    }

    const variables: Record<string, unknown> = request.variables;

    let system: string | undefined;
    let user: string | undefined;
    let assistant: string | undefined;
    const missingVariables: string[] = [];
    const unknownVariables: string[] = [];

    if (request.systemTemplate !== undefined) {
      const result = this.templateEngine.render(request.systemTemplate, variables);
      system = result.content;
      missingVariables.push(...result.missingVariables);
      unknownVariables.push(...result.unknownVariables);
    }

    if (request.userTemplate !== undefined) {
      const result = this.templateEngine.render(request.userTemplate, variables);
      user = result.content;
    }

    if (request.assistantTemplate !== undefined) {
      const result = this.templateEngine.render(request.assistantTemplate, variables);
      assistant = result.content;
    }

    return {
      id: "preview",
      version: "0.0.0",
      system,
      user,
      assistant,
      variables: [],
      missingVariables: [...new Set(missingVariables)],
      unknownVariables: [...new Set(unknownVariables)],
    } as PromptRenderResult;
  }

  public async getVersions(promptId: string, organizationId?: string): Promise<readonly PromptVersion[]> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    return this.versionRepo.findMany(promptId) as unknown as Promise<readonly PromptVersion[]>;
  }

  public async rollback(promptId: string, version: string, organizationId?: string): Promise<PromptRenderResult> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    const versionRecord = (await this.versionRepo.findByVersion(promptId, version)) as unknown as VersionRecord | null;

    if (versionRecord === null) {
      throw new NotFoundException(`Version "${version}" not found for prompt "${promptId}"`);
    }

    await this.promptRepo.setCurrentVersion(promptId, versionRecord.id);
    await this.cache.invalidatePrompt(promptId);

    return this.#toRenderResult(promptId, versionRecord.version, [], [], []);
  }

  public async compareVersions(promptId: string, versionA: string, versionB: string, _organizationId?: string): Promise<VersionComparison> {
    return this.versionRepo.compareVersions(promptId, versionA, versionB);
  }

  public async getCategories(): Promise<readonly { id: string; name: string; slug: string }[]> {
    const cached = await this.cache.getCategories();

    if (cached !== null) {
      return cached as readonly { id: string; name: string; slug: string }[];
    }

    const categories = await this.categoryRepo.findMany();
    const result = categories.map((c) => {
      const rec = c as unknown as PromptRecord;
      return { id: rec.id, name: rec.name, slug: rec.slug };
    });

    await this.cache.setCategories(result);
    return result;
  }

  public async validate(promptId: string, organizationId?: string): Promise<{ valid: boolean; errors: readonly string[]; warnings: readonly string[] }> {
    const prompt = (await this.promptRepo.findById(promptId, organizationId)) as unknown as PromptRecord | null;

    if (prompt === null) {
      throw new NotFoundException(`Prompt "${promptId}" not found`);
    }

    const version = prompt.currentVersionId !== null
      ? (await this.versionRepo.findById(prompt.currentVersionId)) as unknown as VersionRecord | null
      : null;

    if (version === null) {
      return { valid: false, errors: ["No version exists for this prompt"], warnings: [] };
    }

    let validation = this.validator.validateTemplates(
      /* eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style */
      version.systemTemplate as string,
      /* eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style */
      version.userTemplate as string,
      /* eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style */
      version.assistantTemplate as string,
    );

    const declaredVars = (version.variables as { name: string }[]).map((v) => v.name);
    const allTemplates = [version.systemTemplate, version.userTemplate, version.assistantTemplate]
      .filter((t): t is string => t !== null);

    const varWarnings: string[] = [];

    for (const template of allTemplates) {
      const varResult = this.validator.validateVariables(template, declaredVars);
      varWarnings.push(...varResult.warnings.map((w) => w.message));
    }

    if (version.schema !== null && version.schema !== undefined) {
      const schemaResult = this.validator.validateJsonSchema(version.schema);
      if (!schemaResult.valid) {
        const mutableErrors = [...validation.errors];
        mutableErrors.push(
          ...schemaResult.errors.map((e) => ({ field: "schema", message: e, code: "SCHEMA_ERROR" })),
        );
        validation = { ...validation, errors: mutableErrors };
      }
    }

    return {
      valid: validation.valid,
      errors: validation.errors.map((e) => e.message),
      warnings: [...validation.warnings.map((w) => w.message), ...varWarnings],
    };
  }

  #toRenderResult(
    id: string,
    version: string,
    missingVariables: readonly string[],
    unknownVariables: readonly string[],
    variables: readonly string[],
  ): PromptRenderResult {
    return { id, version, system: undefined, user: undefined, assistant: undefined, missingVariables, unknownVariables, variables } as unknown as PromptRenderResult;
  }
}
