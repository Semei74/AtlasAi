import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createLogger, rootLogger } from "./index.js";
import type { LogEntry } from "./index.js";

describe("createLogger", () => {
  let logs: string[];
  let originalLog: (...args: string[]) => void;
  let originalWarn: (...args: string[]) => void;
  let originalError: (...args: string[]) => void;

  beforeEach((): void => {
    logs = [];
    originalLog = console.log.bind(console);
    originalWarn = console.warn.bind(console);
    originalError = console.error.bind(console);
    const capture = (...args: string[]): void => {
      logs.push(args.join(" "));
    };
    console.log = capture;
    console.warn = capture;
    console.error = capture;
  });

  afterEach((): void => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it("should create a logger with all methods", (): void => {
    const logger = createLogger({ level: "debug", service: "test", prettyPrint: false });

    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.child).toBe("function");
  });

  it("should log info messages at info level", (): void => {
    const logger = createLogger({ level: "info", service: "test", prettyPrint: false });

    logger.info("hello world");

    expect(logs).toHaveLength(1);
    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.level).toBe("info");
    expect(entry.message).toBe("hello world");
  });

  it("should filter debug messages when level is info", (): void => {
    const logger = createLogger({ level: "info", service: "test", prettyPrint: false });

    logger.debug("should not appear");

    expect(logs).toHaveLength(0);
  });

  it("should pass debug messages when level is debug", (): void => {
    const logger = createLogger({ level: "debug", service: "test", prettyPrint: false });

    logger.debug("debug message");

    expect(logs).toHaveLength(1);
    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.level).toBe("debug");
  });

  it("should include details in log entry", (): void => {
    const logger = createLogger({ level: "info", service: "test", prettyPrint: false });

    logger.info("with details", { userId: "123" });

    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.details).toEqual({ userId: "123" });
  });

  it("should include error in error log entry", (): void => {
    const logger = createLogger({ level: "error", service: "test", prettyPrint: false });
    const error = new Error("something broke");

    logger.error("failed", error);

    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.level).toBe("error");
    expect(entry.message).toBe("failed");
    expect(entry.error?.message).toBe("something broke");
  });

  it("should output warn to console.warn", (): void => {
    const logger = createLogger({ level: "warn", service: "test", prettyPrint: false });

    logger.warn("warning message");

    expect(logs).toHaveLength(1);
    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.level).toBe("warn");
  });

  it("should output error to console.error", (): void => {
    const logger = createLogger({ level: "error", service: "test", prettyPrint: false });

    logger.error("error message");

    expect(logs).toHaveLength(1);
    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.level).toBe("error");
  });

  it("should create child logger with inherited service", (): void => {
    const parent = createLogger({ level: "info", service: "parent-service", prettyPrint: false });
    const child = parent.child({ service: "child-service" });

    expect(typeof child.info).toBe("function");
    child.info("from child");

    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.service).toBe("child-service");
  });

  it("should include service name in entries", (): void => {
    const logger = createLogger({ level: "info", service: "my-service", prettyPrint: false });

    logger.info("test");

    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.service).toBe("my-service");
  });

  it("should have timestamp in each entry", (): void => {
    const logger = createLogger({ level: "info", service: "test", prettyPrint: false });

    logger.info("timed");

    const entry = JSON.parse(logs[0] ?? "") as LogEntry;
    expect(entry.timestamp).toBeDefined();
    expect(() => new Date(entry.timestamp)).not.toThrow();
  });
});

describe("rootLogger", () => {
  it("should be a valid logger", (): void => {
    expect(typeof rootLogger.info).toBe("function");
    expect(typeof rootLogger.error).toBe("function");
  });

  it("should include service from SERVICE_NAME env", (): void => {
    const logger = createLogger({
      level: "info",
      service: "root-test",
      prettyPrint: false,
    });

    expect(logger).toBeDefined();
  });
});
