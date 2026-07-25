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

  public readonly dbConnectionsActive: client.Gauge;
  public readonly dbConnectionsIdle: client.Gauge;
  public readonly dbQueryDurationSeconds: client.Histogram;
  public readonly dbQueriesTotal: client.Counter;

  public readonly redisConnectionsActive: client.Gauge;
  public readonly redisOperationsTotal: client.Counter;
  public readonly redisOperationDurationSeconds: client.Histogram;

  public readonly authLoginTotal: client.Counter;
  public readonly authRegisterTotal: client.Counter;
  public readonly authPasswordResetTotal: client.Counter;
  public readonly authRefreshTokenTotal: client.Counter;

  public readonly aiGatewayRequestsTotal: client.Counter;
  public readonly aiGatewayTokensTotal: client.Counter;
  public readonly aiGatewayDurationSeconds: client.Histogram;
  public readonly aiGatewayErrorsTotal: client.Counter;
  public readonly aiGatewayCostTotal: client.Counter;
  public readonly aiGatewayProviderHealth: client.Gauge;
  public readonly aiGatewayProviderFallbackTotal: client.Counter;
  public readonly aiGatewayStreamTotal: client.Counter;

  public readonly aiGatewayCircuitBreakerState: client.Gauge;
  public readonly aiGatewayCircuitBreakerTransitionsTotal: client.Counter;
  public readonly aiGatewayRetryAttemptsTotal: client.Counter;
  public readonly aiGatewayRetrySuccessTotal: client.Counter;
  public readonly aiGatewayCacheHitsTotal: client.Counter;
  public readonly aiGatewayCacheMissesTotal: client.Counter;
  public readonly aiGatewayPiiRedactionsTotal: client.Counter;
  public readonly aiGatewayIdempotencyHitsTotal: client.Counter;
  public readonly aiGatewayRequestLimitsExceededTotal: client.Counter;
  public readonly aiGatewayHealthCheckDurationSeconds: client.Histogram;

  public readonly promptLibraryPromptsTotal: client.Counter;
  public readonly promptLibraryVersionsTotal: client.Counter;
  public readonly promptLibraryRenderTotal: client.Counter;
  public readonly promptLibraryRenderDurationSeconds: client.Histogram;
  public readonly promptLibraryValidationErrorsTotal: client.Counter;
  public readonly promptLibraryCacheHitsTotal: client.Counter;
  public readonly promptLibraryCacheMissesTotal: client.Counter;
  public readonly promptLibraryPublishTotal: client.Counter;
  public readonly promptLibraryExecutionTotal: client.Counter;
  public readonly promptLibraryExecutionErrorsTotal: client.Counter;

  public readonly organizationCreatedTotal: client.Counter;
  public readonly organizationDeletedTotal: client.Counter;
  public readonly workspaceCreatedTotal: client.Counter;
  public readonly workspaceDeletedTotal: client.Counter;
  public readonly membershipCreatedTotal: client.Counter;
  public readonly membershipDeletedTotal: client.Counter;
  public readonly invitationSentTotal: client.Counter;
  public readonly invitationAcceptedTotal: client.Counter;
  public readonly authorizationDeniedTotal: client.Counter;

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

    this.dbConnectionsActive = new client.Gauge({
      name: `${METRICS_PREFIX}db_connections_active`,
      help: "Number of active database connections",
      registers: [this.register],
    });

    this.dbConnectionsIdle = new client.Gauge({
      name: `${METRICS_PREFIX}db_connections_idle`,
      help: "Number of idle database connections",
      registers: [this.register],
    });

    this.dbQueryDurationSeconds = new client.Histogram({
      name: `${METRICS_PREFIX}db_query_duration_seconds`,
      help: "Database query duration in seconds",
      labelNames: ["operation"],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.register],
    });

    this.dbQueriesTotal = new client.Counter({
      name: `${METRICS_PREFIX}db_queries_total`,
      help: "Total number of database queries",
      labelNames: ["operation", "status"],
      registers: [this.register],
    });

    this.redisConnectionsActive = new client.Gauge({
      name: `${METRICS_PREFIX}redis_connections_active`,
      help: "Number of active Redis connections",
      registers: [this.register],
    });

    this.redisOperationsTotal = new client.Counter({
      name: `${METRICS_PREFIX}redis_operations_total`,
      help: "Total number of Redis operations",
      labelNames: ["operation"],
      registers: [this.register],
    });

    this.redisOperationDurationSeconds = new client.Histogram({
      name: `${METRICS_PREFIX}redis_operation_duration_seconds`,
      help: "Redis operation duration in seconds",
      labelNames: ["operation"],
      buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
      registers: [this.register],
    });

    this.authLoginTotal = new client.Counter({
      name: `${METRICS_PREFIX}auth_login_total`,
      help: "Total number of login attempts",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.authRegisterTotal = new client.Counter({
      name: `${METRICS_PREFIX}auth_register_total`,
      help: "Total number of registration attempts",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.authPasswordResetTotal = new client.Counter({
      name: `${METRICS_PREFIX}auth_password_reset_total`,
      help: "Total number of password reset attempts",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.authRefreshTokenTotal = new client.Counter({
      name: `${METRICS_PREFIX}auth_refresh_token_total`,
      help: "Total number of refresh token attempts",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.aiGatewayRequestsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_requests_total`,
      help: "Total number of AI Gateway requests",
      labelNames: ["provider", "model"],
      registers: [this.register],
    });

    this.aiGatewayTokensTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_tokens_total`,
      help: "Total number of tokens processed by AI Gateway",
      labelNames: ["provider", "model", "type"],
      registers: [this.register],
    });

    this.aiGatewayDurationSeconds = new client.Histogram({
      name: `${METRICS_PREFIX}ai_gateway_duration_seconds`,
      help: "AI Gateway request duration in seconds",
      labelNames: ["provider", "model"],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10, 15, 30, 60, 120],
      registers: [this.register],
    });

    this.aiGatewayErrorsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_errors_total`,
      help: "Total number of AI Gateway errors",
      labelNames: ["provider", "error_type"],
      registers: [this.register],
    });

    this.aiGatewayCostTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_cost_total`,
      help: "Total estimated cost of AI Gateway requests",
      labelNames: ["provider", "model"],
      registers: [this.register],
    });

    this.aiGatewayProviderHealth = new client.Gauge({
      name: `${METRICS_PREFIX}ai_gateway_provider_health`,
      help: "Current health status of AI providers (1=healthy, 0=unhealthy)",
      labelNames: ["provider"],
      registers: [this.register],
    });

    this.aiGatewayProviderFallbackTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_provider_fallback_total`,
      help: "Total number of provider fallback events",
      labelNames: ["from_provider", "to_provider"],
      registers: [this.register],
    });

    this.aiGatewayStreamTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_stream_total`,
      help: "Total number of AI Gateway streaming requests",
      labelNames: ["provider", "model"],
      registers: [this.register],
    });

    this.aiGatewayCircuitBreakerState = new client.Gauge({
      name: `${METRICS_PREFIX}ai_gateway_circuit_breaker_state`,
      help: "Circuit breaker state per provider (0=closed, 1=half_open, 2=open)",
      labelNames: ["provider"],
      registers: [this.register],
    });

    this.aiGatewayCircuitBreakerTransitionsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_circuit_breaker_transitions_total`,
      help: "Total number of circuit breaker state transitions",
      labelNames: ["provider", "from_state", "to_state"],
      registers: [this.register],
    });

    this.aiGatewayRetryAttemptsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_retry_attempts_total`,
      help: "Total number of retry attempts",
      labelNames: ["provider"],
      registers: [this.register],
    });

    this.aiGatewayRetrySuccessTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_retry_success_total`,
      help: "Total number of successful retries",
      labelNames: ["provider"],
      registers: [this.register],
    });

    this.aiGatewayCacheHitsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_cache_hits_total`,
      help: "Total number of model cache hits",
      labelNames: ["provider"],
      registers: [this.register],
    });

    this.aiGatewayCacheMissesTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_cache_misses_total`,
      help: "Total number of model cache misses",
      labelNames: ["provider"],
      registers: [this.register],
    });

    this.aiGatewayPiiRedactionsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_pii_redactions_total`,
      help: "Total number of PII redaction events",
      labelNames: ["field_type"],
      registers: [this.register],
    });

    this.aiGatewayIdempotencyHitsTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_idempotency_hits_total`,
      help: "Total number of idempotency cache hits",
      registers: [this.register],
    });

    this.aiGatewayRequestLimitsExceededTotal = new client.Counter({
      name: `${METRICS_PREFIX}ai_gateway_request_limits_exceeded_total`,
      help: "Total number of request limit violations",
      labelNames: ["limit_type"],
      registers: [this.register],
    });

    this.aiGatewayHealthCheckDurationSeconds = new client.Histogram({
      name: `${METRICS_PREFIX}ai_gateway_health_check_duration_seconds`,
      help: "Health check duration in seconds per provider",
      labelNames: ["provider"],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
      registers: [this.register],
    });

    this.promptLibraryPromptsTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_prompts_total`,
      help: "Total number of prompts created",
      labelNames: ["action"],
      registers: [this.register],
    });

    this.promptLibraryVersionsTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_versions_total`,
      help: "Total number of prompt versions created",
      registers: [this.register],
    });

    this.promptLibraryRenderTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_render_total`,
      help: "Total number of prompt renders",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.promptLibraryRenderDurationSeconds = new client.Histogram({
      name: `${METRICS_PREFIX}prompt_library_render_duration_seconds`,
      help: "Prompt render duration in seconds",
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1],
      registers: [this.register],
    });

    this.promptLibraryValidationErrorsTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_validation_errors_total`,
      help: "Total number of prompt validation errors",
      labelNames: ["error_type"],
      registers: [this.register],
    });

    this.promptLibraryCacheHitsTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_cache_hits_total`,
      help: "Total number of prompt cache hits",
      registers: [this.register],
    });

    this.promptLibraryCacheMissesTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_cache_misses_total`,
      help: "Total number of prompt cache misses",
      registers: [this.register],
    });

    this.promptLibraryPublishTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_publish_total`,
      help: "Total number of prompt publishes",
      registers: [this.register],
    });

    this.promptLibraryExecutionTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_execution_total`,
      help: "Total number of prompt executions",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.promptLibraryExecutionErrorsTotal = new client.Counter({
      name: `${METRICS_PREFIX}prompt_library_execution_errors_total`,
      help: "Total number of prompt execution errors",
      labelNames: ["error_code"],
      registers: [this.register],
    });

    this.organizationCreatedTotal = new client.Counter({
      name: `${METRICS_PREFIX}organization_created_total`,
      help: "Total number of organizations created",
      registers: [this.register],
    });

    this.organizationDeletedTotal = new client.Counter({
      name: `${METRICS_PREFIX}organization_deleted_total`,
      help: "Total number of organizations deleted",
      registers: [this.register],
    });

    this.workspaceCreatedTotal = new client.Counter({
      name: `${METRICS_PREFIX}workspace_created_total`,
      help: "Total number of workspaces created",
      registers: [this.register],
    });

    this.workspaceDeletedTotal = new client.Counter({
      name: `${METRICS_PREFIX}workspace_deleted_total`,
      help: "Total number of workspaces deleted",
      registers: [this.register],
    });

    this.membershipCreatedTotal = new client.Counter({
      name: `${METRICS_PREFIX}membership_created_total`,
      help: "Total number of memberships created",
      registers: [this.register],
    });

    this.membershipDeletedTotal = new client.Counter({
      name: `${METRICS_PREFIX}membership_deleted_total`,
      help: "Total number of memberships deleted",
      registers: [this.register],
    });

    this.invitationSentTotal = new client.Counter({
      name: `${METRICS_PREFIX}invitation_sent_total`,
      help: "Total number of invitations sent",
      registers: [this.register],
    });

    this.invitationAcceptedTotal = new client.Counter({
      name: `${METRICS_PREFIX}invitation_accepted_total`,
      help: "Total number of invitations accepted",
      registers: [this.register],
    });

    this.authorizationDeniedTotal = new client.Counter({
      name: `${METRICS_PREFIX}authorization_denied_total`,
      help: "Total number of authorization denials",
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
