# Atlas AI

# UI/UX Design Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Product Design Team

Related Documents

- 00_MASTER_SPEC.md
- 01_PRODUCT_REQUIREMENTS.md
- 02_SYSTEM_ARCHITECTURE.md
- 03_TECH_STACK.md
- 04_DATABASE.md
- 05_BACKEND.md
- 06_FRONTEND.md
- 07_MCP.md
- 08_AI_ORCHESTRATOR.md
- 09_MEMORY.md
- 10_API.md
- 11_AUTH.md
- 12_STORAGE.md
- 13_SECURITY.md
- 14_LOGGING.md
- 15_DEVOPS.md
- 16_TESTING.md
- 17_DEPLOYMENT.md
- 18_MONITORING.md

---

# Purpose

This document defines the complete UI/UX standards for Atlas AI.

Every screen, component and interaction must follow a unified design system to ensure consistency, accessibility and scalability.

---

# Objectives

The interface must be

- Simple
- Fast
- Responsive
- Accessible
- Consistent
- Modern
- Mobile First
- AI Focused

---

# Design Principles

- Minimalism
- Predictable Navigation
- Clear Visual Hierarchy
- Fast User Flow
- Low Cognitive Load
- Consistent Components
- Immediate Feedback
- Accessibility by Default

---

# Supported Platforms

- iOS
- Android
- Tablet
- Web (Future)

---

# Navigation Structure

Splash

↓

Authentication

↓

Workspace Selection

↓

Home Dashboard

↓

AI Chat

↓

Projects

↓

Tasks

↓

Documents

↓

Profile

↓

Settings

---

# Main Screens

- Splash
- Login
- Registration
- Email Verification
- Forgot Password
- Home Dashboard
- AI Chat
- Chat History
- Projects
- Tasks
- Documents
- Search
- Notifications
- Billing
- Subscription
- Settings
- Profile
- Admin Panel

---

# Design System

Every component must support

- Light Theme
- Dark Theme
- Responsive Layout
- Localization
- Accessibility
- Dynamic Fonts

---

# Color Palette

Primary

Blue

Secondary

Purple

Success

Green

Warning

Orange

Error

Red

Neutral

Gray Scale

---

# Typography

Primary Font

Inter

Fallback

System Font

Font Scale

Responsive

---

# Spacing System

Base Unit

8px

Spacing

4

8

12

16

24

32

48

64

---

# Border Radius

Small

8px

Medium

12px

Large

20px

Cards

16px

Buttons

12px

---

# Shadows

Small

Medium

Large

Only subtle elevation.

---

# Icons

Material Symbols

Outlined Style

Consistent sizing

24px default

---

# Buttons

Variants

Primary

Secondary

Outlined

Text

Danger

Loading State required.

Disabled State required.

---

# Inputs

Support

Validation

Error State

Success State

Helper Text

Prefix

Suffix

Autocomplete

---

# Cards

Support

Title

Subtitle

Actions

Icons

Status

Loading Skeleton

---

# Lists

Support

Pagination

Infinite Scroll

Pull to Refresh

Search

Filtering

Sorting

---

# Animations

Required

Screen Transition

Loading

Micro Interactions

Progress Indicators

Skeleton Loading

Animation duration

150–300ms

---

# AI Chat UX

Features

Streaming Responses

Typing Indicator

Markdown Rendering

Code Blocks

Syntax Highlighting

Copy Button

Regenerate Button

Stop Generation

Feedback Buttons

Conversation History

Pinned Chats

Search

---

# Accessibility

WCAG 2.2 AA

Support

Screen Readers

Keyboard Navigation

High Contrast

Dynamic Text

Reduced Motion

Touch Targets ≥44px

---

# Localization

Architecture supports

Multiple Languages

RTL Layout

Pluralization

Date Formats

Number Formats

Time Zones

---

# Offline Experience

Support

Cached Conversations

Cached Projects

Offline Notifications

Automatic Sync

Conflict Resolution

---

# Performance Targets

Cold Start

<2 seconds

Screen Transition

<200ms

Scroll

60 FPS

Search

<300ms

---

# Error Handling

Display

Clear Error Messages

Retry Button

Offline Banner

Empty States

Loading States

Recovery Suggestions

---

# Notifications

Support

Push Notifications

In-App Notifications

Email Preferences

Notification Center

---

# User Feedback

Collect

Ratings

Bug Reports

Feature Requests

AI Response Feedback

Crash Reports

---

# Responsive Design

Support

Phones

Foldables

Tablets

Desktop (Future)

---

# Security

Hide sensitive information

Prevent screenshots (optional)

Auto-lock sensitive screens

Secure clipboard handling

---

# Design Tokens

Centralized tokens for

Colors

Typography

Spacing

Radius

Elevation

Animation

Icons

---

# Forbidden

No inconsistent components

No inaccessible UI

No blocking loading screens

No fixed layouts

No unresponsive elements

No hardcoded colors

---

# Acceptance Criteria

UI implementation accepted only if

- Design system applied
- Accessibility requirements met
- Responsive layouts implemented
- Dark mode supported
- Performance targets achieved
- User testing completed

---

# Definition of Done

UI/UX complete only if

- Designed
- Implemented
- Tested
- Accessible
- Responsive
- Documented
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement the complete design system
- build reusable UI components
- support light and dark themes
- implement responsive layouts
- support localization
- implement accessibility requirements
- optimize animations and rendering performance
- provide loading, error and empty states
- create reusable design tokens
- reject any implementation violating this specification

This specification is mandatory for every Atlas AI user interface.
