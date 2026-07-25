# Atlas AI

# Coding Standards Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Engineering Team

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
- 22_AI_PROMPTS.md

---

# Purpose

This document defines mandatory coding standards for every Atlas AI repository.

Every line of code must comply with these standards.

---

# Objectives

Code must be

- Readable
- Maintainable
- Testable
- Modular
- Secure
- Performant
- Documented
- Consistent

---

# General Principles

- SOLID
- DRY
- KISS
- YAGNI
- Clean Architecture
- Dependency Injection
- Composition over Inheritance
- Explicit over Implicit

---

# Repository Structure

Every module contains

src/

tests/

docs/

README.md

No business logic outside src/.

---

# Naming

Classes

PascalCase

Interfaces

PascalCase

Functions

camelCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Files

snake_case or feature-based naming

Folders

lowercase

---

# File Size

Maximum

500 lines

Preferred

<300 lines

Split large files into modules.

---

# Function Size

Maximum

50 lines

Preferred

20–30 lines

Functions must perform one responsibility only.

---

# Class Size

Maximum

300 lines

Single responsibility required.

---

# Comments

Code should be self-explanatory.

Allowed comments

- Public API documentation
- Complex algorithms
- Business rules
- Security notes

No commented-out code.

---

# Documentation

Every public

Class

Method

Interface

API

Module

must include documentation.

---

# Error Handling

Never ignore exceptions.

Every exception

- logged
- categorized
- traceable
- user-friendly

No empty catch blocks.

---

# Dependency Injection

Required for

Repositories

Services

Providers

Adapters

Controllers

No direct dependency creation.

---

# Architecture Rules

Business layer must never depend on

UI

Database

Storage

External APIs

AI Providers

---

# Async Code

Use async operations when supported.

Avoid blocking calls.

No busy waiting.

---

# API Standards

REST endpoints

Versioned

Validated

Documented

Typed

Idempotent where applicable.

---

# Database Standards

Parameterized queries only.

No raw SQL in controllers.

Repositories isolate persistence.

---

# Security Standards

Validate all input.

Escape output.

Never expose secrets.

Never hardcode credentials.

---

# Logging Standards

Structured JSON logs only.

Every request includes

Request ID

Trace ID

Timestamp

Service Name

---

# Testing Requirements

Every production feature requires

Unit Tests

Integration Tests

Regression Tests (where applicable)

Critical logic requires 100% coverage.

---

# Performance Standards

Avoid

N+1 Queries

Repeated allocations

Blocking I/O

Large synchronous loops

Unbounded recursion

---

# Memory Management

Dispose resources correctly.

Avoid leaks.

Cache only when justified.

Monitor memory usage.

---

# Configuration

Configuration via

Environment Variables

Secret Manager

Configuration Files

No hardcoded values.

---

# Git Standards

Commits must

- be atomic
- have descriptive messages
- reference tasks when applicable

Direct commits to protected branches forbidden.

---

# Code Reviews

Every Pull Request requires

Minimum

1 approval

Recommended

2 approvals

Review checklist includes

Architecture

Security

Performance

Tests

Documentation

---

# Static Analysis

Required tools

Linter

Formatter

Type Checker

Dependency Scanner

Secret Scanner

Build fails on critical violations.

---

# Formatting

Automatic formatting required.

No manual style differences.

Formatting enforced in CI.

---

# Forbidden

No duplicated business logic

No dead code

No TODO in production

No console debugging

No hardcoded secrets

No unused dependencies

No circular dependencies

No giant classes

No giant functions

---

# Acceptance Criteria

Code accepted only if

- Lint passes
- Formatting passes
- Static analysis passes
- Tests pass
- Documentation complete
- Security scan passes
- Review approved

---

# Definition of Done

Code complete only if

- Implemented
- Tested
- Reviewed
- Documented
- Formatted
- Secure
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- follow SOLID architecture
- enforce dependency injection
- generate modular code
- automatically format source files
- generate documentation for public APIs
- create production-ready tests
- enforce static analysis
- block insecure code
- reject code that violates this specification
- maintain consistent architecture across all repositories

This specification is mandatory for every line of code in Atlas AI.
