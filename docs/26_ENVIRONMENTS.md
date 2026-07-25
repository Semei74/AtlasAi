# Atlas AI

# Environment Management Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** Environment Specification  
**Priority:** Critical  
**Owner:** Platform Engineering Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines all runtime environments used throughout the Atlas AI software lifecycle.

Every environment must be isolated, reproducible, secure, and fully automated.

---

# 2. Objectives

The environment strategy shall provide:

- Complete isolation
- Predictable deployments
- Safe testing
- Production stability
- Easy developer onboarding
- Automated provisioning
- Secure secret management

---

# 3. Environment Lifecycle

Atlas AI uses five primary environments:

```
Developer Machine
        │
        ▼
Development
        │
        ▼
Testing
        │
        ▼
Staging
        │
        ▼
Production
```

Every deployment follows this order.

---

# 4. Local Environment

Purpose

Development on a developer workstation.

Characteristics

- Docker Compose
- Local PostgreSQL
- Local Redis
- Local Object Storage (MinIO)
- Mock Email Provider
- Mock Push Provider
- Local MCP Servers
- Local AI Provider (optional)

Requirements

- One-command startup
- Hot Reload
- Seed Database
- Automatic migrations
- Debug logging enabled

---

# 5. Development Environment

Purpose

Shared integration environment for engineers.

Characteristics

- Shared Backend
- Shared Database
- Shared Redis
- Shared Storage
- Development AI Keys
- Continuous Deployment

Requirements

- Automatic deployments
- Daily backups
- Feature branch testing
- Debug logging

---

# 6. Testing Environment

Purpose

Automated testing.

Used for

- Unit Tests
- Integration Tests
- Contract Tests
- End-to-End Tests
- Performance Tests

Requirements

- Ephemeral infrastructure
- Automatic provisioning
- Automatic cleanup
- Synthetic test data only

---

# 7. Staging Environment

Purpose

Production validation before release.

Characteristics

- Production-like infrastructure
- Production configuration
- Staging secrets
- Production monitoring
- Load testing
- Security testing

Requirements

- Zero manual configuration
- Automated deployment
- Automated rollback
- Release candidate validation

---

# 8. Production Environment

Purpose

Serve real users.

Characteristics

- High Availability
- Horizontal Scaling
- Monitoring
- Backups
- Disaster Recovery
- Security Hardening

Requirements

- No debug logging
- Readiness probes
- Liveness probes
- Audit logging
- Automatic scaling

---

# 9. Environment Isolation

Each environment must have isolated:

- Database
- Redis
- Object Storage
- Secrets
- OAuth Credentials
- AI API Keys
- MCP Connections
- Monitoring
- Logging

Resources must never be shared across environments.

---

# 10. Environment Variables

Each environment maintains independent values for:

- Application settings
- Database
- Redis
- Storage
- Authentication
- AI Providers
- MCP
- Notifications
- Billing
- Monitoring

Production variables must never be reused elsewhere.

---

# 11. Secrets Management

Secrets include:

- JWT Secrets
- Database Passwords
- API Keys
- OAuth Credentials
- Payment Keys
- SMTP Credentials
- Encryption Keys

Secrets must be stored using a dedicated secret manager.

Secrets must never exist in Git repositories.

---

# 12. Database Policy

Each environment owns:

- Independent database
- Independent migrations
- Independent backups
- Independent users

Production data must never be copied into lower environments without anonymization.

---

# 13. Storage Policy

Storage buckets must be isolated.

Example

```
atlas-local
atlas-development
atlas-testing
atlas-staging
atlas-production
```

Signed URLs must be environment-specific.

---

# 14. Logging Policy

Local

- Console
- Debug

Development

- Debug
- Centralized Logs

Testing

- Test Reports
- Error Logs

Staging

- Structured Logs
- Metrics
- Traces

Production

- Structured Logs
- Audit Logs
- Metrics
- Distributed Tracing
- Alerting

---

# 15. Monitoring

Every environment exposes:

- Health Checks
- Metrics
- Readiness Endpoint
- Liveness Endpoint

Production additionally provides:

- Alerting
- Incident Detection
- SLA Monitoring

---

# 16. Deployment Rules

Deployment must be:

- Automated
- Repeatable
- Versioned
- Verified
- Logged

Manual deployments to Production are prohibited.

---

# 17. Promotion Rules

Promotion path:

```
Development
      ↓
Testing
      ↓
Staging
      ↓
Production
```

Skipping environments is not allowed.

---

# 18. Rollback Strategy

Every deployment must support:

- Automatic rollback
- Previous image recovery
- Database rollback plan
- Configuration rollback

Rollback time objective:

Less than 10 minutes.

---

# 19. Backup Policy

Production backups

- Database
- Storage
- Configuration
- Audit Logs

Backup schedule

- Hourly Incremental
- Daily Full
- Weekly Archive

Recovery testing must occur regularly.

---

# 20. Disaster Recovery

Recovery targets

RPO

< 5 minutes

RTO

< 30 minutes

Production recovery must be documented and tested.

---

# 21. Compliance

All environments must comply with:

- Security Policy
- Privacy Policy
- Logging Standards
- Audit Requirements
- Data Retention Rules

---

# 22. Forbidden Practices

The following are prohibited:

- Shared production credentials
- Manual production changes
- Production debugging
- Production test data
- Hardcoded configuration
- Shared databases
- Shared storage buckets

---

# 23. Acceptance Criteria

Environment management is accepted only if:

- environments are isolated;
- deployments are automated;
- secrets are protected;
- monitoring is active;
- rollback works correctly;
- backups are operational.

---

# 24. Definition of Done

Environment management is complete when:

- fully documented;
- reproducible;
- automated;
- secure;
- monitored;
- production ready.

---

# 25. OpenCode Instructions

OpenCode MUST:

- maintain strict environment isolation;
- externalize all configuration;
- automate provisioning;
- automate deployment;
- validate environment consistency;
- prevent production misconfiguration;
- never expose secrets;
- reject implementations violating this specification.

This specification is mandatory for every Atlas AI deployment environment.
