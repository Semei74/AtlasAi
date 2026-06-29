# Atlas AI

# Database Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Architecture Team

Related Documents

- 00_MASTER_SPEC.md
- 01_PRODUCT_REQUIREMENTS.md
- 02_SYSTEM_ARCHITECTURE.md
- 03_TECH_STACK.md

---

# Purpose

This document defines the complete database architecture for Atlas AI.

Every persistent entity must be defined here before implementation.

No table may be added without updating this specification.

---

# Goals

The database must be

- Scalable
- Reliable
- Normalized
- Secure
- Auditable
- Extensible
- Performant
- Provider Agnostic

---

# Database Engine

Primary Database

PostgreSQL

Minimum Version

16+

Encoding

UTF-8

Timezone

UTC

---

# Naming Rules

Tables

snake_case

Columns

snake_case

Indexes

idx_table_column

Foreign Keys

fk_table_reference

Primary Keys

pk_table

Unique Keys

uq_table_column

---

# ID Strategy

Every table uses

UUID v7

Never use auto increment IDs.

---

# Audit Fields

Every table MUST contain

id

created_at

updated_at

deleted_at

created_by

updated_by

version

---

# Soft Delete

Soft delete is mandatory.

deleted_at

NULL = Active

Timestamp = Deleted

No physical deletion except scheduled cleanup jobs.

---

# Core Domains

Authentication

↓

Users

↓

Organizations

↓

Workspaces

↓

Projects

↓

Chats

↓

AI

↓

Files

↓

Billing

↓

Memory

↓

Notifications

↓

Audit

---

# Entity: users

Purpose

Stores user accounts.

Fields

id

email

password_hash

display_name

avatar_url

language

timezone

status

email_verified

last_login_at

created_at

updated_at

deleted_at

Indexes

email

status

---

# Entity: user_sessions

Purpose

Active login sessions.

Fields

id

user_id

device_name

platform

ip_address

refresh_token_hash

expires_at

created_at

---

# Entity: organizations

Fields

id

name

slug

logo_url

owner_id

subscription_id

created_at

updated_at

---

# Entity: organization_members

Fields

id

organization_id

user_id

role

status

joined_at

---

# Entity: workspaces

Purpose

Main working environment.

Fields

id

organization_id

name

description

color

icon

created_at

updated_at

---

# Entity: projects

Fields

id

workspace_id

name

description

status

created_at

updated_at

---

# Entity: chats

Fields

id

workspace_id

title

model

status

created_at

updated_at

---

# Entity: chat_messages

Fields

id

chat_id

role

content

token_count

provider

response_time

created_at

---

# Entity: attachments

Fields

id

message_id

file_id

attachment_type

created_at

---

# Entity: files

Fields

id

workspace_id

storage_provider

storage_key

filename

mime_type

size

checksum

status

created_at

updated_at

---

# Entity: folders

Fields

id

workspace_id

parent_folder_id

name

created_at

---

# Entity: tags

Fields

id

workspace_id

name

color

---

# Entity: file_tags

Fields

id

file_id

tag_id

---

# Entity: ai_requests

Fields

id

user_id

provider

model

workflow

status

prompt_tokens

completion_tokens

cost

duration

created_at

---

# Entity: ai_responses

Fields

id

request_id

status

response_size

cached

created_at

---

# Entity: prompts

Fields

id

name

version

content

enabled

created_at

---

# Entity: workflows

Fields

id

workspace_id

name

status

trigger

created_at

---

# Entity: workflow_steps

Fields

id

workflow_id

step_number

tool_name

configuration

status

---

# Entity: memory_items

Fields

id

user_id

memory_type

content

importance

expires_at

created_at

---

# Entity: subscriptions

Fields

id

organization_id

plan

status

renewal_date

provider

created_at

---

# Entity: invoices

Fields

id

subscription_id

provider_invoice_id

amount

currency

status

issued_at

---

# Entity: notifications

Fields

id

user_id

type

title

body

is_read

created_at

---

# Entity: audit_logs

Purpose

Immutable audit trail.

Fields

id

user_id

action

resource

resource_id

ip_address

user_agent

metadata

created_at

Audit records are never updated.

---

# Entity: api_keys

Fields

id

organization_id

name

key_hash

last_used_at

expires_at

created_at

---

# Entity: rate_limits

Fields

id

user_id

endpoint

requests

window_start

---

# Entity: feature_flags

Fields

id

name

enabled

rollout_percentage

created_at

---

# Relationships

Organization

↓

Workspaces

↓

Projects

↓

Chats

↓

Messages

↓

Attachments

↓

Files

---

User

↓

Sessions

↓

Memory

↓

Notifications

↓

AI Requests

↓

Audit Logs

---

# Index Strategy

Indexes required for

email

workspace_id

organization_id

chat_id

user_id

created_at

status

provider

workflow

---

# Full Text Search

Use PostgreSQL Full Text Search

Supported Tables

files

messages

prompts

memory_items

Future

Elastic/OpenSearch Adapter

---

# Transactions

Required for

Billing

Subscription

Workspace Creation

User Registration

Workflow Execution

---

# Constraints

Every foreign key must enforce integrity.

Every UUID must be unique.

Every email must be unique.

Workspace names unique within organization.

Organization slug globally unique.

---

# JSON Columns

Allowed only for

metadata

provider_response

tool_configuration

Never store business entities inside JSON.

---

# Encryption

Encrypt

API Keys

Tokens

Secrets

Sensitive Metadata

Passwords never encrypted.

Passwords are hashed.

---

# Retention Policy

Audit Logs

7 years

Notifications

180 days

AI Logs

90 days

Sessions

30 days

Temporary Files

24 hours

Deleted Records

30 days

---

# Backup Policy

Daily Full Backup

Hourly Incremental Backup

Point-in-Time Recovery

Encrypted Storage

Backup Verification Weekly

---

# Migration Rules

Every schema change requires

Alembic Migration

Rollback Migration

Documentation Update

Test Coverage

---

# Performance Targets

Simple Query

<50ms

Complex Query

<300ms

Search

<500ms

Insert

<100ms

---

# Scaling Strategy

Read Replicas

Partitioning

Connection Pooling

Archive Tables

Background Cleanup

---

# Security Rules

No direct SQL from controllers.

All access through repositories.

Parameterized queries only.

SQL Injection protection mandatory.

Database credentials stored only in Secret Manager.

---

# Forbidden

No AUTO_INCREMENT

No business logic in triggers

No nullable foreign keys without justification

No duplicated data

No SELECT *

No hardcoded SQL in services

No schema changes without migration

---

# Acceptance Criteria

Database implementation is accepted only if

- schema matches this document
- migrations exist
- indexes created
- constraints validated
- backups configured
- encryption enabled
- audit logging implemented
- tests passing

---

# Definition of Done

Database task is complete only if

- schema implemented
- migrations created
- rollback tested
- indexes verified
- documentation updated
- performance validated
- security reviewed

---

# OpenCode Instructions

OpenCode MUST

- generate SQLAlchemy models from this specification
- generate Alembic migrations
- generate repository interfaces
- generate repository implementations
- generate database tests
- never skip indexes
- never remove audit fields
- never use integer IDs
- never violate foreign key rules
- always support soft delete
- always support optimistic locking
- always document schema changes
- always generate rollback migrations

Any database implementation conflicting with this document must be rejected and regenerated.
