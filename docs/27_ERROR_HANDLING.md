# Atlas AI

# Error Handling Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** Error Handling Specification  
**Priority:** Critical  
**Owner:** Platform Engineering Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the global error handling strategy for Atlas AI.

Every service, API endpoint, AI provider, MCP integration, background worker, and client application
must implement consistent, predictable, and observable error handling.

---

# 2. Objectives

The error handling system shall provide:

- Predictable API responses
- Consistent error formats
- Centralized logging
- Automatic monitoring
- User-friendly messages
- Secure error reporting
- Fast troubleshooting
- Automatic recovery where possible

---

# 3. Error Handling Principles

Atlas AI follows these principles:

- Fail Fast
- Fail Secure
- Never Leak Sensitive Data
- Log Every Unexpected Error
- Recover When Possible
- Retry Only Safe Operations
- Standardize Responses
- Keep Errors Observable

---

# 4. Error Categories

Errors are classified into:

### Client Errors

- Validation Errors
- Authentication Errors
- Authorization Errors
- Invalid Requests
- Resource Not Found
- Conflict Errors

### Server Errors

- Internal Exceptions
- Database Failures
- Storage Failures
- Cache Failures
- Queue Failures

### External Errors

- AI Provider Failures
- MCP Failures
- Payment Provider Errors
- Email Provider Errors
- OAuth Errors

### Infrastructure Errors

- Network Failures
- Timeout Errors
- DNS Errors
- Container Failures

---

# 5. HTTP Status Codes

Supported status codes:

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |
| 504  | Gateway Timeout       |

---

# 6. Standard API Error Format

Every API error must return:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "details": [],
    "traceId": "uuid",
    "timestamp": "ISO8601"
  }
}
```

The format must remain identical across all services.

---

# 7. Error Codes

Examples:

```
AUTH_INVALID_TOKEN

AUTH_SESSION_EXPIRED

USER_NOT_FOUND

PROJECT_NOT_FOUND

TASK_NOT_FOUND

FILE_TOO_LARGE

FILE_NOT_SUPPORTED

AI_PROVIDER_ERROR

AI_TIMEOUT

MCP_SERVER_UNAVAILABLE

MEMORY_ERROR

DATABASE_ERROR

CACHE_ERROR

UNKNOWN_ERROR
```

Each code must be unique and documented.

---

# 8. Validation Errors

Validation must occur before business logic.

Checks include:

- Required Fields
- String Length
- Number Ranges
- Enum Values
- Date Validation
- File Size
- File Type
- JSON Schema

Validation failures must return HTTP 422.

---

# 9. Authentication Errors

Possible failures:

- Missing Token
- Invalid Token
- Expired Token
- Revoked Session
- Invalid OAuth Provider

Return:

HTTP 401

---

# 10. Authorization Errors

Examples:

- Missing Permission
- Workspace Access Denied
- Admin Privileges Required
- Subscription Restriction

Return:

HTTP 403

---

# 11. Database Errors

Typical failures:

- Connection Failure
- Deadlock
- Constraint Violation
- Transaction Failure
- Migration Failure

Sensitive SQL information must never be exposed.

---

# 12. AI Provider Errors

Possible failures:

- Timeout
- Rate Limit
- Invalid API Key
- Model Unavailable
- Provider Offline
- Invalid Response

Recovery strategy:

- Retry
- Fallback Provider
- Queue Request
- Notify User

---

# 13. MCP Errors

Possible failures:

- Tool Not Found
- Permission Denied
- Connection Failed
- Execution Timeout
- Invalid Parameters

The MCP Gateway must normalize all provider-specific errors.

---

# 14. Retry Policy

Retries are allowed only for transient failures.

Default strategy:

- Attempt 1
- Retry after 1 second
- Retry after 2 seconds
- Retry after 4 seconds

Maximum retries:

3

Idempotency must be preserved.

---

# 15. Timeout Policy

Default timeouts:

Authentication

5 seconds

Database

10 seconds

AI Providers

60 seconds

MCP

30 seconds

Storage

30 seconds

---

# 16. Logging

Every unexpected error must log:

- Timestamp
- Service
- User ID (if available)
- Request ID
- Trace ID
- Error Code
- Stack Trace
- Environment

Sensitive information must be redacted.

---

# 17. Monitoring

Every error must produce:

- Structured Log
- Metric
- Trace
- Alert (critical only)

Critical failures must trigger incident notifications.

---

# 18. User Experience

Users should receive:

- Friendly messages
- Retry suggestions
- Recovery guidance

Users must never see stack traces or internal implementation details.

---

# 19. Mobile Client Handling

The mobile application must:

- Handle offline mode
- Retry safe requests
- Cache failed operations
- Display meaningful messages
- Support automatic recovery

The application must never crash due to an API error.

---

# 20. Background Jobs

Background workers must:

- Retry transient failures
- Dead-letter unrecoverable jobs
- Log failures
- Generate metrics

---

# 21. Security

Errors must never expose:

- API Keys
- Passwords
- JWT Secrets
- SQL Queries
- Internal File Paths
- Stack Traces
- Infrastructure Details

---

# 22. Testing Requirements

Every module must include tests for:

- Validation Errors
- Authentication Errors
- Authorization Errors
- Database Failures
- AI Failures
- MCP Failures
- Timeout Handling
- Retry Logic

---

# 23. Acceptance Criteria

The error handling system is accepted only if:

- all errors use the standard format;
- no sensitive data is exposed;
- logging is centralized;
- monitoring is operational;
- retries behave correctly;
- automated tests pass.

---

# 24. Definition of Done

Error handling is complete when:

- standardized;
- documented;
- tested;
- monitored;
- secure;
- production ready.

---

# 25. OpenCode Instructions

OpenCode MUST:

- implement centralized exception handling;
- use the standard API error schema;
- assign unique error codes;
- never expose sensitive information;
- implement retry logic only where safe;
- log every unexpected exception;
- integrate with monitoring and tracing;
- reject implementations that violate this specification.

This document is mandatory for every Atlas AI service, API, background worker, and client
application.
