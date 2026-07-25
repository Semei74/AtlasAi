# 33 — Loading States

## Overview

**Purpose:** Standardized loading indicators and skeleton screens across the platform.

**Business Goal:** Provide smooth perceived performance. Reduce user uncertainty during data fetches.

**User Goal:** I want to know that content is loading and how long to wait.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Any data fetch, Page navigation, API call, File upload | Loading state |
| **To** | Content (success), Error state (failure) | Terminal state |

---

## User Story

> As a user, I want loading indicators so that I know the system is working and content will appear.

---

## Layout

### Full Page Loading

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal, skeleton)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌──────────────────────┐                       │
│              │                      │                       │
│              │    Spinner (32px)    │                       │
│              │    primary color     │                       │
│              │                      │                       │
│              └──────────────────────┘                       │
│                                                             │
│              "Loading..." (14px Regular, text-secondary)     │
│                                                             │
│              Centered vertically & horizontally             │
└─────────────────────────────────────────────────────────────┘
```

### Content Skeleton Loading

```
┌─────────────────────────────────────────────────────────────┐
│  [Skeleton Header]                                          │
│  ─────────────────────────────────────────                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ─────────────  ─────────────  ─────────────         │   │
│  │  ─────────────  ─────────────  ─────────────         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ╱╲    ╱╲    ╱╲                                      │   │
│  │ ╱  ╲  ╱  ╲  ╱  ╲  ╱╲                               │   │
│  │╱    ╲╱    ╲╱    ╲╱  ╲  ╱                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ────────────  ─────  ─────────────────             │   │
│  │  ────────────  ─────  ─────────────────             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading Patterns

| Duration | Pattern | Implementation |
|----------|---------|----------------|
| **< 300ms** | Instant transition | No indicator. Content appears immediately. |
| **300ms–1s** | Skeleton | Component-shaped placeholders with shimmer. |
| **1s–3s** | Skeleton + progress | Skeleton with progress bar for determinate operations. |
| **3s–10s** | Progress with message | Progress bar + "Still loading..." + estimated time. |
| **10s+** | Progress with cancel | Progress bar + "This is taking longer than expected." + Cancel option. |

---

## Skeleton Types

| Type | Spec | Usage |
|------|------|-------|
| **Text line** | H: 14px, W: 100%/75%/60%, radius: 4px | Paragraphs, descriptions |
| **Avatar** | Circle, 40×40px | User profile, avatar groups |
| **Card** | 280×180px rectangle, radius: 8px | Card grids, dashboards |
| **Table row** | H: 40px, W: 100% | Table lists |
| **Table header** | H: 32px, W: 100% | Column headers |
| **Chart** | 200×120px with wave pattern | Charts, graphs |
| **Image** | 16:9 ratio rectangle | Media placeholders |
| **Button** | H: 40px, W: 120px, radius: 8px | Action buttons |
| **Input** | H: 40px, W: 100%, radius: 8px | Form fields |
| **KPI** | 160×100px rectangle, radius: 8px | Stat cards |

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Spinner | Centered loading | 32px (full page), 20px (inline) |
| Skeleton | Content placeholder | per type |
| Progress Bar | Determinate progress | default |
| Progress | Indeterminate (top bar) | 4px, full width |

---

## States

| State | Behavior |
|-------|----------|
| **Loading (initial)** | Full page or section skeleton. |
| **Loading (refresh)** | Subtle indicator. Content remains visible. |
| **Loading (action)** | Button spinner. Form fields disabled. |
| **Loading (upload)** | Progress bar with percentage. |
| **Success** | Content replaces skeleton with transition. |
| **Error** | Skeleton replaced by error state. |
| **Offline** | Cached content shown immediately. No skeleton. |
| **Empty** | Skeleton replaced by empty state. |

---

## Responsive

| Platform | Behavior |
|----------|----------|
| **Desktop** | Skeletons match full layout dimensions. |
| **Tablet** | Layout-adjusted skeletons. |
| **Mobile** | Simplified skeletons. Single column. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-busy="true"` on loading container. `aria-label="Loading"` on spinner. `role="progressbar"` on progress bar. |
| **Focus order** | Maintained during loading. Focus not moved. |
| **Screen reader** | Announce "Loading content" at 500ms. Announce "Content loaded" when complete. |
| **Contrast** | Skeleton colors meet 3:1 minimum. |
| **Reduced motion** | Disable shimmer animation. Show static skeleton. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Shimmer | Left-to-right sweep | 1.5s loop |
| Spinner | 360° rotation | 0.8s loop |
| Skeleton → Content | Cross-fade | 200ms |
| Progress bar fill | Animated width | 300ms ease |

---

## Validation

N/A.

---

## Edge Cases

1. **Loading state flash** — If data loads in <300ms, show nothing. Use minimum display time.
2. **Slow network** — After 3s, show "Still loading..." message. After 10s, offer cancel.
3. **Partial loading** — Sections load independently. Loaded sections shown, loading sections skeleton.
4. **Multiple simultaneous loads** — Each section manages its own loading state.
5. **Cached data + refresh** — Show cached content immediately. Skeleton not shown. Subtle refresh indicator.
6. **Tab backgrounded** — Pause loading animations. Resume on focus.
7. **Loading cancellation** — If user navigates away, cancel pending requests.
8. **Infinite scroll loading** — Show inline spinner at bottom of list.
9. **Pull-to-refresh loading** — Show spinner at top. Existing content remains visible.
10. **Initial load vs subsequent loads** — Full skeleton on first load. Subtle indicator on subsequent.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `loading_started` | `{screen, load_type}` |
| `loading_completed` | `{screen, duration_ms}` |
| `loading_slow` | Duration > 3s |
| `loading_cancelled` | User cancelled |
| `skeleton_shown` | Skeleton type displayed |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Average load time | Per screen |
| 95th percentile load time | Slowest 5% |
| Slow load rate | Percentage > 3s |
| Skeleton impression | Per skeleton type |
| Cancel rate | Long loads cancelled |
