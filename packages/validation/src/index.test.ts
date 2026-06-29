import { describe, it, expect } from "vitest";
import {
  isEmail,
  isUuid,
  isUrl,
  isSlug,
  isNonEmptyString,
  isPositiveInteger,
  assertEmail,
  assertNonEmptyString,
} from "./index.js";

describe("isEmail", () => {
  it("should validate email format", () => {
    expect(isEmail("test@example.com")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("")).toBe(false);
  });
});

describe("isUuid", () => {
  it("should validate UUID format", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
  });
});

describe("isUrl", () => {
  it("should validate URL format", () => {
    expect(isUrl("https://example.com")).toBe(true);
    expect(isUrl("http://example.com/path")).toBe(true);
    expect(isUrl("not-a-url")).toBe(false);
  });
});

describe("isSlug", () => {
  it("should validate slug format", () => {
    expect(isSlug("hello-world")).toBe(true);
    expect(isSlug("hello_world")).toBe(false);
    expect(isSlug("Hello World")).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("should validate non-empty string", () => {
    expect(isNonEmptyString("hello")).toBe(true);
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
  });
});

describe("isPositiveInteger", () => {
  it("should validate positive integer", () => {
    expect(isPositiveInteger(5)).toBe(true);
    expect(isPositiveInteger(0)).toBe(false);
    expect(isPositiveInteger(-1)).toBe(false);
    expect(isPositiveInteger(1.5)).toBe(false);
  });
});

describe("assertEmail", () => {
  it("should throw on invalid email", () => {
    expect(() => {
      assertEmail("invalid");
    }).toThrow();
  });

  it("should pass on valid email", () => {
    expect(() => {
      assertEmail("test@example.com");
    }).not.toThrow();
  });
});

describe("assertNonEmptyString", () => {
  it("should throw on empty string", () => {
    expect(() => {
      assertNonEmptyString("", "field");
    }).toThrow("field must be a non-empty string");
  });

  it("should pass on valid string", () => {
    expect(() => {
      assertNonEmptyString("hello", "field");
    }).not.toThrow();
  });
});
