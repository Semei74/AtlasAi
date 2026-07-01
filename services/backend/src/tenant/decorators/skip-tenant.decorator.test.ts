import { describe, it, expect } from "vitest";
import { Reflector } from "@nestjs/core";
import { SkipTenant, SKIP_TENANT_KEY } from "./skip-tenant.decorator.js";

describe("SkipTenant", () => {
  it("should set metadata with key skip_tenant", () => {
    const reflector = new Reflector();
    const target: () => void = (): void => {
      /* noop */
    };

    const decorator = SkipTenant();
    decorator(target, undefined as never, undefined as never);

    const metadata: boolean | undefined = reflector.get(SKIP_TENANT_KEY, target);
    expect(metadata).toBe(true);
  });

  it("should be undefined when not applied", () => {
    const reflector = new Reflector();
    const target: () => void = (): void => {
      /* noop */
    };

    const metadata: boolean | undefined = reflector.get(SKIP_TENANT_KEY, target);
    expect(metadata).toBeUndefined();
  });

  it("should export SKIP_TENANT_KEY constant", () => {
    expect(SKIP_TENANT_KEY).toBe("skip_tenant");
  });
});
