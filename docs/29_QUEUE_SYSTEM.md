# Atlas AI

# Queue System Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** Queue System Specification  
**Priority:** Critical  
**Owner:** Platform Engineering Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the asynchronous processing architecture for Atlas AI.

The Queue System enables reliable execution of long-running tasks, background processing, retries,
scheduling, and event-driven workflows without blocking user requests.

---

# 2. Objectives

The queue system shall provide:

- Asynchronous execution
- High reliability
- Automatic retries
- Horizontal scalability
- Fault tolerance
- Job prioritization
- Dead-letter handling
- Monitoring

---

# 3. Architecture

```
Client
   │
   ▼
API Gateway
   │
   ▼
Backend Services
   │
   ▼
Queue Broker (Redis)
   │
   ├──────────────┐
   ▼              ▼
 Worker Pool   Scheduler
   │
   ▼
Database / Storage / AI Providers / MCP
```

---

# 4. Queue Principles

Atlas AI follows these principles:

- Never block user requests
- Retry transient failures
- Preserve idempotency
- Process jobs independently
- Support horizontal scaling
- Isolate queue failures
- Track every job

---

# 5. Queue Technology

MVP implementation:

- Redis
- BullMQ

Future support:

- RabbitMQ
- NATS
- Kafka
- AWS SQS

The queue implementation must remain replaceable through an abstraction layer.

---

# 6. Job Categories

Supported job types:

- AI Generation
- AI Streaming
- OCR Processing
- File Processing
- Search Indexing
- Memory Indexing
- Notification Delivery
- Email Sending
- Image Processing
- Document Export
- MCP Execution
- Analytics Processing
- Cleanup Tasks
- Scheduled Jobs

---

# 7. Queue Priorities

Priority levels:

| Level      | Description             |
| ---------- | ----------------------- |
| Critical   | Authentication, Billing |
| High       | AI Requests             |
| Normal     | OCR, File Processing    |
| Low        | Analytics               |
| Background | Cleanup Jobs            |

Workers must process higher-priority jobs first.

---

# 8. Job Lifecycle

```
Created
   │
   ▼
Queued
   │
   ▼
Running
   │
 ┌─┴─────────────┐
 ▼               ▼
Completed     Failed
                  │
             Retry Policy
                  │
             Dead Letter Queue
```

---

# 9. Job Payload

Each job must contain:

- Job ID
- Queue Name
- Payload
- User ID
- Workspace ID
- Priority
- Retry Count
- Created Timestamp
- Correlation ID

Payloads must remain serializable.

---

# 10. Retry Strategy

Transient failures:

- Retry 1 after 1 second
- Retry 2 after 2 seconds
- Retry 3 after 5 seconds
- Retry 4 after 10 seconds

Maximum retries:

5

Permanent failures must not be retried.

---

# 11. Dead Letter Queue

Failed jobs exceeding retry limits must move to a Dead Letter Queue.

The DLQ stores:

- Original Payload
- Failure Reason
- Stack Trace
- Retry History
- Timestamp

DLQ jobs require manual inspection or automated replay.

---

# 12. Scheduling

Supported schedules:

- Immediate
- Delayed
- Fixed Time
- Cron Expressions
- Recurring Jobs

Examples:

- Daily cleanup
- Weekly backups
- Monthly billing
- Periodic indexing

---

# 13. Worker Design

Workers must be:

- Stateless
- Idempotent
- Independently scalable
- Observable
- Gracefully stoppable

Workers must acknowledge jobs only after successful completion.

---

# 14. Concurrency

Workers shall support configurable concurrency.

Examples:

- AI Workers: 5
- OCR Workers: 10
- Notifications: 20
- Analytics: 50

Concurrency limits must be configurable.

---

# 15. Idempotency

Every job must be safely repeatable.

Duplicate execution must not:

- Charge users twice
- Duplicate files
- Duplicate notifications
- Corrupt data

Idempotency keys are mandatory where required.

---

# 16. Monitoring

Monitor:

- Queue Length
- Active Jobs
- Failed Jobs
- Retry Count
- Worker Health
- Processing Time
- Throughput
- Dead Letter Queue Size

Alerts must trigger when thresholds are exceeded.

---

# 17. Logging

Every job must log:

- Job ID
- Queue
- Worker
- Duration
- Status
- Retry Count
- Failure Reason
- Trace ID

Logs must be structured.

---

# 18. Security

Queue payloads must never contain:

- Passwords
- API Keys
- JWT Secrets
- Encryption Keys
- Payment Credentials

Sensitive identifiers must be encrypted or referenced securely.

---

# 19. Performance Targets

Queue enqueue:

< 20 ms

Worker startup:

< 2 seconds

Average processing latency:

< 500 ms (excluding external services)

Queue availability:

99.9%

---

# 20. Failure Handling

If the queue broker becomes unavailable:

- Reject new background jobs gracefully
- Preserve synchronous API functionality where possible
- Retry broker connection automatically
- Emit alerts
- Prevent data loss

---

# 21. Testing

Required tests:

- Job Creation
- Retry Logic
- Dead Letter Queue
- Scheduling
- Worker Shutdown
- High Concurrency
- Duplicate Jobs
- Broker Failure
- Load Testing

---

# 22. Acceptance Criteria

The queue system is accepted only if:

- jobs execute reliably;
- retries behave correctly;
- dead-letter handling works;
- monitoring is operational;
- workers scale horizontally;
- automated tests pass.

---

# 23. Definition of Done

The queue system is complete when:

- implemented;
- documented;
- tested;
- monitored;
- fault tolerant;
- scalable;
- production ready.

---

# 24. OpenCode Instructions

OpenCode MUST:

- implement BullMQ using Redis for the MVP;
- isolate queue logic behind service interfaces;
- support retries and dead-letter queues;
- implement idempotent workers;
- expose queue metrics;
- provide structured logging;
- support scheduled jobs;
- reject implementations that violate this specification.

This document is mandatory for every asynchronous process within Atlas AI.
