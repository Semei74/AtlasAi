import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";
import { TenantModule } from "./tenant.module.js";
import { TenantScopeGuard } from "./guards/tenant-scope.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RedisModule } from "../redis/redis.module.js";
import { RedisService } from "../redis/redis.service.js";
import { MetricsModule } from "../metrics/metrics.module.js";

function createModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [TenantModule, PrismaModule, RedisModule, MetricsModule],
  })
    .overrideProvider(PrismaService)
    .useValue({})
    .overrideProvider(RedisService)
    .useValue({})
    .compile();
}

describe("TenantModule", () => {
  it("should provide TenantScopeGuard", async () => {
    const module = await createModule();

    const guard = module.get<TenantScopeGuard>(TenantScopeGuard);
    expect(guard).toBeDefined();
  });

  it("should resolve TenantScopeGuard as a provider", async () => {
    const module = await createModule();

    const guard = module.get<TenantScopeGuard>(TenantScopeGuard);
    expect(guard).toBeInstanceOf(TenantScopeGuard);
  });
});
