import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExecutionContext, CallHandler } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { MetricsInterceptor } from "./metrics.interceptor.js";
import { MetricsService } from "./metrics.service.js";

describe("MetricsInterceptor", () => {
  let interceptor: MetricsInterceptor;
  let metricsService: MetricsService;
  let mockExecutionContext: ExecutionContext;

  beforeEach((): void => {
    metricsService = new MetricsService();
    interceptor = new MetricsInterceptor(metricsService);

    mockExecutionContext = {
      switchToHttp: (): {
        getRequest: () => { method: string; url: string };
        getResponse: () => object;
      } => ({
        getRequest: (): { method: string; url: string } => ({ method: "GET", url: "/test" }),
        getResponse: (): { statusCode: number } => ({ statusCode: 200 }),
      }),
      getHandler: (): object => ({}),
      getClass: (): object => ({}),
    } as unknown as ExecutionContext;
  });

  describe("on successful response", () => {
    it("should increment active connections", () => {
      const incSpy = vi.spyOn(metricsService.activeConnections, "inc");
      const callHandler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe();

      expect(incSpy).toHaveBeenCalledOnce();
    });

    it("should decrement active connections on success", () => {
      const decSpy = vi.spyOn(metricsService.activeConnections, "dec");
      const callHandler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe();

      expect(decSpy).toHaveBeenCalledOnce();
    });

    it("should record request duration", () => {
      const endTimer = vi.fn();
      const startTimerSpy = vi
        .spyOn(metricsService.httpRequestDuration, "startTimer")
        .mockReturnValue(endTimer);
      const callHandler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe();

      expect(startTimerSpy).toHaveBeenCalledWith({ method: "GET", route: "/test" });
      expect(endTimer).toHaveBeenCalledWith({ status_code: "200" });
    });

    it("should increment httpRequestsTotal on success", () => {
      const incSpy = vi.spyOn(metricsService.httpRequestsTotal, "inc");
      const callHandler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe();

      expect(incSpy).toHaveBeenCalledWith({
        method: "GET",
        route: "/test",
        status_code: "200",
      });
    });
  });

  describe("on error response", () => {
    it("should decrement active connections on error", () => {
      const decSpy = vi.spyOn(metricsService.activeConnections, "dec");
      const callHandler: CallHandler = { handle: () => throwError(() => new Error("fail")) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe({
        error: (): void => undefined,
      });

      expect(decSpy).toHaveBeenCalledOnce();
    });

    it("should increment httpRequestErrors on error", () => {
      const incSpy = vi.spyOn(metricsService.httpRequestErrors, "inc");
      const callHandler: CallHandler = { handle: () => throwError(() => new Error("fail")) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe({
        error: (): void => undefined,
      });

      expect(incSpy).toHaveBeenCalledWith({
        method: "GET",
        route: "/test",
        status_code: "500",
      });
    });

    it("should record error status code in httpRequestsTotal", () => {
      const incSpy = vi.spyOn(metricsService.httpRequestsTotal, "inc");
      const callHandler: CallHandler = { handle: () => throwError(() => new Error("fail")) };

      interceptor.intercept(mockExecutionContext, callHandler).subscribe({
        error: (): void => undefined,
      });

      expect(incSpy).toHaveBeenCalledWith({
        method: "GET",
        route: "/test",
        status_code: "500",
      });
    });
  });
});
