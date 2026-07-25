import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { WorkspaceRepository } from "../interfaces/workspace-repository.interface.js";
import type { Workspace } from "../interfaces/workspace.interface.js";
import type { WorkspaceSettings } from "../interfaces/workspace-settings.interface.js";

function toJson(value: unknown): object {
  return value as object;
}

@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<Workspace | null> {
    const row = await this.prisma.workspace.findUnique({ where: { id } });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async findByOrganizationId(organizationId: string): Promise<Workspace[]> {
    const rows = await this.prisma.workspace.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async create(
    data: Omit<Workspace, "id" | "createdAt" | "updatedAt">,
  ): Promise<Workspace> {
    const row = await this.prisma.workspace.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        settings: toJson(data.settings),
      },
    });
    return this.toDomain(row);
  }

  public async update(
    id: string,
    changes: Partial<Omit<Workspace, "id">>,
  ): Promise<Workspace> {
    const row = await this.prisma.workspace.update({
      where: { id },
      data: {
        ...(changes.name !== undefined && { name: changes.name }),
        ...(changes.description !== undefined && { description: changes.description }),
        ...(changes.color !== undefined && { color: changes.color }),
        ...(changes.icon !== undefined && { icon: changes.icon }),
        ...(changes.settings !== undefined && { settings: toJson(changes.settings) }),
        ...(changes.organizationId !== undefined && { organizationId: changes.organizationId }),
      },
    });
    return this.toDomain(row);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    settings: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): Workspace {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description,
      color: row.color,
      icon: row.icon,
      settings: row.settings as WorkspaceSettings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
