# Atlas AI

# API Specification

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
- 05_BACKEND.md
- 06_FRONTEND.md
- 07_MCP.md
- 08_AI_ORCHESTRATOR.md
- 09_MEMORY.md

---

# Purpose

This document defines the API architecture, standards, conventions and lifecycle for Atlas AI.

Every client communicates with the backend only through the official REST API.

No client is allowed to access databases, AI providers or infrastructure directly.

---

# Objectives

The API must be

- Secure
- Consistent
- Versioned
- Observable
- Scalable
- Testable
- Backward Compatible
- Provider Agnostic

---

# API Style

Architecture

REST

Protocol

HTTPS Only

Content Type

application/json

Character Encoding

UTF-8

---

# Base URL

/api/v1/

Future versions

/api/v2/

Version changes must never break existing clients without a migration strategy.

---

# Authentication

JWT Access Token

Refresh Token

Rotating Refresh Tokens

Authorization Header

Bearer <token>

---

# API Modules

Authentication

Users

Organizations

Workspaces

Projects

Chats

Messages

Files

Storage

AI

Memory

MCP

Notifications

Billing

Subscriptions

Analytics

Settings

Health

Admin

---

# Request Rules

Every request contains

Authorization

Content-Type

Accept

X-Request-ID

X-Client-Version

X-Platform

---

# Response Format

Every successful response

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "request_id": "",
  "timestamp": ""
}
```

---

# Error Response

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": "",
    "details": [],
    "retryable": false
  },
  "request_id": "",
  "timestamp": ""
}
```

---

# HTTP Status Codes

200 OK

201 Created

202 Accepted

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Too Many Requests

500 Internal Error

503 Service Unavailable

---

# Authentication Endpoints

POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me

---

# User Endpoints

GET /users/me

PATCH /users/me

DELETE /users/me

GET /users/preferences

PATCH /users/preferences

---

# Workspace Endpoints

GET /workspaces

POST /workspaces

GET /workspaces/{id}

PATCH /workspaces/{id}

DELETE /workspaces/{id}

---

# Project Endpoints

GET /projects

POST /projects

PATCH /projects/{id}

DELETE /projects/{id}

---

# Chat Endpoints

GET /chats

POST /chats

GET /chats/{id}

DELETE /chats/{id}

---

# Message Endpoints

GET /messages

POST /messages

PATCH /messages/{id}

DELETE /messages/{id}

---

# AI Endpoints

POST /ai/chat

POST /ai/complete

POST /ai/image

POST /ai/speech

POST /ai/embeddings

GET /ai/models

GET /ai/providers

---

# Memory Endpoints

GET /memory

POST /memory

PATCH /memory/{id}

DELETE /memory/{id}

POST /memory/search

---

# MCP Endpoints

GET /mcp/tools

POST /mcp/execute

GET /mcp/health

GET /mcp/tool/{name}

---

# File Endpoints

POST /files/upload

GET /files

GET /files/{id}

DELETE /files/{id}

POST /files/download

POST /files/share

---

# Notification Endpoints

GET /notifications

PATCH /notifications/{id}

DELETE /notifications/{id}

---

# Billing Endpoints

GET /billing

GET /billing/invoices

GET /subscriptions

PATCH /subscriptions

---

# Admin Endpoints

GET /admin/users

GET /admin/system

GET /admin/logs

GET /admin/metrics

---

# Health Endpoints

GET /health

GET /ready

GET /live

GET /metrics

---

# Pagination

Default

25

Maximum

100

Parameters

page

limit

sort

order

---

# Filtering

Supported

status

created_at

updated_at

owner

workspace

project

provider

model

---

# Searching

Supports

Keyword Search

Full Text Search

Semantic Search

Hybrid Search

---

# Sorting

Supported

created_at

updated_at

name

priority

status

---

# Idempotency

Required for

Payments

Subscriptions

File Upload

Workflow Execution

Header

Idempotency-Key

---

# Rate Limiting

Authentication

10 requests/minute

AI

60 requests/minute

Uploads

30 requests/minute

Search

120 requests/minute

Limits configurable.

---

# Validation

All requests validated using

Pydantic

Validation occurs before business logic.

---

# File Upload

Supported

PDF

DOCX

XLSX

CSV

TXT

PNG

JPEG

WEBP

Maximum size configurable.

---

# API Documentation

Generated automatically

OpenAPI 3.1

Swagger UI

ReDoc

---

# Security

HTTPS Only

JWT Validation

CORS

Input Validation

Output Encoding

Rate Limiting

Request Size Limits

Security Headers

---

# Logging

Every request logs

Request ID

User ID

Endpoint

Method

Duration

Status

IP

Platform

Version

---

# Monitoring

Metrics

Request Count

Latency

Errors

Rate Limits

Active Sessions

Upload Volume

AI Usage

---

# Performance Targets

Authentication

<200ms

CRUD

<150ms

Search

<500ms

Health

<50ms

---

# API Versioning

Semantic Versioning

Deprecation notice required before removal.

Minimum support period

12 months.

---

# Forbidden

No undocumented endpoints

No direct database exposure

No provider-specific responses

No sensitive data in responses

No breaking changes without version update

No business logic inside controllers

---

# Acceptance Criteria

API implementation accepted only if

- Fully documented
- Versioned
- Authenticated
- Validated
- Tested
- Logged
- Monitored
- Secure

---

# Definition of Done

API feature complete only if

- Implemented
- Tested
- Documented
- Logged
- Monitored
- Versioned
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- generate OpenAPI automatically
- implement REST best practices
- validate every request
- standardize all responses
- implement JWT authentication
- implement rate limiting
- generate API integration tests
- generate API documentation
- expose health endpoints
- expose Prometheus metrics
- never expose internal models
- keep controllers thin
- implement API versioning
- reject any implementation violating this specification

This specification is mandatory for every API endpoint.
