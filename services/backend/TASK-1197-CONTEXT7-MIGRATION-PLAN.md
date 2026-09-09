# TASK-1197 — Context7 Findings Reconciliation & Migration Plan

## 1. Executive Summary

This report reconciles the local workspace state with the requirements in
`MASTER_IMPLEMENTATION_PLAN.md`, the available local evidence from
`TASK-1195-TYPESCRIPT-MINIMAL-FIX.md`, and the current repository implementation.

Important constraints for this task:

- This is an analysis/planning document only.
- No source code changes are made.
- No dependency versions are changed.
- No broad refactoring or architecture changes are proposed.
- The current local workspace is treated as the source of truth.

### High-level conclusion

The current local repository already contains the major TypeScript import/config fixes that
TASK-1195 claimed to have made, including:

- `services/backend/tsconfig.json` already includes `vitest/globals`
- the backend package already uses `node --env-file=.env` in the dev script
- the backend `typecheck` command is now running against the current workspace and reveals a
  different set of issues than the earlier TASK-1194/TASK-1195 baseline

The most important findings are not package deprecations. They are contract mismatches and
incomplete workflow/trigger foundations that remain unresolved in the local codebase.

The central unresolved issues are:

1. `WorkflowExecution` is currently defined with `readonly` fields, but repository/runtime/tests
   mutate the object in multiple places.
2. `WorkflowRepository.update(...)` is typed around `WorkflowDefinition`, while workflow runtime
   execution updates are pushing execution-state values (`pending`, `running`, `completed`,
   `failed`, `cancelled`) into a definition-oriented contract.
3. `TRIGGER_CONTRACTS` is exported as `readonly`, but the trigger files call `.push(...)` on it.
4. `TriggerHandlerResult` exists, but the trigger files still fail to import it correctly and do not
   consistently declare a valid trigger runtime surface.
5. The current workflow runtime has an in-memory placeholder design (`Map`-backed repository,
   `WorkflowRuntime` state transitions, checkpoint scaffolding), which is not yet a complete
   production state-management implementation.

The local workspace also does not contain a file named
`services/backend/TASK-1196-GLOBAL-CONTEXT7-COMPATIBILITY-AUDIT.md`. That means TASK-1196 cannot be
reconciled directly against a local artifact; any TASK-1196 conclusions must be inferred from the
reminder in TASK-1195 and the current repository code.

### Overall priority

The most important blockers are:

- P0: none at package/dependency level in the current workspace
- P0/P1: workflow contract mismatches that currently break type safety and runtime assumptions
- P1: trigger registry contract inconsistency
- P1: workflow execution state management needs formalization before further migration work
- P2: optional modernization opportunities in frontend/mobile/extension remain functional but should
  be tracked incrementally
- P3: non-blocking documentation drift and modernization items

---

## 2. TASK-1195 Reconciliation

### What TASK-1195 actually fixed

Based on the local `services/backend/TASK-1195-TYPESCRIPT-MINIMAL-FIX.md`, the task accomplished the
following verified fixes:

- added `vitest/globals` to `services/backend/tsconfig.json`
- corrected test and trigger import paths for Node16/ESM resolution
- removed the immediate TS5097 import blockers
- restored the backend TypeScript typecheck to a state where the compiler could analyze the
  workflow/trigger test files instead of failing at import resolution

These are valid fixes and are reflected in the current workspace, especially in the backend
`tsconfig.json`:

- `types: ["node", "vitest/globals"]`
- backend package uses `node --env-file=.env ... nest.js` for local environment loading

### What remains unresolved after TASK-1195

The current local typecheck output confirms that the original blocking issues are not the main
remaining problems anymore. The current remaining errors are mostly contract-level and
state-management-level issues, not missing import configuration.

Verified unresolved items include:

- `WorkflowExecution` immutability vs mutation
- `WorkflowRepository.update(...)` contract mismatch for execution-state updates
- `TRIGGER_CONTRACTS` readonly array misuse
- missing/incorrect trigger contract imports and handler signatures
- placeholder workflow runtime state handling that cannot yet be treated as complete
  production-grade state management
- test files that currently assume a mutable contract for workflow definitions/executions

### Incomplete or incorrect TASK-1195 conclusions

The local evidence shows that some TASK-1195 conclusions need correction or clarification:

1. The TASK-1195 report states that the error count increased from 117 to 225 after the import
   blockers were removed. That is possible in the earlier workspace state, but the current local
   workspace already includes the import/config fixes. The present typecheck output is therefore not
   the same as the original 225-error baseline.
2. The report says the remaining root causes are mainly logic errors. In the current workspace, the
   remaining issues are broader than pure logic; they include contract design drift, API surface
   inconsistencies, and incomplete trigger/runtime architecture.
3. TASK-1195 treats the workflow runtime as a local runtime issue, but the current repository shows
   that workflow state handling is intentionally a foundation layer, not a fully production-ready
   implementation. This is a design limitation, not just a TypeScript bug.
4. The file `TASK-1196-GLOBAL-CONTEXT7-COMPATIBILITY-AUDIT.md` does not exist locally, so any claim
   that TASK-1196 “fixed” or “verified” specific compatibility items cannot be directly checked
   here.

### Evidence from the current workspace

Current verified local issues include:

- `services/backend/src/workflow/trigger/manual.trigger.ts` imports `TriggerHandlerResult` from a
  type that is not imported in the file
- `services/backend/src/workflow/trigger/trigger.interface.ts` exports `TriggerHandlerResult`,
  `TriggerContract`, and `TRIGGER_CONTRACTS`, but `TRIGGER_CONTRACTS` is declared as `readonly`
- `services/backend/src/workflow/services/workflow.runtime.service.ts` mutates execution objects
  (`retryCount`, `retryEligible`, `lastRetryAt`, `status`, `error`) even though `WorkflowExecution`
  is declared as a readonly interface
- `services/backend/src/workflow/services/prisma-workflow.repository.ts` mutates
  `execution.checkpoint`, `execution.retryEligible`, and `execution.lastRetryAt`
- `services/backend/src/workflow/services/workflow.service.ts` uses
  `Omit<WorkflowExecution, "id" | "startedAt" | "completedAt">` while also inserting `id`, which is
  a type-contract smell and a likely source of the current typecheck churn

---

## 3. TASK-1196 Reconciliation

### Local status of TASK-1196

The file `services/backend/TASK-1196-GLOBAL-CONTEXT7-COMPATIBILITY-AUDIT.md` is not present in the
current local workspace. Because of that, this report cannot reconcile an actual TASK-1196 artifact.
The only available evidence is:

- the `TASK-1195` report’s “Next steps (TASK-1196)” section
- the current repository state
- the existing local workflow/trigger source code

### What TASK-1196 findings are still relevant

The most relevant TASK-1196-era findings still present in the code are:

- workflow execution readonly mutation problems
- workflow runtime and repository contract drift
- trigger registration contract inconsistency
- status-type confusion between workflow definition status and execution status
- placeholder trigger implementations that are only partially wired to runtime and infrastructure

### What must not be inferred as implemented

The following should not be assumed as completed simply because someone mentioned TASK-1196 in
earlier notes:

- no independent Context7 compatibility audit artifact exists locally
- no fresh global compatibility verification artifact exists for the current workspace
- no new source code changes were made in the repo to resolve the remaining workflow runtime/trigger
  inconsistencies

---

## 4. Current Dependency/Version Matrix

| Area                   | Current package/version                                                                                                        | Notes                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Root workspace         | `pnpm@10.8.0`, `typescript@5.8.0`, `vitest@3.1.0`, `turbo@2.5.0`                                                               | Already aligned with the workspace, no version changes proposed                                   |
| Backend                | `@nestjs/common/core/platform-fastify@11.x`, `fastify@5.x`, `prisma@7.8.0`, `@prisma/client@7.8.0`, `@prisma/adapter-pg@7.8.0` | Current backend stack is already installed and partially verified                                 |
| Web frontend           | `next@15.2.0`, `react@19.1.0`, `react-dom@19.1.0`, `tamagui@2.x`, `@tanstack/react-query@5.70.0`, `zustand@5.0.0`              | Functional; likely needs audit rather than forced upgrades                                        |
| Mobile app             | `expo~54.0.0`, `react-native~0.81.0`, `expo-router~4.0.0`, `react@19.1.0`, `tamagui@2.x`                                       | Current stack already matches the architecture plan                                               |
| Extension              | `wxt@0.19.0`, `react@19.1.0`, `zustand@5.0.0`                                                                                  | Current stack already present; issues are likely local implementation drift, not package mismatch |
| Database/cache/storage | `postgresql` via local Docker, Redis 7, MinIO, OpenSearch per docker compose                                                   | Current infra architecture should remain unchanged                                                |

### Key point

No current dependency matrix evidence suggests that the local workspace is using a package version
that is outright invalid or deprecated. The issues are mostly in the local implementation contracts
and the workflow engine’s foundation design.

---

## 5. Context7 Verified Findings

### Verified evidence already present in the workspace

The local repository already contains verified Context7-linked findings for the following technical
areas:

- TypeScript `Node16/ESM` module resolution rules
- Vitest globals support via `vitest/globals`
- current library surface/behavior for major packages across the monorepo

The TASK-1195 document explicitly confirms these:

- TypeScript Node16/ESM requires explicit extensions when using `.ts` source files in the backend
  workspace
- `vitest/globals` must be added to the TypeScript `types` array for Vitest global APIs

### Current limitation

This session does not have a direct, live Context7 MCP tool result available in the workspace.
Therefore, the reconciliation below uses the local repository plus the existing verified local
Context7 references from `TASK-1195` and other documentation already checked into the repo.

### Findings that should remain as-is after Context7 check

- `vitest/globals` is the correct backend TypeScript fix for Vitest global APIs
- `.js` specifiers in Node16/ESM imports remain the correct code path for TypeScript source files in
  this repo
- no package-level deprecation verdict should be made for current versions without direct, current
  official documentation for each package

### Findings that remain unverified in the current local workspace

- a formal TASK-1196 comparison artifact is absent locally
- some workflow trigger and state-management assumptions are still unverified beyond the local
  codebase

---

## 6. Compliant Components

The following components are already compliant enough to require no immediate change:

### Backend

- `services/backend/tsconfig.json` already includes `vitest/globals`
- `services/backend/package.json` already uses the patched dev script with `node --env-file=.env`
- `services/backend/src/workflow/interfaces/workflow-definition.interface.ts` is correctly using
  `WorkflowStatus` for workflow definition state
- `services/backend/src/workflow/interfaces/workflow-status.enum.ts` correctly models the workflow
  definition lifecycle (`draft | published | archived`)
- `services/backend/src/workflow/interfaces/workflow-execution.interface.ts` correctly distinguishes
  execution statuses (`pending | running | completed | failed | cancelled`)
- `services/backend/src/workflow/interfaces/workflow-repository.interface.ts` is structurally
  consistent with the repository pattern used elsewhere in the project
- `services/backend/src/workflow/trigger/trigger.interface.ts` already exports
  `TriggerHandlerResult`, `TriggerContract`, and `TRIGGER_CONTRACTS`

### Frontend / Mobile / Extension

- the web, mobile, and extension package manifests currently point to the intended modern stacks
  already captured by the architecture documentation
- no evidence suggests a blanket package downgrade or wholesale modernization is required before
  workflow migration backlog items are addressed

### Infrastructure

- Docker-compose layout and local env assumptions remain consistent with the architecture plan
- the local workspace already contains the required backend environment loading behavior and local
  database connection path adjustments

---

## 7. Deprecated APIs

### Findings

No current package or framework API in the local workspace is clearly deprecated in a way that would
justify immediate code changes.

### What is currently visible instead

The local issues are best described as:

- incomplete contracts
- placeholder implementations
- state model drift
- architecture mismatch rather than deprecation

### Particular caution

The wording “deprecated” should not be used for the current workflow engine foundation because the
design is not yet complete. The more accurate statement is that several workflow APIs are currently
under-specified or inconsistent, not deprecated.

---

## 8. Breaking Changes

### Current breaking-change candidates in the workspace

These are the main breaking-facing issues that should be treated as migration blockers if they are
addressed in future work:

1. `WorkflowExecution` immutability
   - Current `readonly` fields conflict with the repository/runtime/test code that mutates execution
     objects.
   - This is a real contract-level mismatch.

2. `WorkflowRepository.update(...)` contract mismatch
   - Execution state updates currently pass through a method defined for workflow definitions.
   - The method signature is functionally too narrow for execution lifecycle updates.

3. `TRIGGER_CONTRACTS` readonly registry conflict
   - The registry is declared as readonly, but trigger files push into it.
   - This is a contract-level breaking inconsistency.

4. Trigger runtime surface mismatch
   - Some trigger files assume a `workflowRuntime` instance property that is not consistently
     declared or surfaced.
   - This affects the ability to guarantee a stable runtime contract.

5. `WorkflowStatus` vs `WorkflowExecutionStatus` separation
   - The definitions are intentionally distinct, but the runtime and repository are mixing them in a
     way that is not yet fully type-safe.

### Note on package-level breaking changes

No package-level breaking changes were identified in the current local dependency matrix that
require immediate migration. The main breaking-change risk is local contract drift, not external
library incompatibility.

---

## 9. TypeScript Root Causes

### Current root causes

1. `WorkflowExecution` readonly contract mismatch
   - `services/backend/src/workflow/interfaces/workflow-execution.interface.ts`
   - runtime/repository/tests mutate the structure in multiple places

2. `WorkflowRepository.update(...)` typed for definitions, not execution state
   - `services/backend/src/workflow/interfaces/workflow-repository.interface.ts`
   - `services/backend/src/workflow/services/workflow.runtime.service.ts`
   - `services/backend/src/workflow/services/workflow.service.ts`

3. Trigger registry contract mismatch
   - `services/backend/src/workflow/trigger/trigger.interface.ts`
   - trigger files under `services/backend/src/workflow/trigger/`

4. Import path and contract cleanliness issues in trigger files
   - `manual.trigger.ts`, `api.trigger.ts`, `event.trigger.ts`, `file-upload.trigger.ts`,
     `schedule.trigger.ts`, `webhook.trigger.ts`, `ai-completion.trigger.ts`

5. Typecheck now reveals remaining definitions/state issues rather than hidden import blockers

### Current state of the earlier `TASK-1195` fixes

The earlier root causes that were truly fixed are the import resolution and Vitest globals problems.
Those are now already reflected in the current workspace and should not be reopened as future tasks
unless a new regression appears.

---

## 10. Workflow Root Causes

### Workflow runtime

The current workflow runtime in `services/backend/src/workflow/services/workflow.runtime.service.ts`
is clearly a foundation implementation:

- it persists execution state in-memory
- it tracks checkpoints with placeholder properties
- it exposes a runtime lifecycle with `pending -> running -> completed/failed/cancelled`
- it uses an internal `Map` repository for execution state

This is valid as a local foundation, but it is not yet a complete production state-management
solution.

### Workflow repository

`WorkflowRepositoryService` in
`services/backend/src/workflow/services/prisma-workflow.repository.ts` is an in-memory
implementation. This is acceptable for foundation work, but its current usage patterns should be
explicitly separated from a future persistent Prisma-backed implementation.

### Workflow status contracts

The current interfaces already distinguish:

- `WorkflowStatus` for the definition lifecycle (`draft`, `published`, `archived`)
- `WorkflowExecutionStatus` for execution state (`pending`, `running`, `completed`, `failed`,
  `cancelled`)

That distinction is good. The current problem is not the existence of two types; it is that
`WorkflowRepository` is not clearly split between definition updates and execution-state updates.

### Trigger contracts

The trigger contract files are the biggest unresolved contract issue in the current workflow engine.
The local code has the correct conceptual registry shape, but the concrete implementation is
inconsistent:

- `TRIGGER_CONTRACTS` is readonly
- trigger modules perform `.push(... )`
- trigger handlers assume a `workflowRuntime` instance property
- some imports are inconsistent or incomplete
- the handlers currently rely on a placeholder runtime shape rather than a fully specified execution
  contract

### Webhook trigger

`services/backend/src/workflow/trigger/webhook.trigger.ts` is a useful local example of `webhook`
handling with a simple auth check, but it is still a minimal placeholder rather than an end-to-end
secure webhook processor. This should be kept in mind when planning future work.

---

## 11. Backend Migration Backlog

### TASK-1198 — Reconcile workflow trigger registry contracts

- Objective: Make the trigger registry and trigger handler contracts internally consistent without
  changing the architecture.
- Root cause: `TRIGGER_CONTRACTS` is declared `readonly` while trigger files push into it; trigger
  files also rely on incomplete handler/runtime contracts.
- Exact files:
  - `services/backend/src/workflow/trigger/trigger.interface.ts`
  - `services/backend/src/workflow/trigger/manual.trigger.ts`
  - `services/backend/src/workflow/trigger/api.trigger.ts`
  - `services/backend/src/workflow/trigger/event.trigger.ts`
  - `services/backend/src/workflow/trigger/file-upload.trigger.ts`
  - `services/backend/src/workflow/trigger/ai-completion.trigger.ts`
  - `services/backend/src/workflow/trigger/schedule.trigger.ts`
  - `services/backend/src/workflow/trigger/webhook.trigger.ts`
- Current implementation: registry exists, but contract is inconsistent and some trigger files use
  incomplete or incorrect imports and handler signatures.
- Required modern implementation: formalize a mutable registry for registration, ensure each trigger
  module imports the correct symbols, and keep the contract aligned with the actual runtime surface.
- Context7 verification: verify NestJS module/DI + TypeScript ESM import rules against current
  official docs before finalizing the registry contract.
- Minimal change: modify only the trigger contract files and their imports; keep the existing
  trigger architecture and registry pattern.
- Tests: update trigger-focused unit tests to assert registry shape and import correctness.
- Quality gates: backend typecheck, trigger unit tests, existing workflow tests.
- Dependencies: none; should be first backend task.
- Risk: low-to-medium; risk is concentrated in trigger module integration and import paths.

### TASK-1199 — Reconcile workflow execution immutability with repository/runtime usage

- Objective: formalize whether `WorkflowExecution` should remain readonly or become a mutable
  runtime contract.
- Root cause: the interface is readonly, but repository and runtime mutate execution state.
- Exact files:
  - `services/backend/src/workflow/interfaces/workflow-execution.interface.ts`
  - `services/backend/src/workflow/services/workflow.runtime.service.ts`
  - `services/backend/src/workflow/services/prisma-workflow.repository.ts`
  - `services/backend/src/workflow/__tests__/workflow.runtime.test.ts`
  - `services/backend/src/workflow/__tests__/workflow.service.test.ts`
- Current implementation: a readonly execution model is declared, but multiple runtime/repository
  areas mutate objects.
- Required modern implementation: either (a) make the execution object mutable and update the
  contract accordingly, or (b) change runtime/repository logic to clone and return new objects
  instead of mutating the readonly interface.
- Context7 verification: verify current TypeScript and NestJS patterns for mutable DTO/state
  contracts before deciding the design direction.
- Minimal change: keep the domain model intent, but align the runtime/repository architecture
  precisely.
- Tests: update tests to follow the final chosen mutability design.
- Quality gates: typecheck, workflow runtime tests, repository tests.
- Dependencies: TASK-1198
- Risk: medium; this is the root of multiple downstream type errors.

### TASK-1200 — Separate workflow definition updates from execution-state updates

- Objective: cleanly distinguish definition-level `WorkflowRepository.update(...)` from
  execution-level state updates.
- Root cause: repository update method currently uses `WorkflowDefinition` types even when execution
  state is being updated.
- Exact files:
  - `services/backend/src/workflow/interfaces/workflow-repository.interface.ts`
  - `services/backend/src/workflow/services/workflow.runtime.service.ts`
  - `services/backend/src/workflow/services/workflow.service.ts`
  - `services/backend/src/workflow/services/prisma-workflow.repository.ts`
- Current implementation: execution updates are pushed through a definition-oriented contract.
- Required modern implementation: introduce explicit execution update methods or a dedicated
  execution repository contract.
- Context7 verification: verify repository contract patterns in current NestJS/TypeScript docs
  before finalizing the split.
- Minimal change: keep the existing repository service shape, but separate definition and execution
  update APIs.
- Tests: add regression checks for execution status transitions.
- Quality gates: typecheck, workflow runtime tests, repository tests.
- Dependencies: TASK-1199
- Risk: medium

### TASK-1201 — Formalize workflow state management as a production-ready foundation

- Objective: turn the current in-memory placeholder state management into a clearly documented
  foundation with explicit checkpoint/retry semantics.
- Root cause: state transitions and checkpoint handling are implemented in a basic way and should
  not be described as full state management yet.
- Exact files:
  - `services/backend/src/workflow/services/workflow.runtime.service.ts`
  - `services/backend/src/workflow/services/prisma-workflow.repository.ts`
  - `services/backend/src/workflow/interfaces/workflow-execution.interface.ts`
- Current implementation: checkpoint submission and retry state support exist but are
  placeholder-level.
- Required modern implementation: explicit state machine documentation, checkpoint semantics, retry
  limitations, and resume behavior should be formalized.
- Context7 verification: verify current recommended state-management patterns for workflow engines
  and resumable execution models.
- Minimal change: no broad architecture changes; only formalize the state model and document the
  intended lifecycle.
- Tests: add state transition/regression tests.
- Quality gates: workflow runtime tests, typecheck, targeted integration tests.
- Dependencies: TASK-1200
- Risk: medium-high; this affects runtime assumptions across the engine.

---

## 12. Frontend Migration Backlog

### TASK-1202 — Frontend modern API compatibility audit

- Objective: verify that the web app’s current usage of Next.js, React 19, Tamagui, Zustand,
  TanStack Query, and openapi-fetch remains consistent with the current official API guidance.
- Root cause: current frontend stack is modern, but several previous audit artifacts have mixed old
  and new guidance; the local code should be audited before further migration tasks.
- Exact files:
  - `apps/web/package.json`
  - `apps/web/**/app/**`
  - `apps/web/**/components/**`
  - shared packages under `packages/`
- Current implementation: Next.js 15, React 19, Tamagui, TanStack Query 5, Zustand, openapi-fetch
  are already present.
- Required modern implementation: document current compliant usage patterns and flag any local
  inaccuracies or stale assumptions.
- Context7 verification: verify Next.js App Router, React 19, TanStack Query v5, Zustand v5,
  openapi-fetch middleware usage, and Tamagui token patterns.
- Minimal change: no dependency changes, only code/documentation audit outputs.
- Tests: frontend typecheck, targeted web tests.
- Quality gates: frontend typecheck, lint, build, Playwright smoke tests.
- Dependencies: none
- Risk: low-medium

---

## 13. Mobile Migration Backlog

### TASK-1203 — Mobile runtime contract audit

- Objective: verify that Expo, React Native, React 19, Tamagui, and AsyncStorage-related patterns
  remain current and compliant.
- Root cause: the mobile app uses a modern Expo SDK stack, but the architecture should be compared
  to current official guidance before any future migration or deprecation work.
- Exact files:
  - `apps/mobile/package.json`
  - `apps/mobile/app/**`
  - `apps/mobile/src/**`
- Current implementation: Expo 54 / React Native 0.81 / React 19 / Tamagui 2 / React Query 5 /
  Zustand 5 are already present.
- Required modern implementation: audit the app for stack-specific best practices and document any
  necessary follow-up adjustments.
- Context7 verification: verify Expo SDK 54, Expo Router 4, React Native 0.81, and related package
  patterns against current docs.
- Minimal change: only audit and reconcile, no package churn.
- Tests: mobile typecheck, existing unit tests.
- Quality gates: mobile typecheck, lint, test.
- Dependencies: none
- Risk: low-medium

---

## 14. Extension Migration Backlog

### TASK-1204 — Extension platform compatibility audit

- Objective: verify the browser extension stack (WXT, React 19, Zustand, Chrome APIs) against the
  current official extension platform guidance.
- Root cause: extension stack is modern but not yet reconciled against current local architecture
  and packaging assumptions.
- Exact files:
  - `apps/extension/package.json`
  - `apps/extension/wxt.config.ts`
  - `apps/extension/entrypoints/**`
  - `apps/extension/lib/**`
- Current implementation: WXT 0.19, React 19, Zustand 5, Chrome types are already present.
- Required modern implementation: validate extension patterns and identify any current
  incompatibilities or modernization needs.
- Context7 verification: verify WXT docs, React 19 extension patterns, and Chrome API usage.
- Minimal change: audit and document only.
- Tests: extension typecheck, existing unit tests, Playwright smoke tests.
- Quality gates: extension typecheck, lint, build.
- Dependencies: none
- Risk: low-medium

---

## 15. Infrastructure Migration Backlog

### TASK-1205 — Infrastructure readiness and environment contract audit

- Objective: confirm the local Docker/Prisma/PostgreSQL/Redis/MinIO/OpenSearch setup remains aligned
  with the current architecture and the documented local launch sequence.
- Root cause: the local workspace already has patched dev scripts and a corrected PostgreSQL
  connection path, but the infrastructure documentation and runtime assumptions should be reconciled
  against the current code.
- Exact files:
  - `docker/docker-compose.yml`
  - `services/backend/package.json`
  - `services/backend/.env`
  - `services/backend/src/config/**`
  - relevant Prisma configuration files
- Current implementation: docker services and backend dev startup are already patched for local
  usage.
- Required modern implementation: add a formal verification/certification matrix for the services
  and their local contracts.
- Context7 verification: verify Prisma, PostgreSQL, Redis, MinIO, and Docker docs for current usage
  patterns.
- Minimal change: documentation and verification tasks, no runtime changes unless actual local
  incompatibilities are found.
- Tests: Docker health checks, Prisma generate/migrate, backend startup smoke test.
- Quality gates: local bootstrap smoke test, backend startup verification, DB connectivity test.
- Dependencies: none
- Risk: medium

---

## 16. Security Migration Backlog

### TASK-1206 — Security and workflow trust boundary audit

- Objective: verify that workflow execution, trigger handling, webhook validation, tenant-scoping,
  and state persistence remain aligned with the security model.
- Root cause: current workflow runtime and trigger files are foundational and should not be treated
  as security-complete until explicit review is performed.
- Exact files:
  - `services/backend/src/workflow/trigger/webhook.trigger.ts`
  - `services/backend/src/workflow/services/workflow.runtime.service.ts`
  - `services/backend/src/auth/**`
  - workflow and tenant-related modules
- Current implementation: webhook trigger contains a basic token check; other trigger types rely on
  current context propagation.
- Required modern implementation: document mandatory trust boundaries, tenant checks, and webhook
  validation requirements before promoting these contracts further.
- Context7 verification: verify current NestJS guard, JWT, and webhook security guidance.
- Minimal change: no broad security redesign; simply reconcile the workflow trust boundaries with
  existing auth/tenant patterns.
- Tests: security-focused workflow and webhook tests.
- Quality gates: existing security tests, workflow tests, auth tests.
- Dependencies: TASK-1198, TASK-1200
- Risk: high

---

## 17. P0/P1/P2/P3 Priorities

### P0 — blocking/security/runtime critical

- None at package/dependency level in the current workspace
- workflow execution contract mismatch is effectively a runtime/typing blocker for future safe
  migration work
- workflow trigger registry inconsistency is a blocker for any production-grade trigger integration

### P1 — correctness/required migration

- TASK-1198: trigger registry contract reconciliation
- TASK-1199: workflow execution readonly/mutation contract reconciliation
- TASK-1200: definition vs execution update contract split
- TASK-1201: formalize execution state management
- TASK-1206: security/trust-boundary audit for workflow/webhook and tenant context

### P2 — deprecated but currently functional

- none currently identified as deprecation-level issues
- only potential P2 items are future modernization opportunities in frontend/mobile/extension that
  already work but should be audited against current docs

### P3 — recommended modernization

- TASK-1202: frontend modern API audit
- TASK-1203: mobile runtime contract audit
- TASK-1204: extension compatibility audit
- TASK-1205: infrastructure readiness audit

---

## 18. Migration Dependency Graph

```text
TASK-1198 (trigger registry contract cleanup)
    ├─> TASK-1199 (execution mutability contract)
    │      └─> TASK-1200 (definition vs execution update split)
    │            └─> TASK-1201 (state management formalization)
    │                  └─> TASK-1206 (security/trust-boundary audit)
    │
    └─> TASK-1202/1203/1204/1205 (parallel audit tracks)
```

### Dependency interpretation

- The backend workflow contract tasks should be executed first, because they determine the
  correctness of all downstream migration planning.
- Frontend/mobile/extension audits can run in parallel once the backend contract reconciliation is
  understood.
- Security work depends on the backend contract cleanup because trust boundaries are partially
  defined by the workflow runtime and trigger surfaces.

---

## 19. Recommended TASK Execution Order

1. TASK-1198 — trigger registry contract cleanup
2. TASK-1199 — workflow execution mutability contract reconciliation
3. TASK-1200 — definition vs execution update contract split
4. TASK-1201 — workflow state management formalization
5. TASK-1206 — security/trust-boundary audit
6. TASK-1202 — frontend API compatibility audit
7. TASK-1203 — mobile runtime contract audit
8. TASK-1204 — extension compatibility audit
9. TASK-1205 — infrastructure readiness audit

### Why this order

This preserves the minimal-change, dependency-aware approach required by the project plan. It also
avoids broad refactoring or version churn before the current contract drift is addressed.

---

## 20. Items That Must NOT Be Changed

These items should be explicitly preserved:

- the current monorepo structure and package boundaries
- the existing backend package version matrix
- the current backend dev script with `node --env-file=.env` already patched for local runtime
- the current distinction between `WorkflowStatus` and `WorkflowExecutionStatus`
- the current architecture split between workflow definition, workflow execution, and trigger
  contracts
- the current local infrastructure layout (Docker services, database, Redis, MinIO, OpenSearch)
- the current dependency versions in the local workspace

### Important non-goal

The report must not create a task that says “fix all 225 errors.” That would be too broad and would
hide the real root causes. The work should be decomposed into small, dependency-aware tasks that
each address a concrete contract or migration issue.

---

## 21. Final Recommendation

### Recommended path

Proceed with a dependency-aware, contract-first migration plan rather than a version-first migration
plan.

### Why

The current local workspace already contains the major import/config fixes that TASK-1195 achieved.
The remaining issues are not caused by package obsolescence; they are the result of contract drift
in the workflow engine and trigger system.

### Recommended action

1. Treat `TASK-1198` through `TASK-1201` as the first migration wave.
2. Keep `TASK-1202` through `TASK-1205` as parallel audits rather than blocking changes.
3. Run `TASK-1206` after the backend contract cleanup has been completed, since it depends on the
   workflow and trigger contracts being stable.
4. Do not change dependency versions in this planning phase.
5. Do not broad-refactor the architecture. The current foundation is useful; it simply needs
   contract alignment and explicit state model boundaries.

### Bottom line

The local workspace is already past the original import/config blockers. The next step is not a
global package migration. The next step is targeted reconciliation of workflow contracts and
trigger/runtime boundaries, followed by focused audits of the web, mobile, extension,
infrastructure, and security layers.
