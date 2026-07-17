# FINAL_PROJECT_STATUS.md

> Сводный статус проекта на момент окончания Phase 2. Код репозитория не изменялся — только анализ и
> отчёт. Источники: результаты `pnpm install` / `lint` / `typecheck` / `build`, запуск `next dev`
> (web), `wxt build` + Chrome (extension), `expo export --platform web` (mobile), а также
> статическая инспекция `apps/mobile`.

---

## Завершённые Phase

- **Phase 1** — фундамент монорепо (упоминается в `TECHNICAL_HANDOVER_P1..P4`, `TASK_1110..1128`):
  завершена. Сборка пакетов и базовая инфраструктура сертифицированы (см. `TASK_1128.md`).
- **Phase 2** — Frontend Infrastructure Completion & Runtime Certification: **завершена на ~95%**.
  Все гейты сборки зелёные; web и extension runtime-валидированы в реальном браузере; mobile
  типчектся и бандлится (web-export), но нативный рантайм и реальные экраны не закрыты (см. ниже).

---

## Закрытые TODO

- ✅ `pnpm install` — чисто (временные пины/оверрайды откачаны, не нужны).
- ✅ `pnpm lint` — **20/20**.
- ✅ `pnpm typecheck` — **19/19** (включая `apps/mobile`).
- ✅ `pnpm build` — **4/4** (web, ui, observability, hooks).
- ✅ Tamagui type-defect (индексная сигнатура `[k:string]: undefined`) — устранён удалением
  `disableRootThemeClass`.
- ✅ Runtime-краш `createTamagui() invalid tokens.zIndex` (HTTP 500) — устранён переименованием
  токенов.
- ✅ SSR-краш PostHog — динамический импорт в `useEffect`.
- ✅ RSC-ошибка `QueryClient` — фабрика `createQueryClient()` + `useState`.
- ✅ `createContext is not a function` при SSR — `@tamagui/web` в `transpilePackages`.
- ✅ Кросс-платформенный PostHog (натив) — добавлен `posthog.native.tsx`.
- ✅ Extension UI не собиралось — добавлены `wxt.config.ts` + UI-точки входа.
- ✅ web runtime — dev-сервер, `/auth/login` 200, ноль ошибок в Chrome.
- ✅ extension runtime — `wxt build` + Chrome (popup/sidepanel), ноль ошибок.
- ✅ mobile web-export — `expo export --platform web` собирается (`EXIT=0`).

---

## Открытые TODO

- ⏳ **mobile: нативный конфиг.** Отсутствуют `app.json` / `app.config.js` (Expo-плагины не
  объявлены) → `expo prebuild`/`run:ios`/`run:android` невозможны без этого.
- ⏳ **mobile: реальные экраны.** `app/(auth)/login.tsx` и `app/(tabs)/index.tsx` отсутствуют;
  `index.tsx` делает редирект на несуществующий маршрут → в рантайме «Unmatched route».
- ⏳ **mobile: нативный рантайм.** Реальный запуск на iOS/Android симуляторе не выполнялся (нет
  полного SDK/симулятора в окружении; `xcrun` есть, но Xcode Simulator и Android SDK отсутствуют/не
  настроены).
- ⏳ **mobile: e2e/Detox** и `components/` — пусты (не блокирует Phase 2, но нужно для
  production-готовности).
- ⏳ **Turbo `outputs` warning** для `@atlas/extension#build` (benign).
- ⏳ **Ревью сторонних изменений** — множество модификаций корневых файлов (`.github/*`, `docs/*`,
  `docker/*`, `configs/*`, `README.md` и др.) из предыдущих сессий не ревьюились в рамках Phase 2.

---

## Состояние web (`apps/web`)

- ✅ Typecheck/lint/build — зелёные.
- ✅ `next dev` поднимается; `/auth/login` → HTTP 200, контент «Atlas — Authentication»; `/` → 307
  редирект.
- ✅ Runtime (Chrome): ноль `pageerror`/hydration, ноль ошибок консоли
  (React/Tamagui/Sentry/PostHog). Favicon-404 на первой отрисовке — безвредный, не повторяется при
  reload.
- Статус: **полностью готово к Phase 3**.

## Состояние mobile (`apps/mobile`)

- ✅ Typecheck — проходит (19/19 общих задач).
- ✅ `expo export --platform web` — собирается, 1397 модулей, `EXIT=0`; все общие пакеты корректно
  резолвятся и бандлятся.
- ❌ Нет `app.json`/`app.config.js`.
- ❌ Группы `(auth)`/`(tabs)` пусты; `index.tsx` редиректит на несуществующий `/(auth)/login`
  (рантайм-404).
- ❌ Нативный рантайм не проверялся (нет SDK/симулятора).
- Статус: **каркас готов, приложение не готово** (~80% Phase 2).

## Состояние extension (`apps/extension`)

- ✅ Typecheck/lint/build — зелёные.
- ✅ `wxt build` собирает `chrome-mv3` (manifest + background + popup + sidepanel).
- ✅ Runtime (Chrome): popup рендерит «Atlas», sidepanel — «Atlas Side Panel», ноль ошибок
  консоли/страницы.
- Статус: **полностью готово к Phase 3**.

## Состояние packages

- ✅ `@atlas/ui` — Tamagui config исправлен (tokens/zIndex), примитивы типобезопасны.
- ✅ `@atlas/observability` — web + native PostHog, Sentry init.
- ✅ `@atlas/hooks` — `createQueryClient()` фабрика, RSC-безопасный провайдер.
- ✅ `@atlas/api`, `@atlas/auth`, `@atlas/i18n` — импортируются mobile без ошибок (подтверждено
  web-export).

## Состояние CI

- ✅ Локальные гейты (install/lint/typecheck/build) зелёные.
- ⚠️ Benign-предупреждение Turbo `outputs` по `@atlas/extension#build` — нужно уточнить `turbo.json`
  (`"outputs": [".output/**"]`), чтобы CI не шумел.
- ⚠️ Множественные изменения корневых файлов из предыдущих сессий не ревьюились — риск при
  коммите/мердже в CI.
- ⚠️ Реальный нативный mobile-рантайм не покрыт CI-шагом (нужен macos-раннер с Xcode для
  `expo prebuild`/`run:ios`).

---

## Оставшиеся технические долги

1. **mobile** — `app.json`/`app.config.js`, реальные экраны `(auth)/login`, `(tabs)/index`,
   наполнение `components/`/`e2e/`, нативный рантайм.
2. **Turbo `outputs`** для extension — убрать benign-предупреждение.
3. **Ревью сторонних изменений** корневых файлов (вне Phase 2).
4. **Sentry/PostHog с реальными ключами** — smoke-проверка не выполнялась (пустые ключи во время
   сборки).
5. **Benign-логи сборки** (`@opentelemetry`/`require-in-the-middle`/Sentry Critical dependency) —
   штатное поведение Sentry-instrumentation, не ошибка.

---

## Готовность проекта к Phase 3

**Да, в целом готов** — с единственной оговоркой по mobile-native.

- **web** — готов на 100%.
- **extension** — готов на 100%.
- **mobile** — готов как каркас и по сборке (web-export), но не как запускаемое нативное приложение.
  Это не блокирует начало Phase 3 для web/extension, но должно быть закрыто отдельной задачей.

### Риски

- Непроверенный нативный mobile-рантайм может вскрыть специфичные для натива ошибки (резолвирование
  `@atlas/ui`/`react-native-web`, поведение `TamaguiProvider` на нативе) только при реальном
  запуске.
- Накопленные изменения корневых файлов вне Phase 2 не ревьюились.

### Рекомендации перед Phase 3

1. Закрыть mobile: добавить `app.json`/`app.config.js` + минимум `app/(auth)/login.tsx` и
   `app/(tabs)/index.tsx`; проверить нативный рантайм на машине с Xcode/симулятором.
2. Убрать Turbo `outputs`-warning для extension.
3. Отревьюить/закоммитить отдельными PR сторонние изменения корневых файлов.
4. При наличии ключей выполнить smoke-проверку Sentry/PostHog.
5. Зафиксировать: `pnpm lint && pnpm typecheck && pnpm build` зелёные → переходить к Phase 3.
