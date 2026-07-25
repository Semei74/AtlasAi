import { describe, it, expect } from "vitest";
import { DefaultTokenEstimator } from "./default-token-estimator.js";

describe("DefaultTokenEstimator", () => {
  const estimator = new DefaultTokenEstimator();

  it("returns zero for empty text", () => {
    expect(estimator.estimate("")).toBe(0);
  });

  it("estimates tokens at roughly four characters per token", () => {
    expect(estimator.estimate("hello")).toBe(2);
    expect(estimator.estimate("12345678")).toBe(2);
    expect(estimator.estimate("hello world")).toBe(3);
  });

  it("ignores the model parameter for the generic estimate", () => {
    expect(estimator.estimate("hello world", "gpt-4.1")).toBe(3);
  });
});
