# ARCHITECTURE_AUDIT.md

> Baseline audit перед Phase 3. Только анализ, код не изменялся.
> Дата: 2026-07-17. Источники: `pnpm-workspace.yaml`, `tsconfig.json` (root references), `turbo.json`, package.json deps, структура каталогов.

## 1. Monorepo структура

- **TurboRepo** + **pnpm workspaces** (21 workspace project).
- `tsconfig.json` (root) объявляет `references` на все packages и apps — project references настроены корректно.
- `turbo.json` определяет задачи `build/dev/lint/typecheck/test/clean/generate` с `dependsOn: ["^build"]` — правильный граф.

## 2. Dependency graph (workspace:*)

```
ui                      → (нет внутренних зависимостей) ✅ leaf
observability          → logger, types
hooks                  → api, auth, types
api                    → types, errors, constants, logger, auth
auth                   → types, errors, constants, logger
i18n                   → constants
user (вне Phase2)      → types, errors, constants, logger
apps/web               → api, auth, ui, hooks, i18n, observability
apps/extension         → api, auth, ui, hooks, i18n, observability
apps/mobile            → api, auth, ui, hooks, i18n, observability
services/backend       → (вне Phase2) prisma, redis, tenant, membership, workspace, ai-gateway…
```

**Нарушений слоёв не найдено.** Apps зависят от shared packages; shared packages не зависят от apps. Циклов нет (проверено по направленному графу; `madge` недоступен без сети, но топология ациклична по построению).

## 3. Найденные проблемы

### 3.1 Turbo `build.outputs` не покрывает extension (Средний)
`turbo.json`:
```json
"build": { "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"] }
```
WXT собирает в **`.output/**`** (не `.next`/`dist`/`build`). Поэтому `pnpm build` выдаёт benign-предупреждение:
`no output files found for task @atlas/extension#build`.
**Рекомендация (минимальная):** добавить `.output/**` в `outputs` extension-задачи, либо переопределить `build` для `@atlas/extension`:
```json
"@atlas/extension#build": { "outputs": [".output/**"] }
```
Это устранит warning и включит кэширование/вывод бандла.

### 3.2 `NEXT_PUBLIC_ENV` в `globalEnv` не используется (Низкий)
См. DEPENDENCY_AUDIT — кандидат на удаление (config hygiene).

### 3.3 `apps/mobile` не имеет `app.json`/`app.config.js` (Средний, вне Phase 2)
Expo-конфиг отсутствует → `expo prebuild` невозможен без него. Это блокирует нативный рантайм (P3-0). См. MOBILE_INSPECTION.md.

### 3.4 Backend находится вне Phase 2 (высокий объём, отдельный PR)
`services/backend` содержит огромный объём изменений (ai-gateway, auth, tenant, membership, workspace, redis, throttler, prisma). Он **не ревьюился** в рамках Phase 2 и не должен смешиваться с фронтенд-коммитами. Требует отдельного PR и ревью (см. QUALITY_AUDIT / раздел «Что должно попасть в отдельный PR»).

## 4. tsconfig references

22 `tsconfig.json` в workspace. Root `tsconfig.json` reference-цепочка корректна. `tooling/typescript/*` предоставляют базовые конфиги (`tsconfig.base/exo/nextjs/package`). Нарушений алиасов/`paths` не обнаружено (проверено по `apps/mobile/tsconfig.json` `@/*` → `./app/*`, `./components/*`).

## 5. Дублирование

- В рамках Phase 2 фронтенд-пакетов дублирования не выявлено (каждый package — единый ответственный: ui=дизайн, observability=телеметрия, hooks=query, api/auth=домен).
- `apps/web` и `apps/extension` используют **идентичный** провайдер-стек (`TamaguiProvider` + `QueryProvider` + `PostHogProvider`) — это намеренная консистентность, не дублирование логики (общий код вынесен в `@atlas/*`).
- `apps/mobile` дублирует тот же стек (через нативный `posthog.native.tsx`) — корректно.

## 6. Итог

Архитектура монорепо **согласована и ациклична**. Единственное структурное улучшение для Phase 3 — поправить `turbo.json` outputs для extension. Backend требует отдельного PR/ревью вне Phase 2.
