import { NotFoundError } from "@atlas/errors";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service.js";
import type { CreateVersionDto } from "../interfaces/prompt-library.interface.js";
import { createHash } from "node:crypto";

@Injectable()
export class PrismaPromptVersionRepository {
  private readonly db: PrismaService;

  public constructor(db: PrismaService) {
    this.db = db;
  }

  get #promptVersionDelegate(): Record<string, (...args: unknown[]) => unknown> {
    return this.db.promptVersion as unknown as Record<string, (...args: unknown[]) => unknown>;
  }

  public async create(promptId: string, dto: CreateVersionDto & { createdBy: string }): Promise<Record<string, unknown>> {
    const versionNumber = await this.#nextVersion(promptId);
    const combinedTemplate = [dto.systemTemplate ?? "", dto.userTemplate ?? "", dto.assistantTemplate ?? ""].join("|");
    const checksum = createHash("sha256").update(combinedTemplate).digest("hex");

    return (this.#promptVersionDelegate["create"] as (...args: unknown[]) => unknown)({
      data: {
        promptId,
        version: versionNumber,
        systemTemplate: dto.systemTemplate,
        userTemplate: dto.userTemplate,
        assistantTemplate: dto.assistantTemplate,
        variables: dto.variables ?? [],
        schema: dto.schema ?? null,
        changelog: dto.changelog,
        checksum,
        createdById: dto.createdBy,
      },
    }) as Promise<Record<string, unknown>>;
  }

  public async findById(id: string): Promise<Record<string, unknown> | null> {
    const result = await (this.#promptVersionDelegate["findUnique"] as (...args: unknown[]) => unknown)({ where: { id } }) as Record<string, unknown> | null;
    return result;
  }

  public async findByVersion(promptId: string, version: string): Promise<Record<string, unknown> | null> {
    const result = await (this.#promptVersionDelegate["findUnique"] as (...args: unknown[]) => unknown)({
      where: { promptId_version: { promptId, version } },
    }) as Record<string, unknown> | null;
    return result;
  }

  public async findLatest(promptId: string): Promise<Record<string, unknown> | null> {
    const result = await (this.#promptVersionDelegate["findFirst"] as (...args: unknown[]) => unknown)({
      where: { promptId },
      orderBy: { createdAt: "desc" },
    }) as Record<string, unknown> | null;
    return result;
  }

  public async findMany(promptId: string): Promise<readonly Record<string, unknown>[]> {
    const results = await (this.#promptVersionDelegate["findMany"] as (...args: unknown[]) => unknown)({
      where: { promptId },
      orderBy: { createdAt: "desc" },
    }) as readonly Record<string, unknown>[];
    return results;
  }

  public async compareVersions(promptId: string, versionA: string, versionB: string): Promise<{
    versionA: string;
    versionB: string;
    systemChanged: boolean;
    userChanged: boolean;
    assistantChanged: boolean;
    variablesChanged: boolean;
    schemaChanged: boolean;
  }> {
    const [a, b] = await Promise.all([
      this.findByVersion(promptId, versionA),
      this.findByVersion(promptId, versionB),
    ]);

    if (a === null || b === null) {
      throw new NotFoundError("Version");
    }

    return {
      versionA: versionA,
      versionB: versionB,
      systemChanged: a["systemTemplate"] !== b["systemTemplate"],
      userChanged: a["userTemplate"] !== b["userTemplate"],
      assistantChanged: a["assistantTemplate"] !== b["assistantTemplate"],
      variablesChanged: JSON.stringify(a["variables"]) !== JSON.stringify(b["variables"]),
      schemaChanged: JSON.stringify(a["schema"]) !== JSON.stringify(b["schema"]),
    };
  }

  public async existsWithChecksum(promptId: string, checksum: string): Promise<boolean> {
    const count = await (this.#promptVersionDelegate["count"] as (...args: unknown[]) => unknown)({
      where: { promptId, checksum },
    }) as number;
    return count > 0;
  }

  async #nextVersion(promptId: string): Promise<string> {
    const latest = await (this.#promptVersionDelegate["findFirst"] as (...args: unknown[]) => unknown)({
      where: { promptId },
      orderBy: { createdAt: "desc" },
      select: { version: true },
    }) as { version: string } | null;

    if (latest === null) {
      return "1.0.0";
    }

    const parts = latest.version.split(".").map(Number);
    const patch = (parts[2] ?? 0) + 1;
    return `${String(parts[0] ?? 1)}.${String(parts[1] ?? 0)}.${String(patch)}`;
  }
}
