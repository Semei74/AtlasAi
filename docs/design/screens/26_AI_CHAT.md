# 26 — AI Chat

## Overview

**Purpose:** Conversational interface with Atlas AI for questions, tasks, and automation.

**Business Goal:** Provide natural language interface to all platform features. Increase productivity.

**User Goal:** I want to ask Atlas AI questions, get help, and perform actions through conversation.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | AI Assistant "Chat" card, Sidebar "AI Chat", Top bar AI icon, Suggested prompt click | Chat view |
| **To** | Material Card (via AI action), Report (via AI generation), Dashboard | AI action results |

---

## User Story

> As a user, I want to chat with Atlas AI so that I can ask questions, get insights, and perform actions naturally.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar: AI Chat            Model: GPT-4▾  [Clear] [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Messages (scrollable) ─────────────────────────────┐    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  👋 Hello! I'm Atlas AI. How can I help you   │   │    │
│  │  │  today?                                        │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                       │    │
│  │           ┌──────────────────────────────────────┐   │    │
│  │           │  Show me low stock items              │   │    │
│  │           └──────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Here are your low stock items:              │   │    │
│  │  │                                              │   │    │
│  │  │  1. 🔩 **Nut M12** — 2 remaining (min: 20)   │   │    │
│  │  │  2. 🔩 **Bolt M8** — 0 remaining (min: 50)   │   │    │
│  │  │  3. 🔧 **Washer M10** — 5 remaining (min: 30)│   │    │
│  │  │                                              │   │    │
│  │  │  Would you like to create a purchase order?   │   │    │
│  │  │  [Yes, create PO] [Show all materials]        │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │           ┌──────────────────────────────────────┐   │    │
│  │           │  Yes, create a purchase order         │   │    │
│  │           └──────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  ✅ Purchase order created!                   │   │    │
│  │  │  PO-2024-0031 for Nut M12, Bolt M8, Washer   │   │    │
│  │  │  [View PO]                                    │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Input Area ─────────────────────────────────────────┐   │
│  │  [📎]  Ask Atlas AI anything...          [🎤] [Send]  │   │
│  │  Tokens: 128 / 4096                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Model selector + Clear/Close
Messages:  Chat bubbles (AI left, user right), scrollable
Input:     Prompt input with attach, voice, send
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Select | Model selector | sm |
| Button | Clear conversation | ghost, sm |
| Card | AI message | neutral-100 bg, left |
| Card | User message | primary-500 bg, white text, right |
| Button | Action buttons (inline in AI response) | primary/ghost, xs |
| Input | Prompt input | lg, with auto-grow |
| Button | Attach file | ghost, icon-only |
| Button | Voice input | ghost, icon-only |
| Button | Send | primary, icon-only |
| Token Counter | Token usage | — |
| Progress | Streaming indicator | — |
| Citation Block | Source citations | expandable |

---

## Information Hierarchy

```
Primary:   Message content, AI responses, Action buttons
Secondary: Input area, Model selector
Tertiary:  Token count, Clear button
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Welcome message visible. Input enabled. |
| **Typing** | User typing in input. Send enabled when non-empty. |
| **Loading (AI)** | Typing indicator "● ● ●" with "Thinking..." |
| **Streaming** | Real-time token-by-token response display. |
| **Success** | Complete response shown. Action buttons available. |
| **Error** | Error message "I encountered an error. Please try again." Retry button. |
| **Offline** | "AI chat requires internet." Input disabled. Show cached responses. |
| **Empty** | New conversation: Welcome message only. |
| **No permissions** | Chat disabled. "AI access not enabled." |
| **No data** | Not applicable. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Input disabled. View conversation history. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full screen. Messages max 720px centered. |
| **Tablet** | Full width. Messages max 640px. |
| **Mobile** | Full width. Input at bottom with keyboard avoidance. Messages full width. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on new messages. `role="log"` on message list. `aria-label` on input. |
| **Focus order** | Header → Messages → Input |
| **Screen reader** | Announce new messages. Announce streaming content. Announce action buttons. |
| **Contrast** | User messages: white text on primary-500 (8.6:1). AI messages: text-primary on neutral-100 (14:1). |
| **Keyboard** | Enter sends. Shift+Enter new line. Arrow keys navigate message history. |
| **Touch targets** | Action buttons ≥ 44pt. Send button ≥ 48pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| New message | Slide in (user from right, AI from left) | 200ms |
| AI thinking | Dot bounce animation | 1s loop |
| Streaming | Character appear | 15ms per token |
| Action buttons | Fade in after response | 200ms |
| Scroll | Auto-scroll to bottom | smooth |

---

## Validation

| Field | Rule |
|-------|------|
| Prompt | Required, min 1 char, max 2000 |
| Rate limit | Max 30 messages per minute |

---

## Edge Cases

1. **Very long conversation** — Auto-summarize after 50 messages. "Conversation is getting long. Start a new one?"
2. **AI action execution** — After AI performs action (e.g., issue material), show confirmation with undo.
3. **Model switching mid-conversation** — Warning "Switching models will clear the current conversation."
4. **Streaming interruption** — If connection drops during streaming, show partial response with "Continue?" option.
5. **Citation display** — AI responses with sources show expandable citation block.
6. **Code/table responses** — Rendered in formatted blocks with copy button.
7. **Sensitive data in prompts** — AI should not expose sensitive inventory data across users.
8. **Multi-turn context** — AI remembers conversation context. User can say "Show me more" or "Tell me about the second one."
9. **File attachment** — User can attach images/files. AI analyzes content.
10. **Conversation export** — Export chat as text or markdown.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `message_sent` | `{length, has_attachment}` |
| `message_received` | Response complete |
| `action_clicked` | `{action}` — Inline action button |
| `model_changed` | `{model}` |
| `conversation_cleared` | Clear action |
| `attachment_uploaded` | File attach |
| `voice_input_started` | Voice button |
| `citation_expanded` | Citation block expand |
| `conversation_exported` | Export action |
| `ai_error` | Error event |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Messages per session | Count |
| Average response time | Submit to complete response |
| Action conversion rate | AI suggestions → user clicks |
| Model usage distribution | Per model percentage |
| Conversation length | Messages before clear/new |
| Voice input rate | Voice vs typing percentage |

---

## Future Improvements

1. Multi-modal AI — Image generation, document analysis
2. AI personas — Specialized AI for different tasks (Inventory Expert, Report Analyst)
3. Team chat — Multiple users in same AI conversation
4. AI workflow builder — Create multi-step AI automation through chat
5. Voice conversation — Full spoken dialogue (mobile)
6. Persistent AI memory — AI remembers preferences and context across sessions
7. AI plugin system — Third-party AI capabilities
