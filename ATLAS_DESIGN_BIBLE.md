# Atlas AI

Version: 1.0

Status: Master Design Specification

This document is the single source of truth for every visual, UX, interaction and interface decision
inside Atlas AI.

Every AI system, designer and developer MUST follow this document.

This document is intentionally implementation-independent.

React Native

Expo

Web

Desktop

Tablet

Future Platforms

must all follow this specification.

---

# 1. PRODUCT VISION

Atlas AI is not a chatbot.

Atlas AI is an Enterprise AI Workspace.

The product helps companies build, organize, automate and collaborate with AI.

Atlas AI is intended to become the operating system for AI work.

Users should immediately feel:

• confidence

• speed

• clarity

• intelligence

• simplicity

The interface must never feel overloaded.

Every screen should communicate:

"I know exactly what I am doing."

---

# 2. PRODUCT PRINCIPLES

Atlas AI follows ten immutable principles.

## Principle 01

Clarity before beauty.

Beauty is important.

Understanding is mandatory.

---

## Principle 02

AI must reduce complexity.

Never increase it.

---

## Principle 03

Every screen has exactly one primary purpose.

Never two.

---

## Principle 04

Whitespace is functionality.

Whitespace is not decoration.

---

## Principle 05

Every interaction must reduce cognitive load.

---

## Principle 06

Animations explain.

Animations never entertain.

---

## Principle 07

Consistency beats creativity.

---

## Principle 08

Every component belongs to the Design System.

No exceptions.

---

## Principle 09

Everything is reusable.

Nothing is page-specific.

---

## Principle 10

Enterprise users spend thousands of hours inside Atlas AI.

Every decision must optimize long-term usability.

---

# 3. BRAND IDENTITY

Atlas AI communicates:

Professional

Reliable

Calm

Intelligent

Modern

Fast

Human

Never futuristic.

Never cyberpunk.

Never playful.

Never childish.

Never game-like.

---

Brand keywords

Enterprise

Premium

Minimal

AI-first

Professional

Reliable

Accessible

Calm

Focused

Technical

---

# 4. DESIGN PHILOSOPHY

Atlas AI combines ideas from:

Google Material 3

Apple Human Interface Guidelines

Linear

Stripe Dashboard

Notion

OpenAI

Google AI Studio

Raycast

Vercel

The resulting experience should feel uniquely Atlas AI.

It must never look like a clone.

---

# 5. EMOTIONAL GOALS

Every user should feel:

Safe

Confident

In control

Productive

Focused

Curious

Successful

Users should never feel:

Lost

Confused

Overwhelmed

Distracted

Pressured

---

# 6. TARGET USERS

Atlas AI serves

Enterprise teams

Developers

AI Engineers

Prompt Engineers

Managers

Researchers

Knowledge Workers

Business Analysts

Product Teams

Power Users

The interface must optimize for long sessions.

---

# 7. VISUAL PERSONALITY

Minimal

Elegant

Structured

Quiet

Premium

High information density

Low visual noise

No unnecessary decoration.

---

# 8. UX PRINCIPLES

Every click must answer:

Where am I?

What can I do?

What happens next?

---

Every screen must have:

Clear hierarchy

Clear title

Primary action

Secondary actions

Navigation

Feedback

Loading

Error state

Empty state

Recovery path

---

# 9. INFORMATION HIERARCHY

Priority order:

1

Current task

2

Primary actions

3

Important data

4

Supporting data

5

Historical information

6

System information

Nothing may violate this hierarchy.

---

# 10. VISUAL LANGUAGE

Atlas AI uses

Soft geometry

Large whitespace

Rounded corners

Subtle elevation

Low contrast backgrounds

High contrast typography

Limited color palette

Purposeful motion

Every pixel must have purpose.

---

# 11. COLOR PHILOSOPHY

Color communicates meaning.

Color never decorates.

Neutral colors dominate.

Accent colors guide attention.

Danger colors indicate problems.

Success colors confirm actions.

Information colors educate.

Warning colors prevent mistakes.

---

Color usage priority

70%

Neutral

20%

Primary

5%

Semantic

5%

Accent

---

# 12. TYPOGRAPHY PHILOSOPHY

Typography is the primary visual hierarchy.

Color is secondary.

Weight is tertiary.

Spacing is equally important.

Never rely on color alone.

---

# 13. WHITESPACE

Whitespace is a component.

Whitespace separates thinking.

Whitespace improves reading speed.

Whitespace reduces errors.

Whitespace creates trust.

Atlas AI intentionally uses more whitespace than average enterprise software.

---

# 14. DENSITY

Atlas AI supports three density modes.

Comfortable

Default

Compact

Compact mode must never reduce accessibility.

---

# 15. ACCESSIBILITY

Accessibility is mandatory.

Never optional.

WCAG AA minimum.

AAA whenever practical.

Every interaction must support:

Keyboard

VoiceOver

TalkBack

Reduced Motion

Large Text

High Contrast

Screen Readers

---

# 16. AI EXPERIENCE

AI is a collaborator.

Not a magician.

AI always explains.

AI always shows progress.

AI always communicates uncertainty.

AI never pretends certainty.

AI actions must be reversible whenever possible.

---

# 17. TRUST

Trust is built through:

Transparency

Predictability

Feedback

Consistency

Undo

History

Versioning

Visible progress

---

# 18. MICROINTERACTIONS

Every interaction should answer:

Did the system understand me?

Did the system start working?

Is it still working?

Did it succeed?

Can I undo?

---

# 19. DESIGN SYSTEM

Every visual element must originate from the Design System.

No local styling.

No duplicated components.

No custom spacing.

No arbitrary colors.

No magic numbers.

---

# 20. STITCH DIRECTIVE

Google Stitch must interpret Atlas AI as:

Enterprise AI Workspace

Premium

Minimal

Professional

Calm

Structured

Whitespace-first

No gradients

No glassmorphism

No neumorphism

No skeuomorphism

No cyberpunk

No gaming aesthetics

No playful illustrations

Prefer:

Linear

Stripe

Google Workspace

OpenAI

Apple

Material 3

while preserving a unique Atlas AI identity.

# 21. DESIGN TOKENS

Atlas AI is built entirely on Design Tokens.

No visual property may be hardcoded.

Every value must come from tokens.

Tokens are the foundation for:

Colors

Typography

Spacing

Elevation

Radius

Motion

Icons

Shadows

Opacity

Borders

Blur

Z-index

---

# 22. COLOR SYSTEM

Atlas AI follows a neutral-first color philosophy.

The interface should never appear colorful.

Color is reserved for communication.

Neutral colors dominate.

Semantic colors explain.

Accent colors guide attention.

---

## PRIMARY

Purpose

Primary actions

Primary buttons

Active navigation

Focused controls

Important links

Accent highlights

---

Primary Scale

Primary-50

Primary-100

Primary-200

Primary-300

Primary-400

Primary-500

Primary-600

Primary-700

Primary-800

Primary-900

---

## NEUTRAL

Neutral colors occupy nearly every surface.

Neutral Scale

Neutral-0

Neutral-25

Neutral-50

Neutral-100

Neutral-200

Neutral-300

Neutral-400

Neutral-500

Neutral-600

Neutral-700

Neutral-800

Neutral-900

Neutral-950

---

## SUCCESS

Used only for

Completed actions

Successful AI execution

Completed uploads

Connected services

Healthy status

Never for decoration.

---

## WARNING

Used only for

Potential problems

Missing information

Attention required

Approaching limits

---

## ERROR

Used only for

Validation

Failed requests

Critical operations

Dangerous actions

Permission denied

---

## INFORMATION

Used for

Tips

Hints

Learning

AI explanations

Recommendations

---

# 23. SURFACES

Every screen uses layered surfaces.

Surface 0

Application background

Surface 1

Primary content

Surface 2

Cards

Surface 3

Floating panels

Surface 4

Dialogs

Surface 5

Critical overlays

Elevation must communicate importance.

Never decoration.

---

# 24. TYPOGRAPHY

Primary Font

Inter

Fallback

System UI

Mono Font

JetBrains Mono

Used only for

Tokens

Code

IDs

Prompt variables

Technical information

---

Typography Scale

Display XL

Display L

Display M

Headline XL

Headline L

Headline M

Title XL

Title L

Title M

Body XL

Body L

Body M

Body S

Caption

Overline

Label

Button

Code

---

Typography Principles

Never center long paragraphs.

Never justify text.

Never reduce readability for aesthetics.

Readable > Beautiful.

---

# 25. SPACING

Atlas AI uses the 8-point grid.

Base Unit

8

Spacing Tokens

0

2

4

8

12

16

20

24

32

40

48

56

64

72

80

96

112

128

Spacing communicates hierarchy.

Not decoration.

---

Content Padding

Screen

24

Card

24

Section

32

Dialog

32

Bottom Sheet

24

Navigation

16

---

# 26. GRID

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

Maximum Content Width

1440

Minimum Interactive Width

320

---

# 27. BORDER RADIUS

Atlas AI uses soft geometry.

Radius XS

Radius SM

Radius MD

Radius LG

Radius XL

Radius XXL

Rules

Cards

Medium

Dialogs

Large

Buttons

Medium

FAB

Large

Avatar

Circle

---

# 28. ELEVATION

Elevation communicates hierarchy.

Never decoration.

Level 0

Background

Level 1

Cards

Level 2

Floating Cards

Level 3

Dropdowns

Level 4

Dialogs

Level 5

Critical overlays

Dark mode reduces shadows.

Light mode emphasizes shadows.

---

# 29. SHADOWS

Shadows are subtle.

Never dramatic.

Large blurred shadows are forbidden.

Glow effects are forbidden.

Colored shadows are forbidden.

---

# 30. BORDERS

Borders define structure.

Not decoration.

Default

1px

Strong

2px

Focus

2px

Danger

2px

---

# 31. OPACITY

Disabled

40%

Loading

60%

Overlay

70%

Backdrop

80%

---

# 32. MOTION

Motion exists to explain.

Never entertain.

---

Animation Durations

Instant

Fast

Normal

Slow

Very Slow

---

Animation Curves

Standard

Emphasized

Exit

Enter

Spring

---

Animations Allowed

Fade

Scale

Slide

Expand

Collapse

Elevation

Opacity

Transform

---

Animations Forbidden

Bounce

Rubber

Jelly

Shake

Spin

Flash

Blink

Overshoot

Unless specifically required.

---

# 33. REDUCED MOTION

Reduced Motion overrides every animation.

Replace

Scale

Slide

Spring

with

Fade

or

Instant transitions.

Accessibility always wins.

---

# 34. ICONOGRAPHY

Primary Library

Lucide

Icons follow

24px grid

Stroke only

Rounded caps

Consistent stroke width

No filled icons unless semantic.

---

Icon Sizes

XS

SM

MD

LG

XL

---

# 35. DARK MODE

Dark Mode is first-class.

Not secondary.

Every component must support

Light

Dark

High Contrast

No component may exist in only one theme.

---

# 36. TOKEN RULES

Developers must never write:

padding: 17

margin: 19

borderRadius: 11

fontSize: 15

color: "#FFFFFF"

Instead

Always use Design Tokens.

Hardcoded visual values are forbidden.

---

# 37. STITCH DIRECTIVE

Google Stitch must generate every screen using these tokens.

Never invent:

colors

spacing

radius

elevation

motion

typography

outside this specification.

Consistency has higher priority than creativity.

# 38. COMPONENT LIBRARY

Every visual object inside Atlas AI is a reusable Design System component.

Pages never own components.

Components never own business logic.

Business logic is injected.

Visual behavior is standardized.

Every component supports

Light Theme

Dark Theme

High Contrast

Reduced Motion

Accessibility

Loading

Disabled

Error

Hover (Desktop)

Pressed

Focused

Selected

Active

---

# 39. BUTTON

Purpose

Execute primary user actions.

Variants

Primary

Secondary

Outline

Ghost

Danger

Success

AI

Sizes

XS

SM

MD

LG

XL

States

Default

Hover

Pressed

Focused

Loading

Disabled

Success

Error

Rules

Maximum one Primary Button per screen section.

Never place two primary buttons side-by-side.

---

# 40. ICON BUTTON

Purpose

Compact actions.

Examples

Back

Close

Refresh

Settings

Copy

Delete

Share

More

Sizes

32

40

48

Touch Target

Minimum 44×44

---

# 41. FLOATING ACTION BUTTON

Purpose

Highest-priority contextual action.

Rules

Only one FAB per screen.

Never multiple FABs.

Expandable Speed Dial supported.

---

# 42. TEXT INPUT

Variants

Filled

Outlined

Search

Password

OTP

Multiline

Prompt

Read Only

States

Empty

Typing

Focused

Filled

Loading

Disabled

Error

Success

Required

Rules

Always display validation below field.

Never use placeholders instead of labels.

---

# 43. SEARCH BAR

Supports

Instant Search

Debounce

Voice Search

Recent Searches

Suggestions

AI Search

History

Loading

Empty

Error

Offline

FlashList integration mandatory.

---

# 44. TEXTAREA

Purpose

Long prompts

Knowledge articles

Descriptions

Comments

Supports

Character counter

Markdown

Autosize

---

# 45. DROPDOWN

Supports

Search

Groups

Icons

Multi Select

Async Loading

Infinite Scroll

---

# 46. SELECTOR

Types

Single

Multiple

Workspace

Language

Theme

Organization

Agent

---

# 47. SWITCH

Purpose

Binary settings.

Animated.

Accessible.

---

# 48. CHECKBOX

Supports

Checked

Unchecked

Indeterminate

Disabled

---

# 49. RADIO GROUP

Single selection.

Animated.

Keyboard accessible.

---

# 50. SLIDER

Supports

Single

Range

Discrete

Continuous

---

# 51. DATE PICKER

Supports

Date

Time

DateTime

Range

Timezone

---

# 52. CARD

Purpose

Primary information container.

Variants

Default

Elevated

Interactive

Selected

Outlined

AI Card

Statistics Card

Metric Card

Insight Card

Project Card

Conversation Card

Knowledge Card

Rules

Cards must never contain another Card.

---

# 53. SURFACE

Purpose

Visual layer.

Levels

0

1

2

3

4

5

---

# 54. MODAL

Variants

Dialog

Confirmation

Fullscreen

Bottom Sheet

Wizard

Rules

Maximum one modal stack.

---

# 55. BOTTOM SHEET

Supports

Snap Points

Gesture

Keyboard

Scrollable

---

# 56. TOOLTIP

Short explanation.

Never required for understanding.

---

# 57. POPOVER

Supports

Interactive content.

---

# 58. ALERT

Types

Info

Warning

Success

Danger

AI

---

# 59. TOAST

Temporary notification.

Auto dismiss.

Undo supported.

---

# 60. BANNER

Persistent information.

Dismissible.

---

# 61. AVATAR

Variants

Image

Initials

AI

Workspace

Organization

---

# 62. BADGE

Purpose

Status.

Variants

Success

Warning

Error

Info

Neutral

AI

---

# 63. CHIP

Purpose

Filters

Tags

Prompt Labels

Knowledge Labels

---

# 64. TAG

Used inside

Knowledge

Projects

Prompts

Files

---

# 65. DIVIDER

Horizontal

Vertical

Labeled

---

# 66. PROGRESS

Linear

Circular

Determinate

Indeterminate

---

# 67. LOADER

Variants

Inline

Fullscreen

Overlay

Skeleton

---

# 68. SKELETON

Mandatory for every asynchronous screen.

Types

Text

Card

Avatar

List

Table

Dashboard

Chart

---

# 69. EMPTY STATE

Every module must have an Empty State.

Contains

Illustration

Title

Description

Primary Action

---

# 70. ERROR STATE

Contains

Icon

Headline

Description

Retry

Report

---

# 71. KPI CARD

Displays

Metric

Trend

Comparison

Sparkline

---

# 72. CHART

Types

Line

Bar

Area

Pie

Donut

Heatmap

Timeline

---

# 73. TABLE

Enterprise Data Grid

Supports

Sorting

Filtering

Selection

Pagination

Resize

Sticky Header

Export

---

# 74. LIST

Supports

FlashList

Infinite Scroll

Grouping

Swipe Actions

---

# 75. TIMELINE

Activity history.

---

# 76. STEPPER

Wizard navigation.

---

# 77. COMMAND PALETTE

Global search.

Keyboard

⌘K

Mandatory.

---

# 78. BREADCRUMBS

Always visible on Desktop.

---

# 79. SIDEBAR

Collapsible.

Resizable.

Pinned.

---

# 80. TOP BAR

Contains

Workspace

Search

Notifications

AI

Profile

---

# 81. TAB BAR

Maximum five visible tabs.

Overflow → More.

---

# 82. NAVIGATION DRAWER

Mobile only.

---

# 83. AI MESSAGE

Variants

Assistant

User

System

Error

Thinking

Streaming

Tool Call

Citation

---

# 84. PROMPT CARD

Contains

Title

Author

Tags

Tokens

Favorites

Version

Run

---

# 85. KNOWLEDGE CARD

Contains

Title

Source

Tags

Embeddings

Updated

---

# 86. PROJECT CARD

Contains

Status

Progress

Members

AI Activity

---

# 87. AGENT CARD

Contains

Avatar

Capabilities

Status

Model

Latency

---

# 88. FILE CARD

Preview

Type

Size

Owner

Version

---

# 89. NOTIFICATION ITEM

Supports

Read

Unread

Actions

Grouping

---

# 90. USER MENU

Contains

Profile

Workspace

Theme

Language

Logout

---

# 91. PROFILE CARD

User information.

---

# 92. ORGANIZATION CARD

Workspace information.

---

# 93. PERMISSION BADGE

Viewer

Editor

Admin

Owner

---

# 94. STATUS INDICATOR

Online

Offline

Busy

Idle

Disconnected

---

# 95. SEARCH RESULT

Supports

Highlighting

Grouping

Preview

---

# 96. AI INSIGHT CARD

Displays

Recommendation

Reason

Confidence

Action

---

# 97. TOKEN USAGE CARD

Displays

Tokens

Cost

Limit

Remaining

---

# 98. ACTIVITY ITEM

Timeline component.

---

# 99. FILE PREVIEW

Image

PDF

Markdown

Code

Text

---

# 100. COMPONENT RULES

Every component

must be reusable.

must be documented.

must support accessibility.

must support themes.

must support animations.

must support reduced motion.

must support loading.

must support errors.

must never contain business logic.

---

# 101. STITCH DIRECTIVE

Google Stitch must generate every screen exclusively from these components.

Never invent new UI patterns.

Never create custom widgets.

Everything must reuse the Component Library.

# 102. SCREEN TEMPLATES

Every screen inside Atlas AI follows one of the official Screen Templates.

No custom layouts.

No page-specific design.

Every screen inherits

Navigation

Spacing

Typography

Component Library

Motion

Accessibility

Theme

Loading

Error

Empty State

---

# AUTHENTICATION

---

## SCREEN 01

Splash

Purpose

Initialize application.

Display

Logo

Background

Loading animation

Version

Rules

No buttons.

No interactions.

Maximum duration: 2 seconds.

Transition

Fade.

---

## SCREEN 02

Onboarding

Purpose

Explain product value.

Layout

Header

Illustration

Headline

Description

Pagination

Primary Button

Skip Button

Pages

3–5

---

## SCREEN 03

Welcome

Purpose

Choose authentication.

Components

Logo

Headline

Description

Primary Button

Secondary Button

Language Selector

Theme Toggle

---

## SCREEN 04

Login

Layout

Header

Email

Password

Forgot Password

Login Button

SSO Buttons

Footer

Loading

Skeleton

Validation

Mandatory

---

## SCREEN 05

Register

Layout

Header

Name

Email

Password

Confirm Password

Terms

Create Account

---

## SCREEN 06

Forgot Password

Layout

Email

Send

Cancel

Success State

---

## SCREEN 07

OTP Verification

Layout

Title

Description

6 Digit Input

Paste Support

Resend Timer

Verify Button

---

## SCREEN 08

Workspace Selection

Layout

Search

Workspace Cards

Recent

Favorites

Continue Button

---

# HOME

---

## SCREEN 09

Enterprise Dashboard

Layout

Workspace Header

Greeting

Quick Actions

Insights

Recent Activity

Pinned Items

Notifications

FAB

Pull To Refresh

---

## SCREEN 10

Search

Layout

Search Bar

Filters

Recent Searches

Results

Empty State

FlashList

---

## SCREEN 11

Notifications

Layout

Tabs

Unread

Read

Grouped Timeline

Actions

---

## SCREEN 12

Global Command Palette

Shortcut

⌘K

Contains

Search

Commands

Navigation

Recent

AI Commands

---

# AI

---

## SCREEN 13

AI Chat

Layout

Conversation

Composer

Attachments

Suggestions

Streaming

Tool Calls

Typing Indicator

---

## SCREEN 14

New Chat

Layout

Templates

Recent Prompts

Model Selector

Workspace

---

## SCREEN 15

Prompt Library

Layout

Search

Categories

Cards

Favorites

Versions

Run Button

---

## SCREEN 16

Prompt Editor

Layout

Metadata

Editor

Variables

Preview

History

Version

---

## SCREEN 17

Prompt Playground

Layout

Prompt

Variables

Response

Metrics

Comparison

---

## SCREEN 18

AI Models

Layout

Cards

Latency

Tokens

Pricing

Capabilities

---

## SCREEN 19

AI Agents

Layout

Agent Cards

Capabilities

Status

Tools

Usage

---

## SCREEN 20

Agent Details

Layout

Overview

Configuration

Logs

Metrics

Runs

---

# KNOWLEDGE

---

## SCREEN 21

Knowledge Base

Layout

Folders

Search

Documents

Filters

FAB

---

## SCREEN 22

Knowledge Article

Layout

Reader

Metadata

Related

AI Summary

References

---

## SCREEN 23

Upload Knowledge

Layout

Dropzone

Metadata

Tags

Progress

History

---

## SCREEN 24

Knowledge Search

Layout

Semantic Search

Results

Highlights

Preview

---

# PROJECTS

---

## SCREEN 25

Projects

Layout

Grid

List

Filters

Sort

FAB

---

## SCREEN 26

Project Details

Layout

Overview

Tasks

Files

Agents

Activity

Members

---

## SCREEN 27

Files

Layout

Grid

Preview

Upload

History

Filters

---

## SCREEN 28

File Viewer

Layout

Preview

Metadata

Versions

Download

Comments

---

# ACTIVITY

---

## SCREEN 29

Activity Feed

Layout

Timeline

Filters

Search

Grouping

---

## SCREEN 30

Analytics

Layout

Charts

KPIs

Insights

Time Range

---

## SCREEN 31

Reports

Layout

Templates

Generated Reports

Export

History

---

# SETTINGS

---

## SCREEN 32

Settings

Layout

Categories

Navigation

Preferences

---

## SCREEN 33

Profile

Layout

Avatar

Information

Security

Sessions

---

## SCREEN 34

Workspace Settings

Layout

General

Members

Permissions

Billing

AI

---

## SCREEN 35

Organization

Layout

Overview

Users

Teams

Policies

---

## SCREEN 36

Security

Layout

Password

2FA

Sessions

Devices

Audit

---

## SCREEN 37

Billing

Layout

Plan

Invoices

Usage

Payment Methods

---

## SCREEN 38

Integrations

Layout

Connected Apps

Marketplace

Status

API Keys

---

## SCREEN 39

Developer Console

Layout

API Keys

Webhooks

Logs

Rate Limits

Tokens

---

## SCREEN 40

Help Center

Layout

Search

Documentation

FAQ

Tutorials

Support

Community

---

# COMMON SCREEN STATES

Every screen supports

Loading

Skeleton

Error

Offline

Empty

Permission Denied

Maintenance

Refreshing

Success

---

# PAGE HEADER

Every screen contains

Title

Subtitle (optional)

Primary Action

Secondary Actions

Breadcrumb (Desktop)

Back Button (Mobile)

---

# CONTENT RULES

Maximum content width

Desktop

1440

Tablet

960

Mobile

100%

Cards use

24px padding

Sections separated by

32px spacing

---

# MOBILE RULES

Bottom Navigation

Maximum

5 items

Overflow

More

FAB

Optional

Gestures

Supported

Pull To Refresh

Supported

Safe Area

Mandatory

---

# DESKTOP RULES

Sidebar

Collapsible

Resizable

Breadcrumbs

Always visible

Keyboard shortcuts

Mandatory

Hover states

Enabled

---

# STITCH DIRECTIVE

Google Stitch must generate every Atlas AI interface using these Screen Templates.

Never invent additional layouts.

Every generated screen must inherit:

Design Tokens

Component Library

Navigation Rules

Motion Rules

Accessibility Rules

Enterprise UX Principles

This document overrides any default Stitch design assumptions.

# PART 5 — Enterprise Interaction & AI UX Bible

Version: 1.0

Atlas AI

Enterprise AI Platform

---

# PURPOSE

Этот документ описывает не внешний вид приложения, а его поведение.

Именно этот документ используется AI генераторами интерфейсов для построения ощущения продукта.

НЕ менять архитектуру.

НЕ менять компоненты.

НЕ менять Layout.

Изменять можно только визуальный слой.

---

# PRODUCT FEELING

Atlas AI должен ощущаться как

✓ Calm

✓ Intelligent

✓ Fast

✓ Professional

✓ Premium

✓ Invisible

Пользователь никогда не должен бороться с интерфейсом.

Интерфейс существует только чтобы помочь AI.

---

# CORE UX PRINCIPLES

1.

AI всегда главный.

Не интерфейс.

Не кнопки.

Не меню.

AI.

---

2.

Каждый экран отвечает только на один вопрос.

---

3.

Никогда не более одного Primary Action.

---

4.

Вторичные действия максимально незаметны.

---

5.

Максимум свободного пространства.

---

6.

Любой экран должен пониматься менее чем за 3 секунды.

---

7.

Минимум текста.

Максимум структуры.

---

# AI EXPERIENCE

Каждое действие ощущается как работа с персональным экспертом.

Не чат.

Не бот.

Не поиск.

Именно эксперт.

---

# BUTTON BEHAVIOR

Primary

hover

↓

Elevation +2dp

↓

Color +4%

↓

Shadow +

---

pressed

↓

Scale 98%

↓

Shadow исчезает

↓

Ripple

---

loading

↓

Spinner

↓

Text fade

↓

Width фиксируется

---

disabled

↓

Opacity 40%

---

Danger

использовать только

Delete

Remove

Destroy

Erase

---

Secondary

Flat

Transparent

---

Ghost

без заливки

---

Link

только текст

---

# CARD BEHAVIOR

Hover

↓

Elevation

↓

Shadow

↓

Border Accent

---

Selected

↓

Accent Border

↓

Background Accent 4%

---

Focused

↓

Glow

---

# SEARCH

Поиск —

главный способ навигации.

Не меню.

---

Search всегда сверху.

Sticky.

---

Placeholder

Search anything...

---

После 2 символов

живой поиск.

---

После Enter

полный поиск.

---

# EMPTY STATES

Каждый Empty Screen

содержит

Illustration

-

Title

-

Description

-

Primary Action

---

Пример

No Projects

Create your first AI Project

[ Create Project ]

---

# ERROR STATES

Никогда

Something went wrong

---

Всегда

Что произошло

-

что делать

-

Retry

---

Пример

Connection lost

Please check your internet connection.

[ Retry ]

---

# SUCCESS STATES

Всегда

✓

короткое сообщение

без модалок

использовать Toast

---

# SNACKBAR

Bottom

Floating

6 seconds

Swipe dismiss

---

# DIALOGS

Только для

Delete

Critical

Permissions

---

# DRAWERS

Использовать редко.

Предпочитать

Command Palette

Search

Quick Actions

---

# COMMAND PALETTE

Cmd + K

Главный способ работы.

---

Позволяет

Open Screen

Create

Search

Run Prompt

Switch Workspace

Open Agent

---

# FLOATING ACTION BUTTON

Появляется только если действительно нужен.

---

Actions

-

New Chat

-

New Prompt

-

Upload

-

Project

-

Knowledge

---

# ANIMATIONS

Все анимации

120–250 ms

---

Не использовать bounce.

---

Предпочитать

Fade

Scale

Slide

Opacity

---

# PAGE TRANSITIONS

Push

↓

Slide Left

---

Back

↓

Slide Right

---

Modal

↓

Fade + Scale

---

Bottom Sheet

↓

Slide Up

---

# LISTS

Использовать FlashList.

---

Каждый элемент

имеет

Hover

Focus

Pressed

Selected

---

# TABLES

Sticky Header

Resizable Columns

Sorting

Filtering

Search

Selection

Export

---

# DASHBOARD

Не информационная панель.

AI Workspace.

---

Каждый блок отвечает на вопрос

Что сейчас важно?

---

# AI CHAT

Chat —

главный экран продукта.

---

Максимальная ширина

900 px

---

Сообщения

имеют большие поля

воздух

минимум границ

---

# PROMPTS

Редактор —

как IDE.

---

Sidebar

↓

Categories

---

Center

↓

Prompt

---

Right

↓

Preview

---

# KNOWLEDGE

Напоминает

Notion

-

Google Drive

---

# PROJECTS

Напоминает

Linear

-

GitHub Projects

---

# SETTINGS

Максимально простые.

Не более

2 уровней.

---

# MOBILE EXPERIENCE

Все действия большим пальцем.

---

Минимальный touch target

44 px

---

Bottom Navigation

всегда.

---

# DESKTOP EXPERIENCE

Sidebar

-

Command Palette

-

Keyboard Shortcuts

---

# ACCESSIBILITY

WCAG AA

---

Keyboard First

---

Screen Readers

---

Reduced Motion

---

Large Fonts

---

High Contrast

---

# DARK MODE

Основной режим.

Light —

вторичный.

---

# MICROINTERACTIONS

Hover

↓

очень мягкий

---

Loading

↓

приятный

---

Success

↓

незаметный

---

# NEVER DO

×

Glassmorphism

×

Neumorphism

×

Heavy Gradients

×

Cartoon

×

Over Animation

×

More than one Accent Color

×

Centered Login Forms

×

Long Forms

×

Huge Modals

×

Nested Drawers

×

Floating Windows

×

Random Colors

×

Material Design Clone

×

Windows 11 Clone

×

macOS Clone

---

# DESIGN GOAL

Пользователь должен чувствовать

не приложение.

А интеллектуального помощника.

Интерфейс должен исчезнуть.

Остаться должен только AI.
