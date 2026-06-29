# Atlas AI

# Backend Architecture Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Backend Team

Related Documents

- 00_MASTER_SPEC.md
- 01_PRODUCT_REQUIREMENTS.md
- 02_SYSTEM_ARCHITECTURE.md
- 03_TECH_STACK.md
- 04_DATABASE.md

---

# Purpose

This document defines the complete backend architecture of Atlas AI.

Every backend module must comply with this specification.

Business logic must never be implemented outside the Application and Domain layers.

---

# Objectives

The backend must be

- Fast
- Secure
- Modular
- Observable
- Horizontally Scalable
- Testable
- Provider Agnostic
- Cloud Agnostic
- Event Driven

---

# Backend Overview

Mobile App

↓

API Gateway

↓

NestJS + Fastify

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

Database / AI / Storage / Queue

---

# Repository Structure

backend/

src/

api/

application/

domain/

infrastructure/

config/

shared/

tests/

---

# API Layer

Responsibilities

- Request validation
- Authentication
- Authorization
- Response serialization
- Error handling

Forbidden

- Business Logic
- SQL
- AI Calls
- File Processing

---

# Application Layer

Contains

- Use Cases
- Services
- DTOs
- Validators
- Workflow Coordinators

Responsibilities

- Execute business scenarios
- Coordinate repositories
- Publish events
- Start workflows

---

# Domain Layer

Contains

- Entities
- Value Objects
- Interfaces
- Domain Services
- Business Rules

Domain layer must not depend on

- NestJS
- Fastify
- Prisma
- Express
- Redis
- OpenAI SDK
- External APIs

---

# Infrastructure Layer

Contains

- Database
- Repositories
- Redis
- BullMQ
- Storage
- AI Providers
- MCP
- Logging
- Monitoring

---

# Shared Layer

Contains

- Exceptions
- Utilities
- Constants
- Base Classes
- Common Types

---

# Configuration

Configuration sources

1. Environment Variables
2. Secret Manager
3. Runtime Configuration

Never hardcode

- Secrets
- Tokens
- URLs
- API Keys

---

# Dependency Injection

All services registered through DI.

No global instances.

Every dependency must be replaceable.

---

# API Versioning

Pattern

/api/v1/

Future versions

/api/v2/

Backward compatibility maintained where possible.

---

# Authentication Module

Responsibilities

- Login
- Logout
- Refresh Token
- Session Management
- Device Tracking

Authentication via JWT.

Refresh Tokens rotated after every refresh.

---

# Authorization Module

RBAC

Roles

- Owner
- Admin
- Manager
- User
- Viewer

Permissions resolved server-side.

---

# User Module

Responsibilities

- Profile
- Preferences
- Language
- Timezone
- Avatar
- Devices

---

# Organization Module

Responsibilities

- Company Management
- Members
- Roles
- Invitations
- Billing Ownership

---

# Workspace Module

Responsibilities

- Workspace CRUD
- Projects
- Files
- Chats
- Settings

---

# Chat Module

Responsibilities

- Conversation Management
- Message Storage
- Context Handling
- Attachments

AI calls delegated to AI Orchestrator.

---

# AI Module

Responsibilities

- Receive AI Requests
- Build Context
- Execute Workflow
- Validate Response
- Return Result

Never communicate directly with providers.

---

# MCP Module

Responsibilities

- Register Tools
- Execute Tools
- Tool Permissions
- Tool Logging
- Tool Metrics

---

# File Module

Responsibilities

- Upload
- Download
- Versioning
- Metadata
- Virus Scan
- Storage Routing

---

# OCR Module

Responsibilities

- Image Recognition
- PDF OCR
- Queue Processing
- Result Storage

Runs asynchronously.

---

# Workflow Module

Responsibilities

- Execute workflows
- Retry failed steps
- Resume execution
- Store execution history

---

# Notification Module

Supports

- Push
- Email
- In-App

Notification delivery must be asynchronous.

---

# Billing Module

Responsibilities

- Subscription
- Usage
- Limits
- Invoices

Business logic isolated from payment provider.

---

# Memory Module

Responsibilities

- Long-term memory
- User preferences
- Templates
- Context retrieval

Memory must be editable and removable.

---

# Event Bus

Events include

UserCreated

WorkspaceCreated

ChatStarted

DocumentUploaded

OCRCompleted

WorkflowCompleted

SubscriptionUpdated

NotificationSent

---

# Background Workers

Dedicated workers

AI Worker

OCR Worker

Export Worker

Notification Worker

Cleanup Worker

Analytics Worker

Workers must be independently scalable.

---

# Error Handling

Every error contains

- Error Code
- Message
- Trace ID
- Timestamp
- Retry Flag

Stack traces never returned to clients.

---

# Logging

Structured JSON logging.

Each request logs

- Request ID
- User ID
- Workspace ID
- Endpoint
- Duration
- Status
- Errors

Sensitive information masked.

---

# Monitoring

Metrics

- Request Count
- Response Time
- Error Rate
- Queue Length
- AI Cost
- Cache Hit Ratio
- Active Sessions

---

# Caching

Redis

Cache

- User Profile
- Workspace
- AI Responses
- Feature Flags
- Configuration

Cache invalidation event-driven.

---

# Rate Limiting

Applied to

- Authentication
- AI Requests
- Uploads
- Public APIs

Limits configurable.

---

# Security

Mandatory

- HTTPS
- CORS
- CSRF Protection (where applicable)
- JWT Validation
- Input Validation
- Output Encoding
- SQL Injection Protection
- XSS Protection

---

# API Standards

Request

JSON

Response

JSON

Errors

RFC7807 compatible where practical.

---

# Performance Targets

Authentication

<200ms

CRUD

<150ms

Search

<500ms

AI Request Accepted

<300ms

File Upload Initialization

<250ms

---

# Scalability

Backend must support

- Stateless instances
- Horizontal scaling
- Load balancing
- Queue scaling
- Read replicas
- Object storage

---

# Coding Standards

Maximum file

500 lines

Maximum function

50 lines

Maximum nesting

3

Cyclomatic Complexity

<10

---

# Forbidden

Business logic in controllers

Business logic in repositories

Direct provider SDK usage

Global mutable state

Blocking I/O inside async endpoints

Duplicate validation logic

Hardcoded configuration

---

# Testing Requirements

Mandatory

- Unit Tests
- Integration Tests
- API Tests

Coverage

Backend

Minimum 90%

---

# Acceptance Criteria

Backend implementation accepted only if

- Architecture respected
- Tests pass
- Logging implemented
- Monitoring enabled
- Documentation updated
- Security review completed
- Performance targets achieved

---

# Definition of Done

Backend feature complete only if

- Implemented
- Tested
- Documented
- Logged
- Monitored
- Configurable
- Secure
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement Clean Architecture
- create interfaces before implementations
- isolate infrastructure from business logic
- generate dependency injection registrations
- generate OpenAPI documentation
- generate unit and integration tests
- implement structured logging
- expose Prometheus metrics
- support horizontal scaling
- avoid framework leakage into domain
- keep all integrations replaceable
- reject implementations violating this specification

This specification is mandatory for every backend implementation.
