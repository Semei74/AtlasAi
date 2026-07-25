import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { ConfigModule, CONFIG_LOADER } from "./config.module.js";
import type { ConfigLoader } from "@atlas/config";

describe("ConfigModule", () => {
  it("should provide CONFIG_LOADER", async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    const configLoader = module.get<ConfigLoader>(CONFIG_LOADER);
    expect(configLoader).toBeDefined();
  });

  it("should provide a ConfigLoader instance", async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    const configLoader = module.get<ConfigLoader>(CONFIG_LOADER);
    expect(typeof configLoader.load).toBe("function");
    expect(typeof configLoader.get).toBe("function");
    expect(typeof configLoader.require).toBe("function");
  });

  it("should load config from environment", async () => {
    process.env["TEST_CONFIG_KEY"] = "test_value";

    const module = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    const configLoader = module.get<ConfigLoader>(CONFIG_LOADER);
    const config = configLoader.load({
      TEST_CONFIG_KEY: { type: "string", required: true },
    });

    expect(config["TEST_CONFIG_KEY"]).toBe("test_value");

    delete process.env["TEST_CONFIG_KEY"];
  });
});
