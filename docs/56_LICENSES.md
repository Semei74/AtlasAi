# Atlas AI

# Licenses Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** Software Licenses Specification  
**Priority:** High  
**Owner:** Legal & Platform Engineering Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the software licensing strategy for Atlas AI.

The Licenses subsystem establishes policies for selecting, tracking, approving, and maintaining
software licenses for all first-party and third-party components used throughout the platform.

---

# 2. Objectives

The Licenses subsystem shall provide:

- License compliance
- Third-party dependency tracking
- Open-source governance
- Commercial license management
- License auditing
- Automated compliance validation
- Risk assessment
- Legal transparency

---

# 3. Scope

This specification applies to:

- Backend Services
- Frontend Applications
- Mobile Applications
- Desktop Applications
- AI Models
- SDKs
- Infrastructure Components
- Development Tools
- Build Systems
- Documentation Assets

Every software component must have an identified license.

---

# 4. License Categories

Supported license categories include:

- MIT
- Apache 2.0
- BSD
- ISC
- MPL
- LGPL
- GPL (restricted use)
- Commercial
- Proprietary
- Custom Enterprise Licenses

All licenses shall be reviewed before adoption.

---

# 5. License Inventory

The platform shall maintain a centralized inventory including:

- Package Name
- Version
- License Type
- Vendor
- Repository
- Approval Status
- Risk Level
- Last Review Date

The inventory shall be automatically updated.

---

# 6. Approval Workflow

```
New Dependency
      │
      ▼
License Detection
      │
      ▼
Legal Review
      │
      ▼
Risk Assessment
      │
      ▼
Approval
      │
      ▼
Production Usage
```

No dependency may enter production without approval.

---

# 7. Compliance Rules

The platform shall:

- Detect incompatible licenses
- Prevent unauthorized dependencies
- Track license obligations
- Generate attribution notices
- Maintain license documentation

Compliance checks shall be integrated into CI/CD.

---

# 8. Risk Classification

Licenses shall be classified as:

- Low Risk
- Medium Risk
- High Risk
- Restricted
- Prohibited

Risk classifications shall be maintained by the Legal team.

---

# 9. Monitoring

Track:

- Active licenses
- Expired commercial licenses
- License violations
- Unapproved dependencies
- Dependency updates
- Compliance status
- Legal review backlog

Monitoring data shall be available through administrative dashboards.

---

# 10. Security

The subsystem shall enforce:

- Role-Based Access Control
- Audit logging
- Version history
- Immutable approval records

License modifications shall be fully auditable.

---

# 11. Integrations

The Licenses subsystem shall integrate with:

- Dependency Management
- CI/CD Pipelines
- Security Scanning
- Audit Log
- Admin Panel
- Risk Register

All integrations shall use versioned APIs.

---

# 12. Performance Targets

License lookup:

< 20 ms

Compliance validation:

< 2 minutes

Dependency scan:

< 5 minutes

Dashboard loading:

< 2 seconds

---

# 13. Testing

Required tests:

- License detection
- Compliance validation
- Risk classification
- Approval workflow
- Dependency scanning
- Audit logging
- Performance benchmarking
- Integration testing

---

# 14. Acceptance Criteria

The Licenses subsystem is accepted only if:

- all dependencies have identified licenses;
- compliance validation succeeds;
- approval workflows operate correctly;
- monitoring is operational;
- audit logging is complete;
- automated tests pass.

---

# 15. Definition of Done

The Licenses subsystem is complete when:

- documented;
- integrated with dependency management;
- monitored;
- audited;
- tested;
- production ready.

---

# 16. OpenCode Instructions

OpenCode MUST:

- automatically detect software licenses;
- maintain a centralized license inventory;
- validate license compatibility during CI/CD;
- prevent unauthorized dependencies from entering production;
- generate compliance reports and attribution notices;
- integrate with Security, Audit Log, and Risk Register subsystems;
- expose license compliance metrics;
- reject implementations that violate this specification.

This document is mandatory for all software assets and third-party dependencies used within Atlas
AI.
