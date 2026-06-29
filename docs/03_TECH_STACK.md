# Atlas AI

# Technology Stack Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Architecture Team

Related Documents:

- 00_MASTER_SPEC.md
- 01_PRODUCT_REQUIREMENTS.md
- 02_SYSTEM_ARCHITECTURE.md

---

# Purpose

This document defines the official technology stack for Atlas AI.

Every implementation must use the technologies described in this document unless a newer version of this specification explicitly replaces them.

Technology choices are based on:

- scalability
- maintainability
- security
- performance
- ecosystem maturity
- long-term support
- AI integration capabilities

---

# Core Principles

The technology stack must satisfy the following principles.

- Cross Platform
- API First
- AI First
- Modular
- Replaceable
- Cloud Agnostic
- Provider Agnostic
- Infrastructure as Code
- Testable
- Observable

---

# High Level Stack

Frontend

↓

Backend API

↓

AI Orchestrator

↓

MCP Tool Manager

↓

Infrastructure

↓

Cloud Services

---

# Frontend

## Framework

Flutter (Stable Channel)

Reason

- Single codebase
- Native performance
- Android
- iOS
- Web support
- Large ecosystem
- Excellent tooling

---

## Programming Language

Dart

Latest Stable Version

---

## State Management

Riverpod

Reason

- Compile-time safety
- Testability
- Dependency Injection
- Modular architecture

Forbidden

- Provider
- GetX
- Global mutable state

---

## Routing

GoRouter

Reason

- Official Flutter recommendation
- Deep Linking
- Web compatible

---

## Local Storage

Hive

Use Cases

- cached settings
- cached conversations
- offline queue
- preferences

---

## Secure Storage

Flutter Secure Storage

Use Cases

- tokens
- encryption keys
- device secrets

---

## HTTP Client

Dio

Requirements

- retry support
- interceptors
- authentication
- logging
- timeout configuration

---

## Serialization

json_serializable

build_runner

---

## Localization

intl

ARB localization files

---

## UI

Material 3

Custom Design System

No third-party UI kits.

---

## Charts

fl_chart

---

## Image Cache

cached_network_image

---

## Forms

flutter_form_builder

---

## Backend

Framework

FastAPI

Reason

- async
- OpenAPI support
- performance
- Python ecosystem
- typing

---

## Programming Language

Python

Stable LTS version

---

## Dependency Management

uv

Requirements

- lock file
- reproducible builds

---

## API

REST

Future

GraphQL Gateway if needed.

---

## Validation

Pydantic

---

## ORM

SQLAlchemy 2.x

Async Mode

---

## Database Migration

Alembic

---

## Authentication

JWT

Refresh Tokens

Rotating Refresh Tokens

---

## Password Hashing

Argon2

Forbidden

MD5

SHA1

SHA256 as password hashing

---

## Authorization

RBAC

Future

ABAC

---

## Task Queue

Celery

Broker

Redis

---

## Cache

Redis

Used for

- sessions
- rate limits
- AI cache
- queue
- temporary data

---

## Database

Primary

PostgreSQL

Reason

- mature
- ACID
- scalability
- indexing
- JSON support

Forbidden

SQLite in production

---

## File Storage

S3 Compatible Storage

Supported Providers

MinIO

Cloudflare R2

AWS S3

Backblaze

Storage implementation must be replaceable.

---

# AI Layer

Architecture

AI Orchestrator

↓

Provider Interface

↓

Providers

---

## Supported Providers

OpenAI

Anthropic

Google Gemini

OpenRouter

Local Models

Future Providers

Every provider must implement the same interface.

---

## Embeddings

Provider independent

Implementation hidden behind adapter.

---

## Prompt Management

Central Prompt Library

Prompt Versioning

Prompt Templates

No prompts inside business logic.

---

## AI Memory

Separate module.

Never inside provider adapter.

---

# MCP

Architecture

MCP Tool Manager

↓

Registered Tools

↓

Execution Layer

↓

Provider

---

## Initial MCP Tools

Filesystem

Web Search

PDF

DOCX

OCR

Email

Calendar

Image Generation

Speech

Translation

Browser

Spreadsheet

Presentation

---

## MCP Rules

Each tool

- isolated
- versioned
- documented
- testable
- replaceable

---

# OCR

Primary

Tesseract

Optional

Cloud OCR providers

OCR implementation hidden behind interface.

---

# Document Generation

python-docx

reportlab

markdown

openpyxl

python-pptx

---

# Search

Provider independent

Search module isolated.

---

# Logging

structlog

Requirements

JSON logs

Request IDs

Correlation IDs

Trace IDs

---

# Monitoring

Prometheus

Grafana

OpenTelemetry

Health Checks

---

# Error Tracking

Sentry

Requirements

Environment separation

Sensitive data masking

---

# Testing

Unit Tests

pytest

---

Integration Tests

pytest

Testcontainers

---

API Tests

httpx

---

Flutter Tests

flutter_test

integration_test

mocktail

---

Coverage

Backend

Minimum

90%

Frontend

Minimum

85%

---

# CI/CD

GitHub Actions

Pipeline

Lint

↓

Tests

↓

Security Scan

↓

Build

↓

Docker

↓

Deploy

---

# Containers

Docker

Docker Compose

Development

Production

---

# Reverse Proxy

NGINX

Responsibilities

TLS

Compression

Caching

Security Headers

Rate Limiting

---

# Infrastructure

Terraform

Future Ready

---

# Secrets

Never committed.

Development

.env

Production

Secret Manager

Vault compatible

---

# Analytics

Firebase Analytics

Self-hosted analytics supported later.

---

# Push Notifications

Firebase Cloud Messaging

Apple Push Notification Service

---

# Crash Reporting

Firebase Crashlytics

---

# Dependency Injection

Backend

dependency-injector

Frontend

Riverpod

---

# Documentation

Markdown

OpenAPI

Swagger

Architecture Decision Records

---

# Code Quality

Backend

ruff

black

mypy

---

Frontend

dart format

flutter analyze

very_good_analysis

---

# Security

Bandit

Trivy

GitHub Dependabot

Secret Scanning

---

# Version Control

Git

Main Branch

main

Development

develop

Feature Branches

feature/*

Bug Fixes

fix/*

Hotfix

hotfix/*

---

# Naming Conventions

Backend

snake_case

Python Classes

PascalCase

Flutter Widgets

PascalCase

Variables

camelCase

Database

snake_case

API

kebab-case

---

# Forbidden Technologies

No Firebase Authentication

No Supabase Authentication

No Business Logic in Flutter Widgets

No SQLite Production Database

No Hardcoded Secrets

No Vendor Lock-In

No Direct AI SDK Calls from UI

No Static Global State

No Unstructured Logging

No Anonymous Exceptions

---

# Upgrade Policy

Dependencies updated monthly.

Security updates immediately.

Major versions evaluated individually.

---

# Acceptance Criteria

Technology stack is considered implemented only if

- every technology matches this document
- dependency versions are locked
- reproducible builds exist
- CI passes
- security scan passes
- documentation updated
- architecture remains provider agnostic
- cloud provider can be replaced
- AI provider can be replaced
- storage provider can be replaced

---

# Definition of Done

A technology integration is complete only if

- implemented
- tested
- documented
- benchmarked
- monitored
- logged
- configurable
- replaceable
- production ready

---

# OpenCode Instructions

OpenCode MUST:

- strictly follow this technology stack
- never replace technologies without updating documentation
- prefer official libraries
- avoid experimental packages
- isolate every third-party dependency
- generate abstractions before implementations
- never couple business logic with external SDKs
- keep provider implementations interchangeable
- keep cloud implementations interchangeable
- generate dependency injection configuration
- generate automated tests
- generate documentation for every integration
- validate licenses of all dependencies
- reject any implementation violating this specification

This document is mandatory for every future implementation.
