# Atlas AI

# Cache Strategy Specification

**Version:** 1.0.0 **Status:** Approved **Document Type:** Cache Strategy Specification
**Priority:** Critical **Owner:** Platform Engineering Team **Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the caching architecture for Atlas AI.

Caching is used to reduce latency, decrease infrastructure costs, improve scalability, and minimize
unnecessary requests to databases, AI providers, and external services.

---

# 2. Objectives

The cache layer shall provide:

- Low latency
- High availability
- Horizontal scalability
- Reduced database load
- Reduced AI provider requests
- Faster API responses
- Predictable cache invalidation

---

# 3. Architecture

```
Mobile Client
      │
      ▼
 API Gateway
      │
      ▼
 Backend Services
      │
      ▼
 Redis Cache
      │
 ┌────┴────┐
 ▼         ▼
Database  AI Providers
```

Redis is the primary distributed cache.

---

# 4. Cache Principles

Atlas AI follows these principles:

- Cache Frequently Read Data
- Never Cache Sensitive Secrets
- Cache Before Database
- Short TTL by Default
- Explicit Invalidation
- Event-Based Refresh
- Avoid Stale Data

---

# 5. Cache Levels

Level 1

Application Memory Cache

Purpose:

- Frequently accessed configuration
- Static metadata

---

Level 2

Distributed Redis Cache

Purpose:

- API responses
- User sessions
- Authentication
- AI context
- Search results
- Workspace metadata

---

Level 3

Client Cache

Flutter local storage

Purpose:

- Recent chats
- User preferences
- Offline support
- Images
- Configuration

---

# 6. Cached Resources

The following resources may be cached:

- User Profile
- Workspace Settings
- Project Metadata
- Task Lists
- Conversation Metadata
- Search Results
- AI Model Metadata
- Prompt Templates
- Feature Flags
- Configuration
- MCP Capabilities

---

# 7. Resources That Must Never Be Cached

The following data must not be cached:

- Passwords
- API Keys
- JWT Secrets
- Refresh Tokens
- Encryption Keys
- Payment Credentials
- Private Files
- Security Logs

---

# 8. Cache Keys

Naming convention:

```
user:{id}

workspace:{id}

project:{id}

task:{id}

conversation:{id}

memory:{id}

search:{hash}

config:{name}

feature:{flag}

ai:model:{provider}

mcp:server:{id}
```

Keys must remain globally unique.

---

# 9. TTL Policy

Recommended defaults:

| Resource       | TTL        |
| -------------- | ---------- |
| Configuration  | 24 hours   |
| Feature Flags  | 10 minutes |
| User Profile   | 30 minutes |
| Workspace      | 30 minutes |
| Projects       | 15 minutes |
| Tasks          | 10 minutes |
| Search Results | 5 minutes  |
| AI Metadata    | 1 hour     |
| MCP Metadata   | 30 minutes |

---

# 10. Cache Invalidation

Invalidation methods:

- Manual
- Event Driven
- Time Expiration
- Write Through
- Write Around
- Cache Busting

Updates must invalidate affected cache entries immediately.

---

# 11. Session Cache

Session data includes:

- User Session
- OAuth State
- Refresh Tokens
- Rate Limits

Sessions must expire automatically.

---

# 12. AI Cache

The platform may cache:

- Model metadata
- Pricing
- Token limits
- Prompt templates

Generated AI responses must not be globally shared between users.

---

# 13. Search Cache

Search cache stores:

- Recent queries
- Ranked results
- Autocomplete

Maximum TTL:

5 minutes

---

# 14. Database Cache

Frequently accessed database objects may be cached.

Examples:

- User profile
- Workspace metadata
- Subscription plan
- Permissions

Database writes invalidate corresponding cache entries.

---

# 15. Distributed Cache

Redis Cluster should support:

- Replication
- Automatic Failover
- High Availability
- Horizontal Scaling

---

# 16. Cache Consistency

Consistency model:

- Eventual consistency
- Explicit invalidation
- Optimistic refresh

Critical security information must always be retrieved from the primary database.

---

# 17. Monitoring

Monitor:

- Hit Ratio
- Miss Ratio
- Evictions
- Memory Usage
- Expired Keys
- Latency
- Connection Count

Alerts must trigger on abnormal behavior.

---

# 18. Performance Targets

Redis latency:

< 5 ms

Cache hit ratio:

> 90%

Session lookup:

< 10 ms

Configuration lookup:

< 5 ms

---

# 19. Security

Cache must support:

- TLS
- Authentication
- Network Isolation
- Encryption in Transit
- Access Control

Sensitive data must never appear in cache logs.

---

# 20. Failure Strategy

If Redis becomes unavailable:

- Continue serving requests
- Read directly from database
- Rebuild cache gradually
- Log degradation
- Notify monitoring system

Application availability must be preserved.

---

# 21. Testing

Required tests:

- Cache hit
- Cache miss
- TTL expiration
- Invalidation
- Redis failover
- Cluster recovery
- Concurrent access
- Load testing

---

# 22. Acceptance Criteria

Caching is accepted only if:

- hit ratio exceeds targets;
- invalidation works correctly;
- failures degrade gracefully;
- monitoring is active;
- security policies are enforced.

---

# 23. Definition of Done

The caching layer is complete when:

- implemented;
- documented;
- tested;
- monitored;
- scalable;
- secure;
- production ready.

---

# 24. OpenCode Instructions

OpenCode MUST:

- use Redis as the distributed cache;
- implement standardized cache keys;
- enforce TTL policies;
- invalidate cache after writes;
- never cache secrets;
- monitor cache metrics;
- support graceful degradation;
- reject implementations that violate this specification.

This document is mandatory for every Atlas AI service that reads or stores cacheable data.
