# Atlas AI

# Localization Specification

**Version:** 1.0.0 **Status:** Approved **Document Type:** Localization Specification **Priority:**
High **Owner:** Platform Team **Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the Localization (L10n) architecture for Atlas AI.

The Localization subsystem enables the platform to support multiple languages, regional settings,
cultural conventions, and localized user experiences while maintaining a single codebase.

---

# 2. Objectives

The Localization subsystem shall provide:

- Multi-language support
- Runtime language switching
- Regional formatting
- Translation management
- Pluralization support
- Right-to-left (RTL) support
- International scalability
- Provider independence

---

# 3. Architecture

```
Application
      │
      ▼
Localization Manager
      │
 ┌────┼──────────────┐
 ▼    ▼              ▼
Language      Translation
Resources      Cache
      │
      ▼
Localized UI
```

---

# 4. Supported Languages

The platform shall support:

- English
- Russian
- Spanish
- German
- French
- Italian
- Portuguese
- Chinese
- Japanese
- Korean

Additional languages may be added without modifying application logic.

---

# 5. Localization Resources

Localization files shall include:

- UI labels
- Buttons
- Menus
- Error messages
- Notifications
- Validation messages
- System messages
- Help content

Translation resources should remain external to source code.

---

# 6. Resource Format

Recommended formats:

- JSON
- ICU Message Format

Every resource key must be unique.

Example:

```
app.title
auth.login
settings.language
errors.network
```

---

# 7. Runtime Language Switching

Users shall be able to:

- Select preferred language
- Change language without restart
- Persist language preference
- Override browser defaults

Changes should apply immediately.

---

# 8. Regional Formatting

Localization shall support:

- Dates
- Time
- Currency
- Numbers
- Percentages
- Time zones
- Measurement units

Formatting must follow locale conventions.

---

# 9. Pluralization

The subsystem must support locale-aware plural rules.

Example:

- 1 message
- 2 messages
- 5 messages

Plural logic must not be hardcoded.

---

# 10. Right-to-Left Support

RTL languages shall support:

- Mirrored layouts
- Text direction
- Icon alignment
- Navigation adjustments

LTR and RTL layouts should share the same component library.

---

# 11. Translation Workflow

```
Developer
      │
      ▼
Translation Keys
      │
      ▼
Translation Files
      │
      ▼
Validation
      │
      ▼
Deployment
```

Missing translations should be detected automatically.

---

# 12. Fallback Strategy

Fallback order:

1. User Language
2. Workspace Default
3. System Default (English)

Missing keys shall never crash the application.

---

# 13. Monitoring

Track:

- Active languages
- Missing translations
- Translation coverage
- Localization errors
- Language switching events
- Cache performance

---

# 14. Security

Localization resources must:

- Prevent code injection
- Validate placeholders
- Escape unsafe content
- Restrict dynamic execution

Translation files shall not contain executable code.

---

# 15. Performance Targets

Language loading:

< 100 ms

Runtime switch:

< 200 ms

Translation lookup:

< 2 ms

Cache hit ratio:

> 95%

---

# 16. Testing

Required tests:

- Translation completeness
- Locale formatting
- RTL rendering
- Language switching
- Missing key handling
- ICU message validation
- Performance benchmarks
- Accessibility verification

---

# 17. Acceptance Criteria

The Localization subsystem is accepted only if:

- multiple languages are supported;
- runtime switching functions correctly;
- locale formatting is accurate;
- RTL layouts render properly;
- monitoring is operational;
- automated tests pass.

---

# 18. Definition of Done

The Localization subsystem is complete when:

- documented;
- integrated with the UI framework;
- scalable;
- monitored;
- tested;
- production ready.

---

# 19. OpenCode Instructions

OpenCode MUST:

- externalize all user-facing text;
- support runtime language switching;
- implement locale-aware formatting;
- support ICU message formatting;
- implement RTL compatibility;
- validate translation resources automatically;
- expose localization metrics;
- reject implementations that violate this specification.

This document is mandatory for all localized functionality within Atlas AI.
