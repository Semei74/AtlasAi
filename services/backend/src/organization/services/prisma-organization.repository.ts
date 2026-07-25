import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { OrganizationRepository } from "../interfaces/organization-repository.interface.js";
import type { Organization } from "../interfaces/organization.interface.js";
import type { OrganizationBranding } from "../interfaces/organization-branding.interface.js";
import type { OrganizationSettings } from "../interfaces/organization-settings.interface.js";
import type { OrganizationMetadata } from "../interfaces/organization-metadata.interface.js";

function toJson(value: unknown): object {
  return value as object;
}

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findUnique({ where: { id } });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async findBySlug(slug: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findUnique({ where: { slug } });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async findByIds(ids: string[]): Promise<Organization[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.organization.findMany({ where: { id: { in: ids } } });
    return rows.map((row) => this.toDomain(row));
  }

  public async create(
    data: Omit<Organization, "id" | "createdAt" | "updatedAt">,
  ): Promise<Organization> {
    const row = await this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        branding: toJson(data.branding),
        settings: toJson(data.settings),
        metadata: toJson(data.metadata),
      },
    });
    return this.toDomain(row);
  }

  public async update(
    id: string,
    changes: Partial<Omit<Organization, "id">>,
  ): Promise<Organization> {
    const row = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(changes.name !== undefined && { name: changes.name }),
        ...(changes.slug !== undefined && { slug: changes.slug }),
        ...(changes.ownerId !== undefined && { ownerId: changes.ownerId }),
        ...(changes.branding !== undefined && { branding: toJson(changes.branding) }),
        ...(changes.settings !== undefined && { settings: toJson(changes.settings) }),
        ...(changes.metadata !== undefined && { metadata: toJson(changes.metadata) }),
      },
    });
    return this.toDomain(row);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    branding: unknown;
    settings: unknown;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      ownerId: row.ownerId,
      branding: row.branding as OrganizationBranding,
      settings: row.settings as OrganizationSettings,
      metadata: row.metadata as OrganizationMetadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
