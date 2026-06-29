import { describe, it, expect } from "vitest";
import { slugify, randomId, pick, omit, truncate, isDefined, groupBy } from "./index.js";

describe("slugify", () => {
  it("should convert text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("  Hello   World  ")).toBe("hello-world");
    expect(slugify("Special!@#Characters")).toBe("specialcharacters");
    expect(slugify("")).toBe("");
  });
});

describe("randomId", () => {
  it("should generate id with default length", () => {
    const id = randomId();
    expect(id.length).toBe(16);
  });

  it("should generate id with custom length", () => {
    const id = randomId(8);
    expect(id.length).toBe(8);
  });

  it("should only contain valid characters", () => {
    const id = randomId(100);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe("pick", () => {
  it("should pick specified keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });
});

describe("omit", () => {
  it("should omit specified keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ["b"])).toEqual({ a: 1, c: 3 });
  });
});

describe("truncate", () => {
  it("should truncate string", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
    expect(truncate("Hi", 5)).toBe("Hi");
  });
});

describe("isDefined", () => {
  it("should return true for defined values", () => {
    expect(isDefined("hello")).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
  });

  it("should return false for undefined/null", () => {
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(null)).toBe(false);
  });
});

describe("groupBy", () => {
  it("should group items by key", () => {
    const items: { type: string; name: string }[] = [
      { type: "a", name: "x" },
      { type: "b", name: "y" },
      { type: "a", name: "z" },
    ];
    const grouped = groupBy(items, (item) => item.type);

    expect(grouped["a"]).toHaveLength(2);
    expect(grouped["b"]).toHaveLength(1);
  });
});
