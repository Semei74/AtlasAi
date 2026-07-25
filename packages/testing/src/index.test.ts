import { describe, it, expect } from "vitest";
import { createMockLogger, noopLogger, expectRejection, generateId, delay } from "./index.js";

describe("createMockLogger", () => {
  it("should create a logger that records messages", (): void => {
    const logger = createMockLogger();

    logger.info("test message");

    expect(logger.messages).toHaveLength(1);
    expect(logger.messages[0]?.level).toBe("info");
    expect(logger.messages[0]?.message).toBe("test message");
  });

  it("should record debug messages", (): void => {
    const logger = createMockLogger();

    logger.debug("debug test");

    expect(logger.messages[0]?.level).toBe("debug");
  });

  it("should record warn messages", (): void => {
    const logger = createMockLogger();

    logger.warn("warn test");

    expect(logger.messages[0]?.level).toBe("warn");
  });

  it("should record error messages with error details", (): void => {
    const logger = createMockLogger();
    const error = new Error("fail");

    logger.error("error test", error, { context: "test" });

    expect(logger.messages[0]?.level).toBe("error");
    expect(logger.messages[0]?.error).toBe(error);
    expect(logger.messages[0]?.details).toEqual({ context: "test" });
  });

  it("should record details when provided", (): void => {
    const logger = createMockLogger();

    logger.info("with details", { key: "value" });

    expect(logger.messages[0]?.details).toEqual({ key: "value" });
  });

  it("should reset messages", (): void => {
    const logger = createMockLogger();

    logger.info("msg1");
    logger.info("msg2");
    expect(logger.messages).toHaveLength(2);

    logger.reset();
    expect(logger.messages).toHaveLength(0);
  });

  it("should create child logger with empty messages", (): void => {
    const logger = createMockLogger();
    const child = logger.child({});

    child.info("child msg");

    expect(child.messages.length).toBe(1);
    expect(child.messages.at(0)?.message).toBe("child msg");
  });

  it("should log multiple messages in order", (): void => {
    const logger = createMockLogger();

    logger.info("first");
    logger.warn("second");
    logger.error("third");

    const messages = logger.messages;
    expect(messages[0]?.message).toBe("first");
    expect(messages[1]?.message).toBe("second");
    expect(messages[2]?.message).toBe("third");
  });
});

describe("noopLogger", () => {
  it("should not throw on any method", (): void => {
    const logger = noopLogger();

    function verify(): void {
      logger.debug("test");
      logger.info("test");
      logger.warn("test");
      logger.error("test");
      logger.child({});
    }

    expect(verify).not.toThrow();
  });

  it("should return a logger from child()", (): void => {
    const logger = noopLogger();
    const child = logger.child({});

    expect(typeof child.info).toBe("function");
  });
});

describe("expectRejection", () => {
  it("should catch a rejected promise", async (): Promise<void> => {
    const error = await expectRejection((): Promise<never> => {
      throw new Error("boom");
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("boom");
  });

  it("should verify error type", async (): Promise<void> => {
    const error = await expectRejection(
      (): Promise<never> => {
        throw new TypeError("type error");
      },
      TypeError as new (...args: unknown[]) => Error,
    );

    expect(error).toBeInstanceOf(TypeError);
  });

  it("should throw if function does not reject", async (): Promise<void> => {
    const error = await expectRejection((): Promise<void> => Promise.resolve());

    expect(error.message).toBe("Expected function to throw");
  });
});

describe("generateId", () => {
  it("should generate a string starting with test_", (): void => {
    const id = generateId();

    expect(id).toMatch(/^test_\d+_[a-z0-9]+$/);
  });

  it("should generate unique ids", (): void => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));

    expect(ids.size).toBe(100);
  });
});

describe("delay", () => {
  it("should wait approximately the specified time", async (): Promise<void> => {
    const start = Date.now();

    await delay(10);

    expect(Date.now() - start).toBeGreaterThanOrEqual(5);
  });

  it("should resolve to undefined", async (): Promise<void> => {
    await delay(1);
  });
});
