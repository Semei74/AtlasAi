# Atlas AI

# Frontend Architecture Specification

Version: 1.0.0

Status: Approved

Document Type: Engineering Specification

Priority: Critical

Owner: Frontend Team

Related Documents

- 00_MASTER_SPEC.md
- 01_PRODUCT_REQUIREMENTS.md
- 02_SYSTEM_ARCHITECTURE.md
- 03_TECH_STACK.md
- 04_DATABASE.md
- 05_BACKEND.md

---

# Purpose

This document defines the complete frontend architecture of Atlas AI.

Every screen, component and feature must comply with this specification.

---

# Objectives

The frontend must be

- Fast
- Responsive
- Accessible
- Modular
- Offline Ready
- Testable
- Scalable
- Maintainable
- Secure

---

# Framework

Flutter Stable

Language

Dart

Architecture

Clean Architecture

MVVM

Feature First

---

# Directory Structure

lib/

core/

features/

shared/

theme/

navigation/

services/

widgets/

generated/

main.dart

---

# Feature Structure

Each feature MUST contain

feature/

presentation/

application/

domain/

infrastructure/

widgets/

models/

providers/

tests/

No feature may depend directly on another feature.

---

# Core Module

Contains

- Theme
- Routing
- Localization
- Network
- Secure Storage
- Configuration
- Error Handling
- Dependency Injection

---

# Navigation

GoRouter

Requirements

- Deep Linking
- Protected Routes
- Nested Navigation
- Route Guards
- Web Support

---

# State Management

Riverpod

Rules

- No global mutable state
- No business logic inside widgets
- State is immutable
- Providers grouped by feature

---

# Dependency Injection

Riverpod Providers

Every service must be injectable.

---

# Design System

Material 3

Custom Atlas Design System

Every UI component must use design tokens.

---

# Theme

Support

- Light
- Dark
- System

User selection stored locally and synchronized.

---

# Colors

Primary

Secondary

Surface

Background

Error

Success

Warning

Info

Every color defined through ThemeData.

---

# Typography

Font Family

Inter

Text Styles

Display

Headline

Title

Body

Label

No hardcoded font sizes.

---

# Icons

Material Symbols

Custom icons only when required.

---

# Spacing System

Base Unit

8dp

Allowed values

4

8

12

16

24

32

40

48

64

No arbitrary spacing.

---

# Responsive Design

Supported

Phone

Tablet

Desktop

Web

Landscape

Portrait

---

# Accessibility

Support

- Screen Readers
- Dynamic Text
- High Contrast
- Reduced Motion
- Focus Navigation

Accessibility mandatory for every screen.

---

# Localization

ARB Files

Languages

English

Russian

Future

Unlimited

No hardcoded strings.

---

# Networking

HTTP Client

Dio

Requirements

- Retry
- Timeout
- Logging
- Authentication
- Error Mapping

---

# Authentication Flow

Splash

↓

Token Validation

↓

Refresh Token

↓

Login

↓

Home

Expired sessions redirected automatically.

---

# Error Handling

User-friendly messages only.

Every error contains

- Message
- Retry
- Support Code

No raw exceptions displayed.

---

# Offline Support

Offline cache

Queued requests

Automatic synchronization

Read-only mode when offline

---

# Caching

Hive

Cache

- Profile
- Workspace
- Recent Chats
- Documents
- Settings
- AI History

---

# Image Loading

cached_network_image

Requirements

- Memory Cache
- Disk Cache
- Placeholder
- Error Widget

---

# File Upload

Supported

PDF

DOCX

XLSX

CSV

TXT

PNG

JPEG

WEBP

Future

PPTX

ZIP

---

# File Download

Requirements

Progress

Pause

Resume

Cancel

Retry

---

# Screens

Splash

Onboarding

Login

Register

Workspace

Projects

Chat

Documents

AI Workspace

Profile

Settings

Notifications

Subscription

Billing

Help

About

---

# Shared Widgets

Primary Button

Secondary Button

Outlined Button

Text Field

Search Field

Card

Dialog

Bottom Sheet

Loading Indicator

Snackbar

Avatar

Badge

List Item

File Tile

Chat Bubble

Every shared widget documented.

---

# Forms

Validation

Realtime

Client Side

Server Side

Field level errors

Form level errors

---

# Loading States

Skeleton

Progress Indicator

Empty State

Error State

Success State

Timeout State

Every screen supports all states.

---

# Animations

Implicit animations preferred.

Duration

200ms

300ms

500ms

No unnecessary animations.

---

# Security

Secure Storage

Token Encryption

Certificate Pinning (future)

Clipboard protection for secrets

No sensitive logs

---

# Notifications

Firebase Cloud Messaging

Local Notifications

Notification routing supported.

---

# Search

Global Search

Documents

Chats

Workspaces

Projects

Settings

---

# Performance Targets

Cold Start

<2 seconds

Navigation

<150ms

List Scroll

60 FPS

Chat Open

<300ms

Screen Build

<16ms/frame

---

# Analytics

Events

Screen Viewed

Button Clicked

Workflow Started

Workflow Completed

Purchase

Subscription

Error

No personal content logged.

---

# Crash Reporting

Crashlytics

Only non-sensitive information.

---

# Testing

Widget Tests

Golden Tests

Integration Tests

Navigation Tests

Accessibility Tests

---

# Code Standards

Maximum Widget File

300 lines

Maximum Widget Build

100 lines

Maximum Function

50 lines

No nested widgets exceeding 3 levels without extraction.

---

# Forbidden

Business Logic in Widgets

HTTP Calls in Widgets

Hardcoded Colors

Hardcoded Strings

Hardcoded Dimensions

Direct Provider SDK Usage

Global Singletons

Duplicated Components

---

# Acceptance Criteria

Frontend implementation accepted only if

- Responsive
- Accessible
- Localized
- Tested
- Theme compliant
- Offline capable
- Error handled
- Performance targets achieved

---

# Definition of Done

Frontend feature complete only if

- Implemented
- Reviewed
- Tested
- Localized
- Accessible
- Documented
- Responsive
- Production Ready

---

# OpenCode Instructions

OpenCode MUST

- implement every screen as an independent feature
- use Riverpod for state management
- use GoRouter for navigation
- generate immutable models
- separate UI from business logic
- generate widget tests
- generate integration tests
- generate localization keys
- reuse shared widgets
- never duplicate UI components
- optimize rebuilds
- follow Material 3 guidelines
- ensure accessibility compliance
- reject any implementation violating this specification

This specification is mandatory for all frontend development.
