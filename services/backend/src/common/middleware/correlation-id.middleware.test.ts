import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { CorrelationIdMiddleware } from "./correlation-id.middleware.js";

describe("CorrelationIdMiddleware", () => {
  let middleware: CorrelationIdMiddleware;
  let mockReq: Partial<IncomingMessage>;
  let mockRes: Partial<ServerResponse>;
  let nextFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();

    mockReq = {
      headers: {},
    };

    mockRes = {
      setHeader: vi.fn(),
    };

    nextFn = vi.fn();
  });

  it("should generate a correlation ID when none is provided", () => {
    middleware.use(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn);

    const headers: Record<string, string | string[] | undefined> = mockReq.headers ?? {};
    const correlationId = headers["x-correlation-id"];
    expect(correlationId).toBeDefined();
    expect(typeof correlationId).toBe("string");
    expect(correlationId).toHaveLength(36);
  });

  it("should preserve an existing correlation ID from the request", () => {
    mockReq.headers = { "x-correlation-id": "existing-id-123" };

    middleware.use(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn);

    expect(mockReq.headers["x-correlation-id"]).toBe("existing-id-123");
  });

  it("should set the correlation ID header on the response", () => {
    const setHeaderSpy = vi.fn();
    mockRes.setHeader = setHeaderSpy;

    middleware.use(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn);

    expect(setHeaderSpy).toHaveBeenCalledWith("x-correlation-id", expect.any(String));
  });

  it("should call next()", () => {
    middleware.use(mockReq as IncomingMessage, mockRes as ServerResponse, nextFn);

    expect(nextFn).toHaveBeenCalledOnce();
  });
});
