import { describe, it, expect } from "vitest";
import { HTTP_STATUS, HEADERS, MIME_TYPES, CACHE_TTL, TIME, REGEX, ERROR_CODES } from "./index.js";

describe("HTTP_STATUS", () => {
  it("should contain standard HTTP status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.NO_CONTENT).toBe(204);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
  });

  it("should have all values as numbers", () => {
    for (const value of Object.values(HTTP_STATUS)) {
      expect(typeof value).toBe("number");
    }
  });
});

describe("HEADERS", () => {
  it("should contain common HTTP headers", () => {
    expect(HEADERS.CONTENT_TYPE).toBe("content-type");
    expect(HEADERS.AUTHORIZATION).toBe("authorization");
    expect(HEADERS.CORRELATION_ID).toBe("x-correlation-id");
  });

  it("should have all values as strings", () => {
    for (const value of Object.values(HEADERS)) {
      expect(typeof value).toBe("string");
    }
  });
});

describe("MIME_TYPES", () => {
  it("should contain standard MIME types", () => {
    expect(MIME_TYPES.JSON).toBe("application/json");
    expect(MIME_TYPES.HTML).toBe("text/html");
    expect(MIME_TYPES.PDF).toBe("application/pdf");
  });
});

describe("CACHE_TTL", () => {
  it("should have increasing durations", () => {
    expect(CACHE_TTL.SHORT).toBeLessThan(CACHE_TTL.MEDIUM);
    expect(CACHE_TTL.MEDIUM).toBeLessThan(CACHE_TTL.LONG);
    expect(CACHE_TTL.LONG).toBeLessThan(CACHE_TTL.DAY);
    expect(CACHE_TTL.DAY).toBeLessThan(CACHE_TTL.WEEK);
  });
});

describe("TIME", () => {
  it("should have correct millisecond values", () => {
    expect(TIME.SECOND).toBe(1000);
    expect(TIME.MINUTE).toBe(60000);
    expect(TIME.HOUR).toBe(3600000);
    expect(TIME.DAY).toBe(86400000);
  });

  it("should have consistent relationships", () => {
    expect(TIME.SECOND * 60).toBe(TIME.MINUTE);
    expect(TIME.MINUTE * 60).toBe(TIME.HOUR);
    expect(TIME.HOUR * 24).toBe(TIME.DAY);
    expect(TIME.DAY * 7).toBe(TIME.WEEK);
  });
});

describe("REGEX", () => {
  it("should validate email addresses", () => {
    expect(REGEX.EMAIL.test("user@example.com")).toBe(true);
    expect(REGEX.EMAIL.test("invalid")).toBe(false);
  });

  it("should validate UUIDs", () => {
    expect(REGEX.UUID.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(REGEX.UUID.test("not-a-uuid")).toBe(false);
  });

  it("should validate URLs", () => {
    expect(REGEX.URL.test("https://example.com")).toBe(true);
    expect(REGEX.URL.test("not-a-url")).toBe(false);
  });

  it("should validate slugs", () => {
    expect(REGEX.SLUG.test("my-slug")).toBe(true);
    expect(REGEX.SLUG.test("Invalid Slug")).toBe(false);
  });
});

describe("ERROR_CODES", () => {
  it("should contain all expected error codes", () => {
    expect(ERROR_CODES.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(ERROR_CODES.NOT_FOUND).toBe("NOT_FOUND");
    expect(ERROR_CODES.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
    expect(ERROR_CODES.AI_PROVIDER_ERROR).toBe("AI_PROVIDER_ERROR");
  });
});
