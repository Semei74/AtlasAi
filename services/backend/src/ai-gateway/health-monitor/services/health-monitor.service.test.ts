import { describe, it, expect, beforeEach, vi } from "vitest";
import { HealthMonitorServiceImpl } from "./health-monitor.service.js";
import { MetricsService } from "../../../metrics/metrics.service.js";

vi.mock("../../../metrics/metrics.service.js", () => {
  const mockFn = (): void => { /* noop */ };
  return {
    MetricsService: vi.fn(() => ({
      httpRequestDuration: { observe: mockFn },
      httpRequestsTotal: { inc: mockFn },
      httpRequestErrors: { inc: mockFn },
      activeConnections: { set: mockFn },
      dbConnectionsActive: { set: mockFn },
      dbConnectionsIdle: { set: mockFn },
      dbQueryDurationSeconds: { observe: mockFn },
      dbQueriesTotal: { inc: mockFn },
      redisConnectionsActive: { set: mockFn },
      redisOperationsTotal: { inc: mockFn },
      redisOperationDurationSeconds: { observe: mockFn },
      authLoginTotal: { inc: mockFn },
      authRegisterTotal: { inc: mockFn },
      authPasswordResetTotal: { inc: mockFn },
      authRefreshTokenTotal: { inc: mockFn },
      aiGatewayRequestsTotal: { inc: mockFn },
      aiGatewayTokensTotal: { inc: mockFn },
      aiGatewayDurationSeconds: { observe: mockFn },
      aiGatewayErrorsTotal: { inc: mockFn },
      aiGatewayCostTotal: { inc: mockFn },
      aiGatewayProviderHealth: { set: mockFn },
      aiGatewayProviderFallbackTotal: { inc: mockFn },
      aiGatewayStreamTotal: { inc: mockFn },
      aiGatewayCircuitBreakerState: { set: mockFn },
      aiGatewayCircuitBreakerTransitionsTotal: { inc: mockFn },
      aiGatewayRetryAttemptsTotal: { inc: mockFn },
      aiGatewayRetrySuccessTotal: { inc: mockFn },
      aiGatewayCacheHitsTotal: { inc: mockFn },
      aiGatewayCacheMissesTotal: { inc: mockFn },
      aiGatewayPiiRedactionsTotal: { inc: mockFn },
      aiGatewayIdempotencyHitsTotal: { inc: mockFn },
      aiGatewayRequestLimitsExceededTotal: { inc: mockFn },
      aiGatewayHealthCheckDurationSeconds: { observe: mockFn },
      organizationCreatedTotal: { inc: mockFn },
      organizationDeletedTotal: { inc: mockFn },
      workspaceCreatedTotal: { inc: mockFn },
      workspaceDeletedTotal: { inc: mockFn },
      membershipCreatedTotal: { inc: mockFn },
      membershipDeletedTotal: { inc: mockFn },
      invitationSentTotal: { inc: mockFn },
      invitationAcceptedTotal: { inc: mockFn },
      authorizationDeniedTotal: { inc: mockFn },
    })),
  };
});

describe("HealthMonitorServiceImpl", () => {
  let service: HealthMonitorServiceImpl;
  let metricsService: MetricsService;

  const mockProviderFactory = {
    supports: vi.fn(),
    create: vi.fn(),
  };

  const mockCircuitBreakerService = {
    onSuccess: vi.fn(),
    onFailure: vi.fn(),
    onStateChange: vi.fn(),
  } as never;

  beforeEach(() => {
    vi.clearAllMocks();
    metricsService = new MetricsService();
    service = new HealthMonitorServiceImpl(mockProviderFactory, metricsService, mockCircuitBreakerService);
  });

  it("should have default config", () => {
    expect(service.config.checkIntervalMs).toBe(60000);
    expect(service.config.timeoutMs).toBe(5000);
  });

  it("should return null for unknown provider health", () => {
    expect(service.getHealth("nonexistent")).toBeNull();
  });

  it("should start and stop without errors", () => {
    service.start();
    service.stop();
    expect(true).toBe(true);
  });

  it("should return isAvailable false for unknown provider", () => {
    expect(service.isAvailable("nonexistent")).toBe(false);
  });

  it("should getAllHealth return empty initially", () => {
    const all = service.getAllHealth();
    expect(all.size).toBe(0);
  });

  it("should start and stop clears interval", () => {
    service.start();
    service.stop();
    expect(service.isAvailable("test")).toBe(false);
  });

  it("should call forceCheck and return snapshot", async () => {
    mockProviderFactory.supports.mockReturnValue(true);
    mockProviderFactory.create.mockReturnValue({
      metadata: { name: "openai" },
      health: vi.fn().mockResolvedValue({ status: "healthy", latency: 100, lastChecked: new Date() }),
      chat: vi.fn(),
      configure: vi.fn(),
      capabilities: {} as never,
      configuration: {} as never,
    });

    const snapshot = await service.forceCheck("openai");
    expect(snapshot.isAvailable).toBe(true);
    expect(snapshot.provider).toBe("openai");
  });

  it("should handle unsupported provider in forceCheck", async () => {
    mockProviderFactory.supports.mockReturnValue(false);

    const snapshot = await service.forceCheck("unsupported");
    expect(snapshot.isAvailable).toBe(false);
    expect(snapshot.consecutiveFailures).toBe(1);
  });
});
