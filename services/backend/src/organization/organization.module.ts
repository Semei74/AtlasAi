import { Module } from "@nestjs/common";
import { MembershipModule } from "../membership/membership.module.js";
import { ORGANIZATION_REPOSITORY } from "./interfaces/organization-repository.interface.js";
import { ORGANIZATION_SETTINGS_REPOSITORY } from "./interfaces/organization-settings-repository.interface.js";
import { OrganizationService } from "./services/organization.service.js";
import { OrganizationController } from "./controllers/organization.controller.js";
import { PrismaOrganizationRepository } from "./services/prisma-organization.repository.js";
import { PrismaOrganizationSettingsRepository } from "./services/prisma-organization-settings.repository.js";

@Module({
  imports: [MembershipModule],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    { provide: ORGANIZATION_REPOSITORY, useClass: PrismaOrganizationRepository },
    { provide: ORGANIZATION_SETTINGS_REPOSITORY, useClass: PrismaOrganizationSettingsRepository },
  ],
  exports: [ORGANIZATION_REPOSITORY, ORGANIZATION_SETTINGS_REPOSITORY, OrganizationService],
})
export class OrganizationModule {}
