# AtlasAI Agent Instructions

## Purpose

This document defines mandatory rules for every AI agent working in this repository.

The goal is to guarantee:

- consistent architecture;
- production-ready code;
- deterministic outputs;
- minimal technical debt;
- complete implementation of every assigned task.

These rules override default agent behavior.

---

## Core Principles

The agent must:

- understand the existing architecture before modifying anything;
- reuse existing components whenever possible;
- avoid duplicate implementations;
- keep the project production-ready after every task;
- preserve backward compatibility unless explicitly instructed otherwise;
- complete the entire task in one implementation.

Never produce partial implementations.

---

## Before Starting Any Task

The agent must first:

1. Read all files related to the task.
2. Understand current architecture.
3. Find reusable services, utilities, DTOs, guards, interceptors, decorators and modules.
4. Detect architectural constraints.
5. Detect existing coding style.
6. Produce an implementation plan.
7. Only then begin implementation.

Never start writing code immediately.

---

## Architecture Rules

Every implementation must follow:

- SOLID
- DRY
- KISS
- YAGNI
- Clean Architecture
- Modular Design
- Dependency Injection
- High Cohesion
- Low Coupling

Avoid large classes.

Avoid God Objects.

Avoid duplicated logic.

---

## Code Quality

Generated code must:

- compile without TypeScript errors;
- satisfy ESLint;
- satisfy Prettier;
- avoid dead code;
- avoid commented code;
- avoid unused imports;
- avoid unnecessary abstractions;
- avoid unnecessary dependencies.

Every public API must be strongly typed.

Avoid using `any`.

---

## Existing Code

Before creating:

- service;
- utility;
- helper;
- interface;
- DTO;
- decorator;
- middleware;
- provider;
- hook;

the agent must verify whether an equivalent implementation already exists.

Reuse existing implementations whenever possible.

---

## Refactoring Rules

When refactoring:

- preserve behavior;
- improve maintainability;
- improve readability;
- reduce coupling;
- reduce duplication;
- simplify responsibilities.

Never refactor unrelated modules.

---

## Production Readiness

Every completed task must leave the project production-ready.

The implementation must consider:

- security;
- scalability;
- observability;
- maintainability;
- deployment;
- monitoring;
- logging;
- graceful shutdown;
- failure recovery.

---

## Validation

Before declaring a task complete, the agent must validate:

- TypeScript compilation;
- ESLint;
- tests;
- build;
- affected functionality.

If runtime validation is impossible, explicitly document the limitation.

---

## Testing

Whenever applicable:

- update existing tests;
- create missing tests;
- remove obsolete tests.

Tests must verify behavior rather than implementation details.

---

## Documentation

Update documentation whenever functionality changes.

Documentation must remain synchronized with implementation.

Avoid outdated examples.

---

## Task Reports

Every completed task must generate a report named "TASK_{ID}.md".

The report should include:

- objective;
- existing architecture;
- identified problems;
- implemented solution;
- modified files;
- architectural decisions;
- validation performed;
- quality gates;
- remaining limitations.

The report must describe only completed work.

Do not include speculative future work unless explicitly requested.

---

## Prompt Generation Rules

When generating implementation prompts:

- describe only the current task;
- include complete implementation requirements;
- avoid optional suggestions;
- avoid "nice to have" items;
- avoid future improvements;
- avoid TODO lists unrelated to the task;
- avoid speculative enhancements.

The prompt must contain everything required to complete the task.

---

## Token Efficiency

Prompts should be:

- concise;
- deterministic;
- implementation-oriented;
- free from repetition.

Do not waste context on explanations that are not required for implementation.

---

## Quality Standard

Every implementation should target the following outcome:

- production-ready;
- maintainable;
- testable;
- extensible;
- fully validated.

The expected quality level is **10/10**.

---

## Prohibited Behaviors

Never:

- invent architecture;
- ignore existing code;
- duplicate functionality;
- leave unfinished implementations;
- bypass validation;
- skip quality checks;
- introduce unnecessary complexity;
- generate placeholder implementations;
- silently change unrelated code.

---

## Completion Criteria

A task is complete only when:

- implementation is finished;
- affected code compiles;
- validation is complete;
- documentation is updated;
- quality gates pass;
- final report is written.

Until then, the task is considered incomplete.
