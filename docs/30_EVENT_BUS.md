# Atlas AI

# Event Bus Specification

**Version:** 1.0.0 **Status:** Approved **Document Type:** Event Bus Specification **Priority:**
Critical **Owner:** Platform Engineering Team **Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the internal event-driven architecture of Atlas AI.

The Event Bus enables loose coupling between services by allowing components to communicate through
domain events instead of direct dependencies.

---

# 2. Objectives

The Event Bus shall provide:

- Loose coupling
- Asynchronous communication
- High scalability
- Event replay capability
- Reliable delivery
- Event observability
- Service independence
- Future microservice compatibility

---

# 3. Architecture

```
Application Service
        │
        ▼
 Domain Event
        │
        ▼
   Event Bus
        │
 ┌──────┼────────┬────────┐
 ▼      ▼        ▼        ▼
Memory  Search  Notify   Analytics
Engine  Index   Service  Service
```

---

# 4. Event Principles

Atlas AI follows these principles:

- Publish immutable events
- Never modify published events
- One business action may generate multiple events
- Event consumers must be independent
- Event handlers must be idempotent
- Events must never contain secrets

---

# 5. Event Categories

Supported event types:

### User Events

- UserRegistered
- UserLoggedIn
- UserUpdated
- UserDeleted

### Workspace Events

- WorkspaceCreated
- WorkspaceUpdated
- WorkspaceDeleted

### Project Events

- ProjectCreated
- ProjectArchived
- ProjectDeleted

### Task Events

- TaskCreated
- TaskUpdated
- TaskCompleted
- TaskDeleted

### AI Events

- AIRequestStarted
- AIRequestCompleted
- AIRequestFailed

### Memory Events

- MemoryCreated
- MemoryUpdated
- MemoryDeleted

### File Events

- FileUploaded
- FileProcessed
- FileDeleted

### Billing Events

- SubscriptionCreated
- PaymentSucceeded
- PaymentFailed

---

# 6. Event Structure

Every event must contain:

- Event ID
- Event Type
- Aggregate ID
- Aggregate Type
- Timestamp
- Version
- Correlation ID
- Trace ID
- Payload

---

# 7. Event Naming

Naming convention:

```
<Entity><Action>

Examples

UserRegistered

TaskCompleted

WorkspaceCreated

MemoryUpdated

FileUploaded
```

Past tense is mandatory.

---

# 8. Event Publishing

Events must be published only after a successful business transaction.

Failed transactions must never publish events.

---

# 9. Event Consumers

Consumers include:

- Notification Service
- Analytics
- Search Indexer
- Memory Engine
- Audit Logger
- Cache Manager
- Background Workers
- AI Orchestrator

Consumers must never depend on each other.

---

# 10. Delivery Guarantees

Delivery model:

- At least once
- Ordered per aggregate
- Retry on transient failures
- Dead-letter on permanent failures

Consumers must handle duplicate events safely.

---

# 11. Versioning

Every event must include a version.

Breaking changes require a new event version.

Older consumers must continue functioning during migration.

---

# 12. Event Storage

Events may be retained for:

- Auditing
- Debugging
- Analytics
- Replay
- Compliance

Retention policies are defined separately.

---

# 13. Monitoring

Track:

- Published Events
- Failed Events
- Consumer Latency
- Retry Count
- Processing Duration
- Dead Letter Events

---

# 14. Logging

Every published event must log:

- Event ID
- Event Type
- Publisher
- Consumer
- Duration
- Status
- Correlation ID

Logs must be structured.

---

# 15. Security

Events must never include:

- Passwords
- API Keys
- JWT Tokens
- Encryption Keys
- Payment Credentials
- Sensitive Personal Data

Sensitive references must use identifiers only.

---

# 16. Performance Targets

Event publishing:

< 10 ms

Consumer startup:

< 2 seconds

Average processing latency:

< 100 ms

Event delivery success:

> 99.9%

---

# 17. Failure Handling

If a consumer fails:

- Retry automatically
- Preserve event ordering
- Route permanent failures to Dead Letter Queue
- Generate alerts
- Continue processing unrelated events

---

# 18. Testing

Required tests:

- Event Publishing
- Event Consumption
- Ordering
- Duplicate Handling
- Retry Logic
- Dead Letter Queue
- Version Compatibility
- Load Testing

---

# 19. Acceptance Criteria

The Event Bus is accepted only if:

- events are immutable;
- consumers are independent;
- retries function correctly;
- monitoring is operational;
- duplicate events are handled safely;
- automated tests pass.

---

# 20. Definition of Done

The Event Bus is complete when:

- implemented;
- documented;
- tested;
- monitored;
- scalable;
- fault tolerant;
- production ready.

---

# 21. OpenCode Instructions

OpenCode MUST:

- implement domain events for major business operations;
- publish events only after successful transactions;
- keep event payloads immutable;
- implement idempotent consumers;
- support retries and dead-letter queues;
- expose event metrics and logs;
- isolate publishers from consumers;
- reject implementations that violate this specification.

This document is mandatory for all asynchronous communication inside Atlas AI.
