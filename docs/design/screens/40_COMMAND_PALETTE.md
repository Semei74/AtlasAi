# 40 — Command Palette

## Overview

**Purpose:** Universal command palette for keyboard-driven navigation and actions.

**Business Goal:** Enable power users to navigate and act quickly without mouse.

**User Goal:** I want to quickly find and execute any command or navigate anywhere using the keyboard.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Cmd+K (Mac) / Ctrl+K (Windows), Anywhere in app | Command palette overlay |
| **To** | Navigation target, Action execution, Search results | Selected command |

---

## User Story

> As a power user, I want to execute commands and navigate using the keyboard so that I work faster.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⌘K  Search commands and pages...           [Filter▾]│   │
│  │  ────────────────────────────────────────────────    │    │
│  │                                                     │    │
│  │  ┌─ Navigate to ───────────────────────────────┐   │    │
│  │  │  📊  Dashboard                     ⌘1      │   │    │
│  │  │  📦  Materials                     ⌘2      │   │    │
│  │  │  📋  Tasks                         ⌘3      │   │    │
│  │  │  🤖  AI Assistant                  ⌘4      │   │    │
│  │  │  📈  Analytics                     ⌘5      │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  ┌─ Actions ───────────────────────────────────┐   │    │
│  │  │  ➕  Create Material              ⌘⇧M      │   │    │
│  │  │  📷  Open QR Scanner              ⌘⇧S      │   │    │
│  │  │  📤  Issue Material               ⌘⇧I      │   │    │
│  │  │  📥  Return Material              ⌘⇧R      │   │    │
│  │  │  🔍  Search                       ⌘K       │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  ┌─ Quick Actions ─────────────────────────────┐   │    │
│  │  │  🔄  Sync Now                               │   │    │
│  │  │  🌙  Toggle Dark Mode                       │   │    │
│  │  │  🚪  Sign Out                               │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  Tip: Type "?" to see all keyboard shortcuts        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Input:     Search bar (auto-focused)
Results:   Categorized results (Navigate, Actions, Quick)
Shortcuts: Keyboard shortcut hints per item
Footer:    Tip text
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Input | Command search | lg, auto-focused |
| Card | Result group | default |
| Card | Result item | interactive, with icon |
| KBD | Shortcut hint | — |
| Badge | Result category | per type |
| Empty State | No results | "No matching commands" |
| Text | Search tip | caption (12px) |

---

## Information Hierarchy

```
Primary:   Search input, Result items
Secondary: Categories, Keyboard shortcuts
Tertiary:  Tip text, Filter
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Empty query. Recent/navigable items displayed. |
| **Typing** | Real-time filtering (no debounce). Results update instantly. |
| **Loading** | Not applicable (local search). |
| **Selected** | Highlighted item with keyboard focus. |
| **Executed** | Palette closes. Action/navigation executes. |
| **Error** | Not applicable (local operation). |
| **Offline** | Works fully offline. Local commands only. |
| **Empty** | "No matching commands for '{query}'." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered overlay, max 640px width. |
| **Tablet** | Centered overlay, max 480px. |
| **Mobile** | Full-screen overlay. Bottom sheet alternative. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="dialog"`. `aria-label="Command palette"`. `aria-activedescendant` on selected. |
| **Focus order** | Trap focus within palette. Input → Results → Close. |
| **Screen reader** | Announce search results count. Announce selected command. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Arrow keys navigate. Enter executes. Esc closes. Tab moves between sections. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Open | Overlay fade + scale down | 200ms |
| Results update | Cross-fade items | 100ms |
| Selection | Background highlight | 50ms |
| Execute | Palette collapses | 150ms |
| Close | Fade out | 100ms |

---

## Validation

N/A.

---

## Commands List

### Navigation Commands

| Command | Shortcut | Action |
|---------|----------|--------|
| Dashboard | ⌘1 | Navigate to Dashboard |
| Materials | ⌘2 | Navigate to Materials List |
| Tasks | ⌘3 | Navigate to Tasks |
| AI Assistant | ⌘4 | Open AI Assistant |
| Analytics | ⌘5 | Open Analytics |
| Notifications | ⌘⇧N | Open Notifications |
| Settings | ⌘, | Open Settings |
| Profile | ⌘⇧P | Open Profile |
| Help | ⌘? | Open Help |

### Action Commands

| Command | Shortcut | Action |
|---------|----------|--------|
| Create Material | ⌘⇧M | Open Create Material |
| Issue Material | ⌘⇧I | Open Issue Material |
| Return Material | ⌘⇧R | Open Return Material |
| Open QR Scanner | ⌘⇧S | Open QR Scanner |
| New Task | ⌘⇧T | Create new task |
| Generate Report | ⌘⇧G | Open Reports |
| New Reservation | ⌘⇧E | Create reservation |
| Search Materials | ⌘⇧F | Focus material search |

### Quick Commands

| Command | Shortcut | Action |
|---------|----------|--------|
| Toggle Dark Mode | ⌘⇧D | Switch theme |
| Sync Now | ⌘⇧Y | Trigger sync |
| Sign Out | ⌘⇧Q | Logout |
| Reload | ⌘R | Reload app |
| New Chat | ⌘⇧A | Start AI chat |

---

## Edge Cases

1. **Hundreds of commands** — Categorized. Fuzzy search. Max 5 results per category.
2. **No matching command** — "No matching commands. Try a different search." Show available actions.
3. **Command requires permission** — Show "No permission" but still list command. Disabled with tooltip.
4. **Command with confirmation** — Execute immediately for simple actions. Show dialog for destructive.
5. **Rapid typing** — Local filter is instant. No debounce needed.
6. **Empty state** — Show popular commands and recently used when query is empty.
7. **Command search in progress** — Not applicable (local).
8. **Keyboard shortcut conflicts** — System shortcuts take precedence. Show conflict warning.
9. **Custom shortcuts** — If implemented, respect user-defined shortcuts.
10. **Mobile open** — Swipe down gesture or long-press on home screen.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `palette_opened` | Trigger (keyboard/touch) |
| `palette_closed` | Esc / execute |
| `command_searched` | `{query}` |
| `command_executed` | `{command, category}` |
| `command_hovered` | Arrow key navigation |
| `shortcut_used` | `{shortcut}` — Direct shortcut usage |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Command palette usage | Opens per session |
| Most used command | Command rank |
| Search-to-find rate | Queries leading to execution |
| Keyboard vs mouse | Open method distribution |
| Time to command | Open → execute |

---

## Future Improvements

1. Custom commands — User-defined command aliases
2. Recent commands — Most frequently used at top
3. Command history — Recently executed commands
4. Plugin commands — Third-party command extensions
5. AI-powered commands — Natural language command input
6. Command snippets — Save command sequences as macros
7. Context-aware commands — Show relevant commands based on current screen
