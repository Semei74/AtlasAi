# Atlas AI

# Architecture Decision Records (ADR)

**Version:** 1.0.0  
**Status:** Active  
**Document Type:** Architecture Decision Records  
**Owner:** Architecture Team  
**Last Updated:** 2026-06-29

---

# Purpose

This document records the major architectural decisions made for the Atlas AI platform.

Architecture Decision Records (ADRs) explain **why** important technical decisions were made, the
alternatives considered, and the long-term consequences.

All significant architectural changes must be documented before implementation.

---

# ADR Lifecycle

```text
Proposed
    │
    ▼
Accepted
    │
    ▼
Implemented
    │
    ▼
Superseded / Deprecated
```

---

# ADR Index

| ADR     | Title                                | Status   |
| ------- | ------------------------------------ | -------- |
| ADR-001 | Documentation First Development      | Accepted |
| ADR-002 | Monorepo Repository Structure        | Accepted |
| ADR-003 | Modular Architecture                 | Accepted |
| ADR-004 | Backend Technology Stack             | Accepted |
| ADR-005 | Frontend Technology Stack            | Superseded |
| ADR-006 | Database Strategy                    | Accepted |
| ADR-007 | AI Provider Abstraction              | Accepted |
| ADR-008 | Retrieval-Augmented Generation (RAG) | Accepted |
| ADR-009 | Context Engine                       | Accepted |
| ADR-010 | Workflow Engine                      | Accepted |
| ADR-011 | AI Agent Architecture                | Accepted |
| ADR-012 | Security by Design                   | Accepted |
| ADR-013 | Multi-Tenancy                        | Accepted |
| ADR-014 | Observability                        | Accepted |
| ADR-015 | Deployment Strategy                  | Accepted |
| ADR-016 | Plugin & Extension System            | Accepted |
| ADR-017 | API Design Standards                 | Accepted |
| ADR-018 | Versioning Strategy                  | Accepted |
| ADR-019 | Testing Strategy                     | Accepted |
| ADR-020 | Documentation Governance             | Accepted |
| ADR-021 | Next.js (Web Framework)              | Accepted |
| ADR-022 | Expo (Mobile Framework)              | Accepted |
| ADR-023 | Tamagui (Cross-Platform UI)          | Accepted |
| ADR-024 | TanStack Query (Server State)        | Accepted |
| ADR-025 | Zustand (Client State)               | Accepted |
| ADR-026 | React Hook Form + Zod (Forms)        | Accepted |
| ADR-027 | openapi-typescript + openapi-fetch    | Accepted |
| ADR-028 | WXT (Browser Extension)              | Accepted |
| ADR-029 | Storybook + Chromatic (Visual Testing)| Accepted |
| ADR-030 | Vitest + Playwright + Detox (Testing) | Accepted |
| ADR-031 | i18next (Internationalization)       | Accepted |
| ADR-032 | Turborepo + Changesets (Build & Release)| Accepted |
| ADR-033 | Sentry + PostHog (Observability)      | Accepted |
| ADR-034 | P3 Freeze (Project Domain Deferral)   | Accepted |

---

# ADR-001 — Documentation First Development

## Status

Accepted

## Context

Atlas AI is a large enterprise platform consisting of many independent subsystems.

## Decision

Architecture and specifications shall be completed before implementation.

## Consequences

- Clear implementation guidance
- Reduced architectural drift
- Easier onboarding
- Better long-term maintainability

## Alternatives Considered

- Code-first development
- Prototype-first development

---

# ADR-002 — Monorepo Repository Structure

## Status

Accepted

## Context

The project contains backend, frontend, infrastructure, documentation and shared resources.

## Decision

Maintain a single repository containing all platform components.

## Consequences

- Simplified dependency management
- Shared tooling
- Unified CI/CD
- Easier version control

## Alternatives Considered

- Polyrepo architecture

---

# ADR-003 — Modular Architecture

## Status

Accepted

## Context

The platform must evolve without requiring large-scale rewrites.

## Decision

Every subsystem shall be independently deployable and loosely coupled.

## Consequences

- Better scalability
- Easier testing
- Independent evolution
- Reduced coupling

## Alternatives Considered

- Monolithic architecture

---

# ADR-004 — Backend Technology Stack

## Status

Accepted

## Context

Backend services require scalability, maintainability and strong typing.

## Decision

Primary backend stack:

- Node.js
- TypeScript
- NestJS
- Fastify

## Consequences

- Strong developer productivity
- High performance
- Excellent ecosystem

## Alternatives Considered

- Spring Boot
- ASP.NET
- Go

---

# ADR-005 — Frontend Technology Stack

## Status

Superseded

Superseded by: ADR-021 (Next.js), ADR-022 (Expo), ADR-023 (Tamagui), ADR-025 (Zustand),
ADR-026 (React Hook Form), ADR-027 (openapi-typescript), ADR-028 (WXT), ADR-031 (i18next)

## Context

The platform requires a modern, maintainable, responsive user interface capable of supporting
enterprise workflows across multiple devices.

## Original Decision

Primary frontend stack:

- React
- Next.js
- TypeScript
- Tailwind CSS

A shared Design System shall be used across all applications.

## Why Superseded

ADR-005 was written before the cross-platform requirements (Web + iOS + Android + Browser Extension)
were fully specified. The original stack lacked:
- Mobile framework (Expo)
- Cross-platform UI (Tamagui)
- State management (TanStack Query + Zustand)
- Form handling (React Hook Form + Zod)
- API SDK generation (openapi-typescript)
- Browser extension framework (WXT)
- Internationalization (i18next)

These gaps are resolved by ADR-021 through ADR-032.

## Consequences

- The original React + Next.js + TypeScript foundation remains valid
- Tailwind CSS is removed. Tamagui is the sole UI framework, providing true cross-platform styling.
- A shared Design System is now provided by Tamagui (cross-platform) instead of Tailwind CSS (web-only)
- The frontend stack has expanded from 4 technologies to 20 to cover all platforms and engineering concerns

---

# ADR-006 — Database Strategy

## Status

Accepted

## Context

Atlas AI manages structured business data, AI metadata, workflows, audit logs, and user information.

## Decision

PostgreSQL is the primary relational database.

Redis shall be used for:

- caching
- sessions
- distributed locks
- queues

Object storage shall manage binary assets.

## Consequences

- Mature ecosystem
- ACID compliance
- Excellent scalability
- Strong indexing capabilities

## Alternatives Considered

- MySQL
- MongoDB
- SQL Server

---

# ADR-007 — AI Provider Abstraction

## Status

Accepted

## Context

The platform must avoid vendor lock-in while supporting multiple AI providers.

## Decision

All AI requests shall pass through the AI Gateway and Model Routing layer.

Providers may include:

- OpenAI
- Anthropic
- Google
- Azure OpenAI
- Ollama
- Local Models

## Consequences

- Provider independence
- Automatic failover
- Cost optimization
- Easy integration of future providers

## Alternatives Considered

- Direct provider integration
- Single-provider architecture

---

# ADR-008 — Retrieval-Augmented Generation (RAG)

## Status

Accepted

## Context

Enterprise AI responses must be grounded in organizational knowledge.

## Decision

Implement a complete RAG pipeline consisting of:

- Document Processing
- Chunking
- Embedding Generation
- Vector Search
- Context Assembly
- Citation Engine

## Consequences

- More accurate responses
- Reduced hallucinations
- Traceable information sources
- Enterprise knowledge integration

## Alternatives Considered

- Prompt-only architecture
- Fine-tuned models without retrieval

---

# ADR-009 — Context Engine

## Status

Accepted

## Context

LLMs require structured contextual information to produce relevant responses.

## Decision

Introduce a dedicated Context Engine responsible for:

- user context
- workspace context
- conversation history
- retrieved knowledge
- system prompts
- runtime variables

## Consequences

- Better response quality
- Reusable context logic
- Consistent AI behavior

## Alternatives Considered

- Context assembly inside individual services

---

# ADR-010 — Workflow Engine

## Status

Accepted

## Context

Business processes require orchestration beyond simple API calls.

## Decision

Introduce a standalone Workflow Engine supporting:

- visual workflows
- conditional logic
- scheduled execution
- human approval
- retries
- event-driven execution

## Consequences

- Flexible automation
- Business process support
- Reduced custom code

## Alternatives Considered

- Hard-coded workflows
- External workflow-only platforms

---

# ADR-011 — AI Agent Architecture

## Status

Accepted

## Context

Atlas AI must support autonomous AI agents capable of planning, reasoning, tool execution, and
collaboration.

## Decision

Introduce a dedicated Agent Runtime consisting of:

- Agent Registry
- Agent Memory
- Planning Engine
- Tool Calling
- Context Integration
- Workflow Integration
- Multi-Agent Communication

Agents shall remain isolated from business services through defined interfaces.

## Consequences

- Reusable agent framework
- Extensible capabilities
- Safer execution model
- Easier testing and governance

## Alternatives Considered

- Agent logic embedded inside AI Gateway
- Single monolithic agent implementation

---

# ADR-012 — Security by Design

## Status

Accepted

## Context

Security is a foundational requirement rather than an optional feature.

## Decision

Every subsystem shall implement security controls from the beginning of development.

Security includes:

- Authentication
- Authorization
- Encryption
- Secrets Management
- Audit Logging
- Rate Limiting
- Secure Defaults
- Least Privilege

## Consequences

- Lower security risk
- Simplified compliance
- Better operational resilience

## Alternatives Considered

- Security after implementation
- Per-service security policies

---

# ADR-013 — Multi-Tenancy

## Status

Accepted

## Context

Atlas AI is intended for organizations managing multiple workspaces and business units.

## Decision

The platform shall support tenant isolation across:

- Users
- Workspaces
- Knowledge Bases
- AI Context
- Storage
- Configuration
- Audit Logs

## Consequences

- Enterprise readiness
- Data isolation
- Simplified administration

## Alternatives Considered

- Single-tenant deployment only

---

# ADR-014 — Observability

## Status

Accepted

## Context

Enterprise platforms require operational visibility.

## Decision

Every service shall expose standardized telemetry.

Minimum requirements:

- Structured Logs
- Metrics
- Distributed Traces
- Health Checks
- Readiness Checks
- Performance Statistics

Recommended stack:

- Prometheus
- Grafana
- Loki
- Jaeger

## Consequences

- Faster incident response
- Better diagnostics
- Performance optimization

## Alternatives Considered

- Logging only

---

# ADR-015 — Deployment Strategy

## Status

Accepted

## Context

The platform must support local development and scalable production deployments.

## Decision

Deployment targets include:

- Docker Compose (development)
- Kubernetes (production)

Infrastructure shall be managed using Infrastructure as Code.

## Consequences

- Reproducible deployments
- Horizontal scalability
- Simplified operations

## Alternatives Considered

- Virtual machine deployments only

---

---

# ADR-016 — Plugin & Extension System

## Status

Accepted

## Context

The platform must remain extensible without requiring modifications to the core services.

## Decision

Atlas AI shall provide a Plugin Framework supporting:

- External Integrations
- AI Tools
- Custom Connectors
- Workflow Extensions
- Authentication Providers
- Notification Providers
- Import/Export Modules

Plugins shall communicate through stable public APIs and extension points.

## Consequences

- Extensible platform
- Faster integration development
- Reduced core complexity
- Independent plugin lifecycle

## Alternatives Considered

- Hard-coded integrations
- Custom development for every connector

---

# ADR-017 — API Design Standards

## Status

Accepted

## Context

Multiple services expose APIs consumed by web clients, mobile applications, integrations, and
plugins.

## Decision

All public APIs shall follow common design standards:

- REST-first architecture
- OpenAPI Specification
- Semantic Versioning
- Consistent Error Responses
- Pagination Standards
- Filtering & Sorting
- JWT Authentication
- Rate Limiting
- Idempotent Operations where applicable

## Consequences

- Consistent developer experience
- Easier client implementation
- Improved maintainability

## Alternatives Considered

- Service-specific API conventions
- GraphQL-only architecture

---

# ADR-018 — Versioning Strategy

## Status

Accepted

## Context

The platform consists of independently evolving services and APIs.

## Decision

Versioning shall follow Semantic Versioning (SemVer).

API versions shall remain backward compatible whenever practical.

Documentation, APIs, and releases shall use synchronized version identifiers.

## Consequences

- Predictable upgrades
- Stable integrations
- Simplified release management

## Alternatives Considered

- Date-based versioning
- Unversioned APIs

---

# ADR-019 — Testing Strategy

## Status

Accepted

## Context

Enterprise software requires repeatable quality assurance.

## Decision

Testing shall be mandatory across all implementation layers.

Minimum testing categories include:

- Unit Tests
- Integration Tests
- API Tests
- Contract Tests
- End-to-End Tests
- Security Tests
- Performance Tests

CI/CD pipelines shall block releases when quality gates fail.

## Consequences

- Higher software quality
- Reduced regression risk
- Safer deployments

## Alternatives Considered

- Manual testing only
- End-to-end testing only

---

# ADR-020 — Documentation Governance

## Status

Accepted

## Context

Atlas AI follows a documentation-first methodology.

Documentation must remain synchronized with implementation throughout the project lifecycle.

## Decision

The documentation contained in the repository shall be treated as the authoritative specification.

Implementation changes affecting architecture, APIs, infrastructure, security, or user experience
must include corresponding documentation updates.

Major architectural changes require a new ADR before implementation begins.

## Consequences

- Documentation remains accurate
- Architectural decisions are traceable
- Reduced knowledge loss
- Improved onboarding

## Alternatives Considered

- Documentation maintained after implementation
- Informal architectural notes

---

# ADR Governance

## Creating a New ADR

A new Architecture Decision Record should be created whenever a significant technical decision
affects:

- Platform Architecture
- Infrastructure
- Security
- AI Systems
- Data Storage
- APIs
- Deployment
- Observability
- Development Standards

---

# ADR-021 — Next.js (Web Framework)

## Status

Accepted

## Context

AtlasAI requires a production web application with SSR, SEO, streaming, and excellent developer
experience, serving as the primary web interface for the platform.

## Decision

Next.js 14+ with App Router architecture:

- React Server Components for reduced client bundle
- Streaming SSR for progressive loading (especially AI chat responses)
- Route Handlers for API proxy routes if needed
- Middleware for auth checks and redirects
- Server Actions for direct backend mutations where appropriate

## Alternatives Considered

- **Remix**: Less mature streaming SSR support, smaller ecosystem
- **Vite + React**: Requires additional setup for SSR, routing, and data loading
- **Create React App**: Deprecated, no SSR, no routing

## Consequences

- Positive: Server Components significantly reduce client-side JavaScript
- Positive: Streaming SSR enables progressive rendering of AI chat responses
- Positive: Middleware enables efficient auth checks before page load
- Positive: Largest React meta-framework ecosystem and community
- Trade-off: Must maintain clear separation between Server and Client Components
- Trade-off: Server Components cannot use hooks, event handlers, or browser APIs

## References

- Next.js App Router Documentation (Context7 verified)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-022 — Expo (Mobile Framework)

## Status

Accepted

## Context

AtlasAI requires iOS and Android applications that share maximum code with the web application
while providing native platform experiences.

## Decision

Expo SDK 54+ with:

- Expo Router for file-based universal routing
- EAS Build for CI/CD mobile builds
- expo-updates for OTA updates
- expo-secure-store for encrypted token storage
- expo-document-picker for file uploads
- expo-notifications for push notifications

## Alternatives Considered

- **Bare React Native CLI**: No OTA updates, harder CI/CD, more boilerplate for native modules
- **React Native Community CLI**: Same limitations as bare RN

## Consequences

- Positive: Expo Router provides file-based routing shared with web navigation patterns
- Positive: EAS Build provides CI/CD pipeline for app store submissions
- Positive: OTA updates enable instant bug fixes without app store review
- Positive: expo-secure-store provides Keychain (iOS) / EncryptedSharedPreferences (Android)
- Positive: Expo SDK 54+ (with React Native 0.81, React 19.1) is required for Tamagui v2 compatibility
- Trade-off: If custom native modules are needed, Expo prebuild generates native projects
- Trade-off: Some advanced native features require dev client or bare workflow

## References

- Expo SDK Documentation (Context7 verified)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-023 — Tamagui (Cross-Platform UI)

## Status

Accepted

## Context

AtlasAI needs a single design system that works identically on Web (Next.js), Mobile (Expo/iOS/Android),
and Browser Extension (WXT). Using separate UI frameworks per platform would triple maintenance.

## Decision

Tamagui v2 (the sole UI system — shadcn/ui and TailwindCSS are NOT used):

- **Version requirements:** Tamagui v2 requires React 19+, React Native 0.81+ (New Architecture),
  TypeScript 5+, and Expo SDK 54+. See compatibility matrix in TASK_1126B Phase 2.
- Optimizing compiler for platform-specific output
- @tamagui/core primitives as base building blocks
- Custom components built with `styled()` factory
- Design tokens in tamagui.config.ts (colors, spacing, typography, radii)
- Dark/light theme via Tamagui Theme component
- @tamagui/sheet, @tamagui/dialog, @tamagui/toast, @tamagui/popover for complex primitives
- No TailwindCSS. No shadcn/ui. No web-only components. All components shared across all platforms.

## Alternatives Considered

- **NativeWind** (TailwindCSS for RN): No UI kit, separate web/mobile component libraries,
  lower Context7 benchmark score (74.24 vs 83.05), Tailwind-only approach
- **Plain TailwindCSS**: Web only, no React Native support
- **React Native Paper**: Weak web support, Material Design only, limited customization
- **Restyle**: Shopify's library, no web support, smaller ecosystem

## Consequences

- Positive: 100% API parity between React Native, Web, and any React target
- Positive: Optimizing compiler generates atomic CSS for web (minimal output)
- Positive: Optimizing compiler generates hoisted `StyleSheet.create()` for native (no runtime cost)
- Positive: Built-in UI kit covers most common components (Button, Input, Sheet, Dialog, Toast)
- Positive: Cross-platform theming with dark/light mode built in
- Positive: TypeScript-first with full type inference
- Trade-off: Compiler adds build complexity (dev mode works without, production requires it)
- Trade-off: Learning curve for `styled()` API vs Tailwind utility classes
- Trade-off: Smaller community than TailwindCSS (but growing rapidly)

## References

- Tamagui Documentation (Context7 verified — `/tamagui/tamagui`, Score: 83.05)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-024 — TanStack Query (Server State)

## Status

Accepted

## Context

AtlasAI has 54 API endpoints that require caching, deduplication, background refetching, pagination,
infinite scrolling, and SSR hydration across Web, Mobile, and Extension platforms.

## Decision

TanStack Query v5 with:

- QueryClient provider at app root
- useQuery for data fetching (GET endpoints)
- useMutation for data modification (POST, PATCH, DELETE)
- useInfiniteQuery for paginated lists (chat history, documents, prompts)
- experimental_createQueryPersister for offline cache persistence
- focusManager.setFocused (AppState) for React Native refetch on focus
- SSR prefetchQuery + dehydrate for server-rendered pages
- queryClient.invalidateQueries for cache invalidation after mutations

## Alternatives Considered

- **SWR**: Fewer features (no mutation helpers, no infinite queries, no devtools),
  less mature TypeScript support, smaller ecosystem

## Consequences

- Positive: Automatic caching and deduplication reduces API calls by 60%+ in typical usage
- Positive: useInfiniteQuery enables cursor-based pagination for chat history
- Positive: SSR prefetch + dehydrate enables server-rendered pages with zero client loading state
- Positive: React Native AppState integration refetches on app foreground
- Positive: Offline persistence via persister (12h TTL default)
- Positive: Excellent DevTools for debugging query state
- Positive: Largest server state library ecosystem, backed by TanStack
- Trade-off: Cache invalidation strategy must be carefully designed to avoid stale data

## References

- TanStack Query Documentation (Context7 verified — `/tanstack/query`, Score: 89.58)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-025 — Zustand (Client State)

## Status

Accepted

## Context

AtlasAI needs lightweight client-side state management for auth tokens, UI preferences, theme,
sidebar state, and other non-server state across all platforms without Redux boilerplate.

## Decision

Zustand v5 with:

- persist middleware for state persistence across sessions
- devtools middleware for Redux DevTools debugging
- Platform-specific storage adapters:
  - Web: localStorage (non-sensitive) / in-memory (tokens)
  - Mobile: expo-secure-store (tokens) / AsyncStorage (preferences)
  - Extension: chrome.storage.local
- No provider required — stores are consumed directly via hooks

## Alternatives Considered

- **Redux Toolkit**: Too much boilerplate for this use case (actions, reducers, slices, selectors),
  heavier bundle (~12 KB vs ~1 KB)
- **Jotai**: Atomic state adds unnecessary complexity for straightforward state needs,
  less mature persistence
- **React Context**: Re-renders entire subtree on any change, no persistence, no devtools

## Consequences

- Positive: Minimal boilerplate — stores are single-function calls
- Positive: persist middleware handles serialization, hydration, and migrations
- Positive: devtools middleware enables time-travel debugging
- Positive: TypeScript inference is excellent with `create<Store>()()` pattern
- Positive: 1.1 KB bundle size min+gzip
- Positive: No provider wrapper needed (unlike Context or Redux)
- Trade-off: Zustand v5 requires explicit `setState()` after store creation for initial values
- Trade-off: No built-in side effect handling (use TanStack Query for async, not Zustand)

## References

- Zustand Documentation (Context7 verified — `/pmndrs/zustand`, Score: 91.2)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-026 — React Hook Form + Zod (Forms & Validation)

## Status

Accepted

## Context

AtlasAI has complex forms across all platforms (login, register, document upload, prompt editor,
organization settings) requiring performant validation and TypeScript type safety.

## Decision

React Hook Form v7 with @hookform/resolvers/zod for validation:

- Zod schemas as single source of truth for form validation
- TypeScript types inferred from Zod schemas via `z.infer`
- Controller wrapper for Tamagui/React Native form components
- @atlas/validation predicates reused within Zod refinements
- Zod schemas shareable with backend validation (future)

## Alternatives Considered

- **Formik**: Re-renders entire form on any field change, more boilerplate, less performant
- **Final Form**: Smaller ecosystem, less mature TypeScript support
- **Custom validation**: Duplication between client and server, maintenance burden

## Consequences

- Positive: Unmanaged form state — no re-renders on keystroke (only on submission)
- Positive: Zod schemas provide automatic TypeScript type inference
- Positive: @hookform/resolvers/zod provides seamless integration
- Positive: Controller wraps any custom component (Tamagui, React Native, etc.)
- Positive: Zod schemas can be shared with backend validation via @atlas/validation predicates
- Trade-off: Nested form structures require more verbose Zod schemas
- Trade-off: Controller adds slight overhead compared to native register()

## References

- React Hook Form Documentation (Context7 verified — Version: v7.66.0)
- Zod Documentation
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-027 — openapi-typescript + openapi-fetch (API SDK)

## Status

Accepted

## Context

AtlasAI has 54 documented API endpoints with an OpenAPI 3.0 specification. Frontend needs a type-safe
API client that stays synchronized with the backend contract.

## Decision

openapi-typescript CLI for type generation from `openapi.json` + openapi-fetch for typed fetch wrapper:

- Types generated via CLI: `npx openapi-typescript openapi.json -o types.ts`
- Generated types in `@atlas/api-client/src/types.ts`
- openapi-fetch provides `createClient<paths>()` with full type inference
- Manual type overrides for the 28 endpoints returning `Promise<unknown>`
- Generation script in CI: `scripts/generate-api-types.sh`
- `noUncheckedIndexedAccess` enabled in tsconfig for path param safety

## Alternatives Considered

- **orval**: Generates React Query hooks automatically — reduces control, heavier setup,
  less flexible for custom hook patterns
- **OpenAPI Generator**: Requires Java runtime, generates more code than needed,
  harder to customize for TanStack Query integration
- **Manual types**: Guaranteed to drift from backend, maintenance burden

## Consequences

- Positive: Types are generated from the backend spec — guaranteed to match at generation time
- Positive: openapi-fetch is 0.8 KB min+gzip — negligible bundle impact
- Positive: Generated types feed directly into TanStack Query generic parameters
- Positive: CI pipeline rejects PRs if OpenAPI spec change breaks type generation
- Trade-off: 28 endpoints require manual type overrides (controllers return `Promise<unknown>`)
- Trade-off: Generation must be re-run when OpenAPI spec changes
- Trade-off: 28 of 54 endpoints lack request/response schemas in the OpenAPI spec (swagger plugin not configured)

## References

- openapi-typescript Documentation (Context7 verified — `/openapi-ts/openapi-typescript`)
- openapi-fetch Middleware API (Context7 verified — `client.use()`, `onRequest`, `onResponse`, `onError`)
- TASK_1125.md — API Freeze & Frontend Contract Certification
- TASK_1126B.md — Frontend Architecture Hardening

---

# ADR-028 — WXT (Browser Extension)

## Status

Accepted

## Context

AtlasAI requires a browser extension (Chrome, Firefox, Edge, Safari) that provides AI assistant
capabilities (chat in side panel, text selection actions, quick popup) while sharing code with
the web and mobile applications.

## Decision

WXT with @wxt-dev/module-react for React/TypeScript support:

- Manifest V3 for Chrome, MV2 fallback for Firefox
- Entrypoints: popup (quick actions), sidepanel (full chat), background (service worker),
  content-script (page integration)
- chrome.storage.local for token and preference persistence
- Shares @atlas/api-client, @atlas/auth, @atlas/ui (minimal subset), @atlas/hooks
- HMR during development via WXT dev server
- Auto-publishing via WXT CLI for Chrome Web Store and Firefox Add-ons

## Alternatives Considered

- **CRXJS**: Manifest V3 only (no MV2 for Firefox), no auto-publishing, less monorepo-friendly,
  lower benchmark score for monorepo integration
- **Plasmo**: Smaller community, less mature, fewer entrypoint types
- **Vanilla Webpack/Rollup**: No HMR, manual config, no framework integration

## Consequences

- Positive: File-based entrypoints provide clear project structure
- Positive: HMR during extension development
- Positive: Multi-browser support from single codebase
- Positive: Auto-publishing to Chrome Web Store and Firefox Add-ons
- Positive: Shares code with web and mobile via @atlas/* packages
- Positive: TypeScript-first with full type safety
- Trade-off: WXT is newer than CRXJS (smaller community, fewer GitHub stars)
- Trade-off: MV3 service worker limitations (no DOM access, no localStorage)
- Trade-off: chrome.storage.local has 10 MB limit (sufficient for tokens and preferences)

## References

- WXT Documentation (Context7 verified — `/wxt-dev/wxt`, Score: 78.51)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-029 — Storybook + Chromatic (Visual Testing)

## Status

Accepted

## Context

AtlasAI needs component documentation, visual regression testing, and design system review workflow
for the shared Tamagui component library.

## Decision

Storybook 8 for component development + Chromatic for visual regression testing:

- Storybook 8 with @storybook/react and @storybook/nextjs for web component testing
- Tamagui configuration in Storybook via custom preview.ts
- Chromatic for visual diffs, UI review workflow, and cross-browser screenshots
- Chromatic auto-accepts on main branch, requires human review on PRs
- Stories co-located with components in `@atlas/ui/src/**/*.stories.tsx`

## Alternatives Considered

- **Ladle**: Less mature, fewer addons, no Tamagui integration examples
- **Histoire**: Vue-focused, React support is secondary
- **No visual testing**: Risk of unintended UI changes reaching production

## Consequences

- Positive: Component documentation always stays in sync with implementation
- Positive: Chromatic provides pixel-perfect visual diffs
- Positive: UI review workflow integrates with GitHub PRs
- Positive: Cross-browser screenshot comparison catches rendering differences
- Trade-off: Storybook + Chromatic add ~3 minutes to CI pipeline
- Trade-off: Tamagui-native components may not render identically in Storybook web environment

## References

- Storybook 8 Documentation
- Chromatic Documentation
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-030 — Vitest + Playwright + Detox (Testing)

## Status

Accepted

## Context

AtlasAI requires comprehensive testing across all platforms: unit tests for shared packages,
integration tests for API client and hooks, E2E tests for web and mobile, and visual regression
for UI components.

## Decision

Three-tier testing strategy:

**Unit & Integration (Vitest):**
- Vitest (already in monorepo, Vite-native, Jest-compatible)
- jsdom environment for frontend packages, node for backend-compatible packages
- @testing-library/react for component tests
- @testing-library/react-hooks for hook tests
- MSW (Mock Service Worker) for API mocking in integration tests
- 80% coverage threshold (branches, functions, lines, statements)
- Coverage provider: v8

**Web E2E (Playwright):**
- Three browser projects: chromium, firefox, webkit
- Two mobile viewport projects: Pixel 5 (Chrome), iPhone 12 (Safari)
- webServer config to start Next.js dev server before tests
- Auto-wait and web-first assertions for reliable tests

**Mobile E2E (Detox):**
- iOS simulator (iPhone 15 Pro)
- Android emulator (Pixel_4_API_30)
- Gray-box testing with async monitoring for flakiness reduction
- Jest test runner with detox globals

**Visual Regression (Storybook + Chromatic):**
- Chromatic for cross-browser screenshot comparison
- Auto-accept on main branch, review required on PRs

## Alternatives Considered

- **Jest**: Slower than Vitest, more configuration, especially for ESM and TypeScript
- **Cypress**: Chromium-only (no Firefox, no WebKit), no mobile viewports, slower execution
- **Appium**: Slow, flaky, less integrated with React Native than Detox

## Consequences

- Positive: Vitest shares Vite config and transformation pipeline with the build system
- Positive: Playwright provides fastest cross-browser E2E execution
- Positive: Detox async monitoring eliminates a major source of mobile test flakiness
- Positive: MSW enables testing error states and edge cases without a running backend
- Trade-off: Three test frameworks means learning three APIs
- Trade-off: Detox requires native build tooling (Xcode, Android SDK) in CI
- Trade-off: Mobile E2E tests are significantly slower than web E2E tests

## References

- Vitest Documentation (Context7 verified — `/vitest-dev/vitest`, Score: 88.36)
- Playwright Documentation (Context7 verified — `/microsoft/playwright`, Score: 81.24)
- Detox Documentation (Context7 verified — `/wix/detox`, Score: 86.06)
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-031 — i18next (Internationalization)

## Status

Accepted

## Context

AtlasAI supports 6 locales (en-US, ru-RU, de-DE, fr-FR, ja-JP, zh-CN) based on `SUPPORTED_LOCALES`
from `@atlas/user` package. The platform needs scalable internationalization that works across
all platforms.

## Decision

i18next with react-i18next for React integration:

- ICU message format for pluralization and interpolation
- Namespace-based translation files per domain
- Namespaces: common, auth, chat, knowledge, prompts, settings, errors, extension
- Lazy loading per locale (only load active locale)
- Locale detection: browser preference → stored preference → en-US fallback
- TypeScript safety via i18next TypeScript integration (t function checks)
- Translation files in `@atlas/i18n/src/locales/{locale}/{namespace}.json`

## Alternatives Considered

- **react-intl**: Less flexible ICU support, heavier bundle, more verbose API
- **LinguiJS**: Smaller ecosystem, fewer community adapters, less mature

## Consequences

- Positive: ICUs message format supports complex pluralization and interpolation
- Positive: Namespace separation keeps translation files manageable
- Positive: Lazy loading reduces initial bundle size
- Positive: react-i18next useTranslation hook provides TypeScript-safe keys
- Positive: Mature ecosystem with extensive documentation
- Trade-off: Translation management requires tooling (sync-locales.sh for key extraction)
- Trade-off: i18next is larger than minimal alternatives (~8 KB gzip)

## References

- i18next Documentation
- react-i18next Documentation
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-032 — Turborepo + Changesets (Build & Release)

## Status

Accepted

## Context

AtlasAI monorepo (pnpm workspaces) needs efficient build orchestration and automated semantic
versioning for its packages and applications.

## Decision

Turborepo (already established) for build caching and parallel execution + Changesets for
versioning, CHANGELOG generation, and publishing:

- Turborepo remote cache for CI speed (shared across team and CI runners)
- Parallel execution of independent package builds
- Changesets generated per PR via `pnpm changeset`
- Versioning and publishing on merge to main
- Automated CHANGELOG generation
- Semantic versioning (major.minor.patch) for packages following conventional commits
- GitHub Actions release workflow

## Alternatives Considered

- **Nx**: Heavier than Turborepo, more configuration, steeper learning curve
- **Lerna**: Maintenance mode, slower, no built-in caching
- **semantic-release**: Less pnpm monorepo support, harder to customize per-package

## Consequences

- Positive: Turborepo remote cache reduces CI times by 70%+ (cached builds skipped)
- Positive: Changesets provide per-PR changelog entries with clear upgrade paths
- Positive: Semantic versioning is automated and consistent
- Positive: Parallel builds maximize CI resource utilization
- Positive: Both tools are mature and actively maintained
- Trade-off: Changesets require PR authors to add changeset files
- Trade-off: Turborepo remote cache requires Vercel account or self-hosted cache server

## References

- Turborepo Documentation (Context7 verified)
- Changesets Documentation
- TASK_1126.md — Frontend Platform Architecture

---

# ADR-033 — Sentry + PostHog (Observability)

## Status

Accepted

## Context

AtlasAI requires production observability across all platforms (Web, Mobile, Extension):
error tracking, performance monitoring, product analytics, feature flags, and session replay.

## Decision

**Sentry** for error monitoring + performance + crash reporting:
- `@sentry/nextjs` for Web (App Router, RSC, API routes)
- `@sentry/react-native` for Mobile (iOS + Android)
- `@sentry/browser` for Extension (background + popup + sidepanel)
- Source maps upload in CI for readable stack traces
- 0.25 tracesSampleRate, 0.1 replaysSessionSampleRate, 1.0 replaysOnErrorSampleRate

**PostHog** for product analytics + feature flags + session replay:
- `posthog-js` for Web, `posthog-react-native` for Mobile
- Feature flags with server-side evaluation (RSC) + client-side hydration
- Bootstrap flags to prevent flicker
- Session replay with PII masking (text, images, inputs masked by default)
- `@atlas/observability` package wraps both Sentry and PostHog initialization

**Logging:**
- `@atlas/logger` for structured logs (console in dev, Sentry `captureMessage` in prod)
- Sentry.addBreadcrumb for debug/info context on errors

## Alternatives Considered

- **Datadog RUM**: More expensive, no self-hosted option, less frontend-focused
- **Amplitude**: Analytics only — no feature flags, no session replay, higher cost at scale
- **LogRocket**: Session replay only — no error monitoring, no analytics
- **LaunchDarkly**: Feature flags only — separate vendor, higher cost, no analytics integration
- **Sentry-only**: Missing analytics and feature flags. PostHog fills both gaps affordably.

## Consequences

- Positive: Sentry provides unified error tracking across all platforms
- Positive: PostHog provides analytics + feature flags under one roof (self-hostable for GDPR)
- Positive: Feature flags enable gradual rollouts, kill switches, and A/B testing
- Positive: Session replay with PII masking enables debugging without privacy violations
- Positive: `@atlas/observability` provides single initialization point for all apps
- Trade-off: Two observability vendors instead of one (Sentry + PostHog)
- Trade-off: PostHog self-hosting requires infrastructure (can use PostHog Cloud first)
- Trade-off: Session replay increases bundle size (~30 KB gzip for PostHog replay)

## References

- Sentry Documentation (Context7 verified — `/getsentry/sentry-javascript`, Score: 76.7)
- Sentry Next.js SDK (Context7 verified — supports App Router RSC error capture)
- PostHog Documentation (Context7 verified — `/websites/posthog`, Score: 76.93)
- TASK_1126B.md — Frontend Architecture Hardening

---

# ADR-034 — P3 Freeze (Project Domain Deferral)

## Status

Accepted

## Context

The P3 Dashboard Backend stream requires real (non-mock) data for
`GET /projects/recent`, `GET /activity/recent`, and the `projectsCount` field of
`GET /dashboard/statistics`. The current Prisma schema contains **no `Project` and
no `ActivityLog` (or any event/audit) model**. Existing entities (`Prompt`,
`AiRequest`, `Membership`, `Invitation`, `KnowledgeDocument`) do not match the
required field shapes and must not be misused as substitutes.

This is an architectural constraint (missing subject area), not an implementation
defect.

## Decision

P3 is placed in status **FROZEN** (not cancelled). It will automatically return to
`ACTIVE` once the Project domain is implemented: `Project` + `ActivityLog` Prisma
models, migration, repository, service, controller (with `AuthGuard` +
`TenantScopeGuard`), Swagger descriptors, OpenAPI regeneration, `packages/api`
regeneration, and the three real endpoints live.

The following are explicitly prohibited as workarounds: mapping `Prompt` →
`Project`, mapping `AiRequest` → `Activity`, and any mock or hard-coded/fake data.

## Alternatives Considered

- **Map `Prompt` to `Project`**: Rejected — mislabels the domain and corrupts
  `projectsCount` semantics.
- **Map `AiRequest` to `Activity`**: Rejected — telemetry, not user-facing
  activity; cannot supply real `type`/`actor`/`description`.
- **Mock / fake data**: Rejected — violates production-readiness and AGENTS.md
  no-placeholder rules.
- **Implement the domain immediately**: Deferred — the new business domain is
  scoped as a separate stream (P4) and must land before P3 can thaw.

## Consequences

- Positive: Preserves architectural integrity and data-model honesty.
- Positive: No fake/placeholder code enters the codebase.
- Positive: Clear, automatic resumption path for P3 once P4 delivers the domain.
- Trade-off: P3 Dashboard completion is blocked until P4 Project domain ships.
- Trade-off: Temporary divergence between UI placeholders (empty states) and
  backend until thaw.

## References

- `ADR_P3_FREEZE.md` — full freeze decision and thaw conditions.
- `P3_4_ANALYSIS.md` — gap analysis and required change list.
- `PROJECT_ROADMAP.md` — phase sequence (P3 Frozen, P4 Active).
- `services/backend/prisma/schema.prisma` — current models (no `Project`/`ActivityLog`).

---

## ADR Template

Each new ADR should follow this structure:

```text
ADR-XXX — Title

Status

Context

Decision

Consequences

Alternatives Considered

References
```

---

# Related Documentation

| Document            | Purpose                              |
| ------------------- | ------------------------------------ |
| README.md           | Project overview                     |
| ROADMAP.md          | Development roadmap                  |
| CONTRIBUTING.md     | Contribution guidelines              |
| SECURITY.md         | Security policies                    |
| SUPPORTED_MODELS.md | AI provider support                  |
| CHANGELOG.md        | Project history                      |
| docs/               | Complete architecture specifications |

---

# Summary

The Architecture Decision Records document captures the fundamental technical decisions that define
Atlas AI.

These decisions establish a consistent architectural direction for the platform and provide
long-term guidance for implementation, maintenance, and future evolution.

All contributors are expected to review applicable ADRs before implementing significant
functionality or proposing architectural changes.
