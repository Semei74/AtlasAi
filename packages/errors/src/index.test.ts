import { describe, it, expect } from "vitest";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalError,
  RateLimitError,
  AiProviderError,
  ConfigurationError,
} from "./index.js";
import { HTTP_STATUS } from "@atlas/constants";

describe("ValidationError", () => {
  it("should create with default properties", () => {
    const error = new ValidationError("Invalid input");

    expect(error.message).toBe("Invalid input");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.httpStatus).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    expect(error.retryable).toBe(false);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it("should include optional details", () => {
    const error = new ValidationError("Invalid email", { field: "email" });

    expect(error.details).toEqual({ field: "email" });
  });
});

describe("NotFoundError", () => {
  it("should create with resource name", () => {
    const error = new NotFoundError("User");

    expect(error.message).toBe("User not found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.httpStatus).toBe(HTTP_STATUS.NOT_FOUND);
  });

  it("should include id in message", () => {
    const error = new NotFoundError("User", "123");

    expect(error.message).toBe("User with id '123' not found");
  });
});

describe("UnauthorizedError", () => {
  it("should create with default message", () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe("Authentication required");
    expect(error.httpStatus).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});

describe("ForbiddenError", () => {
  it("should create with default message", () => {
    const error = new ForbiddenError();

    expect(error.message).toBe("Access denied");
    expect(error.httpStatus).toBe(HTTP_STATUS.FORBIDDEN);
  });
});

describe("ConflictError", () => {
  it("should create with message", () => {
    const error = new ConflictError("Resource already exists");

    expect(error.message).toBe("Resource already exists");
    expect(error.httpStatus).toBe(HTTP_STATUS.CONFLICT);
  });
});

describe("InternalError", () => {
  it("should create with cause", () => {
    const cause = new Error("DB connection failed");
    const error = new InternalError("Server error", cause);

    expect(error.message).toBe("Server error");
    expect(error.httpStatus).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(error.retryable).toBe(true);
    expect(error.cause).toBe(cause);
  });
});

describe("RateLimitError", () => {
  it("should create with retryable flag", () => {
    const error = new RateLimitError();

    expect(error.httpStatus).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(error.retryable).toBe(true);
  });
});

describe("AiProviderError", () => {
  it("should create with details", () => {
    const error = new AiProviderError("OpenAI timeout", {
      provider: "openai",
      model: "gpt-4",
    });

    expect(error.details).toEqual({ provider: "openai", model: "gpt-4" });
    expect(error.httpStatus).toBe(HTTP_STATUS.SERVICE_UNAVAILABLE);
  });
});

describe("ConfigurationError", () => {
  it("should create with message", () => {
    const error = new ConfigurationError("Missing JWT_SECRET");

    expect(error.code).toBe("CONFIGURATION_ERROR");
    expect(error.httpStatus).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(error.retryable).toBe(false);
  });
});

describe("AppError.toJSON", () => {
  it("should serialize to JSON", () => {
    const error = new ValidationError("Bad input", { field: "name" });
    const json = error.toJSON();

    expect(json).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Bad input",
      httpStatus: 422,
      details: { field: "name" },
      retryable: false,
    });
    expect(json["timestamp"]).toBeDefined();
  });
});
