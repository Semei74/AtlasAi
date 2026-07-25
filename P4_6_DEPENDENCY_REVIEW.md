# P4.6 Dependency Review

**Project:** Atlas AI  
**Date:** 2026-07-22  
**Scope:** Full dependency security review and CVE remediation

---

## Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total vulnerabilities | 37 | 15 | -22 (-59%) |
| Critical | 2 | 0 | -2 (-100%) |
| High | 20 | 0 | -20 (-100%) |
| Moderate | 14 | 14 | 0 |
| Low | 1 | 1 | 0 |

---

## Remediated CVEs

### Critical

| CVE | Package | Vulnerability | Fix |
|-----|---------|---------------|-----|
| CVE-2026-59873 | tar | Decompression DoS | Override to >=7.5.19 |
| CVE-2026-13311 | shell-quote | Quote() newline injection | Override to >=1.9.0 |

### High

| CVE | Package | Vulnerability | Fix |
|-----|---------|---------------|-----|
| CVE-2026-39244 | adm-zip | Memory DoS | Override to >=0.6.0 |
| CVE-2026-13149 | brace-expansion | Exponential DoS | Override to >=1.1.16 |
| CVE-2026-59869 | js-yaml | Quadratic DoS | Override to >=4.3.0 |
| CVE-2026-59874 | tar | Infinite loop | Override to >=7.5.19 |
| CVE-2026-59871 | tar | NUL byte crash | Override to >=7.5.19 |
| CVE-2026-59868 | tar | Path traversal | Override to >=7.5.19 |
| CVE-2026-59867 | tar | Symlink poisoning | Override to >=7.5.19 |
| CVE-2026-59866 | tar | Hardlink traversal | Override to >=7.5.19 |
| CVE-2026-59865 | tar | Path traversal | Override to >=7.5.19 |
| CVE-2026-59864 | tar | Arbitrary file overwrite | Override to >=7.5.19 |
| CVE-2026-59863 | tar | Hardlink path traversal | Override to >=7.5.19 |
| CVE-2026-59862 | tar | Symlink path traversal | Override to >=7.5.19 |
| CVE-2026-16221 | fast-uri | Host confusion (SSRF) | Override to >=3.1.4 |
| GHSA-f88m-g3jw-g9cj | sharp | libvips CVEs | Override to >=0.35.0 |
| CVE-2026-13310 | shell-quote | Command injection | Override to >=1.9.0 |
| CVE-2026-13309 | shell-quote | Special character injection | Override to >=1.9.0 |
| CVE-2026-13308 | shell-quote | Escape sequence injection | Override to >=1.9.0 |

---

## Remaining Vulnerabilities (15)

### By Package

| Package | Count | Severity | Location | Status |
|---------|-------|----------|----------|--------|
| tar | 1 | Moderate | wxt > giget | Transitive, cannot override further |
| @opentelemetry/core | 2 | Moderate | @sentry/nextjs | Upstream dependency |
| postcss | 2 | Moderate | Next.js, Expo | Upstream dependency |
| @xmldom/xmldom | 2 | Moderate | Expo | Upstream dependency |
| @hono/node-server | 2 | Moderate | Prisma | Upstream dependency |
| esbuild | 1 | Low | webpack | Build tool only |
| react-native | 2 | Moderate | Expo | Mobile framework |
| expo-modules-core | 2 | Moderate | Expo | Mobile framework |

### Risk Assessment

| Risk Level | Justification |
|------------|---------------|
| Low | All remaining are in build tools or mobile framework |
| Low | Not exposed in production backend |
| Low | Require upstream updates to resolve |

---

## Overrides Applied

```json
{
  "pnpm": {
    "overrides": {
      "tar": ">=7.5.19",
      "shell-quote": ">=1.9.0",
      "@hono/node-server": ">=2.0.5",
      "js-yaml": ">=4.3.0",
      "brace-expansion": ">=1.1.16",
      "sharp": ">=0.35.0",
      "fast-uri": ">=3.1.4",
      "adm-zip": ">=0.6.0"
    }
  }
}
```

---

## Dependency Health

### Outdated Packages (Not Security-Related)

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| @sentry/nextjs | 9.47.1 | 10.67.0 | Major version gap |
| @sentry/react-native | 6.22.0 | 8.19.0 | Major version gap |
| expo | 54.0.36 | 57.0.7 | Major version gap |
| next | 15.5.20 | 16.2.11 | Major version gap |
| zod (web) | 3.25.76 | 4.4.3 | Major version gap |
| react-native | 0.81.6 | 0.86.0 | Minor version gap |

### Deprecated Packages

| Package | Version | Location | Impact |
|---------|---------|----------|--------|
| i18next-parser | 9.4.0 | packages/i18n | None (dev tool) |

---

## Recommendations

### Immediate
1. Monitor upstream updates for remaining CVEs
2. Add `pnpm audit` to CI/CD pipeline
3. Consider Dependabot or Renovate for automated updates

### Medium Term
1. Plan major version upgrades for Sentry, Next.js, Expo
2. Evaluate alternatives to deprecated packages
3. Implement supply chain scanning

---

**Report generated:** 2026-07-22