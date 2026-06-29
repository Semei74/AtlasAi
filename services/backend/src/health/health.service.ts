import { Injectable } from "@nestjs/common";

export interface HealthStatus {
  readonly status: "ok" | "degraded" | "down";
  readonly uptime: number;
  readonly timestamp: string;
}

export interface ReadinessStatus extends HealthStatus {
  readonly dependencies: {
    readonly database: "connected" | "disconnected" | "not_checked";
    readonly redis: "connected" | "disconnected" | "not_checked";
    readonly storage: "connected" | "disconnected" | "not_checked";
  };
}

export interface LivenessStatus extends HealthStatus {
  readonly memory: {
    readonly heapUsed: number;
    readonly heapTotal: number;
    readonly rss: number;
  };
}

const START_TIME = Date.now();

@Injectable()
export class HealthService {
  public check(): HealthStatus {
    return {
      status: "ok",
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  public readiness(): ReadinessStatus {
    return {
      status: "ok",
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: "not_checked",
        redis: "not_checked",
        storage: "not_checked",
      },
    };
  }

  public liveness(): LivenessStatus {
    const memoryUsage = process.memoryUsage();
    return {
      status: "ok",
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        rss: memoryUsage.rss,
      },
    };
  }
}
