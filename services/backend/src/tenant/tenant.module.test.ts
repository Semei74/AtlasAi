import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { TenantModule } from "./tenant.module.js";
import { TenantScopeGuard } from "./guards/tenant-scope.guard.js";

describe("TenantModule", () => {
  it("should provide TenantScopeGuard", async () => {
    const module = await Test.createTestingModule({
      imports: [TenantModule],
    }).compile();

    const guard = module.get<TenantScopeGuard>(TenantScopeGuard);
    expect(guard).toBeDefined();
  });

  it("should resolve TenantScopeGuard as a provider", async () => {
    const module = await Test.createTestingModule({
      imports: [TenantModule],
    }).compile();

    const guard = module.get<TenantScopeGuard>(TenantScopeGuard);
    expect(guard).toBeInstanceOf(TenantScopeGuard);
  });
});
