import { describe, it, expect } from "vitest";
import { DefaultCostCalculator } from "./default-cost-calculator.js";

describe("DefaultCostCalculator", () => {
  const calculator = new DefaultCostCalculator();

  it("computes input and output cost", () => {
    const pricing = { inputPerToken: 0.000002, outputPerToken: 0.000008 };

    expect(calculator.calculate({ promptTokens: 1000, completionTokens: 500 }, pricing)).toBeCloseTo(0.002 + 0.004);
  });

  it("applies cached input rate when present", () => {
    const pricing = {
      inputPerToken: 0.000002,
      outputPerToken: 0.000008,
      cachedInputPerToken: 0.000001,
    };

    expect(calculator.calculate({ promptTokens: 1000, completionTokens: 500, cachedTokens: 200 }, pricing)).toBeCloseTo(
      0.002 + 0.004 + 0.0002,
    );
  });

  it("falls back to input rate when cached rate is missing", () => {
    const pricing = { inputPerToken: 0.000002, outputPerToken: 0.000008 };

    expect(calculator.calculate({ promptTokens: 1000, completionTokens: 500, cachedTokens: 200 }, pricing)).toBeCloseTo(
      0.002 + 0.004 + 0.0004,
    );
  });
});
