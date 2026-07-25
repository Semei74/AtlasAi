import { ApiProperty } from "@nestjs/swagger";
import type { Organization } from "../interfaces/organization.interface.js";

export class OrganizationResponseDto {
  @ApiProperty({ description: "Organization ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Organization name", example: "Acme Corp" })
  public readonly name!: string;

  @ApiProperty({ description: "URL-friendly slug", example: "acme-corp" })
  public readonly slug!: string;

  @ApiProperty({ description: "Owner user ID", format: "uuid" })
  public readonly ownerId!: string;

  @ApiProperty({ description: "Organization logo URL", nullable: true })
  public readonly logoUrl!: string | null;

  @ApiProperty({ description: "Creation date", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: Date;

  @ApiProperty({ description: "Last update date", example: "2025-01-01T00:00:00.000Z" })
  public readonly updatedAt!: Date;

  private constructor(data: OrganizationResponseDto) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.ownerId = data.ownerId;
    this.logoUrl = data.logoUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static from(organization: Organization): OrganizationResponseDto {
    return new OrganizationResponseDto({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      ownerId: organization.ownerId,
      logoUrl: organization.branding.logoUrl,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    });
  }
}
