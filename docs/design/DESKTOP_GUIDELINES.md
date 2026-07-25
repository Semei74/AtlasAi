# Atlas AI Desktop Guidelines

> **Status:** Foundation (Phase 1)  
> **Version:** 1.0.0  
> **Purpose:** Define desktop-specific design patterns and adaptations

---

## 1. Platform

- **Primary Target**: Web (Next.js) with responsive design
- **Native Target**: Electron or Tauri (planned)
- **Target OS**: macOS 14+, Windows 11+, Linux (Ubuntu 22.04+)

---

## 2. Window Management

### 2.1 Layout

- Default window size: 1280x800px
- Minimum window size: 900x600px
- Maximum window size: unrestricted
- Sidebar: 240px expanded, 52px collapsed
- Collapsed sidebar shows icons only (tooltip on hover)
- Persistent layout preference (remembers sidebar state)

### 2.2 Multi-Window (Desktop App)

- Main application window
- Separate windows for: AI Chat, Document Viewer, Admin Panel
- Detachable tabs (future)
- Window position and size persistence

---

## 3. Keyboard Navigation

### 3.1 Global Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+K | Command palette |
| Cmd/Ctrl+N | New item |
| Cmd/Ctrl+B | Toggle sidebar |
| Cmd/Ctrl+1-5 | Quick nav to sidebar sections |
| Cmd/Ctrl+, | Settings |
| Escape | Close modal / cancel |
| Cmd/Ctrl+Shift+A | Admin panel |
| Cmd/Ctrl+Shift+L | Logout |

### 3.2 Section Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+P | New project |
| Cmd/Ctrl+U | Upload document |
| Cmd/Ctrl+I | New chat |
| Cmd/Ctrl+Shift+P | New prompt |
| Cmd/Ctrl+Shift+I | Invite member |

### 3.3 Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+[ | Back |
| Cmd/Ctrl+] | Forward |
| Cmd/Ctrl+Shift+N | Next workspace |
| Cmd/Ctrl+Shift+P | Previous workspace |

---

## 4. Mouse Interactions

### 4.1 Right-Click Context Menu

- Right-click on items for context menu
- Available on: projects, documents, prompts, messages, files, table rows
- Context menu actions relevant to the item type

### 4.2 Drag and Drop

- Drag files from OS into upload areas
- Drag items to rearrange lists
- Drag items between containers (documents to projects)
- Drop zone highlighting during drag

### 4.3 Hover States

- All interactive elements have hover state
- Hover reveals actions on list items
- Hover tooltip for truncated text
- Hover card preview for quick info

---

## 5. Multi-Tasking

### 5.1 Tab Management (Web)

- Multiple browser tabs for different sections
- Back/forward browser navigation
- History preserved per tab
- Bookmarkable URLs for all screens

### 5.2 Split View (Desktop App)

- Resizable split panels
- Common split layouts:
  - List + detail (left/right)
  - Editor + preview (left/right)
  - Chat + context (left/right)
  - Code + output (top/bottom)
- Panel divider: 8px wide, hover highlight, drag to resize

### 5.3 Notification Center

- Bell icon in top bar
- Dropdown notification list (recent 20)
- "See all" link to full notification history
- Toast notifications appear top-right
- Notification grouping by source

---

## 6. Advanced Input

### 6.1 Keyboard Shortcut Discovery

- Press and hold Cmd to show available shortcuts
- "?" key opens keyboard shortcuts reference
- Shortcut hints shown in tooltips

### 6.2 Command Palette

- Activated by Cmd/Ctrl+K
- Fuzzy search across all actions, pages, and settings
- Recent commands shown first
- Keyboard navigable (arrow keys, enter to select)
- Supports: navigation, actions, settings, recent items

### 6.3 Clipboard Operations

- Copy text from any read-only element
- Copy AI responses with formatting
- Paste images directly into chat
- Paste files into document upload area
- Cross-platform clipboard sync (desktop app)

---

## 7. Window States

| State | Behavior |
|-------|----------|
| Normal | Standard window |
| Maximized | Full screen (menu bar visible) |
| Full Screen | No chrome (Enter/Exit with F11 or Cmd+Ctrl+F) |
| Minimized | To dock/taskbar, continues running |
| Close | Prompt if unsaved work, otherwise close gracefully |

---

## 8. System Tray (Desktop App)

- Icon in system tray (menu bar on macOS, notification area on Windows)
- Quick actions: New Chat, Upload Document, Recent Items
- Status indicator: connected, disconnected, syncing
- Notifications badge
- Quit option
- Open window on click

---

## 9. Window Resize Behavior

| Width | Layout |
|-------|--------|
| ≥ 1440px | Full layout: sidebar + content + optional right panel |
| 1024-1439px | Standard layout: sidebar + content |
| 768-1023px | Collapsed sidebar + content |
| < 768px | Full-width content, floating action buttons |

---

## 10. Accessibility

- Screen reader support with keyboard navigation
- High contrast mode
- Reduced motion mode
- Font scaling (Cmd/Ctrl+Plus/Minus)
- Focus indicators visible
- Skip-to-content link
