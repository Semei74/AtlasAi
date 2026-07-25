# Security Risk Matrix

**Project:** Atlas AI  
**Date:** 2026-07-22  

| ID | Finding | Risk | Likelihood | Impact | CVSSv3 (est.) | Priority |
|----|---------|------|-----------|--------|---------------|----------|
| F-022 | OpenSearch security disabled in prod | Critical | High | High | 9.1 | P0 — Fix immediately |
| F-001 | Refresh token in localStorage | Critical | High | High | 8.6 | P0 — Fix immediately |
| F-002 | Refresh token replay detection incomplete | High | Medium | High | 7.5 | P1 |
| F-008 | Missing RBAC on project endpoints | High | High | Medium | 7.3 | P1 |
| F-004 | Account lockout can DoS user | High | Medium | Medium | 7.0 | P1 |
| F-019 | Missing CSP on frontend | High | Medium | High | 6.8 | P1 |
| F-023 | Grafana default admin password | High | High | Medium | 7.5 | P1 |
| F-024 | MinIO default credentials | High | High | Medium | 7.5 | P1 |
| F-032 | Empty secrets in production env | High | Medium | High | 8.0 | P1 |
| F-034 | Critical/high CVEs in dependencies | High | Medium | High | 7.5-9.0 | P1 |
| F-014 | `as never` type assertions in Prisma | Medium | Medium | Medium | 5.3 | P2 |
| F-003 | JWT defaults to HS256 | Medium | Low | Medium | 5.0 | P2 |
| F-010 | Swagger exposed in production | Medium | Medium | Low | 4.3 | P2 |
| F-025 | Docker socket mounted in prod | Medium | Low | High | 5.9 | P2 |
| F-026 | No container resource limits | Medium | Low | Medium | 5.0 | P2 |
| F-027 | Metrics endpoint without auth | Medium | Medium | Low | 4.3 | P2 |
| F-029 | PII in auth audit logs | Medium | High | Low | 3.7 | P2 |
| F-018 | XSS via description fields | Medium | Medium | Medium | 6.1 | P2 |
| F-009 | Tenant isolation via JWT claims | Medium | Low | Medium | 4.7 | P3 |
| F-017 | Soft-deleted projects accessible | Low | Low | Low | 3.1 | P3 |
| F-016 | Missing db indexes | Low | Low | Low | 3.0 | P3 |
| F-020 | API URL fallback hardcoded | Low | Low | Low | 2.2 | P3 |
| F-021 | Console.log in production | Low | Low | Low | 1.0 | P3 |
| F-028 | Missing healthchecks | Low | Medium | Low | 2.5 | P3 |
| F-035 | Deprecated dependency | Low | Low | Low | 0.0 | P4 |
| F-036 | eslint-disable comments | Low | Low | Low | 0.0 | P4 |
| F-005/F-006 | Password mgmt (pending check) | Medium | Medium | Medium | 5.0 | P2 |
| F-011 | No CSRF protection | Low | Low | Low | 3.0 | P3 |
| F-012 | Global-only rate limiting | Low | Low | Low | 2.0 | P3 |

---

## Risk Categories

### P0 — Critical (fix immediately)
- F-022: OpenSearch security disabled
- F-001: Refresh token in localStorage

### P1 — High (fix before production)
- F-002: Refresh token replay
- F-008: RBAC missing
- F-004: Account lockout DoS
- F-019: Missing CSP
- F-023: Grafana default creds
- F-024: MinIO default creds
- F-032: Empty production secrets
- F-034: Dependency CVEs

### P2 — Medium (fix within first sprint)
- F-003, F-010, F-014, F-018, F-025, F-026, F-027, F-029, F-005/F-006

### P3 — Low (fix opportunistically)
- F-009, F-011, F-012, F-016, F-017, F-020, F-021, F-028

### P4 — Informational
- F-035, F-036
