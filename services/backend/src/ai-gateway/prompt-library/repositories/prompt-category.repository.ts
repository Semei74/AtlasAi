import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service.js";

@Injectable()
export class PrismaPromptCategoryRepository {
  private readonly db: PrismaService;

  public constructor(db: PrismaService) {
    this.db = db;
  }

  get #delegate(): Record<string, (...args: unknown[]) => unknown> {
    return this.db.promptCategory as unknown as Record<string, (...args: unknown[]) => unknown>;
  }

  public create(dto: { name: string; slug: string; description?: string; organizationId?: string }): Promise<Record<string, unknown>> {
    return (this.#delegate["create"] as (...args: unknown[]) => unknown)({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        organizationId: dto.organizationId,
      },
    }) as Promise<Record<string, unknown>>;
  }

  public async findById(id: string): Promise<Record<string, unknown> | null> {
    const result = await (this.#delegate["findUnique"] as (...args: unknown[]) => unknown)({ where: { id } }) as Record<string, unknown> | null;
    return result;
  }

  public async findBySlug(slug: string): Promise<Record<string, unknown> | null> {
    const result = await (this.#delegate["findUnique"] as (...args: unknown[]) => unknown)({ where: { slug } }) as Record<string, unknown> | null;
    return result;
  }

  public async findMany(): Promise<readonly Record<string, unknown>[]> {
    const results = await (this.#delegate["findMany"] as (...args: unknown[]) => unknown)({
      orderBy: { name: "asc" },
    }) as readonly Record<string, unknown>[];
    return results;
  }
}
