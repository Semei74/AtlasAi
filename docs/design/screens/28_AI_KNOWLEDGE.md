# 28 — AI Knowledge

## Overview

**Purpose:** Browse and search the AI knowledge base — documentation, guides, and reference materials.

**Business Goal:** Provide self-service access to product knowledge. Reduce support requests.

**User Goal:** I want to find documentation, guides, and answers about how to use Atlas AI.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | AI Assistant "Knowledge", Sidebar "Knowledge", Help "Documentation", Search results | Knowledge list |
| **To** | Article detail, Related articles, AI Chat (ask about article) | Knowledge actions |

---

## User Story

> As a user, I want to browse the knowledge base so that I can learn how to use Atlas AI features.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Knowledge Base (24px SemiBold)                    │
│ Side   │  Search ────────────────────────────────           │
│ Bar    │  ┌─ Categories ───────────────────────────────┐    │
│        │  │  [All] [Getting Started] [Guides] [FAQs]   │    │
│        │  │  [Troubleshooting] [Release Notes]         │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  ┌─ Featured Articles ─────────────────────────┐   │
│        │  │  📘 Getting Started with Atlas AI          │   │
│        │  │  📗 How to Issue Materials                  │   │
│        │  │  📕 Understanding Inventory Levels          │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ All Articles ──────────────────────────────┐   │
│        │  │  ● How to create a material — 5 min read    │   │
│        │  │  ● Setting up your workspace — 3 min read   │   │
│        │  │  ● Using the QR scanner — 2 min read       │   │
│        │  │  ● Understanding roles — 4 min read        │   │
│        │  │  ● Generating reports — 6 min read         │   │
│        │  │  [View all →]                              │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title
Search:    Full-text knowledge search
Categories: Topic filter tabs
Featured:  Highlighted articles
All:       Article list with read time
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Search Bar | Knowledge search | md |
| Tabs | Category filter | pill |
| Card | Featured article | default, icon left |
| List | Article item | description list |
| Badge | Read time | neutral, sm |
| Tag | Category | sm |
| Link | View all | default |
| Empty State | No results | "No articles found" |

---

## Information Hierarchy

```
Primary:   Article titles, Featured articles
Secondary: Categories, Search
Tertiary:  Read time, View all
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Article list with featured. |
| **Loading** | Skeleton cards. |
| **Success** | Data rendered. |
| **Error** | Error banner "Knowledge base unavailable." Retry. |
| **Offline** | "Showing cached articles." Some features limited. |
| **Empty** | "No articles yet." (Admin: "Create your first article.") |
| **No permissions** | Restricted articles hidden. |
| **No data (filtered)** | "No articles in this category." |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Articles viewable. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column: featured + list. |
| **Tablet** | Single column. |
| **Mobile** | Single column. Search prominent. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on articles. `role="list"`. |
| **Focus order** | Search → Categories → Featured → List |
| **Screen reader** | Announce article title, category, read time. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through articles. Enter opens. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| List enter | Staggered fade | 300ms |
| Filter change | Cross-fade | 200ms |
| Article open | Slide to detail | 250ms |
| Search results | Update list | 200ms |

---

## Validation

N/A — Browse and search only.

---

## Edge Cases

1. **Article not found** — "Article not found. It may have been removed."
2. **Very long articles** — Table of contents with jump links. Reading progress indicator.
3. **Article feedback** — "Was this helpful? 👍 👎" at bottom.
4. **Related articles** — Show "Related articles" at bottom of each article.
5. **Article versioning** — "Last updated 2 weeks ago." Show what changed.
6. **Search with no results** — "No results for '{query}'." Show popular articles instead.
7. **Multilingual content** — If article has translations, show language selector.
8. **Media in articles** — Images, videos, embedded content. Lazy load.
9. **Article sharing** — Share article link with team.
10. **Knowledge gaps** — "Can't find what you're looking for? Ask AI Assistant." CTA to AI Chat.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `article_viewed` | `{article_id}` |
| `search_performed` | Search query |
| `category_filtered` | `{category}` |
| `article_helpful` | Feedback thumbs up |
| `article_not_helpful` | Feedback thumbs down |
| `article_shared` | Share action |
| `ai_chat_from_knowledge` | "Ask AI" link click |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Most viewed article | Article rank |
| Search-to-find rate | Queries leading to article view |
| Helpful rate | Thumbs up / total feedback |
| Average read time | Time on article page |
| Category distribution | Most accessed categories |

---

## Future Improvements

1. AI-powered article search — Semantic search for better results
2. Article authoring — In-app article editor for admins
3. Video tutorials — Embedded video guides
4. Interactive walkthroughs — Guided product tours from knowledge articles
5. Community Q&A — User questions and answers
6. Article suggestion — "Based on what you're doing, you might find this helpful"
7. Knowledge analytics — Most searched topics, content gaps
