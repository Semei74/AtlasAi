# Atlas AI

# Authentication & Authorization Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Security Team

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

---

# Purpose

This document defines the authentication and authorization architecture of Atlas AI.

All user authentication, session management and permission validation must follow this specification.

---

# Objectives

The authentication system must be

- Secure
- Stateless
- Scalable
- Auditable
- Multi-device
- Provider Agnostic
- Extensible

---

# Authentication Architecture

User

↓

Frontend

↓

Authentication API

↓

Authentication Service

↓

Session Manager

↓

JWT Service

↓

Database

---

# Authentication Methods

Supported

- Email + Password
- Google OAuth (Future)
- Apple Sign-In (Future)
- GitHub OAuth (Future)
- Enterprise SSO (Future)

Primary method

Email + Password

---

# Registration Flow

User submits

- Email
- Password
- Display Name

↓

Validate

↓

Hash Password

↓

Create User

↓

Create Default Workspace

↓

Create Session

↓

Send Verification Email

↓

Login

---

# Login Flow

Email

↓

Password Validation

↓

Generate Access Token

↓

Generate Refresh Token

↓

Create Session

↓

Return Tokens

---

# Logout Flow

User Logout

↓

Invalidate Session

↓

Revoke Refresh Token

↓

Clear Client Tokens

↓

Write Audit Log

---

# Token Strategy

Access Token

JWT

Lifetime

15 minutes

Refresh Token

Opaque Token

Lifetime

30 days

Refresh tokens rotate after every refresh.

---

# JWT Claims

Required

sub

email

role

organization_id

workspace_id

session_id

issued_at

expires_at

token_version

---

# Password Policy

Minimum Length

12 characters

Must contain

- Uppercase
- Lowercase
- Number
- Special Character

Forbidden

- Common passwords
- User email
- Sequential characters

---

# Password Storage

Algorithm

Argon2id

Never

- MD5
- SHA1
- SHA256
- Plain text

Passwords are never recoverable.

---

# Email Verification

Verification required before

- AI usage
- Billing
- Organization invitations

Verification link expires in

24 hours

---

# Password Reset

Reset link

Single Use

Expiration

30 minutes

Previous links invalidated after use.

---

# Session Management

Each session stores

- Session ID
- User ID
- Device
- Platform
- IP Address
- Last Activity
- Created At
- Expires At

---

# Multi Device Support

Users may have multiple active sessions.

Users can revoke

- Current Session
- Selected Session
- All Sessions

---

# Authorization

Model

Role-Based Access Control (RBAC)

Future

Attribute-Based Access Control (ABAC)

---

# Default Roles

Owner

Admin

Manager

Member

Viewer

---

# Permission Categories

Authentication

Organizations

Workspaces

Projects

Chats

Files

AI

Memory

Billing

Administration

MCP Tools

Notifications

---

# Permission Rules

Every request validates

Authentication

↓

Organization Access

↓

Workspace Access

↓

Role

↓

Permission

↓

Subscription Limits

---

# API Key Authentication

Supported for

Server-to-Server communication

API Keys stored only as hashes.

Keys displayed once.

---

# Device Management

Users can

View Devices

Rename Devices

Remove Devices

Revoke Devices

---

# Security Controls

Mandatory

HTTPS

JWT Validation

Refresh Rotation

Replay Protection

CSRF Protection (Web)

Rate Limiting

Brute Force Detection

---

# Login Protection

Failed Attempts

5

Temporary Lock

15 minutes

Progressive delay enabled.

---

# Rate Limits

Login

10 requests/minute

Password Reset

5 requests/hour

Registration

10 requests/hour

Token Refresh

60 requests/hour

---

# Audit Events

Register

Login

Logout

Password Change

Password Reset

Email Verification

Session Revoked

Permission Changed

Role Changed

API Key Created

API Key Revoked

---

# Token Revocation

Triggers

Password Change

Account Disabled

Manual Logout

Session Revocation

Suspicious Activity

---

# Suspicious Activity Detection

Detect

Impossible Travel

New Device

New Country

Brute Force

Token Reuse

Excessive Requests

---

# Error Responses

Authentication Failed

Unauthorized

Forbidden

Session Expired

Token Invalid

Token Revoked

Permission Denied

---

# Performance Targets

Login

<300ms

Token Refresh

<100ms

Permission Check

<20ms

Session Validation

<20ms

---

# Logging

Every authentication event logs

User ID

Session ID

IP Address

Platform

User Agent

Result

Timestamp

Trace ID

Sensitive data never logged.

---

# Monitoring

Metrics

Successful Logins

Failed Logins

Active Sessions

Revoked Sessions

Password Resets

Verification Success Rate

---

# Compliance

Support

GDPR

CCPA

Audit Logging

Data Export

Account Deletion

Consent Tracking

---

# Forbidden

No plaintext passwords

No long-lived access tokens

No shared accounts

No hardcoded secrets

No authentication bypass

No direct role manipulation

No password recovery

---

# Acceptance Criteria

Authentication implementation accepted only if

- JWT implemented
- Refresh rotation enabled
- Password hashing uses Argon2id
- Sessions tracked
- RBAC enforced
- Audit logging enabled
- Rate limiting active
- Security tests passing

---

# Definition of Done

Authentication feature complete only if

- Implemented
- Tested
- Documented
- Logged
- Monitored
- Secure
- Audited
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement JWT authentication
- implement rotating refresh tokens
- implement Argon2id password hashing
- implement RBAC authorization
- implement session management
- implement email verification
- implement password reset flow
- implement audit logging
- implement brute force protection
- implement device management
- generate unit tests
- generate integration tests
- reject any implementation violating this specification

This specification is mandatory for every authentication and authorization component.
