# 25 — AI Assistant

## Overview

**Purpose:** AI-powered assistant landing page showing capabilities, quick actions, and conversation history.

**Business Goal:** Increase AI feature adoption. Provide intuitive entry point to all AI capabilities.

**User Goal:** I want to use AI to help me with inventory tasks, answer questions, and automate work.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "AI Assistant", Top bar AI icon, Dashboard AI widget | AI landing |
| **To** | AI Chat (new conversation), AI Prompts, AI Knowledge, Specific AI feature | AI interactions |

---

## User Story

> As a user, I want to access AI capabilities from one place so that I can get help, automate tasks, and find information.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  AI Assistant (24px SemiBold)                      │
│ Side   │  ┌────────────────────────────────────────────┐    │
│ Bar    │  │  Welcome back! How can I help you today?   │    │
│        │  │  ┌──────────────────────────────────────┐  │    │
│        │  │  │  Ask Atlas AI anything...        [→] │  │    │
│        │  │  └──────────────────────────────────────┘  │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  ┌─ Suggested Prompts ─────────────────────────┐   │
│        │  │  [What materials are low on stock?]          │   │
│        │  │  [Show me movement trends this week]         │   │
│        │  │  [Generate a stock report for last month]    │   │
│        │  │  [Help me issue materials to a task]         │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ AI Capabilities ───────────────────────────┐   │
│        │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│        │  │  │ 💬 Chat  │ │ 📝 Gen.  │ │ 📊 Ana.  │    │   │
│        │  │  │  Q&A     │ │ Reports  │ │ Insights │    │   │
│        │  │  └──────────┘ └──────────┘ └──────────┘    │   │
│        │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│        │  │  │ 🔍 Know. │ │ ⚡ Auto  │ │ 🎓 Learn │    │   │
│        │  │  │  Search  │ │  Actions │ │  Guide   │    │   │
│        │  │  └──────────┘ └──────────┘ └──────────┘    │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Recent Conversations ───────────────────────┐   │
│        │  │  💬 "Show low stock items" — 2 hours ago     │   │
│        │  │  💬 "Generate weekly report" — Yesterday     │   │
│        │  │  [View all →]                               │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Input:     Quick prompt input (top, prominent)
Suggestions: Suggested prompts/chips
Capabilities: Feature cards (Chat, Reports, Analytics, Knowledge, Automation, Learn)
Recent:    Recent conversation history
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Input | AI prompt input | lg, with send |
| Tag | Suggested prompt | interactive chip |
| Card | Capability card | default, interactive, with icon |
| Card | Recent conversation | interactive |
| Button | View all | link, sm |
| Button | New chat | primary, sm |
| Badge | New feature indicator | info (dot) |
| Toast | Welcome message | info |

---

## Information Hierarchy

```
Primary:   Prompt input, Suggested prompts
Secondary: Capability cards, Recent conversations
Tertiary:  Feature descriptions, Welcome text
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Welcome message. Prompt input ready. Suggestions visible. |
| **Loading** | Skeleton capabilities. |
| **Success** | Data loaded. |
| **Warning** | AI credits/usage limit warning. |
| **Error** | Error banner "AI service unavailable." Retry. |
| **Offline** | "AI features require internet." Suggestions hidden. |
| **Empty** | First visit: "Welcome to AI Assistant! Let's get started." |
| **No permissions** | AI features hidden. "AI access not enabled." |
| **No data** | Recent conversations empty: "No conversations yet." |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Input disabled. View capabilities only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full layout. Capabilities in 3×2 grid. |
| **Tablet** | 2×3 capability grid. |
| **Mobile** | Single column. Capabilities list. Input at bottom. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="AI Assistant"`. `aria-live="polite"` on suggestions. |
| **Focus order** | Input → Suggestions → Capabilities → Recent |
| **Screen reader** | Announce AI response. Announce capability selection. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Enter submits prompt. Arrow keys navigate suggestions. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Welcome | Greeting fade in | 300ms |
| Suggestions | Chips stagger in | 400ms total |
| Capabilities | Cards scale in | 300ms |
| Input focus | Border highlight | 150ms |
| Chat transition | Slide to chat | 250ms |

---

## Validation

| Field | Rule |
|-------|------|
| Prompt | Required, min 2 characters, max 2000 |

---

## Edge Cases

1. **First visit** — Welcome onboarding. Suggested prompts tailored to role.
2. **AI service unavailable** — "AI is temporarily unavailable. Try again later." Graceful degradation.
3. **Usage limits** — Show "You've used X of Y AI requests today." Upgrade prompt if exceeded.
4. **Empty prompt submission** — Prevent submit. "Ask me something!" placeholder.
5. **Very long prompt** — Character count. Max 2000 chars enforced.
6. **Model selection** — Show current AI model. Click to change in chat.
7. **Prompt injection concerns** — System prompt security. User prompts are queries, not commands.
8. **Multi-language support** — AI responds in user's language based on prompt.
9. **Offline fallback** — Show cached AI responses for common queries.
10. **Rate limiting** — If multiple rapid prompts, show "Please wait before sending another message."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `prompt_submitted` | Input submit |
| `suggestion_clicked` | Suggested prompt |
| `capability_clicked` | `{capability: "chat"\|"reports"\|...}` |
| `recent_conversation_clicked` | Resume conversation |
| `new_chat_started` | New conversation |
| `ai_response_received` | Response delivered |
| `ai_error` | AI service error |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| AI usage rate | Per user per session |
| Most used capability | Feature rank |
| Prompt submission rate | Per session |
| Average response time | Submit to response |
| Suggestion click rate | Suggestions vs typing |
| Conversation length | Messages per session |

---

## Future Improvements

1. Voice input — Speak prompts on mobile
2. AI persona selection — Different AI models for different tasks
3. Multi-modal input — Upload images for AI analysis
4. AI memory — AI remembers context across sessions
5. Custom AI instructions — User-defined AI behavior
6. AI automation — Create automated AI workflows
7. Team AI — AI that understands team context and collaboration
