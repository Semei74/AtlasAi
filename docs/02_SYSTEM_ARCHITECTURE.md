# Atlas AI

# System Architecture Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** System Architecture Specification  
**Priority:** Critical  
**Owner:** Platform Architecture Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the complete system architecture for Atlas AI.

It specifies the logical components, infrastructure, service boundaries, communication protocols, deployment strategy, scalability model, and engineering constraints.

Every backend, frontend, AI service, MCP integration, and infrastructure component MUST comply with this architecture.

---

# 2. Architecture Principles

Atlas AI follows these principles:

- Clean Architecture
- Domain-Driven Design (DDD)
- API First
- AI First
- Cloud Native
- Modular Monolith (MVP)
- Microservice Ready
- Event Driven
- Provider Independent
- Security by Design
- Infrastructure as Code

---

# 3. High-Level Architecture

```
                    Mobile App
                 (Flutter Client)
                        │
                        ▼
                  API Gateway
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
 Authentication    Core Backend      Notification Service
      │                 │
      │                 ▼
      │          AI Orchestrator
      │                 │
      │      ┌──────────┼──────────┐
      │      ▼          ▼          ▼
      │   Memory     MCP Gateway  Search Engine
      │      │          │
      │      ▼          ▼
      │  PostgreSQL  External MCP Servers
      │
      ▼
 Object Storage
```

---

# 4. Main Components

The platform consists of:

- Mobile Client
- API Gateway
- Authentication Service
- User Service
- Workspace Service
- Project Service
- Task Service
- AI Orchestrator
- Prompt Engine
- Memory Engine
- MCP Gateway
- Search Engine
- File Service
- Notification Service
- Billing Service
- Analytics Service
- Admin Service

---

# 5. Mobile Application

Technology

- Flutter
- Riverpod
- GoRouter
- Dio
- Hive
- Secure Storage

Responsibilities

- Authentication
- Chat UI
- Project UI
- Task Management
- File Upload
- Local Cache
- Push Notifications
- Offline Support

---

# 6. API Gateway

Responsibilities

- Request Routing
- Authentication
- Rate Limiting
- Logging
- Metrics
- API Versioning
- Compression
- CORS
- Request Validation

All client traffic must pass through the API Gateway.

---

# 7. Authentication Service

Responsibilities

- Login
- Registration
- JWT
- Refresh Tokens
- OAuth
- Session Management
- Password Reset
- Email Verification

Supported Providers

- Google
- Apple
- GitHub
- Email

---

# 8. Core Backend

Responsibilities

- Business Logic
- Domain Services
- Validation
- Authorization
- Event Publishing
- Transaction Management

Business logic must never directly depend on AI providers.

---

# 9. AI Orchestrator

The AI Orchestrator is the central intelligence layer.

Responsibilities

- Model Selection
- Prompt Construction
- Context Assembly
- Memory Injection
- Tool Calling
- Response Streaming
- Cost Tracking
- Retry Logic
- Fallback Models

Supported Providers

- OpenAI
- Anthropic
- Google
- OpenRouter
- Local Models

Providers are accessed through adapter interfaces.

---

# 10. Prompt Engine

Responsibilities

- Prompt Templates
- Prompt Versioning
- Context Assembly
- Variable Injection
- Prompt Validation

Prompts must never be hardcoded inside business logic.

---

# 11. Memory Engine

Memory Types

- User Memory
- Workspace Memory
- Project Memory
- Conversation Memory
- AI Preferences

Responsibilities

- Store
- Retrieve
- Rank
- Merge
- Delete
- Update

Memory retrieval must occur before every AI request.

---

# 12. MCP Gateway

Responsibilities

- Tool Discovery
- Tool Execution
- Permission Validation
- Connection Management
- Result Normalization

Supported MCP Servers

- GitHub
- GitLab
- Google Drive
- Google Calendar
- Slack
- Discord
- PostgreSQL
- Notion
- Jira
- REST APIs
- Local MCP

---

# 13. Search Engine

Global search across

- Chats
- Projects
- Tasks
- Files
- Memories
- Documents

Requirements

- Full-text search
- Filters
- Pagination
- Ranking
- Fast indexing

---

# 14. File Service

Supported Operations

- Upload
- Download
- Delete
- Preview
- Versioning
- Virus Scan
- OCR
- AI Analysis

Supported Formats

- PDF
- DOCX
- TXT
- XLSX
- CSV
- PNG
- JPG
- ZIP

---

# 15. Notification Service

Channels

- Push
- Email
- In-App

Notification Types

- Task Reminders
- AI Jobs
- Billing
- System Alerts
- Security Events

---

# 16. Database

Primary Database

PostgreSQL

Storage

Object Storage (S3 Compatible)

Caching

Redis

Search

PostgreSQL Full Text Search (MVP)

Future

OpenSearch

---

# 17. Background Processing

Queue System

Redis Queue

Workers

- AI Jobs
- OCR
- File Processing
- Notifications
- Memory Indexing
- Analytics

---

# 18. External Services

The platform may integrate with

- AI Providers
- MCP Servers
- Email Providers
- Push Notification Providers
- Payment Providers
- Analytics Providers

All integrations must be abstracted through service adapters.

---

# 19. Security Architecture

Security Layers

- HTTPS
- TLS
- JWT
- OAuth
- RBAC
- Rate Limiting
- Audit Logs
- Secret Manager
- Encryption at Rest
- Encryption in Transit
- Prompt Injection Protection
- Input Validation
- Output Validation

---

# 20. Scalability

Services must support

- Horizontal Scaling
- Stateless Deployment
- Auto Scaling
- Load Balancing
- Rolling Updates

The architecture must allow migration to microservices without major refactoring.

---

# 21. Monitoring

Every service exposes

- Health Endpoint
- Metrics Endpoint
- Structured Logs
- Distributed Traces

Observability Stack

- OpenTelemetry
- Prometheus
- Grafana
- Loki

---

# 22. Deployment Architecture

Environments

- Local
- Development
- Staging
- Production

Deployment

GitHub Actions

↓

Docker Build

↓

Security Scan

↓

Tests

↓

Container Registry

↓

Deployment

↓

Health Checks

↓

Monitoring

---

# 23. Disaster Recovery

Requirements

- Automated Backups
- Point-in-Time Recovery
- Multi-Region Ready
- Rollback Support
- Health Monitoring
- Incident Logging

Recovery objectives

RTO < 30 minutes

RPO < 5 minutes

---

# 24. Engineering Constraints

The architecture must

- avoid vendor lock-in
- separate business logic from providers
- isolate infrastructure
- support future microservices
- remain cloud independent
- be fully testable
- support Infrastructure as Code

---

# 25. Acceptance Criteria

The architecture is accepted only if

- all modules are implemented
- service boundaries are respected
- provider abstraction is implemented
- monitoring is operational
- security controls are active
- deployment is automated
- tests pass successfully

---

# 26. Definition of Done

The architecture is considered complete only when

- implemented
- documented
- tested
- monitored
- secured
- scalable
- production ready

---

# 27. OpenCode Instructions

OpenCode MUST

- strictly follow this architecture;
- isolate every external provider behind interfaces;
- implement dependency injection throughout the system;
- maintain modular boundaries;
- prevent circular dependencies;
- generate production-ready code only;
- create automated tests for every service;
- implement health checks and metrics;
- document all public APIs;
- reject implementations that violate this architecture.

This document is the authoritative system architecture specification for Atlas AI and is mandatory for every engineering task.
