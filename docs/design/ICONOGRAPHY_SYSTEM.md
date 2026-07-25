# Iconography System

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Icon Principles](#1-icon-principles)
2. [Icon Library Selection](#2-icon-library-selection)
3. [Icon Sizes](#3-icon-sizes)
4. [Icon Styles](#4-icon-styles)
5. [Icon States](#5-icon-states)
6. [Icon Naming & Organization](#6-icon-naming--organization)
7. [Icon Categories](#7-icon-categories)
8. [Custom Icons](#8-custom-icons)
9. [Accessibility](#9-accessibility)
10. [Implementation Guidelines](#10-implementation-guidelines)

---

## 1. Icon Principles

1. **Icons are semantic, not decorative.** Every icon communicates meaning. If an icon doesn't clarify, don't use it.
2. **One icon, one meaning.** Same icon = same action, everywhere. Never repurpose icons.
3. **Consistent stroke weight.** All icons use 1.5px stroke (outlined style). No mixing stroke weights.
4. **Icons support text, never replace it.** Critical actions always have labels. Icon-only is acceptable for familiar, frequently-used actions with tooltips.
5. **Filled state = active/selected.** Filled icons indicate active state, toggled state, or selected item.
6. **36px is the sweet spot.** The 24px size works for most UI. 20px for inline. 32px for navigation. 48px for empty states.

---

## 2. Icon Library Selection

### 2.1 Primary Library: Lucide

**Why Lucide over alternatives:**

| Library | Why Not Selected |
|---------|-----------------|
| **Material Symbols** | Variable fill/weight causes inconsistency. Google-centric aesthetic. |
| **FontAwesome** | Pro license required for latest icons. Inconsistent stroke weights. Brand heavy. |
| **Heroicons** | Excellent quality, but fewer icons. Slower release cycle. |
| **Feather** | Deprecated (merged into Lucide). |
| **Phosphor** | Excellent but less adoption. Smaller community. |
| **Tabler** | Good variety but less refined. Inconsistent quality. |

**Lucide advantages:**
- 1,450+ icons and growing
- Consistent 1.5px stroke (outlined)
- Clean, minimal geometric style matching Atlas AI aesthetic
- Active community (weekly releases)
- Tree-shakeable (import only what you use)
- SVG-based (no font dependency)
- Permissive license (ISC)
- Excellent React/React Native support

### 2.2 Fallback Strategy

If an icon is unavailable in Lucide, use in this order:

1. **Lucide** — Check all possible names and search Lucide gallery
2. **Custom SVG** — Create matching style (1.5px stroke, 24x24 viewBox, rounded caps/joins)
3. **Heroicons outline** — With size and stroke adjustment to match Lucide

### 2.3 Prohibited Libraries

- FontAwesome (license, weight inconsistency)
- Material Icons (inconsistent with Lucide aesthetic)
- Emoji as icons (accessibility, platform inconsistency)
- Bitmap/raster icons (no scaling, blurry on retina)

---

## 3. Icon Sizes

### 3.1 Size Tokens

| Token | Size | Usage | Touch Target |
|-------|------|-------|--------------|
| `icon-xs` | 16×16px | Inline with small text, badges, status indicators | N/A |
| `icon-sm` | 20×20px | Inline with body text, compact buttons | N/A |
| `icon-md` | 24×24px | **Default** — most buttons, nav items, table actions | 44×44px hit area |
| `icon-lg` | 32×32px | Section headers, sidebar icons, tab bar (mobile) | 48×48px hit area |
| `icon-xl` | 48×48px | Empty states, feature illustrations, avatar fallback | N/A |
| `icon-2xl` | 64×64px | Large empty states, onboarding illustrations | N/A |

### 3.2 Size by Context

| Context | Size | Notes |
|---------|------|-------|
| Primary button | 20px (icon-sm) | Match button text height |
| Secondary/ghost button | 20px (icon-sm) | Match button text height |
| Icon-only button | 24px (icon-md) | 44×44 hit area |
| Navigation sidebar | 20px (icon-sm) | With 12px text gap |
| Table action | 16px (icon-xs) | Inline with text |
| Dropdown item | 16px (icon-xs) | Left-aligned, 12px text gap |
| Alert/banner | 20px (icon-sm) | Match alert text size |
| Tab bar (mobile) | 24px (icon-md) | Above label text |
| Status indicator | 12–16px | Dot or inline icon |
| Modal close | 16px (icon-xs) | 44×44 hit area |
| Search field | 16px (icon-xs) | Left prefix |
| Password visibility | 20px (icon-sm) | Right suffix |
| Sort indicator | 12px | In table headers |
| Drag handle | 16px (icon-xs) | Table/list reorder |

### 3.3 Touch Target Wrapping

For small icons (16–24px) that are interactive, wrap in a touch target container:

```
┌──────────────────┐
│ ┌────┐           │
│ │icon│ 16px      │
│ └────┘           │
│ ← 44px hit area →│
└──────────────────┘
```

```
Touch target container:
- Width:  44px minimum
- Height: 44px minimum
- Border-radius: 8px
- Hover: background neutral-100
```

---

## 4. Icon Styles

### 4.1 Style Definitions

| Style | Stroke | Fill | Corner | Usage |
|-------|--------|------|--------|-------|
| **Outlined** (default) | 1.5px | None | Round (1px cap/join) | Default for all UI icons |
| **Filled** | None | Solid | Round | Active/selected states, toggle on |
| **Duotone** | 1.5px | 50% opacity secondary | Round | Data viz, charts (rare) |

### 4.2 Style Usage Rules

| Context | Style |
|---------|-------|
| Default state (all icons) | Outlined |
| Active nav item | Outlined (primary color) |
| Toggle ON | Filled (primary color) |
| Toggle OFF | Outlined (neutral) |
| Checkbox checked | Filled (primary color) |
| Radio selected | Filled (primary color) |
| Star/favorite active | Filled (accent color) |
| Tab selected | Outlined (primary color) |
| Alert/status | Outlined (semantic color) |
| Empty state primary | Outlined (neutral-300) |

### 4.3 SVG Attributes

```svg
<!-- Default icon specification -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- path data -->
</svg>
```

---

## 5. Icon States

### 5.1 Interactive Icon States

| State | Treatment |
|-------|-----------|
| Default | `color: text-secondary` (#6B7280 light / #9CA3AF dark) |
| Hover | `background: neutral-100` (on container), `color: text-primary` |
| Active/Pressed | `background: neutral-200`, `color: primary-500` |
| Focus | Focus ring on container (2px primary-500 offset 2px) |
| Disabled | `opacity: 0.4`, no hover |
| Selected | `color: primary-500` (outlined) or fill (primary) |
| Error | `color: error` |
| Success | `color: success` |

### 5.2 Non-Interactive Icon States

| State | Color |
|-------|-------|
| Default | `text-secondary` |
| Muted | `text-tertiary` |
| Brand | `primary-500` |
| Semantic (success) | `success` |
| Semantic (warning) | `warning` |
| Semantic (error) | `error` |
| Semantic (info) | `info` |

---

## 6. Icon Naming & Organization

### 6.1 Naming Convention

```
{category}-{name}-{variant?}

Examples:
action-search
action-plus
action-trash-2
navigation-chevron-down
communication-mail
device-smartphone
file-file-text
status-alert-circle
status-check-circle-2
```

### 6.2 Organization Structure

```
icons/
├── action/          — CRUD, operations, tools
│   ├── plus
│   ├── edit
│   ├── trash-2
│   ├── search
│   ├── settings
│   └── ...
├── navigation/      — Direction, movement, navigation
│   ├── chevron-down
│   ├── chevron-left
│   ├── menu
│   ├── x (close)
│   └── ...
├── communication/   — Messages, notifications, sharing
│   ├── mail
│   ├── message-circle
│   ├── bell
│   ├── share-2
│   └── ...
├── file/            — Files, documents, data
│   ├── file-text
│   ├── folder
│   ├── download
│   ├── upload
│   └── ...
├── status/          — Status, alerts, feedback
│   ├── check-circle-2
│   ├── alert-circle
│   ├── info
│   ├── alert-triangle
│   └── ...
├── device/          — Hardware, devices
│   ├── monitor
│   ├── smartphone
│   ├── tablet
│   └── ...
├── data/            — Charts, data, analytics
│   ├── bar-chart-3
│   ├── line-chart
│   ├── pie-chart
│   ├── trending-up
│   └── ...
├── ai/              — AI-specific icons
│   ├── brain
│   ├── sparkles
│   ├── robot
│   ├── wand-2
│   └── ...
├── business/        — Enterprise, teams, org
│   ├── users
│   ├── building-2
│   ├── shield
│   ├── key
│   └── ...
└── media/           — Media, images, audio
    ├── image
    ├── video
    ├── music
    └── ...
```

---

## 7. Icon Categories

### 7.1 Essential Icon Subset

These icons are used in every Atlas AI instance. Must be loaded at application bootstrap:

```
Navigation:       menu, x, chevron-down, chevron-left, chevron-right, chevron-up, home
Actions:          search, plus, edit-3, trash-2, settings, more-vertical, more-horizontal
Communication:    bell, mail, message-circle, share-2
Status:           check-circle-2, alert-circle, info, alert-triangle
File:             file-text, folder, download, upload, external-link
User:             user, users, log-out, log-in
Layout:           maximize-2, minimize-2, panel-left, columns
Data:             bar-chart-3, line-chart, pie-chart, trending-up, trending-down
Common:           clock, calendar, filter, copy, check, slash, refresh-cw
```

### 7.2 AI-Specific Icons

```
brain            — AI model, intelligence
sparkles          — AI generation, AI feature
robot             — AI agent, automation
wand-2            — AI transform, enhance
cpu               — Processing, compute
zap               — Speed, optimization
network           — Connections, integrations
git-branch        — Workflow, branching
layers            — Multi-model, stack
sliders           — Configuration, parameters
```

### 7.3 Enterprise-Specific Icons

```
building-2        — Organization, company
shield            — Security, compliance
key               — API keys, access
lock              — Privacy, permissions
globe             — Regions, multi-tenant
database          — Data sources, storage
cloud             — Cloud, deployment
hard-drive        — Storage, backups
activity          — Activity, audit log
clipboard-list    — Checklist, compliance
fingerprint       — Authentication, MFA
credit-card       — Billing, subscription
receipt           — Invoice, billing history
gift              — Trial, upgrade
target            — Goals, KPIs
```

### 7.4 Application-Specific Icons

```
Layout:
  panel-left        — Sidebar toggle
  columns           — Split view
  sidebar           — Detail panel
  maximize-2        — Full screen
  minimize-2        — Exit full screen

Data Sources:
  database          — Generic data source
  file-text         — Document source
  link-2            — Webhook / API
  cloud             — Cloud storage
  server            — On-premise

AI Features:
  brain             — AI models
  sparkles          — AI generation
  wand-2            — Enhancement
  bot               — Chatbot
  search            — Semantic search
  bar-chart-3       — Analytics
  file-search-2     — Document analysis
```

---

## 8. Custom Icons

### 8.1 When to Create Custom Icons

- Lucide does not have the required icon
- The icon needs to include brand elements
- The icon represents an Atlas AI-specific concept

### 8.2 Custom Icon Specification

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"        // Must be 24x24 viewBox
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"   // Rounded caps
  stroke-linejoin="round"  // Rounded joins
>
  <!-- Custom paths -->
</svg>
```

- All custom icons must match Lucide's visual language
- Use simple geometric shapes
- Maximum 3–4 discrete shapes per icon
- Maintain clear silhouette at 16px size
- Submit for review before adding to library

### 8.3 Brand Icon

The Atlas AI brand icon (compass/map pin) is available in:
- 24×24px — Standard UI use
- 32×32px — Navigation, app icon
- 48×48px — Empty states, loading splash
- 512×512px (PNG) — PWA icon, favicon

---

## 9. Accessibility

### 9.1 Icon Accessibility Requirements

| Context | Requirement |
|---------|-------------|
| Icon with text label | `aria-hidden="true"` on icon |
| Icon-only button | `aria-label="Action description"` on button |
| Decorative icon | `aria-hidden="true"` |
| Status icon | `role="img"` + `aria-label` describing the status |
| Link icon | `aria-label="Link destination"` |

### 9.2 Color-Only Icon Content

- Icons conveying status must include text or ARIA label
- Interactive icons must have visible focus indicator
- Icon color must never be the only indicator of state

---

## 10. Implementation Guidelines

### 10.1 React Implementation

```tsx
// Icon component pattern
interface IconProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: 'default' | 'primary' | 'error' | 'success' | 'warning' | 'info'
  className?: string
  ariaLabel?: string
  decorative?: boolean
  onClick?: () => void
}
```

### 10.2 Performance

- Icons are tree-shaken at build time
- Lazy-load non-essential icons
- Inline critical SVG icons in HTML for zero-latency rendering
- Use sprite sheet for frequently-used icon combinations
- Avoid icon fonts (SVG only)

### 10.3 React Native

- Use `react-native-svg` with same 24×24 viewBox
- Map size tokens to pixel values
- Use `strokeWidth={1.5}` for consistency
- Respect reduced motion for animated icons
