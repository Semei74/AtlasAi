import { describe, it, expect, beforeEach } from "vitest";
import { RequestLimitsServiceImpl } from "./request-limits.service.js";

describe("RequestLimitsServiceImpl", () => {
  let service: RequestLimitsServiceImpl;

  beforeEach(() => {
    service = new RequestLimitsServiceImpl();
  });

  it("should allow prompt within limits", () => {
    const result = service.validatePrompt("default", "short prompt");
    expect(result.allowed).toBe(true);
  });

  it("should reject excessive prompt", () => {
    const longPrompt = "x".repeat(200000);
    const result = service.validatePrompt("default", longPrompt);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should allow response within limits", () => {
    const result = service.validateResponse("default", "short response");
    expect(result.allowed).toBe(true);
  });

  it("should reject excessive response", () => {
    const longResponse = "x".repeat(200000);
    const result = service.validateResponse("default", longResponse);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should allow context within limits", () => {
    const result = service.validateContext("default", "short context");
    expect(result.allowed).toBe(true);
  });

  it("should reject excessive context", () => {
    const longContext = "x".repeat(300000);
    const result = service.validateContext("default", longContext);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should allow attachments within limits", () => {
    const result = service.validateAttachments("default", 5);
    expect(result.allowed).toBe(true);
  });

  it("should reject excessive attachments", () => {
    const result = service.validateAttachments("default", 15);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should allow streaming duration within limits", () => {
    const result = service.validateStreamingDuration("default", 100000);
    expect(result.allowed).toBe(true);
  });

  it("should reject excessive streaming duration", () => {
    const result = service.validateStreamingDuration("default", 600000);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should allow messages within limits", () => {
    const result = service.validateMessages("default", 10);
    expect(result.allowed).toBe(true);
  });

  it("should reject excessive messages", () => {
    const result = service.validateMessages("default", 200);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should create named limits with custom config", () => {
    const limits = service.getOrCreate("custom", {
      maxPromptLength: 100,
      maxResponseLength: 100,
    });

    expect(limits.config.maxPromptLength).toBe(100);
    expect(limits.config.maxResponseLength).toBe(100);
  });

  it("should reuse existing named limits", () => {
    const limits1 = service.getOrCreate("test", { maxPromptLength: 50 });
    const limits2 = service.getOrCreate("test", { maxPromptLength: 99999 });

    expect(limits1).toBe(limits2);
    expect(limits1.config.maxPromptLength).toBe(50);
  });

  it("should report correct current and limit values", () => {
    const result = service.validatePrompt("default", "test");
    expect(result.current).toBe(4);
    expect(result.limit).toBe(128000);
  });
});
