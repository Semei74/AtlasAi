import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service.js";
import type { CreatePromptDto, UpdatePromptDto, PaginatedResult, PromptFilter } from "../interfaces/prompt-library.interface.js";

@Injectable()
export class PrismaPromptRepository {
  private readonly db: PrismaService;

  public constructor(db: PrismaService) {
    this.db = db;
  }

  get #promptDelegate(): Record<string, (...args: unknown[]) => unknown> {
    return this.db.prompt as unknown as Record<string, (...args: unknown[]) => unknown>;
  }

  public create(dto: CreatePromptDto & { ownerId: string; organizationId?: string; workspaceId?: string }): Promise<Record<string, unknown>> {
    return (this.#promptDelegate["create"] as (...args: unknown[]) => unknown)({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        ownerId: dto.ownerId,
        organizationId: dto.organizationId,
        workspaceId: dto.workspaceId,
        visibility: (dto.visibility ?? "Workspace") as string,
        tags: dto.tags ?? [],
        metadata: dto.metadata ?? {},
      },
    }) as Promise<Record<string, unknown>>;
  }

  public async findById(id: string, organizationId?: string): Promise<Record<string, unknown> | null> {
    const where: Record<string, unknown> = { id, deletedAt: null };
    if (organizationId !== undefined) {
      where["organizationId"] = organizationId;
    }
    const result = await (this.#promptDelegate["findUnique"] as (...args: unknown[]) => unknown)({
      where,
    }) as Record<string, unknown> | null;
    return result;
  }

  public async findBySlug(slug: string, organizationId?: string): Promise<Record<string, unknown> | null> {
    const result = await (this.#promptDelegate["findFirst"] as (...args: unknown[]) => unknown)({
      where: {
        slug,
        organizationId: organizationId ?? undefined,
        deletedAt: null,
      },
    }) as Record<string, unknown> | null;
    return result;
  }

  public update(id: string, dto: UpdatePromptDto): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data["name"] = dto.name;
    if (dto.description !== undefined) data["description"] = dto.description;
    if (dto.categoryId !== undefined) data["categoryId"] = dto.categoryId;
    if (dto.tags !== undefined) data["tags"] = dto.tags;
    if (dto.metadata !== undefined) data["metadata"] = dto.metadata;
    if (dto.visibility !== undefined) data["visibility"] = dto.visibility;

    return (this.#promptDelegate["update"] as (...args: unknown[]) => unknown)({
      where: { id },
      data,
    }) as Promise<Record<string, unknown>>;
  }

  public updateStatus(id: string, status: string): Promise<Record<string, unknown>> {
    return (this.#promptDelegate["update"] as (...args: unknown[]) => unknown)({
      where: { id },
      data: { status },
    }) as Promise<Record<string, unknown>>;
  }

  public async setCurrentVersion(promptId: string, versionId: string): Promise<void> {
    await (this.#promptDelegate["update"] as (...args: unknown[]) => unknown)({
      where: { id: promptId },
      data: { currentVersionId: versionId },
    });
  }

  public async softDelete(id: string): Promise<void> {
    await (this.#promptDelegate["update"] as (...args: unknown[]) => unknown)({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  public async findMany(filter: PromptFilter): Promise<PaginatedResult<Record<string, unknown>>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (filter.status !== undefined) where["status"] = filter.status;
    if (filter.categoryId !== undefined) where["categoryId"] = filter.categoryId;
    if (filter.organizationId !== undefined) where["organizationId"] = filter.organizationId;
    if (filter.workspaceId !== undefined) where["workspaceId"] = filter.workspaceId;
    if (filter.ownerId !== undefined) where["ownerId"] = filter.ownerId;
    if (filter.search !== undefined) {
      where["OR"] = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    if (filter.tags !== undefined && filter.tags.length > 0) {
      where["tags"] = { hasSome: filter.tags };
    }

    const [data, total] = await Promise.all([
      (this.#promptDelegate["findMany"] as (...args: unknown[]) => unknown)({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }) as Promise<readonly Record<string, unknown>[]>,
      (this.#promptDelegate["count"] as (...args: unknown[]) => unknown)({ where }) as Promise<number>,
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
