import { Injectable } from "@nestjs/common";
import type { HealthContributor, HealthStatusValue } from "../health-contributor.interface.js";
import { rootLogger } from "@atlas/logger";

@Injectable()
export class SearchHealthContributor implements HealthContributor {
  public readonly name = "search";

  public async check(): Promise<HealthStatusValue> {
    const host = process.env["SEARCH_HOST"];

    if (!host) {
      return "not_checked";
    }

    const port = process.env["SEARCH_PORT"] ?? "9200";

    try {
      const response = await fetch(`http://${host}:${port}/_cluster/health`, { signal: AbortSignal.timeout(5000) });
      return response.ok ? "connected" : "disconnected";
    } catch (error) {
      rootLogger.error("Search health check failed", error as Error);
      return "disconnected";
    }
  }
}
