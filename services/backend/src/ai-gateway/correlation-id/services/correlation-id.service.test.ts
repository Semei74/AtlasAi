import { describe, it, expect, beforeEach } from "vitest";
import { CorrelationIdServiceImpl } from "./correlation-id.service.js";

describe("CorrelationIdServiceImpl", () => {
  let service: CorrelationIdServiceImpl;

  beforeEach(() => {
    service = new CorrelationIdServiceImpl();
  });

  it("should generate a UUID", () => {
    const id = service.generate();
    expect(id).toBeDefined();
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique IDs", () => {
    const id1 = service.generate();
    const id2 = service.generate();
    expect(id1).not.toBe(id2);
  });

  it("should return generated ID when none is set", () => {
    const id = service.get();
    expect(id).toBeDefined();
    expect(id.length).toBeGreaterThan(0);
  });

  it("should return set ID", () => {
    service.set("test-id-123");
    expect(service.get()).toBe("test-id-123");
  });

  it("should have default config", () => {
    expect(service.config.headerName).toBe("x-correlation-id");
    expect(service.config.injectInResponse).toBe(true);
    expect(service.config.responseHeaderName).toBe("x-correlation-id");
  });

  it("should reset storage", () => {
    service.set("test-id");
    service.reset();
    const newId = service.get();
    expect(newId).not.toBe("test-id");
  });
});
