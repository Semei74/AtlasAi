# Atlas AI

# Memory System Specification

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
- 08_AI_ORCHESTRATOR.md

---

# Purpose

This document defines the Memory System used by Atlas AI.

The Memory System provides persistent, structured and controllable memory for every user, workspace and organization.

Memory is independent from AI providers.

Replacing an AI provider must never affect stored memory.

---

# Objectives

The Memory System must be

- Persistent
- Searchable
- Versioned
- Secure
- Explainable
- Editable
- Auditable
- Provider Agnostic
- Scalable

---

# High Level Architecture

User

↓

Conversation

↓

AI Orchestrator

↓

Memory Manager

↓

Memory Store

↓

Retrieval Engine

↓

Ranking Engine

↓

Context Builder

↓

Prompt Builder

---

# Memory Types

## Short-Term Memory

Purpose

Conversation context.

Retention

Current conversation.

Automatically expires.

---

## Long-Term Memory

Purpose

Remember user preferences and facts.

Retention

Unlimited until removed.

---

## Workspace Memory

Purpose

Workspace knowledge.

Examples

- project rules
- naming conventions
- preferred languages
- coding standards
- documentation style

---

## Organization Memory

Purpose

Shared company knowledge.

Examples

- policies
- workflows
- standards
- documentation
- templates

---

## Project Memory

Purpose

Project-specific knowledge.

Examples

- architecture
- APIs
- dependencies
- milestones
- business rules

---

## User Preference Memory

Examples

- preferred language
- response style
- timezone
- units
- formatting
- favorite AI model

---

## AI Working Memory

Temporary execution memory.

Exists only during workflow execution.

Never persisted.

---

# Memory Categories

Facts

Preferences

Instructions

Tasks

Projects

Documents

Files

Code

Contacts

Templates

Notes

Bookmarks

History

---

# Memory Record Structure

Every memory record contains

id

memory_type

owner_type

owner_id

title

content

summary

tags

importance

confidence

source

created_at

updated_at

expires_at

version

status

---

# Ownership

Memory may belong to

User

Workspace

Organization

Project

Workflow

System

---

# Importance Levels

Critical

High

Medium

Low

Temporary

Importance affects retrieval priority.

---

# Confidence Levels

100

90

75

50

25

Confidence decreases when memory becomes outdated.

---

# Status

Active

Archived

Expired

Deleted

Invalidated

---

# Memory Lifecycle

Create

↓

Validate

↓

Store

↓

Index

↓

Retrieve

↓

Update

↓

Archive

↓

Delete

---

# Memory Creation

Memory may be created by

User

AI

Workflow

System

Administrator

Automatically Generated Rule

---

# Memory Retrieval

Retrieval considers

Ownership

Permissions

Importance

Confidence

Recency

Tags

Similarity

Current task

Conversation

---

# Ranking Algorithm

Ranking score based on

Importance

Recency

Similarity

Confidence

Usage frequency

Workspace priority

Organization priority

---

# Memory Search

Supported

Keyword Search

Semantic Search

Tag Search

Hybrid Search

Future

Vector Search

---

# Memory Compression

Old memories may be summarized.

Original memory retained.

Compression never deletes original data.

---

# Memory Expiration

Temporary memory

Automatic expiration.

Long-term memory

Never expires unless configured.

---

# Memory Versioning

Every update creates

New Version

Previous versions retained.

Rollback supported.

---

# Memory Editing

Users may

View

Edit

Archive

Delete

Export

Import

Restore

---

# Memory Permissions

User Memory

Owner only

Workspace Memory

Workspace members

Organization Memory

Organization members

System Memory

Read-only

---

# Memory Context Budget

Priority order

Critical

High

Medium

Low

Temporary

If context exceeds token budget

Lowest ranked memories removed first.

---

# Memory Deduplication

Duplicate memories detected by

Content similarity

Title similarity

Semantic similarity

Duplicates merged only after validation.

---

# Memory Validation

Every memory validated for

Size

Permissions

Encoding

Safety

Schema

Duplicates

---

# Memory Security

Encrypted at rest

Encrypted in transit

Access logged

Permission checked

Sensitive data masked

---

# Memory Audit

Every operation logged

Create

Read

Update

Delete

Export

Import

Restore

---

# Memory Metrics

Stored Memories

Retrieved Memories

Hit Rate

Average Retrieval Time

Average Ranking Time

Average Memory Size

Compression Rate

---

# Performance Targets

Memory Retrieval

<100ms

Ranking

<50ms

Storage

<100ms

Search

<300ms

---

# Backup

Daily backup

Version history

Point-in-time recovery

Encrypted storage

---

# Integration

Integrated with

AI Orchestrator

Context Builder

Prompt Builder

Workflow Engine

Search Engine

Notification System

Audit System

---

# Forbidden

No provider-specific memory

No direct AI provider storage

No anonymous memory

No mutable history

No hardcoded memory limits

No deletion without audit

---

# Acceptance Criteria

Memory System accepted only if

- Persistent
- Searchable
- Versioned
- Permission controlled
- Integrated with AI Orchestrator
- Fully audited
- Encrypted
- Tested

---

# Definition of Done

Memory feature complete only if

- Implemented
- Indexed
- Searchable
- Tested
- Logged
- Monitored
- Documented
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement Memory as an independent subsystem
- separate storage from retrieval logic
- implement ranking engine
- implement permission checks
- implement semantic search interface
- implement version history
- implement import/export
- implement memory compression
- integrate with AI Orchestrator
- integrate with Context Builder
- generate structured logs
- expose Prometheus metrics
- generate unit and integration tests
- ensure provider independence
- reject any implementation violating this specification

This specification is mandatory for every memory-related component.
