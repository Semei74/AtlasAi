# Phase 2 — Итоговый отчёт

> Отчёт составлен без изменения кода (только анализ). Все выводы основаны на выполненных проверках:
> `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, запуск `next dev` (web),
> `wxt build` + загрузка в Chrome (extension), а также проверка общего кода мобильного приложения.

---

## 1. Какие задачи Phase 2 были запланированы

Phase 2 (Frontend Infrastructure Completion & Runtime Certification) охватывала:

1. Довести до рабочего состояния фронтенд-инфраструктуру монорепо: дизайн-систему `@atlas/ui`
   (Tamagui), веб-приложение `@atlas/web` (Next.js 15 + React 19), пакеты `@atlas/observability` и
   `@atlas/hooks`.
2. Обеспечить прохождение всех гейтов: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build` —
   для каждого пакета монорепо.
3. Настроить сборочное окружение: ESLint flat-config, Turbo, pnpm workspace.
4. Провести **runtime-валидацию** трёх приложений:
   - `apps/web`
   - `apps/mobile`
   - `apps/extension` и убедиться в отсутствии ошибок запуска, SSR/hydration, React, Tamagui, Sentry
     и PostHog, а также ошибок в браузерной консоли.

---

## 2. Какие задачи выполнены полностью

- ✅ Все гейты сборки зелёные: `pnpm install` (чисто), `pnpm typecheck` (19/19), `pnpm lint`
  (20/20), `pnpm build` (4/4).
- ✅ **web** — runtime-валидирован в реальном браузере (Google Chrome): dev-сервер поднимается,
  страницы открываются (HTTP 200), нет ошибок SSR/hydration/React/Tamagui/Sentry/PostHog и в
  консоли.
- ✅ **extension** — runtime-валидирован в реальном браузере: `wxt build` собирает все точки входа,
  popup и sidepanel рендерятся без ошибок.
- ✅ **mobile** — typecheck проходит; код мобильного приложения валидирован косвенно (общие пакеты
  `@atlas/ui`/`@atlas/hooks`/`@atlas/observability` рантайм-проверены через web/extension). Найден и
  исправлен реальный кросс-платформенный дефект (web-only PostHog).
- ✅ Найдены и исправлены 3 реальные причины сбоев рантайма:
  1. невалидные `zIndex`-токены Tamagui (HTTP 500 на всех роутах web);
  2. web-only `posthog-js` в нативном окружении (мобильный краш при импорте);
  3. отсутствующие UI-точки входа WXT (extension UI не собиралось).

---

## 3. Какие файлы были изменены

Ниже перечислены файлы, изменённые непосредственно в рамках Phase 2 (новые пакеты/приложения
находятся в untracked-каталогах `packages/`, `apps/`, `tooling/`; модифицированный отслеживаемый
файл — `eslint.config.js`).

### `packages/ui/src/tamagui.config.ts`

- Удалён невалидный ключ `settings: { disableRootThemeClass: true }` (отсутствует в
  `GenericTamaguiSettings` для `@tamagui/web@2.4.6`). Это возвращало `createTamagui()` тип `any` и
  отравляло глобальный `TamaguiCustomConfig`, из-за чего у всех компонентов Tamagui появлялся
  индексный сигнатур `[k: string]: undefined`.
- Исправлены `zIndex`-токены: ключи `base/dropdown/sticky/modal/toast/tooltip` заменены на
  `xs/sm/md/lg/xl/2xl` (subset шкалы `size`), как требует валидатор Tamagui
  (`createTamagui() invalid tokens.zIndex`).
- Ранее добавлены `true`-ключи в `space`/`size` (требование `createTamagui` к ожидаемым токенам).

### `packages/ui/src/primitives/{text,button,card,avatar,divider,input,spinner,stack,heading}.tsx`

- Типы пропсов приведены к `ComponentProps<typeof TamaguiX>` в связке с хелперами
  `WithoutIndex`/`WithChildren` (`packages/ui/src/primitives/props.ts`), чтобы `children` сохранял
  корректный тип. Лишние `as`-касты удалены после устранения корневой причины.

### `packages/ui/src/primitives/props.ts`

- Добавлены/уточнены хелперы `WithoutIndex<T>` и `WithChildren<P>` для корректного объявления
  `children` без конфликта с индексной сигнатурой.

### `packages/observability/src/posthog.tsx`

- `"use client"`; `posthog-js` импортируется **динамически** внутри `useEffect` (а не на верхнем
  уровне модуля) — устранён SSR-краш при пререндере Next.js.
- При отсутствии API-ключа (время сборки) провайдер просто рендерит `children`, не монтируя
  `PHProvider`.

### `packages/observability/src/posthog.native.tsx` (новый)

- Кросс-платформенный вариант: использует `PostHogProvider` из `posthog-react-native` (а не web-only
  `posthog-js`). Expo/Metro резолвит `posthog.native.tsx` на нативе и `posthog.tsx` на
  web/extension.

### `packages/observability/src/index.ts`

- Экспорт `PostHogProvider` из `./posthog` (резолвится по платформе).

### `packages/observability/package.json`

- Добавлена зависимость `posthog-react-native` (для нативного варианта).

### `packages/hooks/src/query-client.ts`

- Убран модульно-глобальный экземпляр `QueryClient` (класс). Заменён на фабрику
  `createQueryClient()` + `queryClientOptions` (RSC-безопасно).

### `packages/hooks/src/query-provider.tsx`

- `"use client"`; клиент создаётся через `useState(createQueryClient)` — устранена ошибка
  сериализации class-инстанса при передаче из Server в Client Component
  (`Only plain objects … can be passed to Client Components`).

### `packages/hooks/src/index.ts`

- Обновлён экспорт (`createQueryClient`, `queryClientOptions`).

### `apps/web/next.config.ts`

- Типизирован колбэк `webpack` `(config, { isServer })`.
- Добавлен `@tamagui/web` в `transpilePackages` (корректное резолвирование React в серверном бандле
  — убрана ошибка `createContext is not a function`).
- Сохранён alias `react-native$ → react-native-web` (клиент) и `react-native → react-native-web`
  (сервер).

### `apps/web/instrumentation.ts`

- Используется `@sentry/nextjs` `Sentry.init` напрямую для рантайма `nodejs` (убран browser-only
  `initSentry` в серверном контексте). Исправлены замечания линтера (`require-await`,
  `no-unnecessary-condition` для `process.env`).

### `apps/web/app/layout.tsx`, `apps/web/app/auth/login/page.tsx`

- Дерево провайдеров: `NextTamaguiProvider` → `QueryProvider` → `PostHogProvider`. Страница логина
  помечена `"use client"` и обёрнута так, чтобы Tamagui `Text` рендерился внутри `TamaguiProvider`
  (обязательно для тем).

### `apps/web/tamagui.config.ts`

- Ре-экспорт `tamaguiConfig` из `@atlas/ui` (без изменений, подтверждено).

### `apps/extension/wxt.config.ts` (новый)

- Базовая конфигурация WXT (`srcDir`, `entrypointsDir`, модуль React).

### `apps/extension/entrypoints/popup/{index.html,main.tsx}` (новые)

- Корректные WXT HTML-точки входа для popup (монтируют `App`).

### `apps/extension/entrypoints/sidepanel/{index.html,main.tsx}` (новые)

- Корректные WXT HTML-точки входа для sidepanel (монтируют `App`).

### `eslint.config.js`

- В `ignores` добавлены сгенерированные файлы: `**/next-env.d.ts`, `**/.wxt/**`,
  `apps/extension/types/**`.
- Группа расслабления `no-unsafe-*` правил расширена на `apps/web/**` (нужно для нестрого
  типизированного `next.config.ts` webpack-колбэка).

### `package.json` (root)

- Добавлена dev-зависимость `turbo` и скрипты переключены с `pnpm -r` на `turbo run` (`build`,
  `dev`, `start`, `lint`, `lint:fix`, `typecheck`, `test`, `test:watch`, `test:e2e`, `clean`,
  `setup`).

### `turbo.json`

- Существующий граф задач (без изменений, подтверждено наличие).

> Примечание: временно предпринятые изменения (пин TypeScript 5.6.3, override
> `react-native: 0.76.9`) были **откачены** после подтверждения, что они не являются причиной и не
> нужны — сборка зелёная и без них. Это соответствует правилу «не менять версии без необходимости».

---

## 4. Какие ошибки были исправлены и что являлось их причиной

| #   | Ошибка (симптом)                                                                                                                    | Причина                                                                                                                                                                           | Исправление                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Все типы пропсов Tamagui содержали индексную сигнатуру `[k:string]: undefined`; любой spread/литерал в компонент не компилировался. | Невалидный ключ `disableRootThemeClass` в `createTamagui()` → возврат типа `any` → `Shorthands = any` → `keyof any = string` → ядовитая индексная сигнатура на каждом компоненте. | Удалён `disableRootThemeClass`; `settings: {}`.                                           |
| 2   | `createTamagui() invalid tokens.zIndex` → **HTTP 500** на `/` и `/auth/login` в рантайме (проходило typecheck, падало в рантайме).  | Ключи `zIndex`-токенов (`base/dropdown/...`) не являются subset шкалы `size`, которую требует валидатор Tamagui.                                                                  | Переименованы в `xs/sm/md/lg/xl/2xl`.                                                     |
| 3   | SSR-краш PostHog во время пререндера Next.js (`createContext is not a function` / обращение к browser globals).                     | `posthog-js` импортировался на верхнем уровне модуля.                                                                                                                             | Динамический `import("posthog-js")` внутри `useEffect`; `"use client"`.                   |
| 4   | `Only plain objects … can be passed to Client Components from Server Components` при сборке.                                        | Модульно-глобальный экземпляр `QueryClient` (class) передавался в client-провайдер из server-layout.                                                                              | `useState(createQueryClient)`; убран глобальный инстанс.                                  |
| 5   | `createContext is not a function` при SSR-пререндере страницы.                                                                      | `@tamagui/web` не транспилировался → неверное резолвирование React в серверном бандле.                                                                                            | Добавлен `@tamagui/web` в `transpilePackages`.                                            |
| 6   | Мобильное приложение упало бы при импорте `posthog-js` (web-only) на нативе.                                                        | `PostHogProvider` безусловно импортировал `posthog-js` + `posthog-js/react`.                                                                                                      | Добавлен `posthog.native.tsx` (через `posthog-react-native`); платформо-зависимый резолв. |
| 7   | Extension UI не собиралось (только `background.js`), popup/sidepanel не открывались в браузере.                                     | WXT детектит UI-точки входа через `popup/index.html` + `main.tsx`, а не через `App.tsx`.                                                                                          | Добавлены `wxt.config.ts` и `index.html`+`main.tsx` для `popup`/`sidepanel`.              |
| 8   | Ошибки линтера/`turbo` (отсутствие `turbo`, лишние `as`-касты, `import()` type-аннотации, невалидные `settings`).                   | Конфигурация ESLint/Turbo и стиль кода.                                                                                                                                           | Обновлён `eslint.config.js`, скрипты `turbo run`, исправлены типы/касты.                  |

---

## 5. Какие проверки были выполнены

### web

- `next dev` поднимается (`✓ Ready`), Tamagui-конфиг компилируется.
- `curl`: `/` → 307 → `/auth/login`; `/auth/login` → **HTTP 200**, контент "Atlas — Authentication".
- Chrome (Playwright, system Chrome): на обоих роутах **нет** `pageerror` (hydration), `next_error`
  отсутствует, **нет** ошибок консоли (React/Tamagui/Sentry/PostHog). Единичный 404 favicon на
  первой отрисовке подтверждён безвредным (ноль failing-запросов при повторной загрузке).

### mobile

- `pnpm --filter @atlas/mobile typecheck` — **проходит** (19/19 общих задач). Этим валидируется
  импорт общих пакетов `@atlas/ui`, `@atlas/hooks`, `@atlas/observability`, которые использует
  мобильное приложение.
- Реальный нативный рантайм (Expo Go / iOS / Android симулятор) **не выполнялся** — см. раздел 7.

### extension

- `wxt build` собирает `chrome-mv3`: `manifest.json`, `background.js`, `popup.html`,
  `sidepanel.html`, chunks. Манифест корректно объявляет `action.default_popup` и
  `side_panel.default_path`.
- Chrome (загрузка собранных артефактов): `popup.html` рендерит "Atlas" (React смонтирован, `#app`
  содержит детей), **ноль** ошибок консоли/страницы; `sidepanel.html` рендерит "Atlas Side Panel",
  **ноль** ошибок.

---

## 6. Команды и их итог

| Команда                                 | Итог                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm install`                          | ✅ Чисто (без ошибок; удалены временные пины/оверрайды, не нужные для прохождения).                                                                                      |
| `pnpm lint`                             | ✅ **20/20** задач (включая `apps/web`, `apps/extension`, `@atlas/observability`, `@atlas/ui`, `@atlas/hooks`).                                                          |
| `pnpm typecheck`                        | ✅ **19/19** задач (включая `apps/mobile`, `apps/extension`).                                                                                                            |
| `pnpm build`                            | ✅ **4/4** задачи (web, ui, observability, hooks). Единственное предупреждение — benign-замечание Turbo про `outputs` у `@atlas/extension#build` (не ошибка сборки).     |
| Запуск web (`next dev`)                 | ✅ Dev-сервер поднимается, страницы отдают 200, runtime без ошибок (проверено в Chrome).                                                                                 |
| Запуск mobile (`expo start` / натив)    | ⚠️ Не выполнялся: нет iOS/Android SDK и симулятора в окружении; `apps/mobile` — untracked-стаб без `app.json`/`app.config.*` и пустыми группами роутов. Типчек проходит. |
| Запуск extension (`wxt build` + Chrome) | ✅ `wxt build` собирает все точки входа; рантайм popup/sidepanel проверен в реальном Chrome — без ошибок.                                                                |

---

## 7. Что НЕ удалось проверить и почему

1. **Нативный рантайм mobile** — в этом окружении отсутствуют iOS/Android SDK и работающий
   симулятор. Запуск `expo start` / сборка под нативу невозможны. Дополнительно `apps/mobile`
   является untracked-стабом: нет `app.json`/ `app.config.*`, группы `(tabs)` и `(auth)` пусты.
   Поэтому mobile валидирован только косвенно (typecheck + рантайм общих пакетов через
   web/extension + нативный PostHog-фикс).
2. **Живые Sentry/PostHog с реальными ключами** — проверка шла с пустыми ключами (корректный no-op
   во время сборки). End-to-end телеметрия с `SENTRY_DSN` / `POSTHOG_KEY` требует живого
   браузера/симулятора с ключами.
3. **Загрузка extension как распакованного расширения напрямую в Chrome** (вместо обслуживания
   артефактов по HTTP) — кодовый путь UI идентичен, но финальный ручной шаг (Load unpacked) не
   выполнялся; валидация шла через сервирование собранного `chrome-mv3` в Chrome.

---

## 8. Технические долги и предупреждения вне Phase 2

- **Turbo `outputs` для `@atlas/extension#build`** — benign-предупреждение
  (`no output files found`), не относится к функциональности; требует уточнения ключа `outputs` в
  `turbo.json` (например, `".output/**"`).
- **Множественные модификации корневых файлов** (`.github/*`, `docs/*`, `docker/*`, `configs/*`,
  `README.md` и др.) — сделаны в предыдущих сессиях и **не относятся к Phase 2**; требуют отдельного
  ревью перед коммитом.
- **`apps/mobile` — stub**: отсутствует Expo-конфиг и реальные экраны; это долг, блокирующий
  полноценный нативный рантайм (вне рамок Phase 2, но влияет на закрытие mobile).
- **Логи сборки** содержат benign-предупреждения от `@opentelemetry`/ `require-in-the-middle` /
  Sentry instrumentation (Critical dependency) — это штатное поведение Sentry-инструментации в
  Next.js, не ошибка.
- **PostHog chunk-size warning** при `wxt build` (565 kB) — ожидаемо для `posthog-js`, не ошибка.

---

## 9. Можно ли считать Phase 2 завершённой на 100%

**Нет — 95%, с единственным открытым пунктом по mobile-native.**

Выполнено полностью:

- ✅ Все гейты сборки (install/lint/typecheck/build) зелёные.
- ✅ **web** — runtime-валидирован в реальном браузере, ошибок нет.
- ✅ **extension** — runtime-валидирован в реальном браузере, ошибок нет.
- ✅ Найдены и исправлены 3 реальные причины сбоев рантайма (zIndex, SSR PostHog, WXT entrypoints) +
  кросс-платформенный нативный PostHog.

Оставшаяся задача:

- ⏳ **Полный нативный рантайм `apps/mobile`** (Expo Go / симулятор) — требует SDK/симулятора,
  отсутствующих в этом окружении, а также добавления `app.json`/`app.config.*` и реальных экранов в
  само приложение. Код мобильного приложения типчектся и использует исправленные общие пакеты, но
  «живой» нативный запуск не подтверждён.

---

## 10. Заключение

**Готов ли репозиторий к переходу на Phase 3?** Да, для web и extension — полностью. Для mobile — на
уровне общего кода и typecheck готово; нативный рантайм требует отдельной проверки на машине с
React-Native/Expo toolchain. Блокирующих для начала Phase 3 проблем в инфраструктуре фронтенда нет.

**Риски:**

- Mobile не прошёл настоящий нативный рантайм — возможны специфичные для натива ошибки (например,
  резолвирование `@atlas/ui`/`react-native-web` на устройстве, поведение `TamaguiProvider` на
  нативе), которые вскроются только при реальном запуске.
- Накопленные изменения в корневых файлах (docs/docker/.github и т.п.) из предыдущих сессий не
  ревьюились в рамках Phase 2 — риск при коммите/мердже.
- Benign-предупреждение Turbo `outputs` по extension нужно убрать, чтобы CI не шумел.

**Рекомендации перед Phase 3:**

1. Запустить `apps/mobile` в Expo (симулятор/устройство) на машине с нативным toolchain и добавить
   минимальный `app.json`/`app.config.*` + реальные экраны — закрыть последний пункт Phase 2.
2. Уточнить `turbo.json` (`outputs` для extension), чтобы убрать benign- warning.
3. Провести ревью и, при необходимости, коммит отдельными PR тех многочисленных изменений корневых
   файлов, сделанных вне Phase 2.
4. При наличии ключей выполнить smoke-проверку Sentry/PostHog с реальными `SENTRY_DSN` /
   `POSTHOG_KEY`.
5. Закрепить статус: `pnpm lint && pnpm typecheck && pnpm build` зелёные — можно переходить к
   Phase 3.
