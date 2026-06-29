import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ConfigLoader } from "./index.js";
import type { ConfigSource } from "./index.js";

describe("ConfigLoader", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load string config from environment", () => {
    process.env["TEST_KEY"] = "hello";

    const loader = new ConfigLoader();
    const config = loader.load({
      TEST_KEY: { type: "string", required: true },
    });

    expect(config["TEST_KEY"]).toBe("hello");
  });

  it("should load number config", () => {
    process.env["PORT"] = "3000";

    const loader = new ConfigLoader();
    const config = loader.load({
      PORT: { type: "number", required: true },
    });

    expect(config["PORT"]).toBe(3000);
  });

  it("should load boolean config", () => {
    process.env["DEBUG"] = "true";

    const loader = new ConfigLoader();
    const config = loader.load({
      DEBUG: { type: "boolean", required: true },
    });

    expect(config["DEBUG"]).toBe(true);
  });

  it("should use default value when env not set", () => {
    const loader = new ConfigLoader();
    const config = loader.load({
      TIMEOUT: { type: "number", default: 5000 },
    });

    expect(config["TIMEOUT"]).toBe(5000);
  });

  it("should throw on missing required config", () => {
    const loader = new ConfigLoader();

    expect(() => {
      loader.load({
        REQUIRED_KEY: { type: "string", required: true },
      });
    }).toThrow("Configuration validation failed");
  });

  it("should throw on invalid number", () => {
    process.env["PORT"] = "not-a-number";
    const loader = new ConfigLoader();

    expect(() => {
      loader.load({
        PORT: { type: "number", required: true },
      });
    }).toThrow("expected number");
  });

  it("should cache config after loading", () => {
    process.env["KEY"] = "value";
    const loader = new ConfigLoader();
    const first = loader.load({
      KEY: { type: "string", required: true },
    });
    const second = loader.load({
      KEY: { type: "string", required: true },
    });

    expect(first).toEqual(second);
  });

  it("should support custom source", () => {
    const customSource: ConfigSource = {
      get(key: string): string | undefined {
        return key === "CUSTOM_KEY" ? "custom" : undefined;
      },
      has(key: string): boolean {
        return key === "CUSTOM_KEY";
      },
    };

    const loader = new ConfigLoader(customSource);
    const config = loader.load({
      CUSTOM_KEY: { type: "string", required: true },
    });

    expect(config["CUSTOM_KEY"]).toBe("custom");
  });
});
