import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { RequestLoggingMiddleware } from "./request-logging.middleware.js";

function createMockResponse(): ServerResponse {
  const emitter = new EventEmitter() as unknown as ServerResponse;
  Object.defineProperty(emitter, "statusCode", { value: 200, writable: true });
  return emitter;
}

describe("RequestLoggingMiddleware", () => {
  let middleware: RequestLoggingMiddleware;
  let mockReq: IncomingMessage;
  let mockRes: ServerResponse;
  let nextFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();

    mockReq = {
      method: "GET",
      url: "/health",
      headers: {},
    } as IncomingMessage;

    mockRes = createMockResponse();

    nextFn = vi.fn();
  });

  it("should call next() immediately", () => {
    middleware.use(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledOnce();
  });

  it("should log request on finish", () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const loggerSpy = vi.spyOn(middleware["logger"], "log");

    middleware.use(mockReq, mockRes, nextFn);

    mockRes.emit("finish");

    expect(loggerSpy).toHaveBeenCalledOnce();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining("GET /health 200"));
  });

  it("should handle unknown method and url gracefully", () => {
    mockReq.method = undefined;
    mockReq.url = undefined;

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const loggerSpy = vi.spyOn(middleware["logger"], "log");

    middleware.use(mockReq, mockRes, nextFn);

    mockRes.emit("finish");

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining("UNKNOWN / 200"));
  });
});
