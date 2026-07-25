# Dependency Audit

**Project:** Atlas AI  
**Date:** 2026-07-22  
**Tool:** pnpm audit --json  

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 20 |
| Moderate | 14 |
| Low | 1 |
| **Total** | **37** |

Total dependencies scanned: 2,312

---

## Critical Vulnerabilities

### CVE-2026-59873 — node-tar Decompression DoS

| Field | Value |
|-------|-------|
| Package | `tar` |
| Installed | 6.2.1 |
| Patched | >=7.5.19 |
| Path | `apps__extension>wxt>giget>tar` |
| CVE | CVE-2026-59873 |
| CVSS | 7.5 |
| CWE | CWE-770 (Uncontrolled Resource Consumption) |
| GHSA | GHSA-23hp-3jrh-7fpw |

**Impact:** A small, maliciously crafted Gzip Bomb can expand to fill all available disk space, causing denial of service.

**Remediation:** Upgrade `tar` to >=7.5.19. Since it's a transitive dependency via `wxt > giget`, add an override in root `package.json`:
```json
"overrides": {
  "tar": "^7.5.19"
}
```

---

## High Vulnerabilities

### CVE-2026-39244 — adm-zip DoS

| Field | Value |
|-------|-------|
| Package | `adm-zip` |
| Installed | 0.5.18 |
| Patched | >=0.6.0 |
| Path | `apps__extension>wxt>web-ext-run>firefox-profile>adm-zip` |
| CVSS | 7.5 |
| CWE | CWE-400, CWE-789 |

**Impact:** Crafted ZIP file triggers 4GB memory allocation.

### CVE-2026-13149 — brace-expansion DoS

| Field | Value |
|-------|-------|
| Package | `brace-expansion` |
| Installed | 1.1.15 |
| Patched | >=1.1.16 |
| Path | `.>eslint>minimatch>brace-expansion` |
| CVSS | 5.3 |

**Impact:** Exponential-time expansion of consecutive non-expanding groups.

### CVE-2026-59869 — js-yaml DoS

| Field | Value |
|-------|-------|
| Package | `js-yaml` |
| Installed | 4.1.1 (backend), 4.2.0 (api) |
| Patched | >=4.3.0 |
| Path | `services__backend>@nestjs/swagger>js-yaml`, `packages__api>openapi-typescript>@redocly/openapi-core>js-yaml` |
| CVSS | 7.5 |
| CWE | CWE-400, CWE-407 |

**Impact:** YAML merge-key chains force quadratic CPU consumption.

### CVE-2026-59874 — node-tar infinite loop

| Field | Value |
|-------|-------|
| Package | `tar` |
| Installed | 6.2.1 |
| Patched | >=7.5.18 |
| CVSS | 7.5 |
| CWE | CWE-835 |

**Impact:** Negative tar entry size causes infinite loop in `tar.replace()`.

### CVE-2026-59871 — node-tar crash via NUL byte

| Field | Value |
|-------|-------|
| Package | `tar` |
| Installed | 6.2.1 |
| Patched | >=7.5.18 |
| CVSS | 5.3 |

**Impact:** Uncaught Exception DoS via NUL byte in PAX path/linkpath records.

### CVE-2026-13311 — shell-quote DoS

| Field | Value |
|-------|-------|
| Package | `shell-quote` |
| Installed | 1.7.3 |
| Patched | >=1.9.0 |
| Path | `apps__extension>wxt>web-ext-run>fx-runner>shell-quote` |
| CVSS | 7.5 |

**Impact:** Quadratic-complexity DoS in `parse()`.

### CVE-2026-16221 — fast-uri host confusion

| Field | Value |
|-------|-------|
| Package | `fast-uri` |
| Installed | 3.1.3 |
| Patched | >=3.1.4 |
| Path | `.>@commitlint/cli>@commitlint/load>...>fast-uri` |
| CVSS | 7.5 |
| CWE | CWE-436 |

**Impact:** Host confusion via literal backslash authority delimiter — SSRF risk.

### GHSA-f88m-g3jw-g9cj — sharp/libvips CVEs

| Field | Value |
|-------|-------|
| Package | `sharp` |
| Installed | 0.34.5 |
| Patched | >=0.35.0 |
| Path | `apps__web>next>sharp` |
| CVSS | High (CVSSv4) |

**Impact:** Multiple libvips vulnerabilities (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591). Processing untrusted images can lead to code execution or DoS.

### GHSA-frvp-7c67-39w9 — @hono/node-server path traversal

| Field | Value |
|-------|-------|
| Package | `@hono/node-server` |
| Installed | 1.19.11 |
| Patched | >=2.0.5 |
| Path | `services__backend>prisma>@prisma/dev>@hono/node-server` |
| CVSS | 5.9 |

**Impact:** Path traversal in `serve-static` on Windows via encoded backslash. Low risk on Linux.

---

## Deprecated Packages

| Package | Version | Location |
|---------|---------|----------|
| `i18next-parser` | 9.4.0 | `packages/i18n` |

---

## Outdated Packages (not security-related)

44 packages have newer versions available. Major version gaps on:

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| `@sentry/nextjs` | 9.47.1 | 10.67.0 | Major version gap |
| `@sentry/react-native` | 6.22.0 | 8.19.0 | Major version gap |
| `expo` | 54.0.36 | 57.0.7 | Major version gap |
| `next` | 15.5.20 | 16.2.11 | Major version gap |
| `zod` (web) | 3.25.76 | 4.4.3 | Major version gap |
| `react-native` | 0.81.6 | 0.86.0 | Major version gap |

---

## Recommendations

1. **Immediate:** Add `tar@^7.5.19` override to root `package.json`
2. **Immediate:** Run `pnpm update sharp@^0.35.0` in `apps/web`
3. **This sprint:** Run `pnpm update js-yaml@^4.3.0` or add override
4. **This sprint:** Update NestJS packages (`@nestjs/*` 11.1.27 → 11.1.28+)
5. **This month:** Plan major version upgrades for Expo, Sentry, Next.js
6. **Continuous:** Add `pnpm audit` to CI/CD pipeline
7. **Continuous:** Consider Dependabot or Renovate for automated updates
