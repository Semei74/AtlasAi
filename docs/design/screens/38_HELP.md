# 38 — Help

## Overview

**Purpose:** Central help center with documentation, guides, and support options.

**Business Goal:** Reduce support tickets. Enable self-service problem resolution.

**User Goal:** I want to find help when I'm stuck or have a question.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Help", Top bar "?" icon, Error state "Contact Support", Settings "Help" | Help center |
| **To** | Knowledge Base, AI Chat, Contact Support, Tutorials, Onboarding | Help actions |

---

## User Story

> As a user, I want to find help quickly so that I can resolve my issue and get back to work.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Help & Support (24px SemiBold)                    │
│ Side   │  Search ────────────────────────────────           │
│ Bar    │  ┌────────────────────────────────────────────┐    │
│        │  │  How can we help you?                       │    │
│        │  │  ┌──────────────────────────────────────┐  │    │
│        │  │  │  Search for help...              [🔍] │  │    │
│        │  │  └──────────────────────────────────────┘  │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  ┌─ Quick Links ───────────────────────────────┐   │
│        │  │  📘 Getting Started Guide                    │   │
│        │  │  📗 Frequently Asked Questions               │   │
│        │  │  📕 Video Tutorials                          │   │
│        │  │  📙 Keyboard Shortcuts                       │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Contact Us ────────────────────────────────┐   │
│        │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│        │  │  │ 💬 Chat  │ │ 📧 Email │ │ 📞 Phone  │    │   │
│        │  │  │  with AI  │ │  Support │ │  Support │    │   │
│        │  │  └──────────┘ └──────────┘ └──────────┘    │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Popular Topics ─────────────────────────────┐   │
│        │  │  ● How to issue materials                    │   │
│        │  │  ● Setting up your workspace                 │   │
│        │  │  ● Understanding inventory levels            │   │
│        │  │  ● Using the QR scanner                      │   │
│        │  │  ● Generating reports                        │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title
Search:    Prominent search bar
Quick Links: Common help resources
Contact:   Support channels (AI Chat, Email, Phone)
Topics:    Popular help topics
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Search Bar | Help search | lg |
| Card | Quick link | default, with icon |
| Card | Contact option | default, interactive |
| List | Topic items | description list |
| Link | All topics | default |
| Button | Contact channel | outline, md |

---

## Information Hierarchy

```
Primary:   Search, Quick Links
Secondary: Contact options, Popular topics
Tertiary:  Support hours, Response time
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Search + quick links + topics. |
| **Searching** | Search results replace quick links. |
| **Loading** | Skeleton links. |
| **Error** | "Help content unavailable." Offline fallback. |
| **Offline** | "Showing cached help content." |
| **Empty** | "No results for '{query}'." Show popular topics. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column: quick links + topics. |
| **Tablet** | Single column. Contact cards in row. |
| **Mobile** | Single column. Stacked layout. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="search"` on search. `aria-label="Help center"`. |
| **Focus order** | Search → Quick links → Contact → Topics |
| **Screen reader** | Announce search results count. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through options. Enter to select. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Search results | Cross-fade | 200ms |
| Card hover | Scale 1.02 | 150ms |
| Contact card | Fade in | 300ms |

---

## Validation

N/A.

---

## Edge Cases

1. **Empty search results** — "No results found." Show popular topics and contact options.
2. **Offline help** — Cached help articles. "Some content may be outdated."
3. **AI Chat integration** — "Ask Atlas AI" opens AI Chat with context.
4. **Email support** — Pre-fill subject line with "Help Request" + device info.
5. **Phone support hours** — Show "Available Mon-Fri 9AM-5PM EST."
6. **Emergency contact** — "For urgent issues, call +1 (555) 000-0000."
7. **Language support** — Help available in multiple languages.
8. **Feedback after help** — "Was this helpful?" survey after accessing help.
9. **Help for specific screen** — "Help for this screen" link in contextual help.
10. **Support ticket status** — Link to view existing support tickets.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `help_search` | Search query |
| `quick_link_clicked` | `{link}` |
| `contact_chat_clicked` | AI Chat |
| `contact_email_clicked` | Email support |
| `contact_phone_clicked` | Phone support |
| `topic_clicked` | `{topic}` |
| `help_helpful` | Feedback positive |
| `help_not_helpful` | Feedback negative |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Most searched topic | Search query rank |
| Quick link click rate | Per link |
| Contact method preference | Chat vs Email vs Phone % |
| Self-service rate | Resolved without contact |
| Help session duration | Time in help center |

---

## Future Improvements

1. AI-powered help — Context-aware suggestions based on user activity
2. Video walkthroughs — In-app video tutorials
3. Community forum — User-to-user help
4. Interactive troubleshooting — Step-by-step guided resolution
5. Help widget — Floating help button on every screen
6. Ticket tracking — View and manage support tickets
7. In-app messaging — Real-time chat with support team
