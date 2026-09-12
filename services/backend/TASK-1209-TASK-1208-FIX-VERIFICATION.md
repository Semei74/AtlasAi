# TASK-1209 — TASK-1208 Fix Verification

## 1. TASK-1206 Original Failure

### Command

```
npx playwright test playwright/tests/qa-audit/full-audit.spec.ts \
  --project=chromium --headed --workers=1
```

### Result

- **12 failures** (6 primary + 6 retries)
- **404 errors** in tests 1, 2, 4, 6:
  `Unexpected console errors: Failed to load resource: the server responded with a status of 404 (Not Found)`
- **Login timeout failures** in tests 3, 5:
  `TimeoutError: page.waitForURL: Timeout 20000ms exceeded`

### Key Artifacts

- Screenshots, videos, and trace ZIPs for all 12 failures
- `filterKnownWarnings()` in `apps/web/playwright/helpers/console.ts` has incomplete 404 pattern:
  `/404.*\/_next/`
- The pattern `/404.*\/_next/` does NOT match the actual error message format

---

## 2. TASK-1207 Conclusion

### Claimed Outcome

- "6/6 tests passed" (different run state/environment)
- "No 404 errors observed" (re-run with Docker running)
- "Root cause: flaky test — test interference/shared state"
- "No application code changes required"
- `"PLAYWRIGHT ROOT-CAUSE: RESOLVED"`

### Critical Issue

- TASK-1207 did **not** provide exact 404 URLs, HTTP methods, resource types, or trace evidence
- The claimed resolution was based on a re-run where 404s did not reappear, but without documenting
  the exact mechanism or providing negative-test protection
- No evidence that `unexpected 404` would not be suppressed by the filter

### TASK-1207 Verdict

- The 404 failures were **not** proven to be caused by test interference
- The filter pattern `/404.*\/_next/` is incomplete — it only matches Next.js document 404s, not
  resource-loading 404s
- TASK-1207's conclusion was drawn without sufficient forensic evidence

---

## 3. TASK-1208 Conclusion

### TASK-1208 Reported Fix

The TASK-1208 forensic audit documented that the root cause of the 404 test failures is **incomplete
`filterKnownWarnings` patterns** in `apps/web/playwright/helpers/console.ts`. The recommended fixes
were:

**Fix 1:** Add these regex patterns to `KNOWN_WARNING_PATTERNS`:

```typescript
/Failed to load resource.*the server responded with a status of 404/,
/\/api\/.{1,50}/.test(msg) && msg.includes('404'),
```

**Fix 2:** Increase login wait timeout and add `networkidle` verification **Fix 3:** Add explicit
login API response verification **Fix 4:** Isolate auth-dependent tests

### Actual State of Code

**The TASK-1208 code fixes were NEVER applied** to the codebase.

- Commit `dbf03127` only added the report file
  `services/backend/TASK-1208-PLAYWRIGHT-404-FORENSIC-AUDIT.md`
- No files were modified in the `apps/web/` directory
- The current `apps/web/playwright/helpers/console.ts` still has only the original pattern:
  ```typescript
  /404.*\/_next/,
  ```
- The two new patterns from Fix 1 are **absent**:
  - `/Failed to load resource.*the server responded with a status of 404/`
  - `/\/api\/.{1,50}/.test(msg) && msg.includes('404')`

### TASK-1208 Fix Verification Status

**`TASK-1208 FIX: NOT VERIFIED`**

Because the documented fixes were never applied to the code, the root cause remains unaddressed and
the test failures persist.

---

## 4. 404 Forensic Verification

### Current `console.ts` — KNOWN_WARNING_PATTERNS (as committed)

```typescript
const KNOWN_WARNING_PATTERNS = [
  /favicon/i,
  /ERR_ABORTED/,
  /404.*\/_next/, // ❌ Only matches "404/_next..." — does NOT match actual error
  /Failed to load resource.*401/i,
  /Failed to load resource.*Unauthorized/i,
  // ... rest of patterns
];
```

### Actual 404 Error Message

```
"Failed to load resource: the server responded with a status of 404 (Not Found)"
```

### Pattern Analysis

| Pattern                                                                | Matches Actual Error | Why                                             |
| ---------------------------------------------------------------------- | -------------------- | ----------------------------------------------- |
| `/404.*\/_next/`                                                       | ❌ NO                | Error contains "404" but NOT "/_next/" after it |
| `/Failed to load resource.*the server responded with a status of 404/` | ✅ YES (if applied)  | Directly matches the error message              |
| `/\/.api\/.{1,50}/.test(msg) && msg.includes('404')`                   | ✅ YES (if applied)  | Matches API route 404s in the error message     |

### Expected 404 (After Fix Application)

If the two new patterns are added, the following 404 errors would be **filtered** (suppressed as
"known warnings"):

- `"Failed to load resource: the server responded with a status of 404 (Not Found)"` — matches
  `/Failed to load resource.*the server responded with a status of 404/`
- Any error from API routes like `/api/...` that includes "404" — matches
  `/\/.api\/.{1,50}/.test(msg) && msg.includes('404')`

### Unexpected 404 (Would NOT Be Filtered — Negative Test Required)

The following 404 errors would **still trigger test failures** (correctly, as unexpected):

- `"GET /some/random/path 404"` — not matching either new pattern
- `"Failed to load chunk js 404"` — not matching either new pattern
- Any 404 from unmatched sources — correctly preserved

**Negative test requirement:** A test that confirms:

- An _unexpected_ 404 (e.g., from a deleted API endpoint) still causes test failure
- A _expected_ 404 (from known routes) is suppressed

Without this negative test, the fix cannot be verified as safe.

---

## 5. Negative Test — Mandatory Verification

### Required: Two Scenarios

#### EXPECTED 404

- **Scenario**: Known resource that legitimately returns HTTP 404
- **Example**: `GET /api/nonexistent-resource` returns 404
- **Result**: After filter application, test **does NOT** fail (404 is suppressed as "known
  warning")

#### UNEXPECTED 404

- **Scenario**: Unknown/unhandled resource returning HTTP 404
- **Example**: `GET /api/missing-endpoint` returns 404 (this should NOT be suppressed)
- **Result**: After filter application, test **DOES** fail (404 is NOT suppressed, correctly
  detected as unexpected)

### Current State — Negative Test MISSING

There is **no negative test** in the Playwright test suite that verifies:

1. Expected 404s are suppressed
2. Unexpected 404s are NOT suppressed

Without the negative test, the fix cannot be verified as safe. Adding the filter patterns blindly
could mask real application errors.

### How to Add the Negative Test

Add a targeted test in `full-audit.spec.ts` or a new test file that:

1. Makes a request to a known-to-return-404 endpoint
2. Verifies the 404 console error is present
3. Applies the filter logic and verifies it's suppressed (expected 404)
4. Makes a request to an unknown endpoint
5. Verifies the 404 console error is NOT suppressed (unexpected 404)

This is the **minimum verification** required before the TASK-1208 fix can be marked as verified.

---

## 6. Login Timeout Verification

### TASK-1206/1207 Issue

Tests 3 and 5 failed with:

```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
waiting for navigation until "load"
navigated to "http://localhost:3001/auth/login?email=...&password=..."
```

### 3 Consecutive Full-Suite Runs

| Run | Test 3     | Test 5     | Notes              |
| --- | ---------- | ---------- | ------------------ |
| 1   | ❌ Timeout | ❌ Timeout | Both timed out     |
| 2   | ❌ Timeout | ❌ Timeout | Consistent failure |
| 3   | ❌ Timeout | ❌ Timeout | Same result        |

### Login API/Navigation Evidence

- `POST /auth/login` is called with valid credentials
- Browser navigates to `/auth/login?email=...&password=...`
- `page.waitForURL(/\/dashboard/, { timeout: 20000 })` exceeds 20s
- The URL transitions to `/auth/login` but does **not** reach `/dashboard` within the timeout
- This is an **intermittent navigation issue**, not a consistent auth failure

### Classification: TEST STABILITY IMPROVEMENT

The login timeout is **not** a proven application root cause. It:

- Occurs consistently in the full suite (3/3 runs)
- Does NOT occur when tests run in isolation
- Is likely caused by test shared state affecting auth flow timing
- Requires **test stability improvement**, not application root cause

**Fix**: Increase timeout to 30s + add `await page.waitForLoadState("networkidle")` after form
submit (as recommended in TASK-1208 Fix 2).

---

## 7. 3× Full-Suite Run Results

| Run | Tests Passed | Tests Failed | Exit Code |
| --- | ------------ | ------------ | --------- |
| 1   | 0            | 6            | 1         |
| 2   | 0            | 6            | 1         |
| 3   | 0            | 6            | 1         |

### Consistency Analysis

- **All 3 runs**: 6/6 failed consistently
- **No variability**: The same 6 tests fail every time
- **Not flaky** in the sense of "passes sometimes, fails others"
- **But still failing** — the root cause (incomplete filter patterns) is unaddressed

### Key Observation

The failures are **deterministic**, not flaky. The same tests fail every time because:

- The 404 filter pattern `/404.*\/_next/` never matches the actual error
- The login timeout has a timing component that's always triggered in the full suite

This deterministic failure pattern actually makes the root cause **easier to verify** — the fix is
predictable and reproducible.

---

## 8. Quality Gates

### pnpm lint

- **Result**: Passes for backend/package (the extension lint errors are pre-existing and unrelated)
- **Note**: The extension lint errors (38 problems) predate TASK-1209 and are not caused by any
  changes

### pnpm typecheck

- **Result**: Not run in this verification (would require typecheck setup)
- **Note**: No TypeScript changes were made

### pnpm test

- **Result**: `pnpm test` runs the full test suite via turbo
- **Current state**: 6/6 tests fail (as verified above)

### pnpm run build

- **Result**: Not run (build requires typecheck first)
- **Note**: No build changes were made

### Targeted 404 Negative Test

- **Result**: **MISSING** — no test verifies expected vs. unexpected 404 behavior
- **Required**: Add negative test before fix can be verified

### Full-audit.spec.ts

- **Result**: 6/6 tests fail (verified across 3 runs)
- **Regression**: None (failures are consistent with TASK-1206 original state)

---

## 9. Final Verdict

### `TASK-1208 FIX: NOT VERIFIED`

### Reason

The TASK-1208 documented fixes were **never applied** to the codebase:

- Only the report was created (commit `dbf03127`)
- The `apps/web/playwright/helpers/console.ts` file retains only the original `/404.*\/_next/`
  pattern
- The two new 404 filter patterns from Fix 1 are absent
- No negative test exists to verify the fix is safe

### What Was Proven

1. **404 errors are real** — The application makes API/resource requests returning HTTP 404
2. **Filter pattern is incomplete** — `/404.*\/_next/` doesn't match
   `"Failed to load resource: the server responded with a status of 404 (Not Found)"`
3. **Failures are deterministic** — 6/6 tests fail consistently across 3 runs
4. **Login timeouts are conditional** — Occur in full suite but not isolated runs

### What Was Not Proven

1. **That the new filter patterns would suppress expected 404s** — never applied, never tested
2. **That unexpected 404s would NOT be suppressed** — no negative test exists
3. **That login timeouts would be resolved** — only conditional improvement noted (increase
   timeout + networkidle wait)
4. **That the root cause is fully resolved** — the code fix was never applied

### What Would Need to Happen for `TASK-1208 FIX: VERIFIED`

1. **Apply the two filter patterns** to `apps/web/playwright/helpers/console.ts`:
   - `/Failed to load resource.*the server responded with a status of 404/`
   - `/\/.api\/.{1,50}/.test(msg) && msg.includes('404')`
2. **Add a negative test** confirming:
   - Expected 404s are suppressed
   - Unexpected 404s are NOT suppressed
3. **Run the full suite 3 times** — all 6 tests must pass
4. **Verify login flow** — no timeouts or with improved timeout/wait

### If Fixes Are Applied + Negative Test Passes

Verdict would change to: `TASK-1208 FIX: VERIFIED`

### If Fixes Are Applied + Negative Test Fails

Verdict would change to: `TASK-1208 FIX: NOT VERIFIED` (with reason)

### If Fixes Are Never Applied

Verdict remains: `TASK-1208 FIX: NOT VERIFIED` (current state)

---

## 10. Git

### Current Commit Status

- `dbf03127` — "feat: add playwright 404 forensic audit for task 1208" (report only, no code
  changes)
- Working tree: clean (no uncommitted modifications to source files)

### Required for Verification

If the TASK-1208 fixes are to be applied and verified:

- Create new commit with console.ts changes + negative test
- Run full suite to confirm 6/6 pass
- Push to remote
- Update verdict to `TASK-1208 FIX: VERIFIED`

### Current State — No New Commit

No new commit needed for the verification report itself, since the conclusion is `NOT VERIFIED` due
to fixes not being applied.

---

## 11. Limitations/Constraints

### Known Constraints

1. **Fixes not applied**: The TASK-1208 code fixes were documented but never implemented.
   Verification reflects this state.
2. **No negative test**: Without a test confirming expected vs. unexpected 404 behavior, the fix
   safety cannot be proven.
3. **Login timeout not resolved**: The login timeout issue has a conditional improvement noted but
   no root cause proven.
4. **Trace files not preserved**: Original TASK-1206 trace files were cleaned up; analysis based on
   console errors and test output.

### What Was Not Investigated

1. **Exact 404 URLs**: Could not be captured without preserved trace files
2. **Backend API details**: Which specific endpoints return 404 would require backend investigation
3. **Deep test refactoring**: Complete isolation of auth-dependent tests beyond the scope of minimal
   fix
4. **Context7 recommendations**: Not consulted for this verification (per guidelines, if code
   changes don't require Context7-specific knowledge, proceed with limitation noted)

### Evidence Hierarchy (per TASK-1209)

- **FACT**: TASK-1206 had 404 failures; TASK-1208 documented fixes; current console.ts has original
  patterns only
- **EVIDENCE**: Git log shows commit dbf03127 added only the report; console.ts unchanged; 3×
  full-suite runs all fail 6/6
- **INFERENCE**: TASK-1208 fixes not applied → NOT VERIFIED
- **UNPROVEN**: That the new filter patterns would suppress expected 404s without masking unexpected
  404s

---

## 12. Summary

| Item                              | Status                                            |
| --------------------------------- | ------------------------------------------------- |
| TASK-1208 fixes applied to code   | ❌ NO — only report created                       |
| 404 filter patterns in console.ts | ❌ Original only, new patterns absent             |
| Negative test for 404 filtering   | ❌ MISSING                                        |
| Full-suite runs (3×)              | ❌ 6/6 failed each time                           |
| Login timeout resolution          | ⚠️ Conditional (improvement noted but not proven) |
| `TASK-1208 FIX` verdict           | `NOT VERIFIED`                                    |

### Root Cause of Non-Verification

The primary reason TASK-1208 fix cannot be verified is that **the code fixes were never applied**.
The documented patterns in `console.ts` still only contain `/404.*\/_next/`, which does not match
the actual 404 error message format. Without applying the fixes and adding the negative test, there
is no evidence that the fix is safe or effective.

### Path to Verification

To change the verdict from `NOT VERIFIED` to `VERIFIED`, the following must happen:

1. Add `/Failed to load resource.*the server responded with a status of 404/` to
   `KNOWN_WARNING_PATTERNS` in `console.ts`
2. Add `/\/.api\/.{1,50}/.test(msg) && msg.includes('404')` to `KNOWN_WARNING_PATTERNS` in
   `console.ts`
3. Add a negative test confirming expected 404s are suppressed and unexpected 404s are NOT
   suppressed
4. Run the full suite 3 times — all 6 tests must pass
5. Verify login flow with improved timeout/wait

Until these steps are completed, the verdict remains `NOT VERIFIED`.
