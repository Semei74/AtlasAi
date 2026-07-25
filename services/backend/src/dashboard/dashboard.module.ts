import { Module } from "@nestjs/common";
import { MembershipModule } from "../membership/membership.module.js";
import { DashboardService } from "./dashboard.service.js";
import { DashboardController } from "./dashboard.controller.js";

@Module({
  imports: [MembershipModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
