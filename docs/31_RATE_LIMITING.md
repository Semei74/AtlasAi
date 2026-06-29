# Atlas AI

# Rate Limiting Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** Rate Limiting Specification  
**Priority:** Critical  
**Owner:** Platform Engineering Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the rate limiting strategy for Atlas AI.

Rate limiting protects the platform from abuse, ensures fair resource allocation, prevents
denial-of-service attacks, and controls AI infrastructure costs.

---

# 2. Objectives

The rate limiting system shall provide:

- Abuse prevention
- Fair usage
- Infrastructure protection
- AI cost control
- API stability
- User isolation
- Subscription enforcement
- Automatic throttling

---

# 3. Architecture

```
Client
   │
   ▼
API Gateway
   │
   ▼
Rate Limiter
   │
   ├──────────────┐
   ▼              ▼
Redis Store    Request Handler
```

Redis is the authoritative storage for distributed rate limiting.

---

# 4. Guiding Principles

Atlas AI follows these principles:

- Deny excessive requests
- Never block valid traffic unnecessarily
- Enforce subscription limits
- Apply limits consistently
- Support distributed deployments
- Use centralized counters
- Prefer graceful degradation

---

# 5. Scope

Rate limiting applies to:

- REST API
- Authentication
- AI Requests
- File Uploads
- Search
- OCR
- MCP Tools
- Background APIs
- Webhooks
- Admin APIs

---

# 6. Rate Limit Keys

Limits may be applied by:

- User ID
- Workspace ID
- API Key
- IP Address
- Device ID
- Subscription Plan
- Endpoint
- AI Provider

Multiple keys may be combined.

---

# 7. Algorithms

Supported algorithms:

- Fixed Window
- Sliding Window
- Token Bucket

Default algorithm:

Sliding Window

---

# 8. Subscription Limits

Example policy:

Free

- 60 requests/minute
- 10 AI requests/hour

Starter

- 300 requests/minute
- 250 AI requests/day

Professional

- 1000 requests/minute
- Higher AI quotas

Business

- Custom limits

Enterprise

- Contract-defined limits

Actual limits are configured server-side.

---

# 9. Endpoint Categories

Critical

- Login
- Refresh Token
- Logout

Standard

- CRUD APIs
- Search
- Chat

Expensive

- AI Generation
- OCR
- Large File Processing

Administrative

- Admin APIs
- Audit APIs

Each category has independent limits.

---

# 10. AI Rate Limiting

Limits must consider:

- Request count
- Token usage
- Model cost
- Concurrent requests
- Daily quota
- Monthly quota

Expensive models may enforce stricter limits.

---

# 11. Burst Handling

Short bursts are allowed.

Example:

Steady rate:

100 requests/minute

Burst capacity:

150 requests

The burst bucket refills gradually.

---

# 12. Response Format

When a limit is exceeded:

HTTP Status

429 Too Many Requests

Response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Request limit exceeded.",
    "retryAfter": 60
  }
}
```

---

# 13. Response Headers

Responses should include:

```
X-RateLimit-Limit

X-RateLimit-Remaining

X-RateLimit-Reset

Retry-After
```

---

# 14. Distributed Operation

The rate limiter must support:

- Multiple API instances
- Shared Redis
- Horizontal scaling
- Atomic updates

Counters must remain consistent across all nodes.

---

# 15. Monitoring

Monitor:

- Blocked Requests
- Allowed Requests
- Active Counters
- Redis Latency
- AI Quota Usage
- Abuse Attempts

Alerts must trigger on abnormal traffic.

---

# 16. Logging

Log:

- User ID
- Workspace ID
- Endpoint
- Limit Type
- Remaining Quota
- IP Address
- Timestamp
- Correlation ID

Logs must be structured.

---

# 17. Security

The rate limiter must protect against:

- Brute-force attacks
- Credential stuffing
- API abuse
- AI abuse
- Bot traffic
- Denial-of-service attempts

---

# 18. Failure Policy

If Redis becomes unavailable:

- Fail open for low-risk endpoints
- Fail closed for authentication endpoints
- Generate alerts
- Restore counters automatically

The policy must be configurable.

---

# 19. Testing

Required tests:

- Per-user limits
- Per-IP limits
- Burst traffic
- Concurrent requests
- Distributed deployment
- Redis failure
- Subscription limits
- 429 responses

---

# 20. Acceptance Criteria

The rate limiting system is accepted only if:

- limits are enforced consistently;
- distributed counters remain accurate;
- abuse is prevented;
- monitoring is operational;
- subscription quotas work correctly;
- automated tests pass.

---

# 21. Definition of Done

Rate limiting is complete when:

- implemented;
- documented;
- tested;
- monitored;
- horizontally scalable;
- production ready.

---

# 22. OpenCode Instructions

OpenCode MUST:

- implement distributed rate limiting using Redis;
- use the Sliding Window algorithm by default;
- support subscription-based quotas;
- return standardized HTTP 429 responses;
- expose rate limit headers;
- monitor abuse metrics;
- support horizontal scaling;
- reject implementations that violate this specification.

This document is mandatory for every public Atlas AI API endpoint.
