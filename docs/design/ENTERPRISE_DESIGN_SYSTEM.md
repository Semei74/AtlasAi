# Atlas AI Enterprise Design System

> **Version:** 1.0.0  
> **Status:** Production Ready  
> **Classification:** Enterprise Design System Specification  
> **Audience:** Designers, Developers, AI Agents (Stitch), Figma, React Native, Web  
> **Last Updated:** 2026-07-23

---

## Table of Contents

1. [Product Identity](#1-product-identity)
2. [Visual Language](#2-visual-language)
3. [Color Philosophy](#3-color-philosophy)
4. [Typography](#4-typography)
5. [Spacing & Layout Grid](#5-spacing--layout-grid)
6. [Elevation, Corners, Borders & Shadows](#6-elevation-corners-borders--shadows)
7. [Interaction & Feedback States](#7-interaction--feedback-states)
8. [Loading States & Skeletons](#8-loading-states--skeletons)
9. [Accessibility Rules](#9-accessibility-rules)
10. [Theme System (Light & Dark)](#10-theme-system-light--dark)
11. [Responsive & Platform Rules](#11-responsive--platform-rules)
12. [Density Rules](#12-density-rules)
13. [Enterprise UI Principles](#13-enterprise-ui-principles)
14. [Anti-Patterns](#14-anti-patterns)
15. [Design Commandments](#15-design-commandments)

---

## 1. Product Identity

### 1.1 Brand Essence

Atlas AI is an enterprise artificial intelligence orchestration platform. The brand communicates:

- **Intelligence** — The platform is aware, adaptive, and precise
- **Trust** — Enterprise-grade security, reliability, and privacy
- **Clarity** — Complex AI made simple, accessible, and transparent
- **Scale** — From a single user to global enterprise

### 1.2 Visual Metaphor

The visual language is inspired by:

- **Navigation systems** — Maps, compasses, coordinates, waypoints (the "Atlas" identity)
- **Data centers** — Clean, precise, structured, illuminated
- **Scientific instrumentation** — Calibrated, accurate, purposeful
- **Modern enterprise software** — Linear, Notion, Stripe — minimal but rich

### 1.3 Logo Usage

- **Primary logo**: Full lockup with icon + "Atlas AI" wordmark
- **Icon only**: Favicon, app icon, mobile home screen, system tray
- **Wordmark only**: Contexts where space is constrained
- **Clear space**: Minimum 16px (desktop) / 8px (mobile) around all edges
- **Minimum size**: 24px icon / 80px wordmark

---

## 2. Visual Language

### 2.1 Design Aesthetic

Atlas AI follows a **Calibrated Minimalism** aesthetic:

- Purposeful whitespace — never decorative, always functional
- Precise alignment — every element is intentionally placed on the 8px grid
- Subtle depth — shadows are soft, transitions are smooth
- Color restraint — semantic color is used sparingly and meaningfully
- Typographic hierarchy — information is organized by weight and scale, not color
- Consistent rhythm — spacing creates predictable, scannable layouts

### 2.2 Visual DNA

| Attribute | Description |
|-----------|-------------|
| Geometry | Rounded rectangles (8px default). Minimal use of circles. |
| Lines | 1px default. 2px for emphasis. Never 3px+. |
| Icons | Outlined, 1.5px stroke. Filled only for active states. |
| Imagery | Photography with data-visualization overlays. Abstract gradients for empty states. |
| Data Density | Clean, spacious default. Condensed density for power users. |
| Animation | Fast (200ms), subtle, purposeful. No bounce or spring on web. |

### 2.3 Graphic Elements

- **Data glyphs**: Small geometric shapes used to represent data points, status, and metrics
- **Connection lines**: Dotted or solid lines representing relationships, workflows, and sequences
- **Grid overlays**: Subtle background patterns for data-heavy screens
- **Brand gradient**: Primary → Secondary gradient used sparingly for hero sections and illustrations

---

## 3. Color Philosophy

Color in Atlas AI follows a **functional-first** approach:

- **Primary** = Action. Used for interactive elements, primary buttons, links, active states.
- **Secondary** = Complement. Used for secondary actions, brand accents, illustrations.
- **Semantic** = Information. Green for success, red for errors, amber for warnings, blue for info.
- **Neutral** = Structure. Backgrounds, surfaces, borders, text.
- **Accent** = Emphasis. Used sparingly for highlights, badges, and data visualization.

See [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) for complete color specification.

---

## 4. Typography

See [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md) for complete typography specification.

### Quick Reference

| Role | Family | Fallback |
|------|--------|----------|
| Display/Headline | Inter | system-ui, -apple-system, sans-serif |
| Body/UI | Inter | system-ui, -apple-system, sans-serif |
| Mono/Code | JetBrains Mono | SF Mono, Fira Code, monospace |

---

## 5. Spacing & Layout Grid

See [SPACING_SYSTEM.md](./SPACING_SYSTEM.md) for complete spacing specification.

### Quick Reference

The Atlas AI spacing system is based on an **8px base unit** with the following tokens:

| Token | px | rem | Usage |
|-------|----|-----|-------|
| `space-1` | 4 | 0.25 | Micro spacing, icon gaps |
| `space-2` | 8 | 0.5 | Compact spacing, inline elements |
| `space-3` | 12 | 0.75 | Related elements, list items |
| `space-4` | 16 | 1 | Standard spacing, card padding |
| `space-5` | 20 | 1.25 | Section spacing, button padding |
| `space-6` | 24 | 1.5 | Large spacing, modal padding |
| `space-8` | 32 | 2 | Section separation |
| `space-10` | 40 | 2.5 | Page section spacing |
| `space-12` | 48 | 3 | Major page sections |
| `space-16` | 64 | 4 | Page-level spacing |
| `space-20` | 80 | 5 | Max content width padding |
| `space-24` | 96 | 6 | Massive sections |

---

## 6. Elevation, Corners, Borders & Shadows

### 6.1 Elevation System

Elevation is expressed through shadows and z-index. Five levels create consistent depth hierarchy.

| Level | z-index | Shadow | Usage |
|-------|---------|--------|-------|
| **0 — Flat** | auto | None | Base surfaces, cards on same plane |
| **1 — Raised** | 10 | Small, close shadow (y: 1, blur: 2, opacity: 0.06) | Hover state, dropdown, popover |
| **2 — Overlay** | 100 | Medium shadow (y: 4, blur: 12, opacity: 0.08) | Modal, dialog, bottom sheet |
| **3 — Floating** | 200 | Large shadow (y: 8, blur: 24, opacity: 0.12) | Toast, snackbar, tooltip |
| **4 — Cosmic** | 300 | Extra large shadow (y: 16, blur: 48, opacity: 0.16) | Command palette, full-screen modal |

### 6.2 Corner Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0px | Avatars (full), progress bars |
| `radius-xs` | 2px | Checkboxes, small indicators |
| `radius-sm` | 4px | Inputs, buttons (small), badges |
| `radius-md` | 8px | Cards, modals, buttons (default) |
| `radius-lg` | 12px | Dialogs, sheets, large components |
| `radius-xl` | 16px | Full-screen modals, panels |
| `radius-full` | 9999px | Pills, tags, circular avatars |

### 6.3 Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border-none` | 0px | No border |
| `border-thin` | 1px solid | Default borders, inputs, dividers |
| `border-thick` | 2px solid | Active states, focus rings |

**Border colors** are defined in the color system (typically `neutral-200` light / `neutral-700` dark).

### 6.4 Dark Mode Shadows

In dark mode, shadows are replaced with **luminance** — a subtle light overlay that defines elevation:

- Level 1: `inset 0 1px 0 rgba(255,255,255,0.06)`
- Level 2: `inset 0 1px 0 rgba(255,255,255,0.08)` + `0 4px 12px rgba(0,0,0,0.4)`
- Level 3: `0 8px 24px rgba(0,0,0,0.5)` + `0 1px 0 rgba(255,255,255,0.06)`
- Level 4: `0 16px 48px rgba(0,0,0,0.6)`

---

## 7. Interaction & Feedback States

### 7.1 Interactive State Matrix

Every interactive component has these states:

| State | Trigger | Visual Treatment |
|-------|---------|------------------|
| **Default** | No interaction | Base styling |
| **Hover** | Mouse over (desktop) | Background shift (–5% brightness), cursor pointer |
| **Active/Pressed** | Mouse down / touch | Background shift (–10% brightness), scale(0.97) |
| **Focus** | Keyboard focus (Tab) | 2px ring with 4px offset in focus color |
| **Disabled** | Non-interactive state | Opacity 0.4, no cursor pointer |
| **Loading** | Processing action | Replace icon with spinner, preserve width |
| **Error** | Validation failure | Red border, red background tint, error icon |
| **Success** | Validation pass | Green border, green background tint |
| **Read-only** | View mode | No hover/focus, normal opacity |

### 7.2 Focus Ring Specification

```
Outline: 2px solid {color-primary-500}
Offset:  2px
Border-radius: match component + 2px
```

- Color: Primary-500 in light mode, Primary-400 in dark mode
- Visible on keyboard focus only (not mouse click)
- `:focus-visible` pseudo-class for implementation

### 7.3 Feedback Components

| Component | Purpose | Duration | Dismissal |
|-----------|---------|----------|-----------|
| **Toast** | Transient success/error/info notification | 4s auto-dismiss | Manual or auto |
| **Snackbar** | Action confirmation with undo | 6s auto-dismiss | Action or auto |
| **Alert** | Persistent page-level message | Until dismissed | Manual close |
| **Banner** | System-wide announcement | Until dismissed | Manual close |
| **Modal** | Critical confirmation or form | Until action | Action required |
| **Tooltip** | Contextual help on hover/focus | 300ms delay show | On cursor leave |
| **Popover** | Rich contextual content | Until click outside | Click outside |

---

## 8. Loading States & Skeletons

### 8.1 Skeleton Specification

| Property | Value |
|----------|-------|
| Background | `neutral-100` light / `neutral-800` dark |
| Highlight | `neutral-200` light / `neutral-700` dark |
| Animation | Shimmer sweep, left to right, 1.5s loop |
| Border radius | Match the component being replaced |
| Duration | Fade out on content load (200ms) |

### 8.2 Loading Pattern Selection

| Duration | Pattern | Implementation |
|----------|---------|----------------|
| < 500ms | Instant transition | No loading indicator needed |
| 500ms - 2s | Skeleton | Match layout dimensions |
| 2s - 5s | Skeleton + progress bar | Show progress for indeterminate operations |
| 5s+ | Progress with ETA | Uploads, batch processing, AI generation |

### 8.3 Skeleton Templates

```
Card Skeleton:
┌─────────────────────┐
│ ┌─────┐             │
│ │rect │ ─────        │  (avatar rect + title line)
│ │32px │ ───────      │  (description line)
│ └─────┘  ──────      │  (third line)
└─────────────────────┘

Table Row Skeleton:
┌───────────────────────────────────────────┐
│ ──────────────    ─────    ─────────────── │
│ ──────────────    ─────    ─────────────── │
│ ──────────────    ─────    ─────────────── │

Chart Skeleton:
┌───────────────────────────────────────────┐
│  ╱╲    ╱╲                                 │
│ ╱  ╲  ╱  ╲  ╱╲                           │
│╱    ╲╱    ╲╱  ╲  ╱╲                      │
│                ╲╱  ╲╱   ╲╱╲              │
└───────────────────────────────────────────┘
```

---

## 9. Accessibility Rules

### 9.1 Color & Contrast

| Requirement | Ratio | Applied To |
|-------------|-------|------------|
| Normal text | ≥ 4.5:1 | Body text, labels, captions |
| Large text (≥18px bold / ≥24px regular) | ≥ 3:1 | Headings, display text |
| UI components | ≥ 3:1 | Button borders, input borders, icons |
| Focus indicator | ≥ 3:1 vs surrounding | Focus ring on all interactive |
| Disabled text | ≥ 3:1 | Disabled inputs, labels |

### 9.2 Touch Targets

| Platform | Minimum Target | Preferred Target |
|----------|---------------|------------------|
| Desktop (mouse) | 24x24px | 32x32px |
| Mobile (touch) | 44x44pt | 48x48pt |
| Tablet (touch) | 44x44pt | 48x48pt |

### 9.3 Interactive Element Requirements

- All interactive elements must be keyboard accessible
- All images must have `alt` text
- All form fields must have associated labels
- All icon-only buttons must have `aria-label`
- All status changes must be announced via `aria-live`
- Focus order must match visual order
- Skip-to-content link on every page

---

## 10. Theme System (Light & Dark)

### 10.1 Light Theme

The light theme is the default. It uses a **warm neutral** palette with:

- **Background**: White (`#FFFFFF`) to subtle warm gray (`#F8F9FA`)
- **Surface**: White (`#FFFFFF`) with subtle shadow separation
- **Text**: Near-black (`#111827`) for primary, medium gray (`#6B7280`) for secondary
- **Borders**: Light gray (`#E5E7EB`)
- **Primary**: Deep indigo-blue (`#4F46E5`) — conveys trust and intelligence
- **Accent**: Teal (`#0D9488`) — for highlighting and data visualization

### 10.2 Dark Theme

The dark theme uses a **cool charcoal** palette with:

- **Background**: Near-black (`#0F1117`) to dark gray (`#1A1D27`)
- **Surface**: Dark gray (`#1E2030`) with subtle luminance edges
- **Text**: Near-white (`#F3F4F6`) for primary, medium gray (`#9CA3AF`) for secondary
- **Borders**: Dark gray (`#2D3045`)
- **Primary**: Lighter indigo (`#818CF8`) — maintains contrast ratio
- **Accent**: Lighter teal (`#2DD4BF`)

### 10.3 Theme Switching

- Manual toggle in user preferences
- Respects `prefers-color-scheme` media query on first visit
- Persists choice in user preferences
- Transitions smoothly (200ms ease-out on background/text colors)

### 10.4 High Contrast Mode

- Activates when OS high contrast mode is enabled
- Stronger borders (2px minimum)
- Higher contrast text (7:1 minimum for all text)
- Removal of all background textures and gradients
- Underlined links (not just color-based)
- Increased opacity for disabled states (0.65 minimum)

---

## 11. Responsive & Platform Rules

### 11.1 Breakpoints

| Name | Min Width | Target | Layout Behavior |
|------|-----------|--------|-----------------|
| `xs` | 0px | Mobile phones | Single column, bottom nav |
| `sm` | 640px | Large phones/tablets | Single column, wider margins |
| `md` | 768px | Tablets portrait | Two column, collapsible sidebar |
| `lg` | 1024px | Tablets landscape/desktop | Two/three column, sidebar |
| `xl` | 1280px | Desktop | Three column, expanded |
| `2xl` | 1536px | Large desktop | Multi-column, max-width constrained |

### 11.2 Desktop Rules

- Sidebar: 240px expanded, 52px collapsed (icon-only)
- Top bar: 56px fixed height
- Content max-width: 1440px (centered)
- Split panels: resizable with 8px divider hit area
- Max content column width for reading: 720px

### 11.3 Tablet Rules

- Sidebar: Collapsed by default (52px icon-only), expandable
- Top bar: 48px fixed height
- Content: Full width, no max-width constraint
- Back navigation: More prominent, always visible

### 11.4 Mobile Rules

- Bottom tab bar: 56px fixed, 5 items max
- Top bar: 44px height
- Content: Full width, 16px horizontal padding
- Sidebar: Hidden, accessible via hamburger menu or sheet
- FAB: 56px diameter, bottom-right corner (above tab bar)
- Bottom sheet: Primary display pattern for selections and actions

---

## 12. Density Rules

### 12.1 Density Levels

| Density | Spacing Scale | Row Height | Padding | When to Use |
|---------|---------------|------------|---------|-------------|
| **Comfortable** (default) | Standard (space-4 to space-6) | 56px | 16px | Default, most screens |
| **Compact** | Reduced (space-2 to space-4) | 40px | 8-12px | Data tables, admin panels |
| **Touch** | Generous (space-4 to space-8) | 48px min | 16-20px | Mobile always |

### 12.2 Density Switching

- Compact mode is a user preference (Settings → Preferences → Density)
- Default is Comfortable for desktop, Touch for mobile
- Admin panels default to Compact
- Density preferences persist across sessions

---

## 13. Enterprise UI Principles

### 13.1 Reliability

Every interaction must produce predictable results. No surprises. No ambiguous states. Loading, empty, error, and success states are defined for every component.

### 13.2 Efficiency

Power users can accomplish complex tasks with minimal friction. Keyboard shortcuts, bulk actions, templates, and automation reduce repetitive work. The command palette (Cmd+K) provides universal access.

### 13.3 Transparency

AI operations show their work. Token counts, model selection, confidence scores, and source citations are visible by default. Cost indicators appear before expensive operations.

### 13.4 Consistency

Same component, same behavior, everywhere. The search input works identically in every context. The delete confirmation follows the same pattern. Navigation stays consistent across all surfaces.

### 13.5 Forgiveness

Destructive actions require confirmation. Deletes are soft (with recovery window). Every change is reversible (undo, version history, audit trail). The platform assumes user mistakes and protects against them.

### 13.6 Discoverability

Features are findable. The command palette exposes every action. Contextual tooltips explain unfamiliar elements. Empty states guide users to first actions. Onboarding introduces features progressively.

### 13.7 Scalability

UI handles 1 item or 10,000 items with equal grace. Pagination, virtual scrolling, and progressive loading ensure performance at any scale. Filters and search make large datasets navigable.

---

## 14. Anti-Patterns

### 14.1 Forbidden Patterns

These patterns are **never** used in Atlas AI:

| Anti-Pattern | Why | Instead Use |
|--------------|-----|-------------|
| **Carousel** | Hides content, low engagement, accessibility issues | Grid layout, list with filters, tabbed sections |
| **Hamburger menu for primary nav** | Hides navigation, increases cognitive load | Sidebar (desktop), bottom tab bar (mobile) |
| **Infinite scroll without search** | Loses user position, hard to find items | Pagination + search + filter |
| **Auto-play video/audio** | Distracting, data-heavy, accessibility violation | Play button with preview thumbnail |
| **Right-click only actions** | Excludes keyboard/mobile users | Visible action buttons + context menu |
| **Drag-and-drop only** | Not accessible, not keyboard operable | Drag-and-drop as enhancement, buttons as fallback |
| **Toast for critical errors** | Auto-dismisses, easy to miss | Persistent banner or inline error |
| **Unsolicited popups/modals** | Blocks workflow, interrupts focus | Inline suggestion, notification badge |
| **Color-only indicators** | Excludes color-blind users | Color + icon + text label |
| **Disabling without explanation** | Frustrating, unclear why | Disabled state with tooltip explanation |

### 14.2 Discouraged Patterns

These patterns are **discouraged** but may be used in specific contexts with justification:

| Pattern | Acceptable Context |
|---------|-------------------|
| Accordion | Settings panels, FAQ sections. Never for primary content. |
| Horizontal scroll | Data tables with many columns, code editors |
| Tabs | Settings sections, data categories. Never for navigation between pages. |
| Modal for forms | Simple forms (3-5 fields). Complex forms should use dedicated page or wizard. |
| Skeleton loading | Content areas on first load. Never repeat skeleton for cached data. |

---

## 15. Design Commandments

1. **One primary action per screen.** Every screen has exactly one primary CTA. Secondary actions exist but never compete.

2. **Three clicks to any content.** Any piece of content is reachable within three interactions from the dashboard.

3. **No dead ends.** Every screen provides a clear next action. Empty states guide. Error states recover. End states navigate.

4. **Errors are conversations.** Every error message explains: what happened, why, and how to fix it. No error codes. No "Something went wrong."

5. **Never lose data.** Autosave every 30 seconds. Recover drafts on crash. Version history for all content. Undo for destructive actions.

6. **Consistent navigation.** Navigation structure is identical across all surfaces. Users always know where they are and how to get where they need.

7. **Design for the worst connection.** Every feature works on slow networks. Offline mode preserves reading. Queue syncs transparently.

8. **Status is visible.** Every operation shows its state. Loading, progress, success, failure — the user is never left guessing.

9. **AI is contextual.** AI assistance appears where it's needed, never as a separate tool or disruptive popup.

10. **Accessibility is not optional.** Every component meets WCAG 2.2 AA. Every interaction works with keyboard. Every visual element has a text alternative.

---

## References

| Document | Description |
|----------|-------------|
| [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) | Complete color specification |
| [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md) | Complete typography specification |
| [SPACING_SYSTEM.md](./SPACING_SYSTEM.md) | 8-point grid system |
| [ICONOGRAPHY_SYSTEM.md](./ICONOGRAPHY_SYSTEM.md) | Icon library and rules |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Full component specifications |
| [FORM_STANDARDS.md](./FORM_STANDARDS.md) | Unified form standards |
| [DATA_VISUALIZATION.md](./DATA_VISUALIZATION.md) | Chart and data standards |
| [SCREEN_LAYOUTS.md](./SCREEN_LAYOUTS.md) | Screen template library |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | Complete accessibility guidelines |
| [MOTION_SYSTEM.md](./MOTION_SYSTEM.md) | Animation and transition standards |
| [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) | Architectural decisions |
