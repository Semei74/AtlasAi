import { describe, it, expect } from "vitest";
import { APP_PIPE } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { IsString } from "class-validator";
import { ValidationPipeProvider } from "./validation-pipe.provider.js";

interface TestableProvider {
  provide: string;
  useFactory: () => ValidationPipe;
}

function getPipe(): ValidationPipe {
  const provider = ValidationPipeProvider as TestableProvider;
  return provider.useFactory();
}

class TestDto {
  @IsString()
  public name!: string;
}

describe("ValidationPipeProvider", () => {
  it("should register with APP_PIPE token", () => {
    const provider = ValidationPipeProvider as { provide: string };
    expect(provider.provide).toBe(APP_PIPE);
  });

  it("should create a ValidationPipe instance", () => {
    const pipe = getPipe();
    expect(pipe).toBeInstanceOf(ValidationPipe);
  });

  it("should pass whitelisted properties", async () => {
    const pipe = getPipe();

    await expect(
      pipe.transform({ name: "test" }, { type: "body", metatype: TestDto }),
    ).resolves.toMatchObject({ name: "test" });
  });

  it("should throw when forbidNonWhitelisted is violated", async () => {
    const pipe = getPipe();

    await expect(
      pipe.transform(
        { name: "test", extraField: "should be rejected" },
        { type: "body", metatype: TestDto },
      ),
    ).rejects.toThrow();
  });

  it("should transform plain objects to class instances", async () => {
    const pipe = getPipe();

    const result = (await pipe.transform(
      { name: "hello" },
      { type: "body", metatype: TestDto },
    )) as TestDto;

    expect(result).toBeInstanceOf(TestDto);
  });

  it("should throw on invalid type", async () => {
    const pipe = getPipe();

    await expect(
      pipe.transform({ name: 123 }, { type: "body", metatype: TestDto }),
    ).rejects.toThrow();
  });
});
