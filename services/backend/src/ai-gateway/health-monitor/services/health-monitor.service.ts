import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PROVIDER_FACTORY } from "../../providers/factory/provider-factory.interface.js";
import type { ProviderFactory } from "../../providers/factory/provider-factory.interface.js";
import type { ProviderHealthStatus, ProviderHealth } from "../../providers/interfaces/provider-health.interface.js";
import { NotFoundError } from "@atlas/errors";
import { rootLogger } from "@atlas/logger";
import type { HealthMonitorConfig, HealthMonitorService, ProviderHealthSnapshot } from "../interfaces/health-monitor.interface.js";
import { MetricsService } from "../../../metrics/metrics.service.js";
import { CIRCUIT_BREAKER_SERVICE } from "../../circuit-breaker/index.js";
import type { CircuitBreakerService } from "../../circuit-breaker/index.js";

const DEFAULT_CONFIG: HealthMonitorConfig = {
  checkIntervalMs: 60000,
  timeoutMs: 5000,
  consecutiveFailuresBeforeAlert: 3,
};

const SUPPORTED_PROVIDERS = [
  "openai", "anthropic", "gemini", "openrouter", "deepseek",
  "mistral", "groq", "xai", "ollama",
];

@Injectable()
export class HealthMonitorServiceImpl implements HealthMonitorService, OnModuleInit, OnModuleDestroy {
  public readonly config: HealthMonitorConfig;
  private readonly healthMap = new Map<string, ProviderHealthSnapshot>();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  public constructor(
    @Inject(PROVIDER_FACTORY) private readonly providerFactory: ProviderFactory,
    @Inject(MetricsService) private readonly metricsService: MetricsService,
    @Inject(CIRCUIT_BREAKER_SERVICE) private readonly circuitBreakerService: CircuitBreakerService,
  ) {
    this.config = { ...DEFAULT_CONFIG };
  }

  public onModuleInit(): void {
    this.start();
  }

  public onModuleDestroy(): void {
    this.stop();
  }

  public start(): void {
    void this.#checkAll();

    this.intervalId = setInterval(() => {
      void this.#checkAll();
    }, this.config.checkIntervalMs);
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getHealth(provider: string): ProviderHealthSnapshot | null {
    return this.healthMap.get(provider) ?? null;
  }

  public getAllHealth(): ReadonlyMap<string, ProviderHealthSnapshot> {
    return new Map(this.healthMap.entries());
  }

  public isAvailable(provider: string): boolean {
    const health = this.healthMap.get(provider);
    return health?.isAvailable ?? false;
  }

  public async forceCheck(provider: string): Promise<ProviderHealthSnapshot> {
    return this.#checkProvider(provider);
  }

  async #checkAll(): Promise<void> {
    const results = await Promise.allSettled(
      SUPPORTED_PROVIDERS.map((provider) => this.#checkProvider(provider)),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        rootLogger.error("Health check failed", result.reason instanceof Error ? result.reason : new Error(String(result.reason)));
      }
    }
  }

  async #checkProvider(provider: string): Promise<ProviderHealthSnapshot> {
    const startTime = Date.now();
    let status: ProviderHealthStatus = "unhealthy";
    let latency = 0;
    let consecutiveFailures = 0;
    const previous = this.healthMap.get(provider);

    if (previous !== undefined) {
      consecutiveFailures = previous.consecutiveFailures;
    }

    try {
      if (!this.providerFactory.supports(provider)) {
        throw new NotFoundError("Provider", provider);
      }

      const providerInstance = this.providerFactory.create(provider);
      const healthPromise = providerInstance.health();
      const timeoutMs = this.config.timeoutMs > 0 ? this.config.timeoutMs : 5000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Health check timed out"));
        }, timeoutMs);
      });
      const health: ProviderHealth = await Promise.race([healthPromise, timeoutPromise]);
      latency = Date.now() - startTime;
      this.metricsService.aiGatewayHealthCheckDurationSeconds.observe({ provider }, latency / 1000);

      status = health.status;

      if (status === "healthy") {
        consecutiveFailures = 0;
        this.circuitBreakerService.onSuccess(provider);
      } else {
        consecutiveFailures = previous !== undefined ? previous.consecutiveFailures + 1 : 1;
        this.circuitBreakerService.onFailure(provider);
      }
    } catch (error: unknown) {
      latency = Date.now() - startTime;
      this.metricsService.aiGatewayHealthCheckDurationSeconds.observe({ provider }, latency / 1000);

      status = "unhealthy";
      consecutiveFailures = previous !== undefined ? previous.consecutiveFailures + 1 : 1;
      this.circuitBreakerService.onFailure(provider);

      if (consecutiveFailures >= this.config.consecutiveFailuresBeforeAlert) {
        rootLogger.warn("Provider health check consecutive failures", {
          provider,
          consecutiveFailures: String(consecutiveFailures),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const snapshot: ProviderHealthSnapshot = {
      provider,
      status,
      latency,
      lastChecked: new Date(),
      consecutiveFailures,
      isAvailable: status === "healthy",
    };

    this.healthMap.set(provider, snapshot);
    this.metricsService.aiGatewayProviderHealth.set({ provider }, status === "healthy" ? 1 : 0);

    return snapshot;
  }
}
