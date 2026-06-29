# Atlas AI

# AI Prompts & Prompt Engineering Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: AI Engineering Team

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
- 10_API.md
- 11_AUTH.md
- 12_STORAGE.md
- 13_SECURITY.md
- 14_LOGGING.md
- 15_DEVOPS.md
- 16_TESTING.md
- 17_DEPLOYMENT.md
- 18_MONITORING.md
- 19_UI_UX.md
- 20_WORKFLOWS.md
- 21_SUBSCRIPTIONS.md

---

# Purpose

This document defines the prompt engineering architecture for Atlas AI.

Every AI request must be generated through standardized prompt templates.

Direct prompt construction inside application code is prohibited.

---

# Objectives

The prompt system must be

- Modular
- Versioned
- Reusable
- Testable
- Observable
- Secure
- Provider Agnostic
- Easily Extensible

---

# Prompt Architecture

User Request

↓

Intent Detection

↓

Context Builder

↓

Memory Loader

↓

System Prompt

↓

Developer Prompt

↓

Workspace Context

↓

Tool Context

↓

User Prompt

↓

AI Provider

↓

Response Validator

↓

Output

---

# Prompt Layers

Every request contains

- System Prompt
- Developer Prompt
- Business Rules
- User Context
- Memory Context
- Workspace Context
- Tool Context
- User Message

---

# Prompt Categories

General Assistant

Code Generation

Code Review

Bug Fixing

Documentation

Planning

Summarization

Translation

Search

Project Management

Task Management

Workflow Automation

File Analysis

Meeting Notes

---

# Prompt Versioning

Every prompt stores

Prompt ID

Version

Owner

Status

Created At

Updated At

Description

Supported Models

---

# Prompt Repository

Store prompts separately from source code.

Structure

prompts/

general/

coding/

analysis/

planning/

memory/

search/

workflow/

system/

---

# Context Builder

Context sources

Conversation History

Memory

Workspace

Projects

Tasks

Files

User Settings

Subscription

Available MCP Tools

---

# Prompt Safety

Validate

Prompt Injection

Jailbreak Attempts

Malicious Instructions

Sensitive Data Leakage

Unsafe Tool Requests

---

# Prompt Variables

Supported Variables

{{user}}

{{workspace}}

{{project}}

{{language}}

{{timezone}}

{{memory}}

{{tools}}

{{subscription}}

{{today}}

---

# AI Output Validation

Validate

JSON Schema

Markdown

Code Blocks

Length

Formatting

Safety

Required Fields

---

# Tool Calling

Prompt must describe

Available Tools

Tool Permissions

Tool Parameters

Execution Rules

Expected Output

Fallback Rules

---

# Memory Integration

Before every AI request

Load Relevant Memory

↓

Filter Sensitive Data

↓

Rank Relevance

↓

Inject Into Prompt

---

# Provider Independence

Prompts must work with

OpenAI

Anthropic

Google

OpenRouter

Local LLMs

Provider-specific formatting isolated by adapters.

---

# Prompt Optimization

Track

Latency

Accuracy

Token Usage

Cost

Success Rate

Fallback Rate

User Rating

---

# Testing

Every prompt tested for

Correctness

Determinism

Safety

Token Count

Output Structure

Failure Handling

---

# Monitoring

Monitor

Prompt Version

Model Used

Latency

Tokens

Cost

Errors

Fallbacks

Success Rate

---

# Performance Targets

Prompt Build

<50ms

Context Loading

<100ms

Validation

<20ms

---

# Security

Never inject

Passwords

Secrets

API Keys

Private Tokens

Internal Credentials

Sensitive personal data

---

# Forbidden

No hardcoded prompts in business logic

No provider-specific business rules

No prompt without validation

No prompt without version

No unlogged prompt execution

---

# Acceptance Criteria

Prompt system accepted only if

- Prompt repository implemented
- Versioning enabled
- Context builder operational
- Safety validation active
- Output validation implemented
- Metrics collected
- Tests passing

---

# Definition of Done

Prompt system complete only if

- Implemented
- Versioned
- Tested
- Logged
- Monitored
- Documented
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement centralized prompt repository
- separate prompts from application code
- implement prompt versioning
- implement context builder
- implement memory injection
- implement output validation
- implement prompt safety checks
- collect prompt metrics
- generate prompt tests
- reject any implementation violating this specification

This specification is mandatory for every AI prompt used in Atlas AI.
