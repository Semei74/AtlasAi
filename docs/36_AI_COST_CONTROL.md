# Atlas AI

# AI Cost Control Specification

**Version:** 1.0.0 **Status:** Approved **Document Type:** AI Cost Control Specification
**Priority:** Critical **Owner:** AI Platform Team **Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the AI Cost Control architecture for Atlas AI.

The objective is to continuously optimize AI spending while maintaining response quality,
availability, and user experience.

---

# 2. Objectives

The AI Cost Control subsystem shall provide:

- Cost visibility
- Budget enforcement
- Token optimization
- Provider comparison
- Automatic model selection
- Spending alerts
- Usage analytics
- Enterprise budgeting

---

# 3. Architecture

```
Client
   │
   ▼
AI Orchestrator
   │
   ▼
Cost Controller
   │
 ┌────┼─────────────┐
 ▼    ▼             ▼
Budget Token     Model
Engine Counter   Router
   │
   ▼
Provider APIs
```

---

# 4. Cost Management Principles

Atlas AI follows these principles:

- Minimize token usage
- Select the lowest-cost suitable model
- Prevent unnecessary requests
- Cache reusable responses
- Enforce subscription limits
- Monitor spending continuously
- Maintain predictable operating costs

---

# 5. Cost Dimensions

The system shall track:

- Prompt Tokens
- Completion Tokens
- Embedding Tokens
- Vision Requests
- Audio Requests
- OCR Processing
- Tool Calls
- External API Costs

---

# 6. Budget Levels

Budgets may exist at:

- User
- Workspace
- Organization
- Subscription Plan
- Project
- Enterprise Contract

Each level may define independent spending limits.

---

# 7. Model Cost Profiles

Every model shall define:

- Input price
- Output price
- Context window
- Latency
- Availability
- Quality tier
- Provider

Pricing metadata must be updateable without deployment.

---

# 8. Automatic Optimization

The Cost Controller may:

- Select a cheaper equivalent model
- Reduce context size
- Reuse cached results
- Compress prompts
- Delay background jobs
- Reject non-essential requests after quota exhaustion

---

# 9. Token Optimization

Optimization techniques include:

- Prompt compression
- Duplicate removal
- Context truncation
- Semantic retrieval
- Conversation summarization
- Cached embeddings

---

# 10. Cost Estimation

Before execution the system should estimate:

- Expected token usage
- Estimated provider cost
- Remaining user quota
- Remaining workspace budget

Large requests may require confirmation.

---

# 11. Quotas

Quota examples:

Free

- Daily token limit
- Monthly request limit

Starter

- Higher limits

Professional

- Expanded quotas

Enterprise

- Contract-defined quotas

Quota values are configurable.

---

# 12. Monitoring

Track:

- Cost per request
- Cost per provider
- Daily spending
- Monthly spending
- Token consumption
- Cache savings
- Model utilization
- Budget usage

---

# 13. Alerts

Generate alerts for:

- Budget exceeded
- Abnormal spending
- Provider price changes
- Token spikes
- Failed optimization
- Quota exhaustion

---

# 14. Reporting

Reports should include:

- User spending
- Workspace spending
- Provider comparison
- Model comparison
- Token statistics
- Historical trends
- Estimated future costs

---

# 15. Security

The subsystem must protect:

- Billing data
- Provider pricing configuration
- API credentials
- Usage analytics

Financial information must remain access-controlled.

---

# 16. Performance Targets

Cost estimation:

< 20 ms

Budget lookup:

< 10 ms

Optimization decision:

< 20 ms

Cost logging:

Asynchronous

---

# 17. Testing

Required tests:

- Budget enforcement
- Quota exhaustion
- Provider comparison
- Token estimation
- Cost reporting
- Optimization rules
- Alert generation
- High-load scenarios

---

# 18. Acceptance Criteria

The AI Cost Control subsystem is accepted only if:

- spending is measurable;
- quotas are enforced;
- optimization reduces unnecessary costs;
- monitoring is operational;
- reporting is accurate;
- automated tests pass.

---

# 19. Definition of Done

The AI Cost Control subsystem is complete when:

- documented;
- integrated with the AI Orchestrator;
- connected to billing;
- monitored;
- tested;
- scalable;
- production ready.

---

# 20. OpenCode Instructions

OpenCode MUST:

- calculate estimated AI costs before execution;
- enforce configurable budgets and quotas;
- optimize token usage automatically;
- support provider cost comparison;
- expose usage and spending metrics;
- generate alerts for abnormal spending;
- keep pricing configurable without code changes;
- reject implementations that violate this specification.

This document is mandatory for all AI requests processed within Atlas AI.
