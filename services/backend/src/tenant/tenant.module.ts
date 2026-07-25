import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "../auth/auth.module.js";
import { MembershipModule } from "../membership/membership.module.js";
import { TenantScopeGuard } from "./guards/tenant-scope.guard.js";

@Module({
  imports: [AuthModule, MembershipModule],
  providers: [
    TenantScopeGuard,
    {
      provide: APP_GUARD,
      useExisting: TenantScopeGuard,
    },
  ],
})
export class TenantModule {}
