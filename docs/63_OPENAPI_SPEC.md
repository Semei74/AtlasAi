# Atlas AI

# OpenAPI Specification Standard

**Version:** 1.0.0 **Status:** Approved **Document Type:** API Documentation Standard **Priority:**
Critical **Owner:** Platform API Team **Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the OpenAPI Specification standard for Atlas AI.

The OpenAPI Specification provides a single source of truth for every REST API exposed by the
platform, enabling automatic documentation, SDK generation, testing, validation, and client
integration.

---

# 2. Objectives

The OpenAPI Specification shall provide:

- Standardized API documentation
- Machine-readable API definitions
- Automatic SDK generation
- Request validation
- Response validation
- Mock server generation
- API discoverability
- Version consistency

---

# 3. Scope

This specification applies to:

- Public REST APIs
- Internal REST APIs
- Admin APIs
- AI APIs
- Authentication APIs
- Billing APIs
- Webhook endpoints

Every REST endpoint shall be described using OpenAPI.

---

# 4. Standard Version

Atlas AI shall use:

OpenAPI Specification 3.1.x

YAML shall be the primary source format.

Generated JSON versions may also be published.

---

# 5. Repository Structure

```
openapi/
│
├── openapi.yaml
├── schemas/
├── paths/
├── components/
├── security/
├── examples/
└── generated/
```

The specification shall remain modular.

---

# 6. Required Sections

Every specification shall include:

- API Information
- Servers
- Tags
- Paths
- Components
- Schemas
- Parameters
- Request Bodies
- Responses
- Security Schemes
- Examples

---

# 7. Schema Standards

All schemas shall define:

- Required fields
- Optional fields
- Data types
- Validation rules
- Examples
- Descriptions
- Enumerations
- Error responses

Schemas shall be reusable through Components.

---

# 8. Security Definitions

Supported authentication methods:

- OAuth 2.1
- JWT Bearer Tokens
- API Keys (internal only)
- Service Accounts

Security requirements shall be documented per endpoint.

---

# 9. Versioning

The OpenAPI specification shall align with:

- API Versioning Policy
- Migration Guide
- Release Checklist

Each API version shall have its own specification.

---

# 10. Code Generation

The specification shall support generation of:

- TypeScript SDK
- Kotlin SDK
- Swift SDK
- Python SDK
- Go SDK
- Java SDK

Generated code shall not be manually edited.

---

# 11. Validation

Every specification shall be automatically validated for:

- Syntax correctness
- Schema consistency
- Reference integrity
- Duplicate definitions
- Security completeness
- Naming conventions

Validation shall occur during CI/CD.

---

# 12. Documentation

Automatically generated documentation shall include:

- Endpoint descriptions
- Authentication guide
- Request examples
- Response examples
- Error codes
- Rate limits
- Changelog

Documentation shall remain synchronized with source definitions.

---

# 13. Monitoring

Track:

- Specification validation status
- Documentation generation
- SDK generation
- Breaking changes
- Deprecated endpoints
- Client adoption

Metrics shall be visible in engineering dashboards.

---

# 14. Performance Targets

Specification validation:

< 30 seconds

Documentation generation:

< 2 minutes

SDK generation:

< 5 minutes

CI validation:

< 10 minutes

---

# 15. Testing

Required tests:

- Schema validation
- Endpoint validation
- Example validation
- SDK generation
- Backward compatibility
- Security verification
- Documentation generation
- CI integration

---

# 16. Acceptance Criteria

The OpenAPI Specification is accepted only if:

- all REST APIs are documented;
- specifications validate successfully;
- SDK generation succeeds;
- documentation is complete;
- version consistency is maintained;
- automated tests pass.

---

# 17. Definition of Done

The OpenAPI Specification is complete when:

- documented;
- validated automatically;
- integrated into CI/CD;
- synchronized with implementation;
- version controlled;
- production ready.

---

# 18. OpenCode Instructions

OpenCode MUST:

- maintain OpenAPI 3.1.x specifications for every REST API;
- automatically validate specifications during CI/CD;
- generate SDKs and API documentation from source definitions;
- enforce schema consistency and reusable components;
- synchronize API implementation with documentation;
- integrate with API Versioning, Migration Guide, Release Checklist, and Audit Log;
- reject implementations that violate this specification.

This document is mandatory for all REST API development within Atlas AI.
