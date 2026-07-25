import { Module } from "@nestjs/common";
import { MEMBERSHIP_REPOSITORY } from "./interfaces/membership-repository.interface.js";
import { INVITATION_REPOSITORY } from "./interfaces/invitation-repository.interface.js";
import { MembershipService } from "./services/membership.service.js";
import { InvitationService } from "./services/invitation.service.js";
import { MembershipController } from "./controllers/membership.controller.js";
import { InvitationController } from "./controllers/invitation.controller.js";
import { PrismaMembershipRepository } from "./services/prisma-membership.repository.js";
import { PrismaInvitationRepository } from "./services/prisma-invitation.repository.js";

@Module({
  imports: [],
  controllers: [MembershipController, InvitationController],
  providers: [
    MembershipService,
    InvitationService,
    { provide: MEMBERSHIP_REPOSITORY, useClass: PrismaMembershipRepository },
    { provide: INVITATION_REPOSITORY, useClass: PrismaInvitationRepository },
  ],
  exports: [MEMBERSHIP_REPOSITORY, INVITATION_REPOSITORY, MembershipService, InvitationService],
})
export class MembershipModule {}
