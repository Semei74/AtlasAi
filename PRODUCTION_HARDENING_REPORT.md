# Итоговый отчёт по Production Hardening — Atlas AI (backend)

> Аудит выполнен заново с нуля (Task 1110). Предыдущим отчётам не доверяли — каждое утверждение проверено по исходному коду. Все изменения сохраняют бизнес-логику и поведение публичных API (кроме исправления реально сломанного эндпоинта загрузки).

---

## 1. Что было проанализировано

- Архитектура бэкенда: `main.ts` (FastifyAdapter), модули auth / tenant / ai-gateway (knowledge, rag, document, parser, vector-search), storage (local/s3), rate-limit, health, metrics.
- Инфраструктура: `docker/`, `docker-compose.yaml`, микросервисы `opensearch`, `postgres`, `redis`, `prometheus`, `grafana`, `loki`.
- Конфигурация качества: `eslint.config.js`, `tsconfig.json`, `prisma/schema.prisma`, `vitest.config.ts`, `package.json`.
- Система сборки: pnpm workspace (monorepo), `nest build`, `prisma generate`.
- Каждый используемый пакет — через Context7 (см. раздел 8).

## 2. Что уже было сделано (до аудита)

- Prisma-схема: связи, внешние ключи, каскады (`onDelete`), индексы, GIN-индексы на `tags`, `Json`-поля, scalar list `String[]` — уже корректны.
- Лимиты парсеров, health-проверки (`@nestjs/terminus`), rate-limit (`@nestjs/throttler`), метрики (`prom-client`), централизованное логирование.
- Закрыт TechDebt Task 1109: удалены 5 тестовых «мёртвых» модулей, упорядочены vitest-конфиги.
- ESLint-конфиг: исключения для тестовых файлов, `prisma.config.ts` в `allowDefaultProject`.
- Все качественные ворота (TSC/ESLint/Vitest/Prisma/build) уже проходили.

## 3. Реальные критические проблемы (с доказательствами)

| # | Серьёзность | Проблема | Доказательство |
|---|-------------|----------|----------------|
| 1 | **CRITICAL** | Эндпоинт загрузки файлов **сломан**: `document.controller.ts` использовал `FileInterceptor` из `@nestjs/platform-express` (multer), но приложение работает на `FastifyAdapter` (`main.ts`). Файл никогда не попадал в `req.file`. | `main.ts` → `new NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`; контроллер импортировал `@nestjs/platform-express`. `@fastify/multipart` не был установлен. |
| 2 | **HIGH** | **Path traversal** в `getPath`: расширение `ext` выводилось из клиентского `originalName` (последний сегмент после `.`), затем `join()` нормализовал `..` → произвольная запись/чтение файла. | `local-file-storage.service.ts`, `s3-file-storage.service.ts`: `const ext = originalName.split('.').pop(); ... join(base, id + ext)`. |
| 3 | **HIGH** | **Межтенантная запись**: `organizationId` брался из тела DTO (`@Body()`), а не из токена аутентифицированного пользователя. | `document.controller.ts` `create(dto)` → `dto.organizationId`. |
| 4 | **HIGH** | **Zip-bomb DoS**: `parser-limits.ts` проверял только **сжатый** размер (50MB). В epub/pptx парсерах не было проверки числа записей и распакованного размера. | `parser-limits.ts` `MAX_FILE_SIZE` (сжатый); epub/pptx читали все записи без лимитов. |
| 5 | **HIGH** | **Пробел в DI AuthGuard**: `AuthModule` не был `@Global()` и импортировался только в `app.module` и `tenant.module`, но `KnowledgeModule` и др. использовали `@UseGuards(AuthGuard)` без импорта `AuthModule` → потенциальный сбой при загрузке/в рантайме. | Проверка imports всех модулей, использующих `AuthGuard`. Подтверждено РЕАЛЬНОЙ проблемой (не ложное срабатывание). |
| 6 | **MEDIUM** | **O(n²) эмбеддинг**: в `vector-search.service.ts` частоты слов считались внутри цикла. | Вложенный цикл пересчёта частот для каждого слова. |
| 7 | **MEDIUM** | **Последовательный** сбор источников контекста в `retriever.service.ts` (медленнее, чем могло быть). | `for` с `await` по `expandedQueries`. |
| 8 | **MEDIUM** | **Race condition** ротации refresh-токена: `markConsumed` не была атомарной — два параллельных запроса могли обменять один токен дважды. | `jwt.service.ts` `rotateRefreshToken` + `refresh-token-store.service.ts` (простой `set`). |

## 4. Ложные срабатывания

- Первоначально подозревалось, что пробел в DI AuthGuard — ложное срабатывание, но после анализа импортов модулей **подтверждено реальной** проблемой (п. 5). В итоговый список ложных не включается.
- `@types/express` / `@types/multer` — не ошибка, а мёртвые зависимости (удалены вместе с `@nestjs/platform-express`, см. раздел 5).
- OpenSearch: не ложное срабатывание, а **неиспользуемая инфраструктура** (клиент не подключён) — отмечено в разделе 10.

## 5. Какие проблемы исправлены и как

1. **CRITICAL (загрузка)**: удалён `FileInterceptor`/`UploadedFile`/`@nestjs/platform-express`; установлен `@fastify/multipart@^9`; зарегистрирован в `main.ts`, `main.test.ts`, `test/app.e2e.test.ts`, `test/auth.e2e.test.ts`; `create()` переписан на нативный `FastifyRequest.file()` + `toBuffer()`, allowlist MIME, проверка размера 50MB через собственную константу `MAX_FILE_SIZE` (в v9 у `MultipartFile` нет поля `truncated`, см. раздел 9).
2. **Path traversal**: `getPath` теперь проверяет расширение строгим регэкспом `/^\.[a-zA-Z0-9]{1,10}$/` — `..` и пути отсекаются; сигнатура не изменена, тесты проходят.
3. **Межтенантная запись**: `organizationId` теперь берётся из `user.organizationId` (claim токена), тело DTO больше не задаёт тенант.
4. **Zip-bomb**: `parser-limits.ts` добавлены `MAX_ARCHIVE_ENTRIES = 10_000`, `MAX_TOTAL_DECOMPRESSED_BYTES = 200MB`, `assertArchiveEntriesSafe(zip)` (счёт записей + сумма `entry._data.uncompressedSize`); применено в `epub.parser.ts` и `pptx.parser.ts` (+ нарастающий счётчик распакованного размера на главу/слайд).
5. **DI AuthGuard**: `auth.module.ts` помечен `@Global()` — гварды разрешаются во всех модулях.
6. **O(n²)→O(n)**: предрасчёт частот слов через `Map` в `vector-search.service.ts`.
7. **Retriever**: `Promise.all` по `expandedQueries` вместо последовательного `await`.
8. **Race condition**: добавлен метод `consume(token)` в интерфейс `RefreshTokenStore`; реализация в `refresh-token-store.service.ts` через Redis `WATCH`/`MULTI`/`EXEC` (CAS); `jwt.service.ts` вызывает `consume` и бросает ошибку, если токен уже погашен. Обновлены 6 mock-реализаций в тестах.

## 6. Решения (decisions) по спорным моментам

- **Расширение файла**: не доверяем клиенту → строгий allowlist символов, а не очистка `..`. Решение: отсекать всё, что не матчится с регэкспом.
- **Размер файла при multipart v9**: поле `truncated` отсутствует → собственная проверка `buffer.byteLength > MAX_FILE_SIZE` + лимит `fileSize` на уровне плагина с `throwFileSizeLimit:true` (двойная защита).
- **Границы zip-лимитов**: 10k записей / 200MB распакованного — консервативно для документов; не ломает легитимные epub/pptx.
- **Refresh-токен**: выбран optimistic lock (WATCH/MULTI/EXEC), а не отдельный Lua-скрипт — достаточно для текущей нагрузки и не требует админ-прав Redis.
- **Удаление мёртвых deps**: `@nestjs/platform-express`, `@types/express`, `@types/multer` удалены из `package.json` (Express-стек больше не используется).

## 7. Что переиспользовано (архитектура)

- `FastifyAdapter`, `registerPlugins`, `setupGlobalFilters`, `setupGlobalPipes`, `setupPrometheus`, `setupGracefulShutdown` — без изменений.
- `FileStorageService` (Strategy + Factory) — переиспользован, изменён только `getPath`.
- `FileParserFactory` / парсеры — переиспользован, добавлена защита в базовый лимит.
- `RefreshTokenStore` (interface) — расширен методом `consume`, обратная совместимость соблюдена.
- Существующие метрики (`prom-client`), health (`@nestjs/terminus`), rate-limit (`@nestjs/throttler`) — без изменений.

## 8. Библиотеки, проверенные через Context7

NestJS, Prisma, Fastify, ioredis, JSZip, Mammoth, prom-client, Vitest, OpenTelemetry, @nestjs/terminus, @nestjs/throttler, argon2, AWS SDK, class-validator, @fastify/multipart, jsonwebtoken.

## 9. Что изменено/исправлено благодаря Context7

- **@fastify/multipart** (v9.4.0, совместим с fastify 5.8.5): подтверждён API `register({limits:{fileSize,files}, throwFileSizeLimit:true})`, `request.file()` возвращает `MultipartFile` с `filename: string`, `mimetype: string`, `toBuffer()`. Подтверждено **отсутствие** поля `truncated` → решение использовать собственную проверку размера (раздел 6).
- **jsonwebtoken**: подтверждена практика пининга `algorithms: ['HS256']` + `audience` + `issuer` (защита от algorithm-confusion). Текущий `jwt.service` уже соответствует — изменений не требовалось.
- **Prisma v7**: подтверждено, что `onDelete` для обязательных связей по умолчанию `Restrict`, `Json` и `String[]` поддерживаются. Существующая схема корректна.
- Context7 не потребовал корректирующих правок — он подтвердил, что мои исправления соответствуют актуальной документации.

## 10. Что нельзя исправить без изменения архитектуры

- **Циклическая зависимость** `config ↔ validation` (через `forwardRef`) — нужна консолидация/выделение общего модуля.
- **Нарушения SRP / «god-classes»** в ряде сервисов — требуют рефакторинга без изменения поведения (вне рамок этого аудита).
- **OpenSearch**: инфраструктура provisioned, но клиент не подключён к коду — либо интегрировать, либо убрать из композа (сейчас «мёртвая» инфраструктура).
- **`KnowledgeDocument.size`**: `Int` вместо `BigInt` — требует миграции + изменения типов в коде (сейчас достаточно для лимита 50MB, но не future-proof).
- **`AiRequest.estimatedCost` / `PromptExecution.estimatedCost`**: `Float` вместо `Decimal` — риск потери точности денежных значений; требует миграции.
- **Production-оркестрация** (helm/k8s, SLO, алерты) — вне рамок кода бэкенда.
- **MCP TestSprite** не выполнен — Docker недоступен (см. раздел 19).

## 11. Рекомендации на будущее (с приоритетами)

- **P0**: поднять инфраструктуру и выполнить полный прогон TestSprite; закоммитить миграции Prisma (`prisma migrate dev` → `migrate deploy`).
- **P1**: сменить `size` → `BigInt`, `estimatedCost` → `Decimal`; интегрировать OpenSearch в поиск или удалить из композа.
- **P2**: устранить цикл `config↔validation`; разнести SRP-нарушения; добавить дашборды Grafana/Loki и SLO-алерты.
- **P3**: helm/k8s-чарты, нагрузочное тестирование, chaos-тесты, автотесты безопасности (SAST/DAST) в CI.

## 12. Список изменённых файлов

- `services/backend/src/auth/auth.module.ts` — `@Global()`
- `services/backend/src/ai-gateway/vector-search/services/vector-search.service.ts` — O(n) эмбеддинг
- `services/backend/src/ai-gateway/knowledge/services/local-file-storage.service.ts` — санитизация `getPath`
- `services/backend/src/ai-gateway/knowledge/services/s3-file-storage.service.ts` — санитизация `getPath`
- `services/backend/src/ai-gateway/rag/services/retriever.service.ts` — `Promise.all`
- `services/backend/src/ai-gateway/knowledge/services/parsers/parser-limits.ts` — лимиты zip-bomb + `assertArchiveEntriesSafe`
- `services/backend/src/ai-gateway/knowledge/services/parsers/epub.parser.ts` — защита + счётчик распакованного
- `services/backend/src/ai-gateway/knowledge/services/parsers/pptx.parser.ts` — защита + счётчик распакованного
- `services/backend/src/auth/jwt/interfaces/refresh-token-store.interface.ts` — `consume()`
- `services/backend/src/auth/services/refresh-token-store.service.ts` — Redis CAS
- `services/backend/src/auth/jwt/services/jwt.service.ts` — атомарная ротация
- 6 mock-тестов: `auth-orchestrator.service.test.ts`, `user-registration.service.test.ts`, `jwt.service.test.ts`, `__tests__/auth-flow.integration.test.ts`, `authorization/guards/auth.guard.test.ts`, `tenant/guards/tenant-scope.guard.test.ts`
- `services/backend/src/main.ts` — регистрация `@fastify/multipart`
- `services/backend/src/main.test.ts`, `test/app.e2e.test.ts`, `test/auth.e2e.test.ts` — регистрация `@fastify/multipart`
- `services/backend/src/ai-gateway/knowledge/controllers/document.controller.ts` — нативный Fastify multipart + orgId из токена
- `services/backend/package.json` — удалены `@nestjs/platform-express`, `@types/express`, `@types/multer`; добавлен `@fastify/multipart ^9.0.0`
- `docker/Dockerfile.prod` — создан (production multi-stage; **не верифицирован — Docker недоступен**)

## 13–18. Качественные ворота (quality gates)

| Ворота | Статус |
|--------|--------|
| TypeScript (`tsc --noEmit`) | ✅ 0 ошибок |
| ESLint (`eslint . --ext .ts`) | ✅ 0 errors / 0 warnings |
| Vitest | ✅ 163 файла, **1867 тестов PASS** |
| Prisma validate | ✅ схема валидна |
| Production build (`pnpm build`) | ✅ BUILD_EXIT=0 |
| Dockerfile.prod build | ⚠️ не верифицирован (Docker down) |

## 19. TestSprite: результат

**Не выполнено.** Причина: Docker недоступен (`DOCKER_DOWN`) — TestSprite требует запущенный бэкенд на порту `:3000` с PostgreSQL и Redis.

Подготовка (выполнить при появлении инфраструктуры):
1. Поднять: `docker compose up -d postgres redis` (и backend на :3000).
2. `TestSprite_testsprite_bootstrap` (localPort=3000, projectPath=…/services/backend, testScope=codebase).
3. `TestSprite_testsprite_generate_backend_test_plan`.
4. `TestSprite_testsprite_generate_code_and_execute` (serverMode=production).
Ожидаемый результат: smoke-тесты аутентификации, загрузки файла (multipart), парсинга документа, health/metrics проходят; отчёт сохраняется в markdown.

## 20. Итоговая оценка (score)

**9 / 10** — production-ready при условии: (a) запуска TestSprite после поднятия инфраструктуры, (b) применения и коммита миграций Prisma. Все критические и high-проблемы устранены, ворота зелёные. Вычет за невыполненный e2e-прогон TestSprite и неверифицированный production-Dockerfile.

## 21. Остаточный технический долг

- Цикл `config ↔ validation` (forwardRef).
- SRP-нарушения / крупные сервисы («god-classes»).
- OpenSearch не интегрирован (мёртвая инфраструктура).
- `KnowledgeDocument.size` — `Int` вместо `BigInt`.
- `estimatedCost` — `Float` вместо `Decimal`.
- Отсутствуют дашборды/алерты (Grafana/Loki SLO).
- Нет helm/k8s-чартов, нагрузочного и chaos-тестирования.
- Нет SAST/DAST в CI.

## 22. Дорожная карта (roadmap)

1. **Сейчас**: запуск TestSprite + коммит миграций Prisma.
2. **Ближайшее**: `BigInt`/`Decimal` миграции; решение по OpenSearch.
3. **Следующее**: устранение циклической зависимости и SRP-рефакторинг.
4. **Далее**: мониторинг/алерты, helm/k8s, нагрузочное тестирование, SAST/DAST в CI.
