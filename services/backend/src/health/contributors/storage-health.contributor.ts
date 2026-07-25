import { Injectable } from "@nestjs/common";
import type { HealthContributor, HealthStatusValue } from "../health-contributor.interface.js";
import { rootLogger } from "@atlas/logger";

@Injectable()
export class StorageHealthContributor implements HealthContributor {
  public readonly name = "storage";

  public async check(): Promise<HealthStatusValue> {
    const endpoint = process.env["STORAGE_ENDPOINT"];

    if (!endpoint) {
      return "not_checked";
    }

    try {
      const response = await fetch(`${endpoint}/minio/health/live`, { signal: AbortSignal.timeout(5000) });
      return response.ok ? "connected" : "disconnected";
    } catch (error) {
      rootLogger.error("Storage health check failed", error as Error);
      return "disconnected";
    }
  }
}
