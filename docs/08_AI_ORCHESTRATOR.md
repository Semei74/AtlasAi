# Atlas AI

# AI Orchestrator Specification

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
- 07_MCP.md

---

# Purpose

This document defines the architecture, responsibilities and execution model of the AI Orchestrator.

The AI Orchestrator is the central intelligence layer responsible for coordinating all AI operations.

No frontend, backend module or MCP tool communicates directly with AI providers.

All AI traffic must pass through the AI Orchestrator.

---

# Objectives

The AI Orchestrator must be

- Provider Agnostic
- Fault Tolerant
- Extensible
- Observable
- Secure
- Cost Aware
- Testable
- Horizontally Scalable

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

Context Builder

↓

Memory Manager

↓

Prompt Builder

↓

Model Router

↓

MCP Tool Manager

↓

Provider Adapter

↓

AI Provider

↓

Response Validator

↓

Response Formatter

↓

Frontend

---

# Responsibilities

The AI Orchestrator is responsible for

- Request orchestration
- Context collection
- Prompt construction
- Model selection
- Tool invocation
- Memory integration
- Cost optimization
- Error handling
- Response validation
- Logging
- Metrics
- Retry logic

---

# Internal Modules

## Request Manager

Responsibilities

- Accept requests
- Validate payload
- Generate Trace ID
- Generate Request ID
- Start workflow

---

## Context Builder

Collects

- User profile
- Workspace
- Project
- Active chat
- Uploaded files
- Permissions
- Previous messages
- Memory
- Current workflow

Produces unified AI context.

---

## Prompt Builder

Responsibilities

- Load prompt template
- Inject context
- Inject memory
- Inject tool definitions
- Inject system rules
- Validate prompt

Prompts are versioned.

Prompts are never hardcoded.

---

## Memory Manager

Responsibilities

- Retrieve long-term memory
- Retrieve short-term memory
- Merge memories
- Rank memories
- Filter irrelevant data

Memory storage defined in 09_MEMORY.md.

---

## Model Router

Responsibilities

- Select provider
- Select model
- Apply routing rules
- Fallback handling

Selection criteria

- Cost
- Latency
- Capability
- Availability
- Subscription plan

---

## Provider Adapter

Every provider implements

initialize()

chat()

completion()

embeddings()

image()

speech()

health()

metadata()

No provider-specific logic outside adapters.

---

## Tool Planner

Responsibilities

- Decide whether tools are required
- Select tools
- Build execution order
- Collect results

Tool execution performed only through MCP.

---

## Response Validator

Checks

- JSON validity
- Schema validity
- Safety
- Length
- Empty responses
- Unsupported content

---

## Response Formatter

Converts provider response into

Unified Atlas Response Model.

---

# Supported Providers

Primary

- OpenAI
- Anthropic
- Google Gemini
- OpenRouter

Future

- Local Models
- Azure OpenAI
- AWS Bedrock
- Groq
- Mistral

Providers are interchangeable.

---

# Routing Policy

Simple requests

↓

Fast inexpensive model

---

Complex reasoning

↓

Advanced reasoning model

---

Vision requests

↓

Vision-capable model

---

Image generation

↓

Image model

---

Speech

↓

Speech model

---

Embeddings

↓

Embedding model

---

# Context Priority

1. System Instructions
2. Security Policies
3. User Instructions
4. Workspace Rules
5. Memory
6. Conversation History
7. Files
8. Tool Results

---

# Token Management

Responsibilities

- Estimate tokens
- Reserve context
- Truncate safely
- Compress history
- Compress memory

Context truncation must preserve

- Instructions
- Current task
- Critical memory

---

# Cost Optimization

The orchestrator tracks

- Input tokens
- Output tokens
- Cost
- Provider
- Model
- Duration

Supports

- Daily limits
- Monthly limits
- Workspace limits

---

# Retry Strategy

Retry only

- Timeout
- Temporary network failure
- Provider unavailable

Maximum retries

3

Exponential backoff required.

---

# Fallback Strategy

Primary Model

↓

Secondary Model

↓

Third Model

↓

Error Response

Fallback must be transparent to the user.

---

# AI Workflow

Request

↓

Validation

↓

Context

↓

Memory

↓

Prompt

↓

Routing

↓

Tool Planning

↓

Tool Execution

↓

Model Call

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

# Response Model

Every response contains

request_id

trace_id

provider

model

latency

token_usage

cost

tool_usage

response

warnings

metadata

---

# Logging

Every request logs

User

Workspace

Provider

Model

Duration

Cost

Input Tokens

Output Tokens

Retry Count

Fallback Used

Errors

Trace ID

---

# Metrics

Requests

Latency

Token Usage

Cost

Cache Hit Rate

Failure Rate

Fallback Count

Tool Usage

Model Usage

---

# Security

Never send

- API Keys
- Passwords
- Tokens
- Internal Secrets

Sensitive information masked before prompt creation.

---

# Prompt Versioning

Each prompt contains

Prompt ID

Version

Owner

Created At

Updated At

Status

Rollback supported.

---

# AI Cache

Cache

- Responses
- Embeddings
- Prompt Templates
- Tool Metadata

Cache invalidation event driven.

---

# Performance Targets

Request Validation

<20ms

Context Build

<100ms

Prompt Build

<100ms

Routing

<20ms

Provider Selection

<10ms

Average AI Response

<5 seconds

---

# Error Handling

Every error includes

Error Code

Category

Retryable

Message

Trace ID

Timestamp

Internal stack traces never exposed.

---

# Forbidden

No provider SDK usage outside adapters

No prompts inside source code

No direct tool execution

No direct database access from providers

No hardcoded model names

No provider-specific business logic

---

# Acceptance Criteria

AI Orchestrator accepted only if

- Provider independent
- Routing operational
- Memory integrated
- MCP integrated
- Logging enabled
- Metrics enabled
- Cost tracking enabled
- Tests passing

---

# Definition of Done

Feature complete only if

- Implemented
- Tested
- Logged
- Monitored
- Documented
- Secure
- Replaceable
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement AI Orchestrator as an isolated service
- separate routing from provider adapters
- never call providers directly from business logic
- implement provider abstraction
- implement prompt versioning
- implement context builder
- implement token estimation
- implement fallback routing
- implement retry strategy
- integrate with MCP Tool Manager
- generate structured logs
- expose Prometheus metrics
- generate unit and integration tests
- ensure provider interchangeability
- reject any implementation violating this specification

This specification is mandatory for every AI-related component.
