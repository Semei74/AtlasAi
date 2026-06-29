# Atlas AI

# Model Context Protocol (MCP) Architecture Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: AI Platform Team

Related Documents

- 00_MASTER_SPEC.md
- 01_PRODUCT_REQUIREMENTS.md
- 02_SYSTEM_ARCHITECTURE.md
- 03_TECH_STACK.md
- 04_DATABASE.md
- 05_BACKEND.md
- 06_FRONTEND.md

---

# Purpose

This document defines the MCP (Model Context Protocol) architecture for Atlas AI.

Every external tool, automation, connector and AI capability must be exposed through MCP.

The AI Orchestrator never communicates directly with external services.

All integrations pass through the MCP layer.

---

# Objectives

The MCP platform must be

- Modular
- Replaceable
- Observable
- Secure
- Extensible
- Asynchronous
- Provider Agnostic

---

# High Level Architecture

User

↓

Frontend

↓

Backend API

↓

AI Orchestrator

↓

MCP Tool Manager

↓

MCP Server

↓

Tool Registry

↓

Tool Executor

↓

External Services

---

# Core Components

## MCP Gateway

Responsibilities

- Receive tool requests
- Validate permissions
- Route execution
- Return structured responses

---

## Tool Registry

Stores

- Tool Name
- Description
- Version
- Category
- Permissions
- Timeout
- Health Status

Every tool must register itself automatically.

---

## Tool Executor

Responsibilities

- Execute tool
- Retry
- Timeout
- Error Handling
- Logging
- Metrics

---

## Tool Context Builder

Creates execution context

Contains

- User
- Workspace
- Language
- Permissions
- AI Memory
- Workflow
- Files

---

## Permission Manager

Validates

- User permissions
- Subscription limits
- Workspace access
- Tool access
- Organization policies

---

# Tool Categories

## File Tools

- Read File
- Write File
- Delete File
- Rename File
- Copy File
- Move File
- Archive File

---

## PDF Tools

- Read PDF
- OCR PDF
- Split PDF
- Merge PDF
- Compress PDF
- Extract Images

---

## Word Tools

- Read DOCX
- Create DOCX
- Edit DOCX
- Export PDF

---

## Spreadsheet Tools

- Read XLSX
- Analyze Data
- Generate Charts
- Formula Validation
- Export CSV

---

## Presentation Tools

- Create PPTX
- Edit Slides
- Export PDF

---

## OCR Tools

- Image OCR
- PDF OCR
- Table Recognition
- Handwriting Recognition (Future)

---

## Image Tools

- Generate Image
- Edit Image
- Resize
- Crop
- Background Removal

---

## Audio Tools

- Speech To Text
- Text To Speech
- Audio Translation

---

## Translation Tools

- Translate Text
- Translate Document
- Preserve Formatting

---

## Browser Tools

- Open URL
- Read Page
- Search
- Extract Data
- Screenshot

---

## Search Tools

- Web Search
- News Search
- Knowledge Search

---

## Email Tools

- Read Email
- Draft Email
- Send Email
- Search Email

---

## Calendar Tools

- Read Calendar
- Create Event
- Update Event
- Delete Event

---

## Cloud Storage Tools

- Google Drive
- OneDrive
- Dropbox
- S3 Compatible Storage

---

## AI Tools

- Summarization
- Classification
- Extraction
- Reasoning
- Code Generation
- Analysis

---

# Tool Interface

Every tool must implement

initialize()

validate()

execute()

cancel()

health()

version()

metadata()

cleanup()

---

# Tool Metadata

Each tool defines

- Name
- Version
- Description
- Input Schema
- Output Schema
- Permissions
- Timeout
- Retry Policy

---

# Tool Execution Flow

Request

↓

Validation

↓

Permission Check

↓

Context Build

↓

Execution

↓

Validation

↓

Formatting

↓

Logging

↓

Metrics

↓

Response

---

# Tool Result Format

Every tool returns

status

tool_name

execution_time

output

metadata

warnings

errors

trace_id

---

# Error Handling

Every tool must classify errors

Validation Error

Permission Error

Timeout

Provider Error

Network Error

Internal Error

Unknown Error

---

# Retry Policy

Retry only for

- Network
- Timeout
- Temporary Provider Failure

Never retry

- Validation
- Permission
- Authentication

---

# Timeouts

Small Tool

10 seconds

Medium Tool

60 seconds

Large Tool

300 seconds

Long-running tasks must execute asynchronously.

---

# Security

Every tool

- validates permissions
- sanitizes input
- sanitizes output
- logs execution
- masks secrets

No tool stores credentials.

---

# Secrets

Secrets managed through

Secret Manager

Never

- Git
- Source Code
- Configuration Files

---

# Logging

Every execution logs

Tool Name

Version

User

Workspace

Duration

Status

Retries

Errors

Trace ID

---

# Metrics

Every tool exports

Execution Count

Success Rate

Failure Rate

Average Duration

Memory Usage

CPU Usage

Timeout Count

Retry Count

---

# Health Checks

Every tool exposes

Health Endpoint

Status

Version

Dependencies

Latency

---

# Tool Versioning

Semantic Versioning

Major

Minor

Patch

Multiple versions may coexist.

---

# Tool Registration

Registration occurs automatically during startup.

Unhealthy tools are excluded from execution.

---

# Testing

Every tool requires

- Unit Tests
- Integration Tests
- Contract Tests
- Performance Tests

Minimum coverage

90%

---

# Performance Targets

Tool Discovery

<50ms

Execution Start

<100ms

Metadata Load

<20ms

Health Check

<100ms

---

# Forbidden

No direct SDK calls from AI Orchestrator

No business logic inside tools

No hardcoded credentials

No blocking operations

No shared mutable state

No undocumented tools

---

# Acceptance Criteria

MCP implementation accepted only if

- Tool Registry operational
- Tool discovery automatic
- Permissions enforced
- Metrics exposed
- Logging implemented
- Health checks operational
- Documentation complete
- Tests passing

---

# Definition of Done

MCP feature complete only if

- Implemented
- Registered
- Tested
- Documented
- Logged
- Monitored
- Secure
- Replaceable
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement MCP as an independent platform
- isolate every tool
- create common tool interfaces
- register tools automatically
- validate permissions before execution
- support cancellation
- support retries
- support health checks
- generate structured logs
- generate Prometheus metrics
- generate unit, integration and contract tests
- ensure every tool is independently deployable
- reject any implementation violating this specification

This specification is mandatory for every MCP component.
