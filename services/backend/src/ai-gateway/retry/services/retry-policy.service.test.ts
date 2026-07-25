import { describe, it, expect, beforeEach } from "vitest";
import { RetryPolicyServiceImpl } from "./retry-policy.service.js";

describe("RetryPolicyServiceImpl", () => {
  let service: RetryPolicyServiceImpl;

  beforeEach(() => {
    service = new RetryPolicyServiceImpl();
  });

  it("should create policy with default config", () => {
    const policy = service.getOrCreate("test");
    expect(policy.config.maxRetries).toBe(3);
    expect(policy.config.baseDelayMs).toBe(1000);
    expect(policy.config.jitter).toBe(true);
  });

  it("should respect custom config", () => {
    const policy = service.getOrCreate("test", { maxRetries: 5, baseDelayMs: 500, jitter: false });
    expect(policy.config.maxRetries).toBe(5);
    expect(policy.config.baseDelayMs).toBe(500);
  });

  it("should return same policy for same name", () => {
    const policy1 = service.getOrCreate("test");
    const policy2 = service.getOrCreate("test", { maxRetries: 10 });
    expect(policy1).toBe(policy2);
    expect(policy1.config.maxRetries).toBe(3);
  });

  it("should calculate exponential backoff delay", () => {
    const policy = service.getOrCreate("test", { jitter: false, baseDelayMs: 1000 });

    expect(policy.getDelay(0)).toBe(1000);
    expect(policy.getDelay(1)).toBe(2000);
    expect(policy.getDelay(2)).toBe(4000);
  });

  it("should cap delay at maxDelayMs", () => {
    const policy = service.getOrCreate("test", { jitter: false, baseDelayMs: 1000, maxDelayMs: 5000 });

    expect(policy.getDelay(3)).toBe(5000);
  });

  it("should add jitter to delay", () => {
    const policy = service.getOrCreate("test", { jitter: true, baseDelayMs: 1000 });

    const delay = policy.getDelay(0);
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1250);
  });

  it("should determine retryable status codes", () => {
    const policy = service.getOrCreate("test");

    expect(policy.shouldRetry(0, 429)).toBe(true);
    expect(policy.shouldRetry(0, 500)).toBe(true);
    expect(policy.shouldRetry(0, 502)).toBe(true);
    expect(policy.shouldRetry(0, 200)).toBe(false);
    expect(policy.shouldRetry(0, 400)).toBe(false);
  });

  it("should stop retrying after maxRetries", () => {
    const policy = service.getOrCreate("test", { maxRetries: 2 });

    expect(policy.shouldRetry(0, 500)).toBe(true);
    expect(policy.shouldRetry(1, 500)).toBe(true);
    expect(policy.shouldRetry(2, 500)).toBe(false);
  });

  it("should return config for existing policy", () => {
    service.getOrCreate("test");
    const config = service.getConfig("test");
    expect(config).not.toBeNull();
    if (config !== null) {
      expect(config.maxRetries).toBe(3);
    }
  });

  it("should return null config for nonexistent policy", () => {
    expect(service.getConfig("nonexistent")).toBeNull();
  });
});
