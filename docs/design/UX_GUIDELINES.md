# Atlas AI UX Guidelines

> **Status:** Foundation (Phase 1)  
> **Version:** 1.0.0  
> **Purpose:** Define UX writing, interaction, and behavior standards

---

## 1. UX Writing Principles

### 1.1 Voice and Tone

**Voice**: Authoritative but approachable. Expert but not arrogant. Like a senior colleague who explains complex things simply.

**Tone**: Adapts to context:
- **Normal operation**: Neutral, helpful, confident
- **User error**: Empathetic, instructive, no blame
- **System error**: Apologetic, transparent, solution-oriented
- **Success**: Warm, encouraging, concise
- **Empty states**: Encouraging, action-oriented
- **Loading**: Reassuring, brief

### 1.2 Writing Conventions

| Rule | Example |
|------|---------|
| Use active voice | "Upload a document" not "Document should be uploaded" |
| Be concise | "Save" not "Save changes to the current document" |
| Use sentence case | "Project settings" not "Project Settings" |
| Be specific | "File exceeds 50MB limit" not "File too large" |
| Use positive framing | "Complete this field" not "Don't leave this empty" |
| Avoid jargon | "Sign in" not "Authenticate" |
| Use consistent terminology | Always "workspace" never "team space" or "project group" |
| Write for translation | Avoid idioms, humor, cultural references |

### 1.3 Common Phrases

| Context | Phrase |
|---------|--------|
| Creating | "Create [item]" |
| Deleting | "Delete [item]? This action cannot be undone." |
| Saving | "Saved" / "Saving..." |
| Loading | "Loading..." (use skeleton instead when possible) |
| Empty | "No [items] yet. [Action] to get started." |
| Error | "[What happened]. [Why]. [How to fix]." |
| Success | "[Item] [action]d successfully." |
| Confirmation | "Are you sure you want to [action]?" |

---

## 2. Error Message Templates

### 2.1 Validation Errors

**Format**: Inline below the field, red text

| Scenario | Message |
|----------|---------|
| Required field | "This field is required" |
| Email format | "Enter a valid email address" |
| Password too short | "Password must be at least 8 characters" |
| Password no match | "Passwords don't match" |
| Invalid URL | "Enter a valid URL starting with https://" |
| File too large | "File exceeds the maximum size of [limit]" |
| Unsupported file type | "Unsupported file type. Supported: [types]" |

### 2.2 System Errors

**Format**: Toast or banner

| Scenario | Message |
|----------|---------|
| Network error | "Unable to connect. Check your internet connection and try again." |
| Timeout | "The request is taking longer than expected. Try again." |
| Server error | "Something went wrong on our end. We've been notified. Try again." |
| Session expired | "Your session has expired. Please sign in again." |
| Permission denied | "You don't have access to this resource. Contact your admin." |
| Rate limited | "Too many requests. Please wait a moment and try again." |
| Not found | "This [item] doesn't exist or has been removed." |

---

## 3. Confirmation Dialogs

### 3.1 Dialog Structure

```
[Title]: "Delete [item name]?"
[Body]: "[Consequence description]"
[Primary Button]: "[Action]" — red/destructive
[Secondary Button]: "Cancel" — neutral
```

### 3.2 Confirmation Templates

| Action | Title | Body | Primary Button |
|--------|-------|------|----------------|
| Delete item | "Delete [name]?" | "This will permanently delete [name]. This action cannot be undone." | Delete |
| Archive item | "Archive [name]?" | "This will move [name] to the archive. You can restore it later." | Archive |
| Leave organization | "Leave [org name]?" | "You will lose access to all workspaces and projects in this organization." | Leave |
| Remove member | "Remove [name]?" | "They will lose access to all workspaces in this organization." | Remove |
| Cancel subscription | "Cancel subscription?" | "Your subscription will end at the current billing period. Data will be retained for 30 days." | Cancel |

---

## 4. Empty State Templates

### 4.1 Structure

```
[Illustration] — contextual, branded
[Title]: "No [items] yet"
[Description]: "[What to do next]"
[CTA Button]: "[Primary action]"
[Secondary Link]: "Learn more" (optional)
```

### 4.2 Templates

| Section | Title | Description | CTA |
|---------|-------|-------------|-----|
| Projects | "No projects yet" | "Create your first project to organize your work." | Create project |
| Documents | "No documents yet" | "Upload documents to build your knowledge base." | Upload document |
| Prompts | "No prompts yet" | "Create prompts to standardize your AI interactions." | Create prompt |
| Workspaces | "No workspaces yet" | "Workspaces help your team organize work." | Create workspace |
| Members | "No members yet" | "Invite your team to collaborate." | Invite members |
| Chat history | "No conversations yet" | "Start a conversation with AI." | Start chat |
| Search | "No results for [query]" | "Try different keywords or browse [section]." | Clear search |

---

## 5. Microcopy Standards

### 5.1 Button Labels

| Action | Label |
|--------|-------|
| Create new item | "New [item]" or "Create [item]" |
| Save | "Save" |
| Cancel | "Cancel" |
| Delete | "Delete" |
| Confirm | "Confirm" |
| Close | "Close" |
| Back | "Back" |
| Next | "Next" |
| Finish | "Finish" |
| Retry | "Try again" |
| Learn more | "Learn more" |
| View all | "View all" |
| See details | "See details" |

### 5.2 Navigation Labels

| Item | Label |
|------|-------|
| Dashboard | "Dashboard" |
| AI Chat | "AI Chat" |
| Projects | "Projects" |
| Knowledge | "Knowledge" |
| Prompt Library | "Prompts" |
| Agents | "Agents" |
| Workflows | "Workflows" |
| Analytics | "Analytics" |
| Settings | "Settings" |
| Admin | "Administration" |
| Members | "Members" |

### 5.3 Date and Time

| Context | Format | Example |
|---------|--------|---------|
| Relative | "X [unit] ago" | "3 minutes ago" |
| Today | "Today at H:MM AM/PM" | "Today at 2:30 PM" |
| Yesterday | "Yesterday at H:MM AM/PM" | "Yesterday at 2:30 PM" |
| This week | "Day at H:MM AM/PM" | "Monday at 2:30 PM" |
| This year | "Mon D at H:MM AM/PM" | "Jan 15 at 2:30 PM" |
| Previous years | "Mon D, YYYY at H:MM AM/PM" | "Jan 15, 2024 at 2:30 PM" |

---

## 6. Accessibility Copy Guidelines

- Every image must have `alt` text describing its content and function
- Every icon button must have an `aria-label`
- Every form field must have an associated label
- Error messages must be associated with their fields via `aria-describedby`
- Status updates must be announced via `aria-live` regions
- Links must have descriptive text (never "Click here")
- Headings must follow a logical hierarchy (h1 → h2 → h3)
