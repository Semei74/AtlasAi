import type { FastifyRequest } from "fastify";
import type { TenantContext } from "./tenant-context.interface.js";

export interface RequestWithTenant extends FastifyRequest {
  tenant?: TenantContext;
}
