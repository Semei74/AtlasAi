import { Injectable, OnModuleInit } from "@nestjs/common";
import client from "prom-client";

const METRICS_PREFIX = "atlas_";

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: client.Registry;

  public readonly httpRequestDuration: client.Histogram;
  public readonly httpRequestsTotal: client.Counter;
  public readonly httpRequestErrors: client.Counter;
  public readonly activeConnections: client.Gauge;

  public constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register, prefix: METRICS_PREFIX });

    this.httpRequestDuration = new client.Histogram({
      name: `${METRICS_PREFIX}http_request_duration_seconds`,
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.register],
    });

    this.httpRequestsTotal = new client.Counter({
      name: `${METRICS_PREFIX}http_requests_total`,
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.register],
    });

    this.httpRequestErrors = new client.Counter({
      name: `${METRICS_PREFIX}http_request_errors_total`,
      help: "Total number of HTTP request errors",
      labelNames: ["method", "route", "status_code"],
      registers: [this.register],
    });

    this.activeConnections = new client.Gauge({
      name: `${METRICS_PREFIX}active_connections`,
      help: "Number of active connections",
      registers: [this.register],
    });
  }

  public onModuleInit(): void {
    this.activeConnections.set(0);
  }

  public getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  public getContentType(): string {
    return this.register.contentType;
  }
}
