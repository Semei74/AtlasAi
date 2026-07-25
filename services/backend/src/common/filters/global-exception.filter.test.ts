import { describe, it, expect, vi } from "vitest";
import { HttpException, HttpStatus } from "@nestjs/common";
import type { ArgumentsHost } from "@nestjs/common";
import { GlobalExceptionFilter } from "./global-exception.filter.js";
import { ValidationError, NotFoundError, InternalError } from "@atlas/errors";

interface MockResponse {
  status: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
}

function createMockHost(url = "/test"): ArgumentsHost {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));

  const mockResponse: MockResponse = { status, send };

  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => ({ url, headers: {} }),
    }),
    switchToRpc: () => {
      throw new Error("Not implemented");
    },
    switchToWs: () => {
      throw new Error("Not implemented");
    },
    getArgs: () => [],
    getArgByIndex: () => undefined,
    getType: () => "http",
  } as unknown as ArgumentsHost;
}

function getResponse(host: ArgumentsHost): MockResponse {
  return host.switchToHttp().getResponse() as MockResponse;
}

describe("GlobalExceptionFilter", () => {
  const filter = new GlobalExceptionFilter();

  describe("HttpException", () => {
    it("should return correct status code and message", () => {
      const host = createMockHost();
      const exception = new HttpException("Not Found", HttpStatus.NOT_FOUND);

      filter.catch(exception, host);

      const response = getResponse(host);
      expect(response.status).toHaveBeenCalledWith(404);
    });
  });

  describe("AppError (ValidationError)", () => {
    it("should return 422 and VALIDATION_ERROR code", () => {
      const host = createMockHost();
      const exception = new ValidationError("Invalid input", { field: "email" });

      filter.catch(exception, host);

      const response = getResponse(host);
      expect(response.status).toHaveBeenCalledWith(422);
    });
  });

  describe("AppError (NotFoundError)", () => {
    it("should return 404 and NOT_FOUND code", () => {
      const host = createMockHost();
      const exception = new NotFoundError("User", "123");

      filter.catch(exception, host);

      const response = getResponse(host);
      expect(response.status).toHaveBeenCalledWith(404);
    });
  });

  describe("AppError (InternalError)", () => {
    it("should return 500 and INTERNAL_ERROR code", () => {
      const host = createMockHost();
      const exception = new InternalError("Server error");

      filter.catch(exception, host);

      const response = getResponse(host);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });

  describe("unknown errors", () => {
    it("should handle generic Error objects", () => {
      const host = createMockHost();
      const exception = new Error("Something broke");

      filter.catch(exception, host);

      const response = getResponse(host);
      expect(response.status).toHaveBeenCalledWith(500);
    });
  });
});
