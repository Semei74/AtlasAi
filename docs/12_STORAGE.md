# Atlas AI

# Storage Architecture Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Platform Team

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

---

# Purpose

This document defines the complete storage architecture for Atlas AI.

Storage must be independent from cloud vendors and allow replacement without affecting business
logic.

---

# Objectives

The storage system must be

- Secure
- Scalable
- Durable
- Versioned
- Cloud Agnostic
- Provider Agnostic
- Highly Available
- Observable

---

# Storage Architecture

Frontend

↓

Backend API

↓

Storage Service

↓

Storage Adapter

↓

Storage Provider

---

# Supported Providers

Primary

- Amazon S3
- Cloudflare R2
- MinIO

Future

- Google Cloud Storage
- Azure Blob Storage
- Backblaze B2

Every provider implements the same interface.

---

# Storage Layers

Application Layer

↓

Storage Service

↓

Storage Adapter

↓

Provider SDK

Business logic never communicates directly with provider SDKs.

---

# Storage Buckets

avatars

documents

images

exports

imports

temp

logs

backups

attachments

generated

Each bucket has an independent lifecycle policy.

---

# Supported File Types

Documents

- PDF
- DOCX
- XLSX
- CSV
- TXT
- MD

Images

- PNG
- JPG
- JPEG
- WEBP
- SVG

Archives

- ZIP

Future

- PPTX
- MP4
- MP3

---

# Upload Flow

Client

↓

Authentication

↓

Permission Validation

↓

Virus Scan

↓

Checksum

↓

Storage

↓

Metadata Save

↓

Audit Log

↓

Response

---

# Download Flow

Permission Validation

↓

Metadata Lookup

↓

Temporary Signed URL

↓

Download

↓

Audit Log

---

# File Metadata

Every file stores

id

owner_id

workspace_id

organization_id

filename

original_filename

mime_type

extension

size

checksum

provider

bucket

storage_key

version

status

created_at

updated_at

deleted_at

---

# File Versioning

Every update creates

New Version

Previous versions remain available.

Rollback supported.

---

# Storage Classes

Hot Storage

Frequently accessed

Warm Storage

Occasionally accessed

Cold Storage

Archive

Storage class configurable.

---

# Temporary Files

Lifetime

24 hours

Automatic cleanup required.

---

# Image Processing

Supported

Resize

Compress

Thumbnail

Metadata Extraction

Background Processing

---

# Virus Scanning

Every uploaded file must be scanned before becoming available.

Infected files

- quarantined
- unavailable
- logged
- reported

---

# Encryption

Mandatory

Encryption in transit

TLS 1.3

Encryption at rest

AES-256

---

# Signed URLs

Download

Maximum validity

15 minutes

Upload

Maximum validity

10 minutes

URLs are single purpose.

---

# Deduplication

Duplicate detection uses

SHA-256 checksum

Reference existing file when appropriate.

---

# Storage Quotas

Applied to

User

Workspace

Organization

Subscription Plan

Quota checks occur before upload.

---

# Retention Policy

Temporary Files

24 hours

Deleted Files

30 days

Audit Files

7 years

Backups

365 days

---

# Backup Strategy

Daily Backup

Weekly Verification

Monthly Restore Test

Encrypted Storage

Geo-redundant backup supported.

---

# Cleanup Jobs

Remove expired files

Remove orphaned files

Verify integrity

Recalculate metadata

Cleanup temporary storage

Generate reports

---

# Access Control

Every request validates

Authentication

Authorization

Workspace Access

Organization Access

Subscription Limits

File Ownership

---

# Performance Targets

Metadata Lookup

<50ms

Upload Initialization

<200ms

Download Initialization

<100ms

Thumbnail Generation

<2 seconds

---

# Monitoring

Metrics

Storage Used

Uploads

Downloads

Errors

Quota Usage

Average File Size

Processing Time

---

# Logging

Log every

Upload

Download

Delete

Restore

Rename

Move

Share

Version Restore

---

# Error Handling

Handle

Upload Failure

Download Failure

Storage Provider Failure

Checksum Failure

Virus Detection

Quota Exceeded

Permission Denied

Timeout

---

# Disaster Recovery

Automatic Failover

Provider Migration

Backup Restore

Integrity Verification

Recovery documentation required.

---

# Security Rules

No public buckets

No direct storage access

No unsigned downloads

No unsigned uploads

No hardcoded credentials

No secret exposure

---

# Forbidden

No local filesystem storage in production

No provider-specific business logic

No bypass of virus scanning

No permanent temporary files

No anonymous uploads

---

# Acceptance Criteria

Storage implementation accepted only if

- Provider abstraction implemented
- Versioning operational
- Encryption enabled
- Virus scanning enabled
- Signed URLs implemented
- Quotas enforced
- Audit logging enabled
- Tests passing

---

# Definition of Done

Storage feature complete only if

- Implemented
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

- implement provider abstraction
- isolate storage providers
- generate signed URLs
- implement file versioning
- implement metadata management
- implement quota validation
- implement virus scanning integration
- implement cleanup jobs
- implement backup verification
- generate unit and integration tests
- expose storage metrics
- reject any implementation violating this specification

This specification is mandatory for every storage-related component.
