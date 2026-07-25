import { Injectable, Inject } from "@nestjs/common";
import type { HealthContributor, HealthStatusValue } from "./health-contributor.interface.js";
import { HEALTH_CONTRIBUTORS } from "./health-contributor.interface.js";

export interface BuildInfo {
  readonly version: string;
  readonly nodeVersion: string;
  readonly platform: string;
  readonly arch: string;
}

export interface HealthStatus {
  readonly status: "ok" | "degraded" | "down";
  readonly uptime: number;
  readonly timestamp: string;
  readonly version: string;
  readonly build: BuildInfo;
}

export interface ReadinessStatus extends HealthStatus {
  readonly dependencies: {
    readonly database: HealthStatusValue;
    readonly redis: HealthStatusValue;
    readonly storage: HealthStatusValue;
    readonly search: HealthStatusValue;
  };
}

export interface LivenessStatus extends HealthStatus {
  readonly memory: {
    readonly heapUsed: number;
    readonly heapTotal: number;
    readonly rss: number;
  };
}

function createBuildInfo(): BuildInfo {
  return {
    version: process.env["npm_package_version"] ?? "0.0.0",
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

function createBaseStatus(uptime: number): HealthStatus {
  const build = createBuildInfo();
  return {
    status: "ok",
    uptime,
    timestamp: new Date().toISOString(),
    version: build.version,
    build,
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  public constructor(
    @Inject(HEALTH_CONTRIBUTORS) private readonly contributors: HealthContributor[],
  ) {}

  public check(): HealthStatus {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return createBaseStatus(uptime);
  }

  public async readiness(): Promise<ReadinessStatus> {
    const results = await Promise.all(
      this.contributors.map(async (c) => ({
        name: c.name,
        status: await c.check(),
      })),
    );

    const dep = (name: string): HealthStatusValue =>
      results.find((r) => r.name === name)?.status ?? "not_checked";

    const database = dep("database");
    const redis = dep("redis");
    const storage = dep("storage");
    const search = dep("search");

    const allEssential = database === "connected" && redis === "connected";
    const noDegradation = storage !== "disconnected" && search !== "disconnected";
    const status = allEssential && noDegradation ? "ok" : "degraded";

    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      ...createBaseStatus(uptime),
      status,
      dependencies: { database, redis, storage, search },
    };
  }

  public liveness(): LivenessStatus {
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      ...createBaseStatus(uptime),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        rss: memoryUsage.rss,
      },
    };
  }
}
