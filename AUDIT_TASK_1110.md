# Независимый аудит TASK 1110 — Production Hardening (Atlas AI backend)

> Аудит проведён с нуля. Предыдущим отчётам и собственным промежуточным выводам **не доверялось**. Каждое утверждение проверено чтением текущего исходного кода и прогоном quality gates. Там, где факт не подтверждается кодом, явно указано «Не подтверждено анализом исходного кода».

---

## 1. Подтверждение выполнения задачи

| # | Требование (по Task 1110) | Найдено в коде | Где реализовано | Соответствие | Отклонения |
|---|---------------------------|----------------|-----------------|--------------|------------|
| 1 | CRITICAL: рабочая загрузка файлов под Fastify | Да | `document.controller.ts:59-108`, `main.ts:44-51`, `package.json:26` (`@fastify/multipart@^9`) | Полное (код корректен) | См. замечание A (500 вместо 413; мёртвый чек размера), C (нет тестов) |
| 2 | HIGH: устранение path traversal в `getPath` | Да | `local-file-storage.service.ts:44-49`, `s3-file-storage.service.ts:106-111` | Полное | — |
| 3 | HIGH: устранение межтенантной записи (`organizationId` из токена) | Да | `document.controller.ts:63-65, 90-93` | Полное | См. замечание C (нет тестов) |
| 4 | HIGH: защита от zip-bomb | Частично | `parser-limits.ts`, `epub.parser.ts`, `pptx.parser.ts` | Полное для epub/pptx | НЕ применено к `docx.parser.ts` (только сжатый размер) — замечание D |
| 5 | HIGH: DI AuthGuard (`AuthModule` `@Global`) | Да | `auth.module.ts:46` | Полное | Архитектурный запах `@Global()` — замечание E |
| 6 | MEDIUM: O(n²)→O(n) эмбеддинг | Да | `vector-search.service.ts:67-78` | Полное | — |
| 7 | MEDIUM: параллельный сбор контекста в retriever | Да | `retriever.service.ts:28-40` | Полное | — |
| 8 | MEDIUM: атомарная ротация refresh-токена | Да | `refresh-token-store.interface.ts:14`, `refresh-token-store.service.ts:53-68`, `jwt.service.ts:107-112` | Полное | — |
| 9 | Удаление мёртвых зависимостей (`@nestjs/platform-express`, `@types/express`, `@types/multer`) | Да | `package.json` (этих записей нет) | Полное | — |
| 10 | Production Dockerfile | Да (файл создан) | `docker/Dockerfile.prod` | Не верифицировано | Сборка не проверялась (Docker недоступен) — замечание F |
| 11 | Итоговый отчёт (русский) | Да | `PRODUCTION_HARDENING_REPORT.md` | Полное | — |
| 12 | Прогон TestSprite | Нет | — | Не выполнено | Docker недоступен (DOCKER_DOWN) — замечание G |

**Вывод:** все заявленные code-исправления присутствуют в коде и корректны. Два пункта (Dockerfile, TestSprite) не верифицированы по причине недоступности инфраструктуры.

---

## 2. Архитектура (SOLID / DRY / циклические зависимости / DI / SRP)

**SOLID**
- `RefreshTokenStore` корректно разделён на интерфейс и реализацию (`refresh-token-store.interface.ts` / `refresh-token-store.service.ts`) — хорошо.
- `getPath` инкапсулирует санитизацию расширения — SRP соблюдён.

**DRY**
- `assertArchiveWithinSize` / `assertArchiveEntriesSafe` вынесены в `parser-limits.ts` и переиспользуются в epub/pptx — хорошо.
- `local-file-storage.service.ts:18-20`: дублирующаяся логика создания директории (через `new URL(...).pathname.replace(...)` и затем через `substring`) — избыточно, но не ломает работу (замечание H, Low).

**Циклические зависимости**
- Утверждение предыдущего отчёта о цикле `config ↔ validation` через `forwardRef` **не подтверждено**: `grep forwardRef` по `packages/` не находит ни одного вхождения. В текущем коде такого цикла нет.

**DI**
- `@Global()` на `AuthModule` (`auth.module.ts:46`) — рабочее решение пробела DI, но глобальные модули являются архитектурным анти-паттерном (скрывают явную зависимость). Senior-ревьювер, скорее всего, предпочёл бы явный `imports: [AuthModule]` в `KnowledgeModule`. Функционально корректно (замечание E, Low/Medium).

**SRP**
- `DocumentController.create` собирает объект `input` вручную (строки 90-97) — граничное нарушение SRP, но допустимо для контроллера.

---

## 3. Интеграция (используется ли / мёртвый код)

- `@fastify/multipart` зарегистрирован во всех 4 точках подъёма приложения: `main.ts:44`, `main.test.ts:37`, `test/app.e2e.test.ts:32`, `test/auth.e2e.test.ts:214` — консистентно, не «мёртвый».
- Новый метод `consume()` интерфейса вызывается из `jwt.service.rotateRefreshToken` — интегрирован.
- `markConsumed` (старый метод) всё ещё используется в `jwt.service.revokeRefreshToken` (`jwt.service.ts:116`) — НЕ мёртвый код.
- `AuthGuard` резолвится глобально — используется всеми контроллерами.
- **Мёртвый код**: проверка `buffer.byteLength > MAX_FILE_SIZE` в `document.controller.ts:73` фактически недостижима (см. замечание A) — кандидат на удаление.

---

## 4. Влияние на существующий код (регрессии / обратная совместимость)

- **Изменение поведения (намеренное, безопасное):** ранее `organizationId` брался из тела запроса; теперь — из токена (`document.controller.ts:91`). Если клиенты слали `organizationId` в теле `CreateDocumentDto`, он теперь игнорируется. Это breaking change для клиента, но это и была уязвимость. **Рекомендация:** удалить/пометить `@ApiHideProperty` поле `organizationId` из `CreateDocumentDto`, чтобы не вводить в заблуждение (замечание I, Low).
- Регрессий в тестах нет: 1867 тестов проходят (см. раздел 11).
- Обратная совместимость публичного API эндпоинта загрузки сохранена (тот же путь `POST /api/v1/knowledge/documents`, `multipart/form-data`).

---

## 5. Качество реализации (стиль / TODO / FIXME / HACK)

- `grep` по `knowledge` и `auth/jwt` на `TODO|FIXME|HACK|XXX|WORKAROUND|temporary` — **0 совпадений**.
- Стиль соответствует проекту: `explicit-function-return-type`, `readonly`, `consistent-type-imports` (включены в `eslint.config.js`). ESLint проходит с 0 ошибок/предупреждений.
- `refresh-token-store.service.ts:34` содержит целевой `eslint-disable @typescript-eslint/no-unnecessary-condition` с пояснением — оправданно.
- `document.controller.ts:73` — мёртвый код (см. A).
- `xml.parser.ts:1` — глобальный `eslint-disable` (`require-await`, `no-unnecessary-condition`) — допустимо для наивного парсера, но скрывает возможные проблемы типизации.

---

## 6. Безопасность

| Проверка | Результат |
|----------|-----------|
| Path traversal (загрузка) | **Устранён.** `getPath` берёт только расширение через строгий регэксп `/^\.[a-zA-Z0-9]{1,10}$/` (`local/s3-file-storage.service.ts`). `documentId` — доверенный UUID из БД. Проверено на случаи `..`, `a.txt/../../etc/passwd`, `.env` — все безопасны. |
| Межтенантная запись | **Устранён.** `organizationId` берётся из `user.organizationId` (claim токена), тело DTO игнорируется. |
| Zip-bomb (epub/pptx) | **Устранён** частично: лимиты записей (10 000) и распакованного размера (200 MB) + нарастающий счётчик в epub/pptx. |
| Zip-bomb (docx) | **Не устранён.** `docx.parser.ts` вызывает только `assertArchiveWithinSize` (сжатый размер 50 MB). mammoth внутренне не ограничивает распакованный размер → 50 MB docx может раздуться в памяти (замечание D, Medium). |
| Race condition ротации токена | **Устранён.** Атомарный CAS через `WATCH/MULTI/EXEC` (подтверждено Context7 для ioredis). |
| Алгоритм-конфузия JWT | **Закрыто.** `jwt.verify` пинит `algorithms`, `issuer`, `audience` (`jwt.service.ts:65-69`), подтверждено Context7. |
| Обработка oversize-загрузки | **Дефект (Low).** При `throwFileSizeLimit:true` `toBuffer()` бросает `FST_REQ_FILE_TOO_LARGE` (плоский `Error`); глобальный фильтр (`global-exception.filter.ts:21-29`) возвращает **500**, а не 413. Файл отклоняется корректно, но статус неверен (замечание A). |
| XXE / Billion laughs (XML) | **Не уязвимо.** `xml.parser.ts` — наивный regex-парсер без резолва DTD/сущностей; внешние сущности и рекурсия не обрабатываются. Безопасно, но хрупко к валидному XML со сложными namespace (замечание J, Low). |
| MIME-валидация | MIME берётся из клиентского `multipart.mimetype`, а не из содержимого (content sniffing отсутствует) — стандартная практика, но злонамеренный файл с разрешённым MIME пройдёт дальше (замечание K, Low). |
| Работа с файлами в памяти | `toBuffer()` грузит весь файл (до 50 MB) в RAM — приемлемо при лимите 50 MB. |

---

## 7. Производительность

- **O(n²) эмбеддинг** — устранён: частоты считаются один раз в `Map` (`vector-search.service.ts:69-78`), затем одна итерация. Сложность O(n). Подтверждено кодом.
- **Retriever** — `Promise.all` вместо последовательного `await` (`retriever.service.ts:28`). Улучшено.
- **Большие файлы:** epub/pptx ведут нарастающий счётчик `decompressedTotal` и прерывают при >200 MB. docx — НЕ ведёт (см. D).
- **Аллокации:** `combinedText` в epub собирается конкатенацией глав — O(n) по объёму, приемлемо.
- **O(n²) в других местах** не обнаружено.
- **Кэширование:** не затронуто.

---

## 8. Зависимости (проверка через Context7)

| Библиотека | Проверена Context7 | Соответствие документации | Замечания |
|------------|--------------------|---------------------------|-----------|
| `@fastify/multipart` (^9, новая) | Да (`/fastify/fastify-multipart`) | Да. `register({limits:{fileSize,files}, throwFileSizeLimit:true})` + `request.file()` + `toBuffer()`. Документация подтверждает: при `throwFileSizeLimit:true` `toBuffer()` бросает `RequestFileTooLargeError`; поля `truncated` нет (поэтому корректно использован собственный чек размера). | Реализация верна. |
| `ioredis` (CAS consume) | Да (`/redis/ioredis`) | Да. `watch`/`multi`/`exec` — документированный паттерн optimistic locking. | Реализация верна. |
| `jszip` (zip-bomb) | Да (`/stuk/jszip`) | Да. `uncompressedSize` берётся из central directory (`_data.uncompressedSize`); guard `typeof uncompressed === "number"` корректен. | Реализация верна, но зависит от внутреннего поля JSZip (хрупко к мажорным версиям). |
| `jsonwebtoken` (verify) | Да (`/auth0/node-jsonwebtoken`) | Да. `algorithms`/`issuer`/`audience` — рекомендованные `VerifyOptions`. | Реализация верна. |
| `mammoth` (docx) | Не проверялась (не менялась в Task 1110) | — | Используется, но защита от распаковки не добавлена (см. D). |
| `@nestjs/platform-fastify`, `prisma`, `@aws-sdk/client-s3` и др. | Не менялись в рамках Task 1110 | — | Вне scope. |

**Устаревшие API:** не обнаружено. Все используемые API актуальны для заявленных версий.

---

## 9. Технический долг

- **D (Medium):** docx не защищён от zip-bomb (только сжатый размер).
- **E (Low/Medium):** `@Global()` `AuthModule` — архитектурный запах.
- **F (Medium):** `docker/Dockerfile.prod` создан, но не собирался (Docker недоступен); `prisma migrate deploy` требует наличия каталога миграций (в репозитории `services/backend/prisma/` присутствует, но наличие применённых миграций не проверено).
- **G (Medium):** TestSprite не прогнан (Docker down) — e2e-покрытие не верифицировано независимо.
- **H (Low):** дублирующаяся логика mkdir в `local-file-storage.service.ts:18-20`.
- **I (Low):** `CreateDocumentDto.organizationId` всё ещё присутствует, хотя игнорируется контроллером.
- **A (Low):** мёртвый чек `buffer.byteLength > MAX_FILE_SIZE` (`document.controller.ts:73`) + неверный HTTP-статус 500 для oversize.
- **Инфраструктурный долг:** `opensearch` provisioned в `docker-compose.yml`, но **не имеет ни одного упоминания в `services/backend/src`** (grep возвращает 0) — мёртвая инфраструктура.
- **Неиспользуемые интерфейсы/экспорты:** не обнаружено сверх перечисленного.

---

## 10. Покрытие тестами

**Критический пробел.** Несмотря на 1867 проходящих тестов, ключевые исправления Task 1110 **не покрыты**:

- **Загрузка файлов (`create`) — 0 тестов.** `document.controller.test.ts` (71 строка) не вызывает `create()` ни разу. Мок-сервис `create` определён, но ни в одном тесте не вызывается. Нет тестов на: multipart-загрузку, MIME-allowlist, 50 MB лимит, «File is required», cross-tenant `organizationId` из токена. E2E-тесты (`app.e2e.test.ts`, `auth.e2e.test.ts`) лишь импортируют `@fastify/multipart` для bootstrap, но не выполняют реальную загрузку (grep подтверждает отсутствие вызовов `file()`/`toBuffer`/`knowledge/documents` в e2e).
- **Zip-bomb (`assertArchiveEntriesSafe`) — 0 тестов.** `format-parsers.test.ts:15` делает `vi.mock("./parser-limits.js")`, поэтому ни `assertArchiveEntriesSafe`, ни нарастающий `decompressedTotal` в epub/pptx **никогда не исполняются** в тестах. `parser-limits.test.ts` тестирует только `assertArchiveWithinSize` (сжатый размер). То есть HIGH-исправление zip-bomb не верифицировано тестами.
- **Атомарная ротация `consume` — покрыта косвенно.** 6 mock-реализаций обновлены (`consume()` добавлен), но поведенческий тест на гонку (два concurrent `rotateRefreshToken` → только один успех) отсутствует.
- **Path traversal в `getPath` — не покрыт** явным тестом (ни в local, ни в s3 storage test).

**Итог раздела 10:** позитивные сценарии парсеров покрыты; негативные/пограничные сценарии для ДВУХ самых критичных исправлений (загрузка, zip-bomb) отсутствуют. Регрессия в этих местах пройдёт CI.

---

## 11. Quality Gates

| Gate | Команда | Результат |
|------|---------|-----------|
| TypeScript | `npx tsc --noEmit` | ✅ `TSC_EXIT=0` |
| ESLint | `npx eslint . --ext .ts` | ✅ `ESLINT_EXIT=0` (0 errors / 0 warnings) |
| Vitest | `npx vitest run` | ✅ 163 файла, **1867 тестов PASS** |
| Prisma validate | `npx prisma validate` | ✅ схема валидна |
| Build | `pnpm build` (nest build) | ✅ `BUILD_EXIT=0` |
| TestSprite | — | ⚠️ **Не запускался** (Docker недоступен, DOCKER_DOWN) |
| Сборка Dockerfile.prod | `docker build` | ⚠️ **Не выполнялась** (Docker недоступен) |

Все офлайн-gates зелёные. TestSprite и сборка прод-образа не верифицированы из-за инфраструктуры.

---

## 12. Соответствие первоначальному заданию

- **Выполнено полностью:** устранение broken-загрузки, path traversal, межтенантной записи, O(n²) эмбеддинга, последовательного retriever, race-condition ротации токена; санитизация зависимостей; Context7-верификация; quality gates.
- **Выполнено частично:** zip-bomb (только epub/pptx, не docx); production Dockerfile (создан, не собран); итоговый отчёт (создан).
- **Не выполнено:** прогон TestSprite (инфраструктура); независимая верификация прод-сборки.
- **Сверх задания:** не выявлено (все изменения укладываются в scope Task 1110).

---

## 13. Критическая самооценка (как Senior Engineer на ревью)

**Что попросили бы переделать / улучшить:**
1. Добавить тесты на `DocumentController.create` (happy-path multipart + отказ по MIME + отказ по размеру + cross-tenant `organizationId`). Без этого PR не должен быть слит — это центральное security-исправление.
2. Добавить тесты на `assertArchiveEntriesSafe` (zip с >10 000 записей и >200 MB распакованного) и убрать `vi.mock("./parser-limits.js")` из `format-parsers.test.ts` (или добавить отдельный интеграционный тест без мока).
3. Для docx добавить либо `assertArchiveEntriesSafe`, либо ограничение распакованного размера в mammoth-конвейере.
4. Обработать `FST_REQ_FILE_TOO_LARGE` в контроллере (try/catch вокруг `toBuffer()`) и вернуть 413; удалить мёртвый чек `MAX_FILE_SIZE` или сделать его рабочим.
5. Заменить `@Global()` на явный `imports: [AuthModule]` в модулях, использующих `AuthGuard` (чтобы не раздувать неявные зависимости).

**Что выглядит спорно:**
- Использование `entry._data.uncompressedSize` (приватное поле JSZip) — хрупко к мажорным версиям библиотеки; следует задокументировать либо перейти на подсчёт при инфлейте с прерыванием.
- Удаление `CreateDocumentDto.organizationId` не выполнено — поле вводит клиента в заблуждение.

**Архитектурные риски, оставшиеся:**
- docx zip-bomb (Medium).
- `@Global()` модуль (скрытая связность).
- Отсутствие e2e-покрытия загрузки (риск регрессии критического пути).
- Мёртвая инфраструктура OpenSearch (confusion, лишний attack surface в периметре).

---

## 14. Итоговая оценка

### Общая оценка: **7 / 10**

**Обоснование:** Исправления корректны и подтверждены чтением кода + Context7; все офлайн quality gates зелёные. Однако:
- два самых критичных security-исправления (загрузка файлов, zip-bomb) **не имеют автоматических тестов** → регрессия пройдёт CI;
- docx не защищён от zip-bomb (частичная защита);
- oversize-загрузка возвращает 500 вместо 413 + мёртвый чек размера;
- неверифицированы прод-сборка и TestSprite (инфраструктура недоступна).

Оценка снижена с «отлично» до 7/10 именно из-за отсутствия тестов на критических путях и частичной защиты docx, несмотря на корректность самих правок.

### Процент готовности
- **Выполнено:** ~75% — все code-исправления на месте и корректны, gates зелёные.
- **Частично выполнено:** ~20% — zip-bomb (docx), Dockerfile (не собран), тестовое покрытие критических путей.
- **Отсутствует:** ~5% — прогон TestSprite, независимая верификация прод-сборки.

### Список замечаний

**Critical**
- (нет — исходные Critical/High-уязвимости устранены)

**High**
- **C1 (High):** отсутствуют тесты на `DocumentController.create` (загрузка, MIME, размер, cross-tenant). Центральное исправление не верифицировано.
- **C2 (High):** отсутствуют тесты на `assertArchiveEntriesSafe` (zip-bomb); `format-parsers.test.ts` мокает `parser-limits.js`, скрывая новую защиту.

**Medium**
- **D (Medium):** docx не защищён от zip-bomb (только сжатый размер 50 MB в `docx.parser.ts`).
- **F (Medium):** `docker/Dockerfile.prod` не собирался (Docker недоступен); требуется верификация и наличие миграций для `prisma migrate deploy`.
- **G (Medium):** TestSprite не прогнан (Docker down) — e2e не верифицирован независимо.

**Low**
- **A (Low):** oversize-загрузка → 500 вместо 413 (`global-exception.filter.ts` + `document.controller.ts:72-75`); мёртвый чек `MAX_FILE_SIZE` (строка 73).
- **E (Low):** `@Global()` на `AuthModule` — архитектурный запах.
- **H (Low):** дублирующаяся логика mkdir в `local-file-storage.service.ts:18-20`.
- **I (Low):** `CreateDocumentDto.organizationId` игнорируется, но оставлен в DTO.
- **J (Low):** `xml.parser.ts` — хрупкий regex-парсер (безопасен от XXE, но неточен для сложного XML).
- **K (Low):** MIME валидируется по клиентскому значению, без content-sniffing.
- **L (Low):** мёртвая инфраструктура OpenSearch (provisioned, не используется в коде).

---

## Итог

✅ **Выполнено полностью**
- Устранение broken-загрузки (Fastify multipart) — код корректен.
- Устранение path traversal в `getPath` (local + s3).
- Устранение межтенантной записи (`organizationId` из токена).
- Устранение O(n²) эмбеддинга и последовательного retriever.
- Атомарная ротация refresh-токена (CAS WATCH/MULTI/EXEC).
- Санитизация зависимостей (`@nestjs/platform-express`, `@types/express`, `@types/multer` удалены).
- Все офлайн quality gates зелёные: TSC=0, ESLint=0/0, Vitest=1867 PASS, Prisma valid, Build=0.
- Контекст7-верификация всех задействованных библиотек — реализация соответствует документации.

⚠ **Выполнено частично**
- Zip-bomb защита: применена к epub/pptx, НЕ к docx.
- Production Dockerfile: создан, но не собирался.
- Тестовое покрытие: позитивные сценарии парсеров есть; критические пути (загрузка, zip-bomb) — без тестов.

❌ **Отсутствует**
- Прогон TestSprite (Docker недоступен).
- Независимая верификация сборки `Dockerfile.prod`.
- Тесты на `DocumentController.create` и `assertArchiveEntriesSafe`.
- Защита docx от zip-bomb.
