# Atlas AI UI Component Specification

> **Status:** Placeholder — Phase 3  
> **Version:** 1.0.0  
> **Purpose:** Define the complete UI component library for the Atlas AI platform

---

## Overview

This document specifies the complete component library for the Atlas AI platform. Components are implemented using Tamagui and shared across web, mobile, and desktop surfaces.

---

## Component Architecture

### Layer Model

```
┌──────────────────────────────────────────────┐
│            Product Screens (62 screens)        │
├──────────────────────────────────────────────┤
│           Feature Components                  │
│  (DocumentUploader, ChatMessage, PromptEditor)│
├──────────────────────────────────────────────┤
│           Composite Components                │
│  (DataTable, CardGrid, Form, Wizard, Modal)   │
├──────────────────────────────────────────────┤
│           Core Primitives                     │
│  (Button, Input, Select, Checkbox, Toggle,   │
│   Card, Badge, Avatar, Tooltip, Toast, Modal)│
├──────────────────────────────────────────────┤
│           Design Tokens                       │
│  (Color, Typography, Spacing, Shadow, Motion)│
└──────────────────────────────────────────────┘
```

---

## Component Inventory

### Core Primitives (28 components)

| Component | Status | Description |
|-----------|--------|-------------|
| Button | Complete | Primary, secondary, ghost, danger, outline variants. Icon + label support. |
| IconButton | Complete | Icon-only button for toolbar and compact layouts. |
| Text | Complete | Typography primitive with variants. |
| Heading | Complete | h1-h6 with consistent styling. |
| Input | Complete | Text input with label, error, helper text. |
| TextArea | Complete | Multi-line text input. |
| Select | Complete | Dropdown select with search. |
| Checkbox | Complete | With label, indeterminate state. |
| Radio | Complete | Radio group. |
| Toggle | Complete | On/off toggle switch. |
| Slider | Planned | Range slider. |
| DatePicker | Planned | Date and date range selection. |
| Card | Complete | Content container with variants. |
| Badge | Complete | Status indicator, count badge. |
| Avatar | Complete | User avatar with fallback initials. |
| Tooltip | Complete | Hover/tap information. |
| Toast | Planned | Notification toast. |
| Modal | Planned | Dialog with backdrop. |
| Sheet | Planned | Bottom sheet for mobile. |
| Popover | Planned | Contextual popover. |
| DropdownMenu | Planned | Context menu, dropdown. |
| Tabs | Planned | Tab navigation. |
| Accordion | Planned | Collapsible sections. |
| ProgressBar | Planned | Linear progress. |
| Spinner | Complete | Loading spinner. |
| Skeleton | Planned | Skeleton loading placeholder. |
| Divider | Complete | Visual separator. |
| EmptyState | Planned | Empty state with illustration + CTA. |

### Composite Components (16 components)

| Component | Status | Description |
|-----------|--------|-------------|
| DataTable | Planned | Sortable, filterable, paginated table. |
| CardGrid | Planned | Responsive grid of cards. |
| Form | Planned | Form with validation, submission. |
| Wizard | Planned | Multi-step form with progress. |
| SearchBar | Planned | Search input with autocomplete. |
| Pagination | Planned | Page navigation. |
| Breadcrumb | Planned | Navigation breadcrumbs. |
| CommandPalette | Planned | Cmd+K universal search. |
| NotificationBell | Planned | Bell icon with badge + dropdown. |
| ActivityFeed | Planned | Chronological activity list. |
| FileUploader | Planned | Drag-and-drop upload area. |
| FilePreview | Planned | Inline file preview. |
| TagInput | Planned | Tag/chip input. |
| ColorPicker | Planned | Color selection. |
| IconPicker | Planned | Icon selection grid. |
| ConfirmDialog | Planned | Confirmation dialog. |

### Feature Components (20+ components)

| Component | Module | Description |
|-----------|--------|-------------|
| ChatMessage | AI Chat | Message bubble with markdown rendering |
| ChatInput | AI Chat | Message input with attachments |
| ChatHistory | AI Chat | Conversation sidebar |
| StreamingMessage | AI Chat | Live streaming message |
| ModelSelector | AI Chat | Model picker dropdown |
| PromptEditor | Prompt Library | Template editor with syntax highlighting |
| VariableEditor | Prompt Library | Variable configuration form |
| VersionTimeline | Prompt Library | Version history timeline |
| VersionDiff | Prompt Library | Version comparison view |
| DocumentCard | Knowledge | Document card in grid |
| DocumentPreview | Knowledge | Inline document preview |
| ProcessingStatus | Knowledge | Processing progress indicator |
| DocumentUploader | Knowledge | Upload area with progress |
| AgentCard | AI Agents | Agent status card |
| AgentEditor | AI Agents | Agent configuration form |
| WorkflowCanvas | Workflows | Visual workflow editor |
| WorkflowNode | Workflows | Draggable workflow step |
| MetricsChart | Analytics | Data visualization chart |
| UserTable | Admin | User management table |
| AuditLogTable | Admin | Filterable audit log |

---

## Component Specification Template

Each component must be specified with:

```
# Component Name

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|

## Variants
- [List of visual variants]

## States
- Default, Hover, Active, Focus, Disabled, Loading, Error

## Accessibility
- ARIA roles and attributes
- Keyboard interactions
- Focus management

## Usage Guidelines
- When to use
- When not to use
- Content guidelines

## Examples
- [Code examples]
```

---

## Implementation Priority

### Sprint 3: Core Primitives
Button, Text, Heading, Input, TextArea, Select, Checkbox, Radio, Toggle, Card, Badge, Avatar, Spinner, Divider, Tooltip, IconButton

### Sprint 4: Composite Components
DataTable, CardGrid, Form, SearchBar, Pagination, Breadcrumb, Modal, Toast, Tabs, Accordion, Skeleton, EmptyState, ConfirmDialog, TagInput, DropdownMenu, Popover

### Sprint 5: Feature Components
ChatMessage, ChatInput, ChatHistory, ModelSelector, FileUploader, DocumentCard, PromptEditor, ActivityFeed, NotificationBell, CommandPalette, MetricsChart

### Sprint 6+: Advanced Components
StreamingMessage, VersionDiff, WorkflowCanvas, AgentEditor, VersionTimeline, ProcessingStatus, DocumentPreview, ColorPicker, IconPicker, Sheet, ProgressBar, Slider, DatePicker
