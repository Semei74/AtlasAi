import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { OrganizationSettingsRepository } from "../interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettings } from "../interfaces/organization-settings.interface.js";

function toJson(value: unknown): object {
  return value as object;
}

@Injectable()
export class PrismaOrganizationSettingsRepository implements OrganizationSettingsRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findByOrganizationId(organizationId: string): Promise<OrganizationSettings | null> {
    const row = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });
    if (row === null) return null;
    return row.settings as unknown as OrganizationSettings;
  }

  public async save(
    organizationId: string,
    settings: OrganizationSettings,
  ): Promise<OrganizationSettings> {
    const row = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { settings: toJson(settings) },
      select: { settings: true },
    });
    return row.settings as unknown as OrganizationSettings;
  }
}
