# P3_1_ANALYSIS.md

> Этап 0 — анализ перед реализацией P3-1 (Web Authentication). Только анализ. Код не изменялся.

## 1. Текущее состояние (что есть)

### apps/web

- `app/layout.tsx` — RootLayout (Server Component), дерево провайдеров: `NextTamaguiProvider` →
  `QueryProvider` → `PostHogProvider`. **Нет AuthProvider/Session.**
- `app/page.tsx` — `redirect("/auth/login")` (Server Component).
- `app/auth/login/page.tsx` — статический заглушка (`<Text>Atlas — Authentication</Text>`).
- `app/NextTamaguiProvider.tsx` — client, `TamaguiProvider` + theme.
- `instrumentation.ts` — Sentry server init.
- `next.config.ts` — Tamagui plugin + `transpilePackages` + alias (проверено в Phase 2).

### packages/auth (`@atlas/auth`)

Уже реализован **полноценный клиентский auth-слой** (zustand):

- `store.ts` — `useAuthStore` с состоянием
  `accessToken/refreshToken/user/isAuthenticated/isRestoring` и действиями
  `login/logout/setTokens/setUser/refreshTokens/restoreSession`. Persist через `secureStorage`,
  `partialize` хранит только `refreshToken`.
  - `refreshTokens()` делает `POST {NEXT_PUBLIC_API_URL}/auth/refresh` с телом `{refreshToken}`.
  - `restoreSession()` читает refresh-токен из `secureStorage`, вызывает `refreshTokens()`.
- `secure-storage.ts` — `secureStorage` с ветвлением `chrome.storage.local` (extension) /
  `localStorage` (browser). SSR-безопасно (`typeof window`).
- `auth-guard.tsx` — `AuthGuard({children, fallback})`: вызывает `restoreSession()` на маунте,
  возвращает `fallback ?? null` если не аутентифицирован, `null` пока `isRestoring`.
- `index.ts` экспортирует `useAuthStore`, `secureStorage`, `AuthGuard`.

**Важно:** `@atlas/auth` НЕ закоммичен (находится в незакоммиченном дереве вместе с backend). Для
P3-1 он используется как есть.

### packages/api (`@atlas/api`)

- `client.ts` — `createClient({baseUrl, getAccessToken, onAuthError})` на базе `openapi-fetch`.
  Инжектит `Authorization: Bearer` из `getAccessToken()`, при `401` вызывает `onAuthError`.
- `generated.ts` — OpenAPI `paths` (есть `/auth/login`, `/auth/register`, `/auth/forgot-password`,
  `/auth/reset-password`, `/auth/refresh`, `/auth/logout`, `/auth/me`). **Но request/response схемы
  помечены `requestBody?: never` и responses без `content`** — т.е. типы DTO
  (email/password/accessToken/user) в сгенерированном клиенте **отсутствуют**. Значит формы и
  парсинг ответов нужно типизировать локально (Zod).

### packages/ui (`@atlas/ui`)

Примитивы: `Text, Heading, Stack, Card, Input, Surface, Avatar, Spinner, Divider, Button`,
`TamaguiProvider`, `tamaguiConfig`.

- `Input`/`Button`/`Text`/`Spinner` принимают `ComponentProps<typeof TamaguiX>` (без индексной
  сигнатуры). `Text` поддерживает `children`.
- `Stack` — `XStack`/`YStack` (flex-контейнеры). Для форм используем `Stack` с `gap`/`padding`.

### packages/hooks (`@atlas/hooks`)

- `QueryProvider` (RSC-safe `useState(createQueryClient)`), `createQueryClient()`.
- TanStack Query готов к использованию для серверных вызовов (например, `useMutation` для login).

### packages/observability (`@atlas/observability`)

- `PostHogProvider` (уже в layout), `initSentry`, `trackEvent`, `useFeatureFlag`. Telemetry готов.

## 2. Текущий auth flow (как работает сейчас)

1. Пользователь заходит на `/` → Server Component редиректит на `/auth/login`.
2. `/auth/login` рендерит статический текст — **нет формы, нет вызова API, нет сохранения токена**.
3. `useAuthStore` существует, но **нигде не используется** в web (нет AuthProvider, нет вызова
   `restoreSession`, нет защищённых маршрутов).
4. API-клиент `@atlas/api` не инстанцирован в web-приложении.

**Вывод:** auth-инфраструктура есть в пакетах, но web-приложение её не подключает. P3-1 = связать
пакеты с реальными страницами и потоком.

## 3. Роутинг / middleware / layout / providers

- Роутинг: Next.js App Router (`app/`). Нет `middleware.ts` — защита маршрутов сейчас только на
  клиенте через `AuthGuard`.
- Layout: провайдеры Tamagui/Query/PostHog есть; **AuthProvider отсутствует**.
- TanStack Query: `QueryProvider` есть, `useMutation`/`useQuery` доступны.
- PostHog/Sentry: подключены.

## 4. Что нужно реализовать (P3-1 scope)

| Пункт                          | Подход                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Session/Auth Provider**      | Client-компонент `AuthSessionProvider`, который: (а) на маунте вызывает `restoreSession()`; (б) создаёт API-клиент `createClient` с `getAccessToken = () => useAuthStore.getState().accessToken` и `onAuthError = logout`; (в) предоставляет клиент через React context + хук `useApi()`. Добавить в `layout.tsx` между `QueryProvider` и `PostHogProvider` (или внутрь). |
| **Login page**                 | `/auth/login`: RHF + Zod (`email`, `password`). `useMutation` → `POST /auth/login` через api-клиент. При успехе: `store.login(access, refresh, user)` → `router.replace("/dashboard")`. Loading/error states.                                                                                                                                                             |
| **Register page**              | `/auth/register`: RHF + Zod (`email`, `password`, `confirmPassword`, `displayName`). `POST /auth/register`. При успехе → редирект на login (или auto-login).                                                                                                                                                                                                              |
| **Forgot password**            | `/auth/forgot-password`: RHF + Zod (`email`). `POST /auth/forgot-password`. Показать confirmation-state.                                                                                                                                                                                                                                                                  |
| **Protected route**            | `AuthGuard` уже есть. Создать `/dashboard` (защищённый) — обёрнут в `AuthGuard` с `fallback={<Redirect to="/auth/login"/>}`. Если не аутентифицирован → редирект.                                                                                                                                                                                                         |
| **Logout**                     | Кнопка/действие на `/dashboard` → `store.logout()` → `POST /auth/logout` (best-effort) → `router.replace("/auth/login")`.                                                                                                                                                                                                                                                 |
| **API integration**            | Через `useApi()` (созданный клиент). Поскольку сгенерированные типы не содержат DTO, определить локальные Zod-схемы запроса/ответа и парсить `data` вручную.                                                                                                                                                                                                              |
| **Zod validation**             | Схемы в `packages/web`-локальном модуле `auth-schemas.ts` (или в `@atlas/auth` — но чтобы не менять пакет вне scope, держим схемы в web).                                                                                                                                                                                                                                 |
| **RHF**                        | `react-hook-form` + `@hookform/resolvers/zod` (уже в deps web).                                                                                                                                                                                                                                                                                                           |
| **Loading/Error/Suspense/RSC** | Все страны — Client Components (`"use client"`). Loading через `mutation.isPending` + `Spinner`. Ошибки через `mutation.error`/`formState.errors`. Никаких `any`, `ts-ignore`, `eslint-disable`.                                                                                                                                                                          |

## 5. Риски и ограничения

- **Нет типов DTO** в `@atlas/api/generated` → придётся типизировать запросы/ответы локально через
  Zod (приемлемо, не меняет пакет).
- **`@atlas/auth` не закоммичен** — используем как есть; его коммит отдельным PR (вне P3-1).
- **Refresh-токен в `localStorage`** (web) — см. Security Review (Этап 5). Для Phase 3 приемлемо
  (существующая архитектура), но отметить как риск (XSS-вектор). Не меняем без необходимости.
- **`/auth/me`** доступен для получения профиля после логина (опционально).
- **Нет `middleware.ts`** — защита на клиенте через `AuthGuard`. Серверный middleware (cookie-based)
  — вне scope P3-1 (требует смены стратегии хранения токенов на httpOnly cookies). Документируем как
  будущую задачу.

## 6. Границы пакетов (не нарушать)

- P3-1 меняет **только `apps/web`**.
- `@atlas/auth`, `@atlas/api`, `@atlas/ui`, `@atlas/hooks`, `@atlas/observability` — **не
  изменяются** (используются как есть).
- Схемы Zod и формы — внутри `apps/web` (локальные модули).
- Никаких циклических зависимостей: web → @atlas/auth / @atlas/api / @atlas/ui / @atlas/hooks /
  @atlas/observability (все однонаправленные).

## 7. Что будем проверять через Context7 (Этап 1)

- Next.js 15 App Router (client components, `useRouter`/`redirect`, forms).
- React 19 (`useActionState`? — не используем, RHF достаточно).
- TanStack Query v5 (`useMutation` API, `useQuery`).
- PostHog / Sentry (уже подключены — проверить только актуальность вызовов).
- Tamagui (примитивы `Input`/`Button`/`Stack`/`Text`/`Spinner`).
- React Hook Form + Zod + `@hookform/resolvers/zod`.
- Next Navigation (`next/navigation` `useRouter().replace`).
