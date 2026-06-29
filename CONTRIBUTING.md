# Atlas AI

# Contributing Guide

**Version:** 1.0.0  
**Status:** Active  
**Document Type:** Developer Contribution Guide  
**Owner:** Engineering Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the contribution process for Atlas AI.

Its purpose is to ensure that every contribution maintains the project's architectural integrity,
code quality, documentation standards, and long-term maintainability.

Atlas AI follows a **Documentation-First Development** methodology.

No implementation should begin before the corresponding architectural documentation exists.

---

# 2. Who Can Contribute

Contributions are welcome from:

- Core maintainers
- Organization members
- External contributors
- Open-source community members

Every contributor is expected to follow this guide together with:

- `README.md`
- `ROADMAP.md`
- `ARCHITECTURE_DECISIONS.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`

---

# 3. Development Philosophy

Atlas AI follows several engineering principles.

## Documentation First

Documentation precedes implementation.

## Architecture Before Code

Every major feature must follow the approved architecture.

## Security by Design

Security requirements are considered before implementation.

## Modular Development

Components should remain loosely coupled.

## Continuous Improvement

Documentation, architecture and implementation evolve together.

---

# 4. Repository Structure

Major repository areas include:

```text
apps/
packages/
services/
docs/
infrastructure/
scripts/
.github/

README.md
ROADMAP.md
CHANGELOG.md
SECURITY.md
CONTRIBUTING.md
ARCHITECTURE_DECISIONS.md
```

Each directory has a clearly defined responsibility.

Contributors should avoid introducing unnecessary coupling between modules.

---

# 5. Getting Started

Recommended workflow:

1. Read the relevant documentation.
2. Review applicable ADRs.
3. Create or select an issue.
4. Create a feature branch.
5. Implement the change.
6. Add tests.
7. Update documentation.
8. Submit a Pull Request.

---

---

# 6. Development Environment

Recommended software versions:

| Software       | Version |
| -------------- | ------- |
| Node.js        | 22 LTS+ |
| pnpm           | Latest  |
| Docker         | Latest  |
| Docker Compose | Latest  |
| PostgreSQL     | 16+     |
| Redis          | 7+      |
| Git            | Latest  |

Clone the repository:

```bash
git clone <repository-url>
cd atlas-ai
pnpm install
```

Run the development environment according to the project documentation.

---

# 7. Git Workflow

Atlas AI uses a feature-branch workflow.

Typical development process:

```text
main
 │
 ├── feature/...
 ├── fix/...
 ├── docs/...
 ├── refactor/...
 └── chore/...
```

Branches should remain focused on a single objective.

---

# 8. Branch Naming Convention

Use descriptive branch names.

Examples:

```text
feature/user-authentication

feature/knowledge-search

feature/workflow-engine

fix/login-validation

fix/api-timeout

docs/security-policy

docs/rag-specification

refactor/context-engine

chore/dependencies
```

---

# 9. Commit Messages

Atlas AI follows the Conventional Commits specification.

Examples:

```text
feat(auth): implement OAuth login

feat(ai): add model routing

fix(api): validate request payload

docs(readme): update installation guide

refactor(workflow): simplify execution engine

test(rag): add retrieval integration tests

chore(ci): update GitHub Actions
```

Commit messages should be concise and clearly describe the change.

---

# 10. Documentation Requirements

Documentation updates are mandatory whenever changes affect:

- Architecture
- APIs
- Infrastructure
- Security
- Database
- AI Components
- Workflows
- Configuration
- User Experience

Implementation must never diverge from the documented architecture.

---

# 11. Architecture Rules

Every implementation should:

- Follow approved ADRs.
- Respect module boundaries.
- Avoid unnecessary coupling.
- Use shared libraries where appropriate.
- Remain provider-independent whenever possible.
- Preserve backward compatibility unless explicitly approved.

Major architectural changes require a new ADR before implementation.

---

---

# 12. Coding Standards

All code contributed to Atlas AI must follow the project's engineering standards.

### General Principles

- Write clean, readable, and maintainable code.
- Prefer composition over inheritance.
- Avoid duplicated logic.
- Keep functions and classes focused on a single responsibility.
- Use strong typing wherever possible.
- Eliminate dead code before merging.

### Code Style

- TypeScript strict mode enabled.
- ESLint rules must pass.
- Prettier formatting is mandatory.
- No commented-out production code.
- No hardcoded secrets or credentials.

---

# 13. Testing Requirements

Every contribution should include appropriate automated tests.

### Minimum Test Types

- Unit Tests
- Integration Tests
- API Tests
- End-to-End Tests (where applicable)

Additional testing may include:

- Contract Tests
- Performance Tests
- Security Tests
- Accessibility Tests

Changes that reduce test coverage without approval will not be accepted.

---

# 14. Pull Request Process

Before opening a Pull Request, ensure that:

- Documentation has been updated.
- Tests pass successfully.
- Linting passes.
- CI pipeline succeeds.
- No merge conflicts exist.
- Architectural requirements are satisfied.

Each Pull Request should clearly describe:

- Purpose
- Scope
- Related Issue(s)
- Testing performed
- Documentation updated
- Breaking changes (if any)

Large Pull Requests should be avoided whenever possible.

---

# 15. Code Review

Every Pull Request requires review before merging.

Reviewers verify:

- Architecture compliance
- Code quality
- Security considerations
- Performance implications
- Documentation updates
- Test coverage
- Backward compatibility

Constructive feedback and collaboration are expected throughout the review process.

---

# 16. Security Requirements

Contributors must follow the project's Security Policy.

Requirements include:

- Never commit secrets.
- Validate all external input.
- Use secure authentication mechanisms.
- Apply authorization checks.
- Protect sensitive data.
- Report vulnerabilities responsibly.
- Keep dependencies updated.

Refer to `SECURITY.md` for complete security requirements.

---

# 17. CI/CD Requirements

Every contribution must successfully complete the automated pipeline.

Quality gates include:

- Formatting
- Linting
- Static Analysis
- Unit Tests
- Integration Tests
- Dependency Scanning
- Security Scanning
- Documentation Validation
- Build Verification

Changes failing mandatory checks cannot be merged.

---

---

# 18. Definition of Done

A task is considered complete only when all applicable criteria have been satisfied.

### Required Criteria

- Architecture reviewed.
- Implementation completed.
- Documentation updated.
- Tests added or updated.
- Code review approved.
- CI/CD pipeline passed.
- Security requirements satisfied.
- No critical defects remain.

Features that do not meet these requirements shall not be merged into the main branch.

---

# 19. Issue Management

All work should originate from a tracked issue.

Issue categories include:

- Bug
- Feature
- Enhancement
- Documentation
- Security
- Infrastructure
- Performance
- Refactoring

Each issue should include:

- Description
- Motivation
- Expected behavior
- Acceptance criteria
- Priority
- Related documentation

---

# 20. Release Process

Atlas AI follows Semantic Versioning (SemVer).

Typical release workflow:

```text
Planning
    │
    ▼
Implementation
    │
    ▼
Testing
    │
    ▼
Documentation Review
    │
    ▼
Security Review
    │
    ▼
Release Candidate
    │
    ▼
Production Release
```

Every release must update:

- CHANGELOG.md
- Documentation (if required)
- Version references
- Release notes

---

# 21. Communication

Contributors are expected to communicate respectfully and professionally.

Guidelines:

- Be constructive.
- Be transparent.
- Document technical decisions.
- Respect review feedback.
- Ask questions early.
- Avoid assumptions.

All contributors must comply with the project's `CODE_OF_CONDUCT.md`.

---

# 22. Related Documentation

| Document                  | Purpose                           |
| ------------------------- | --------------------------------- |
| README.md                 | Project overview                  |
| ROADMAP.md                | Development roadmap               |
| ARCHITECTURE_DECISIONS.md | Architecture Decision Records     |
| CHANGELOG.md              | Project history                   |
| SECURITY.md               | Security policies                 |
| CODE_OF_CONDUCT.md        | Community standards               |
| SUPPORTED_MODELS.md       | AI provider support               |
| docs/                     | Complete technical specifications |

---

# 23. Summary

Atlas AI is developed using a documentation-first, architecture-driven engineering process.

Every contribution should:

- align with the approved architecture;
- maintain high code quality;
- include appropriate documentation;
- satisfy security and testing requirements;
- preserve long-term maintainability of the platform.

Following this guide ensures that Atlas AI remains consistent, scalable, secure, and maintainable as
the project evolves.
