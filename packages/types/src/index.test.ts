import { describe, it, expect } from "vitest";
import type {
  JsonValue,
  JsonObject,
  PaginatedResponse,
  PaginationParams,
  Result,
} from "./index.js";

describe("result type", () => {
  it("should represent success", () => {
    const result: Result<string> = { success: true, data: "hello" };
    expect(result.success).toBe(true);
    expect(result.data).toBe("hello");
  });

  it("should represent failure", () => {
    const result: Result<string> = { success: false, error: new Error("failed") };
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});

describe("paginated response", () => {
  it("should compute totalPages correctly", () => {
    const response: PaginatedResponse<string> = {
      data: ["a", "b"],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      },
    };

    expect(response.data).toHaveLength(2);
    expect(response.pagination.totalPages).toBe(3);
    expect(response.pagination.hasNext).toBe(true);
    expect(response.pagination.hasPrev).toBe(false);
  });
});

describe("json types", () => {
  it("should accept valid JSON values", () => {
    const values: JsonValue[] = ["string", 42, true, null, { key: "value" }, [1, 2, 3]];

    expect(values).toHaveLength(6);
  });

  it("should accept nested objects", () => {
    const obj: JsonObject = {
      nested: { value: 1 },
    };

    expect(obj["nested"]).toEqual({ value: 1 });
  });
});

describe("pagination params", () => {
  it("should have page and limit", () => {
    const params: PaginationParams = { page: 1, limit: 20 };

    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
  });
});
