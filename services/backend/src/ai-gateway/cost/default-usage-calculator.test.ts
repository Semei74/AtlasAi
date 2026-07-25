import { describe, it, expect, vi } from "vitest";
import type { TokenEstimator } from "./interfaces/token-estimator.interface.js";
import { DefaultUsageCalculator } from "./default-usage-calculator.js";

function makeEstimator(): TokenEstimator {
  return {
    estimate: vi.fn((text: string) => (text.length === 0 ? 0 : Math.ceil(text.length / 4))),
  };
}

describe("DefaultUsageCalculator", () => {
  it("maps provider usage to token counts", () => {
    const calculator = new DefaultUsageCalculator(makeEstimator());

    expect(
      calculator.fromProvider({ promptTokens: 10, completionTokens: 20, totalTokens: 30 }),
    ).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 });
  });

  it("estimates token counts from text", () => {
    const calculator = new DefaultUsageCalculator(makeEstimator());

    expect(calculator.estimate("hello world", "world")).toEqual({
      promptTokens: 3,
      completionTokens: 2,
      totalTokens: 5,
    });
  });

  it("estimates zero tokens for empty text", () => {
    const calculator = new DefaultUsageCalculator(makeEstimator());

    expect(calculator.estimate("", "")).toEqual({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });
  });
});
