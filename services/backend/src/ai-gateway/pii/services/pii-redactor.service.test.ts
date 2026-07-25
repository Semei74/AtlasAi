import { describe, it, expect, beforeEach } from "vitest";
import { PiiRedactorService } from "./pii-redactor.service.js";

describe("PiiRedactorService", () => {
  let service: PiiRedactorService;

  beforeEach(() => {
    service = new PiiRedactorService();
  });

  it("should redact email addresses", () => {
    const result = service.redact("Contact me at test@example.com");
    expect(result.text).toBe("Contact me at [REDACTED_EMAIL]");
    expect(result.redactedFields).toContain("email");
    expect(result.redactionCount).toBe(1);
  });

  it("should redact phone numbers", () => {
    const result = service.redact("Call me at 555-123-4567");
    expect(result.text).toContain("[REDACTED_PHONE]");
    expect(result.redactedFields).toContain("phone");
  });

  it("should redact SSN", () => {
    const result = service.redact("SSN: 123-45-6789");
    expect(result.text).toContain("[REDACTED_SSN]");
    expect(result.redactedFields).toContain("ssn");
  });

  it("should redact credit card numbers", () => {
    const result = service.redact("Card: 4111-1111-1111-1111");
    expect(result.text).toContain("[REDACTED_CARD]");
    expect(result.redactedFields).toContain("credit_card");
  });

  it("should redact IBAN", () => {
    const result = service.redact("IBAN: GB29NWBK60161331926819");
    expect(result.text).toContain("[REDACTED_IBAN]");
    expect(result.redactedFields).toContain("iban");
  });

  it("should redact IP addresses", () => {
    const result = service.redact("IP: 192.168.1.1");
    expect(result.text).toContain("[REDACTED_IP]");
    expect(result.redactedFields).toContain("ip_address");
  });

  it("should redact API keys", () => {
    const result = service.redact("Key: sk-abc123def456ghi789jkl012");
    expect(result.text).toContain("[REDACTED_KEY]");
    expect(result.redactedFields).toContain("api_key");
  });

  it("should redact passwords", () => {
    const result = service.redact("password=supersecret123");
    expect(result.text).toContain("[REDACTED_CREDENTIAL]");
    expect(result.redactedFields).toContain("password");
  });

  it("should redact authorization headers", () => {
    const result = service.redact("Authorization: Bearer token123");
    expect(result.text).toBe("Authorization: [REDACTED]");
  });

  it("should redact JWT tokens", () => {
    const result = service.redact("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNqP2J3yVg");
    expect(result.text).toContain("[REDACTED_JWT]");
    expect(result.redactedFields).toContain("jwt_token");
  });

  it("should handle text with no PII", () => {
    const result = service.redact("This is normal text with no sensitive data.");
    expect(result.text).toBe("This is normal text with no sensitive data.");
    expect(result.redactedFields).toHaveLength(0);
    expect(result.redactionCount).toBe(0);
  });

  it("should add custom patterns", () => {
    service.addPattern({ name: "custom", pattern: /FOO/g, replacement: "[REDACTED]" });
    const result = service.redact("FOO BAR");
    expect(result.text).toContain("[REDACTED]");
    expect(result.redactedFields).toContain("custom");
  });

  it("should return all patterns", () => {
    const patterns = service.getPatterns();
    expect(patterns.length).toBeGreaterThan(5);
  });

  it("should track redaction count", () => {
    const result = service.redact("test@a.com and another@b.com");
    expect(result.redactionCount).toBe(2);
  });
});
