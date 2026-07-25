import { describe, it, expect, beforeEach, vi } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { CorrelationIdMiddleware } from "./correlation-id.middleware.js";
import { CorrelationIdServiceImpl } from "../services/correlation-id.service.js";

describe("CorrelationIdMiddleware", () => {
  let middleware: CorrelationIdMiddleware;
  let correlationIdService: CorrelationIdServiceImpl;

  beforeEach(() => {
    correlationIdService = new CorrelationIdServiceImpl();
    middleware = new CorrelationIdMiddleware(correlationIdService);
  });

  function mockReq(headers: Record<string, string> = {}): FastifyRequest {
    return { headers } as unknown as FastifyRequest;
  }

  function mockRes(): FastifyReply {
    return { header: vi.fn() } as unknown as FastifyReply;
  }

  it("should generate correlation ID when header is missing", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    middleware.use(req, res, next);

    const id = correlationIdService.get();
    expect(id).toBeDefined();
    expect(id.length).toBeGreaterThan(0);
    expect(next).toHaveBeenCalled();
  });

  it("should use existing correlation ID from header", () => {
    const req = mockReq({ "x-correlation-id": "existing-id" });
    const res = mockRes();
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(correlationIdService.get()).toBe("existing-id");
    expect(next).toHaveBeenCalled();
  });

  it("should set response header", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(res.header).toHaveBeenCalledWith("x-correlation-id", expect.any(String));
  });
});
