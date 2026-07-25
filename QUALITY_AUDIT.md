# QUALITY_AUDIT.md

> Baseline audit перед Phase 3. Только анализ, код не изменялся.
> Дата: 2026-07-17. Источники: grep по маркерам качества, `pnpm lint/typecheck` (зелёные), структура backend.

## 1. Маркеры технического долга (по всему репозиторию, исключая node_modules/.next/.output/dist)

| Маркер | Кол-во | Где преимущественно | Оценка |
|--------|--------|---------------------|--------|
| TODO | 28 | backend (вне Phase 2) | ожидаемо для большого backend |
| FIXME | 0 | — | ✅ |
| XXX | 1 | backend | низкий |
| HACK | 6 | backend | средний долг |
| eslint-disable | 58 | **24 в `services/backend/src/generated/prisma/**`** (автоген), остальное — backend + 1 в extension | сгенерированный код |
| ts-nocheck | 24 | **все в `services/backend/src/generated/prisma/**`** | автоген, ожидаемо ✅ |
| @ts-ignore / ts-ignore | 0 | — | ✅ |
| ts-nocheck вне generated | **0** | — | ✅ отлично |
| debugger | 0 | — | ✅ |
| console.log | 5 | backend + 1 `apps/extension/entrypoints/background.ts` (стартап-лог) | низкий |
| console.debug | 0 | — | ✅ |
| `any` (тип) | 108 | **все в `services/backend`** | см. ниже |

## 2. `any` — детально

- `packages/*` (все shared): **0 `any`** ✅
- Phase 2 фронтенд-пакеты (`ui`, `observability`, `hooks`): **0 `any`** ✅ (подтверждает соблюдение правил Phase 2)
- `apps/web`: 20 `any` — **все в `apps/web/.next/types/**`** (сгенерированные Next.js типы, не source) ✅
- `apps/extension`, `apps/mobile`: 0 `any` ✅
- `services/backend`: **108 `any`** — основной технический долг.

**Вывод:** фронтенд-часть (Phase 2 scope) **свободна от `any`, ts-ignore, ts-nocheck, debugger**. Весь долг по `any`/`eslint-disable`/`ts-nocheck` локализован в `services/backend` (вне Phase 2).

## 3. eslint-disable — анализ

- 24 в `services/backend/src/generated/prisma/**` — автогенерированный Prisma-код, отключения ожидаемы и безопасны.
- `apps/extension/entrypoints/background.ts:1` — `// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression` для `defineBackground(() => {…})`. Минимально, допустимо (WXT API возвращает void). Можно заменить на явный `return undefined;` при желании, но не критично.
- `packages/config/src/index.ts:73,78` — 2 disable для `no-unnecessary-type-parameters` (утилиты конфига). Локальны, обоснованы.

## 4. Code quality фронтенда (Phase 2 scope)

- `pnpm lint` → **20/20** ✅
- `pnpm typecheck` → **19/19** ✅ (включая mobile)
- `pnpm build` → **4/4** ✅
- Нет `TODO`/`FIXME`/`HACK`/`debugger`/`console.log` в Phase 2 пакетах.
- Dead code: не обнаружен в Phase 2 пакетах (все экспорты используются).

## 5. Технический долг — оценка

| Область | Долг | Блокирует Phase 3? |
|---------|------|--------------------|
| Фронтенд (Phase 2) | отсутствует | ❌ нет |
| Backend (вне Phase 2) | `any`×108, HACK×6, TODO×28, eslint-disable в generated | нет (отдельный PR) |
| `turbo.json` outputs | warning для extension | ❌ нет (minor) |
| `apps/mobile` нативный конфиг | отсутствует | частично (P3-0) |

## 6. Рекомендации (минимальные)

1. **Фронтенд готов к Phase 3** без техдолга.
2. Backend-долг (`any`, HACK) **не трогать в рамках Phase 3 фронтенда** — вынести в отдельный backend-PR с ревью.
3. При реализации P3-1 (web auth) продолжать соблюдать запрет `any`/`ts-ignore` (уже подтверждено конфигурацией ESLint `strictTypeChecked`).
4. `apps/extension/entrypoints/background.ts` — опционально заменить `eslint-disable` на `return undefined;` (косметика).

## 7. Итог

Качество фронтенд-кода (Phase 2 scope) **высокое**: ноль `any`, ноль `ts-ignore`, ноль `debugger`, ноль `ts-nocheck` вне generated, lint/typecheck/build зелёные. Технический долг локализован исключительно в `services/backend` (вне scope Phase 2) и требует отдельного PR.
