# Atlas AI

# Subscription & Billing Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Product & Billing Team

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

---

# Purpose

This document defines the complete subscription and billing architecture for Atlas AI.

The billing system must support recurring subscriptions, usage limits, feature gating and future enterprise licensing.

---

# Objectives

The subscription platform must be

- Secure
- Flexible
- Extensible
- Auditable
- Automated
- Provider Agnostic
- Highly Available
- Scalable

---

# Subscription Architecture

User

↓

Subscription Service

↓

Billing Engine

↓

Payment Provider

↓

Webhook Processor

↓

Database

↓

Notification Service

↓

Audit Log

---

# Subscription Plans

Free

Starter

Pro

Business

Enterprise

Custom plans supported.

---

# Plan Capabilities

Each plan defines

- AI Requests
- Monthly Tokens
- Workspaces
- Projects
- Storage
- File Upload Size
- MCP Access
- Premium AI Models
- Team Members
- API Access
- Priority Support

---

# Usage Limits

Limits may include

AI Requests

Monthly Tokens

Daily Tokens

Storage

Projects

Documents

Chats

API Requests

Workspaces

Team Members

Uploads

Exports

---

# Billing Cycle

Supported

Monthly

Yearly

Future

Usage-Based

Hybrid Billing

---

# Subscription States

Trial

Active

Past Due

Suspended

Cancelled

Expired

Pending

Grace Period

---

# Trial

Default Trial

14 Days

Configurable.

Trial converts automatically after successful payment.

---

# Payment Providers

Architecture supports

Stripe

Paddle

Lemon Squeezy

Future Providers

Provider implementation isolated through adapters.

---

# Payment Workflow

User Selects Plan

↓

Create Checkout Session

↓

Payment Provider

↓

Webhook

↓

Verify Signature

↓

Activate Subscription

↓

Update Limits

↓

Notify User

↓

Audit Log

---

# Webhook Processing

Every webhook validates

Signature

Timestamp

Replay Protection

Provider Event ID

Duplicate Detection

---

# Feature Gating

Every premium feature validates

Subscription

↓

Plan

↓

Usage

↓

Permissions

↓

Access

---

# Usage Tracking

Track

Input Tokens

Output Tokens

AI Requests

Storage

Uploads

Downloads

API Calls

Projects

Documents

MCP Executions

---

# Overage Policy

Configurable

Block Requests

Soft Limit

Hard Limit

Purchase Additional Credits

Future Feature

---

# Subscription Upgrade

Upgrade

↓

Immediate Activation

↓

Prorated Billing

↓

Update Limits

↓

Audit Log

---

# Subscription Downgrade

Downgrade

↓

Validate Current Usage

↓

Schedule Next Billing Cycle

↓

Reduce Limits

↓

Notify User

---

# Cancellation

Cancellation Options

End of Billing Cycle

Immediate (Admin)

Grace Period Supported

Data retained according to retention policy.

---

# Invoices

Every payment generates

Invoice Number

Invoice Date

Subscription

Taxes

Currency

Status

Download URL

---

# Taxes

Architecture supports

VAT

GST

Sales Tax

Regional Rules

Provider handles tax calculation when supported.

---

# Currency

Support

USD

EUR

GBP

Future Multi-Currency

---

# Refunds

Support

Full Refund

Partial Refund

Provider Managed

Audit Logged

---

# Notifications

Notify Users on

Trial Ending

Payment Success

Payment Failure

Subscription Activated

Subscription Cancelled

Invoice Available

Usage Limit Warning

Plan Changed

---

# Security

Validate

Webhook Signatures

Replay Protection

Idempotency

Permission Checks

Audit Logging

No payment data stored internally.

---

# Audit Events

Subscription Created

Subscription Updated

Subscription Cancelled

Payment Received

Payment Failed

Refund Issued

Plan Changed

Usage Limit Exceeded

Invoice Generated

---

# Monitoring

Track

MRR

ARR

Active Subscribers

Churn

Trial Conversion

Failed Payments

Revenue

Average Revenue Per User

Token Consumption

---

# Performance Targets

Subscription Validation

<20ms

Usage Validation

<20ms

Webhook Processing

<2 seconds

Checkout Initialization

<500ms

---

# Compliance

Support

GDPR

PCI DSS (via provider)

SOC2 Ready

Invoice Retention

Audit Retention

---

# Forbidden

No payment card storage

No hardcoded plan limits

No direct provider logic in business layer

No unsigned webhook processing

No subscription bypass

---

# Acceptance Criteria

Subscription implementation accepted only if

- Multiple plans supported
- Feature gating implemented
- Usage tracking operational
- Billing automated
- Webhooks validated
- Audit logging enabled
- Monitoring configured
- Tests passing

---

# Definition of Done

Subscription feature complete only if

- Implemented
- Tested
- Logged
- Monitored
- Documented
- Secure
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement provider abstraction for billing
- implement subscription lifecycle management
- implement feature gating
- implement usage metering
- validate webhook signatures
- generate invoices metadata
- implement upgrade and downgrade flows
- implement billing notifications
- expose billing metrics
- generate unit and integration tests
- reject any implementation violating this specification

This specification is mandatory for every subscription and billing component.
