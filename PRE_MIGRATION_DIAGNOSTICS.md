# PRE_MIGRATION_DIAGNOSTICS.md

> Atlas AI — Предмиграционная диагностика
> Дата: 2026-07-22
> Статус: **Диагностика завершена (ограничения: отсутствие Docker и базы данных)**

---

## 1. Сводка

| Параметр | Значение | Классификация |
|----------|----------|---------------|
| Схема Prisma | Валидна (18 моделей, 14 enum) | **VERIFIED** |
| Prisma Client | Сгенерирован (7.8.0) | **VERIFIED** |
| Docker | Не установлен | **VERIFIED** |
| PostgreSQL | Недоступен | **VERIFIED** |
| prisma migrate status | Ошибка P1001 | **VERIFIED** |
| prisma db pull | Ошибка P1001 | **VERIFIED** |
| _prisma_migrations | Неизвестно | **UNKNOWN** |
| Drift | Неизвестно | **UNKNOWN** |

---

## 2. Результаты выполнения команд

### 2.1 prisma generate
```
✔ Generated Prisma Client (7.8.0) to ./src/generated/prisma in 80ms
```
**Статус:** ✅ Успешно | **Классификация:** VERIFIED

### 2.2 prisma validate
```
The schema at prisma/schema.prisma is valid 🚀
```
**Статус:** ✅ Успешно | **Классификация:** VERIFIED

### 2.3 prisma format
```
Formatted prisma/schema.prisma in 18ms 🚀
```
**Статус:** ✅ Успешно | **Классификация:** VERIFIED

### 2.4 prisma migrate status
```
Error: P1001: Can't reach database server at `localhost:5432`
```
**Статус:** Ошибка | **Классификация:** VERIFIED

### 2.5 prisma db pull
```
Error: P1001: Can't reach database server at `localhost:5432`
```
**Статус:** Ошибка | **Классификация:** VERIFIED

---

## 3. Анализ структуры Prisma

### 3.1 Модели

| # | Модель | Таблица | Файл миграции в репозитории | Классификация |
|---|--------|---------|----------------------------|---------------|
| 1 | `User` | `users` | Отсутствует | OBSERVED |
| 2 | `PasswordHistory` | `password_history` | Отсутствует | OBSERVED |
| 3 | `PasswordResetToken` | `password_reset_tokens` | Отсутствует | OBSERVED |
| 4 | `Organization` | `organizations` | 0001 | OBSERVED |
| 5 | `Workspace` | `workspaces` | 0001 | OBSERVED |
| 6 | `Membership` | `memberships` | 0001 | OBSERVED |
| 7 | `Invitation` | `invitations` | 0001 | OBSERVED |
| 8 | `AiRequest` | `ai_requests` | 0002 | OBSERVED |
| 9 | `PromptCategory` | `prompt_categories` | Отсутствует | OBSERVED |
| 10 | `Prompt` | `prompts` | Отсутствует | OBSERVED |
| 11 | `PromptVersion` | `prompt_versions` | Отсутствует | OBSERVED |
| 12 | `PromptExecution` | `prompt_executions` | Отсутствует | OBSERVED |
| 13 | `KnowledgeDocument` | `knowledge_documents` | Отсутствует | OBSERVED |
| 14 | `KnowledgeDocumentMetadataHistory` | `knowledge_document_metadata_history` | Отсутствует | OBSERVED |
| 15 | `KnowledgeDocumentOcr` | `knowledge_document_ocr` | Отсутствует | OBSERVED |
| 16 | `KnowledgeDocumentParse` | `knowledge_document_parse` | Отсутствует | OBSERVED |
| 17 | `Project` | `projects` | Отсутствует | OBSERVED |
| 18 | `ActivityLog` | `activity_logs` | Отсутствует | OBSERVED |

**Наблюдение:** 6 моделей имеют файлы миграций в репозитории. 12 моделей не имеют файлов миграций. | **Классификация:** OBSERVED

### 3.2 Enum

| # | Enum | SQL Enum | Файл миграции в репозитории | Классификация |
|---|------|----------|----------------------------|---------------|
| 1 | `UserStatus` | `user_status` | Отсутствует | OBSERVED |
| 2 | `MembershipRole` | `membership_role` | 0001 | OBSERVED |
| 3 | `MembershipStatus` | `membership_status` | 0001 | OBSERVED |
| 4 | `InvitationStatus` | `invitation_status` | 0001 | OBSERVED |
| 5 | `PromptStatus` | `prompt_status` | Отсутствует | OBSERVED |
| 6 | `PromptVisibility` | `prompt_visibility` | Отсутствует | OBSERVED |
| 7 | `PromptRole` | `prompt_role` | Отсутствует | OBSERVED |
| 8 | `DocumentStatus` | `document_status` | Отсутствует | OBSERVED |
| 9 | `ProjectStatus` | `project_status` | Отсутствует | OBSERVED |
| 10 | `ActivityType` | `activity_type` | Отсутствует | OBSERVED |
| 11 | `OcrStatus` | `ocr_status` | Отсутствует | OBSERVED |
| 12 | `ParseStatus` | `parse_status` | Отсутствует | OBSERVED |

**Наблюдение:** 3 enum имеют файлы миграций в репозитории. 9 enum не имеют файлов миграций. | **Классификация:** OBSERVED

---

## 4. Файлы миграций

### 4.1 Существующие файлы миграций

| Миграция | Файл | Таблицы | Enum | Классификация |
|----------|------|---------|------|---------------|
| `0001_add_org_workspace_models` | `migration.sql` | organizations, workspaces, memberships, invitations | membership_role, membership_status, invitation_status | OBSERVED |
| `0002_add_ai_request_model` | `migration.sql` | ai_requests | — | OBSERVED |
| `0003_enable_pg_trgm.sql` | SQL файл | расширение pg_trgm | — | OBSERVED |

### 4.2 Перечень моделей без файлов миграций

Модели, определённые в `schema.prisma`, для которых отсутствуют файлы миграций в директории `prisma/migrations/`:

```
User (users)
PasswordHistory (password_history)
PasswordResetToken (password_reset_tokens)
PromptCategory (prompt_categories)
Prompt (prompts)
PromptVersion (prompt_versions)
PromptExecution (prompt_executions)
KnowledgeDocument (knowledge_documents)
KnowledgeDocumentMetadataHistory (knowledge_document_metadata_history)
KnowledgeDocumentOcr (knowledge_document_ocr)
KnowledgeDocumentParse (knowledge_document_parse)
Project (projects)
ActivityLog (activity_logs)
```

**Классификация:** OBSERVED

---

## 5. Оценка дрейфа

### 5.1 Текущий статус проверок

| Проверка | Статус | Классификация |
|----------|--------|---------------|
| Проверка репозитория | Выполнена | VERIFIED |
| Проверка базы данных | Не выполнена | VERIFIED |
| Проверка _prisma_migrations | Не выполнена | VERIFIED |
| Проверка схемы базы данных | Не выполнена | VERIFIED |

### 5.2 Наблюдения из репозитория

| Наблюдение | Описание | Классификация |
|------------|----------|---------------|
| 18 моделей определены в schema.prisma | Модели присутствуют в файле схемы | OBSERVED |
| 3 файла миграций существуют в репозитории | Миграции 0001, 0002, 0003 найдены | OBSERVED |
| 12 моделей не имеют файлов миграций | Соответствующие SQL файлы отсутствуют | OBSERVED |
| 9 enum не имеют файлов миграций | Соответствующие SQL файлы отсутствуют | OBSERVED |

### 5.3 Возможные объяснения наблюдаемых фактов

Существующие факты допускают несколько объяснений:

| Объяснение | Описание | Подтверждение |
|-------------|----------|---------------|
| Отсутствие миграций | Модели созданы без Prisma migrate dev | Requires database inspection |
| Удаление миграций | Файлы миграций удалены из репозитория | Requires git history inspection |
| Использование prisma db push | Модели созданы без SQL миграций | Requires database inspection |
| Ручное создание таблиц | Таблицы созданы вручную | Requires database inspection |
| Миграции в другом месте | История миграций хранится в другом месте | Requires database inspection |

**Вывод:** Репозиторий недостаточно информативен для определения причины. Требуется проверка базы данных. | **Классификация:** OBSERVED

### 5.4 Потенциальные проблемы

Ниже перечислены проблемы, которые могут быть обнаружены при проверке базы данных:

| Проблема | Условие | Классификация |
|----------|---------|---------------|
| Drift error при prisma migrate dev | Если схема не совпадает с _prisma_migrations | UNKNOWN — Requires database inspection |
| Таблицы уже существуют | Если миграция попытается создать дублирующие таблицы | UNKNOWN — Requires database inspection |
| Enum уже существуют | Если миграция попытается создать дублирующие enum | UNKNOWN — Requires database inspection |

---

## 6. Стратегия восстановления

### 6.1 Необходимая информация

| Информация | Причина недоступности | Классификация |
|------------|----------------------|---------------|
| Содержимое _prisma_migrations | База данных недоступна | UNKNOWN |
| Список таблиц в базе данных | База данных недоступна | UNKNOWN |
| Список enum в базе данных | База данных недоступна | UNKNOWN |
| Список индексов в базе данных | База данных недоступна | UNKNOWN |
| Состояние контейнеров | Docker не установлен | UNKNOWN |

### 6.2 Необходимые проверки

Стратегия восстановления не может быть выбрана до выполнения следующих проверок:

| Проверка | Команда |
|----------|---------|
| prisma migrate status | `npx prisma migrate status` |
| prisma db pull | `npx prisma db pull` |
| Содержимое _prisma_migrations | `SELECT * FROM _prisma_migrations ORDER BY started_at` |
| Существующие таблицы | `SELECT tablename FROM pg_tables WHERE schemaname = 'public'` |
| Существующие enum | `SELECT typname FROM pg_type WHERE typtype = 'e'` |

### 6.3 Возможные стратегии восстановления

Только после выполнения проверок из раздела 6.2 может быть выбрана одна из следующих стратегий:

| Стратегия | Условие применения | Классификация |
|-----------|-------------------|---------------|
| Normal Migration | База данных пуста, таблиц не существует | UNKNOWN — Requires database inspection |
| Baseline Migration | Таблицы существуют, _prisma_migrations пуста | UNKNOWN — Requires database inspection |
| `prisma migrate resolve` | Часть миграций применена, но не записана | UNKNOWN — Requires database inspection |
| Rebuild History | Полный сброс истории необходим | UNKNOWN — Requires database inspection |

**Стратегия восстановления не может быть выбрана** до проверки базы данных. | **Классификация:** OBSERVED

---

## 7. Перечень обнаруженных проблем

### 7.1 Верифицированные проблемы

| # | Проблема | Классификация |
|---|----------|---------------|
| 1 | Docker не установлен | VERIFIED |
| 2 | PostgreSQL недоступен (ошибка P1001) | VERIFIED |
| 3 | `prisma migrate status` не может выполниться | VERIFIED |
| 4 | `prisma db pull` не может выполниться | VERIFIED |

### 7.2 Наблюдаемые проблемы

| # | Проблема | Классификация |
|---|----------|---------------|
| 5 | 12 моделей не имеют файлов миграций в репозитории | OBSERVED |
| 6 | 9 enum не имеют файлов миграций в репозитории | OBSERVED |
| 7 | `DIRECT_URL` отсутствует в .env.development | OBSERVED |
| 8 | Node.js v24 (проект указывает v20 в .nvmrc) | OBSERVED |

### 7.3 Проблемы низкого приоритета

| # | Проблема | Классификация |
|---|----------|---------------|
| 9 | `JWT_SECRET` использует placeholder значение | OBSERVED |
| 10 | `docker/.env` не существует | OBSERVED |
| 11 | Нет AI provider API ключей | OBSERVED |

---

## 8. Оценка риска

| Категория | Риск | Обоснование | Классификация |
|-----------|------|-------------|---------------|
| Потеря данных | Низкий | Миграции не выполняются | OBSERVED |
| Дрейф базы данных | Неизвестно | База данных не проверена | UNKNOWN |
| Невоспроизводимость | Неизвестно | База данных не проверена | UNKNOWN |
| Откат | Неизвестно | База данных не проверена | UNKNOWN |
| Безопасность | Низкий | Dev окружение | OBSERVED |

---

## 9. План действий

### Фаза 0: Восстановление инфраструктуры

```
[ ] 0.1 Установить Docker Desktop для macOS Apple Silicon
[ ] 0.2 Запустить Docker Desktop
[ ] 0.3 Проверить: docker version && docker compose version
[ ] 0.4 (Опционально) Установить nvm + Node.js 20
```

### Фаза 1: Запуск инфраструктуры

```
[ ] 1.1 Запустить: docker compose -f docker/docker-compose.yml up -d
[ ] 1.2 Дождаться здоровых контейнеров
[ ] 1.3 Проверить: docker compose ps
[ ] 1.4 Проверить: docker compose logs postgres
[ ] 1.5 Проверить: docker compose exec postgres pg_isready
```

### Фаза 2: Диагностика базы данных

```
[ ] 2.1 Выполнить: npx prisma migrate status
[ ] 2.2 Выполнить: npx prisma db pull
[ ] 2.3 Запросить: SELECT * FROM _prisma_migrations ORDER BY started_at
[ ] 2.4 Запросить: SELECT tablename FROM pg_tables WHERE schemaname = 'public'
[ ] 2.5 Запросить: SELECT typname FROM pg_type WHERE typtype = 'e'
[ ] 2.6 Запросить: SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public'
```

### Фаза 3: Определение стратегии восстановления

```
[ ] 3.1 Сравнить: schema.prisma vs база данных vs _prisma_migrations
[ ] 3.2 Определить: какие таблицы существуют без файлов миграций
[ ] 3.3 Определить: какие миграции применены, но не записаны
[ ] 3.4 Выбрать стратегию на основе имеющихся данных
[ ] 3.5 Задокументировать выбранную стратегию
```

### Фаза 4: Восстановление

```
[ ] 4.1 Выполнить выбранную стратегию
[ ] 4.2 Проверить: `npx prisma migrate status`
[ ] 4.3 Проверить: `npx prisma db pull`
[ ] 4.4 Запустить валидацию: `pnpm lint && pnpm typecheck && pnpm build`
[ ] 4.5 Написать отчёт
```

---

## 10. Заключение

### 10.1 Что известно

| Факт | Классификация |
|------|---------------|
| Схема Prisma валидна | VERIFIED |
| Prisma Client сгенерирован | VERIFIED |
| Docker не установлен | VERIFIED |
| PostgreSQL недоступен | VERIFIED |
| 18 моделей определены в schema.prisma | OBSERVED |
| 14 enum определены в schema.prisma | OBSERVED |
| 3 файла миграций существуют в репозитории | OBSERVED |
| 12 моделей не имеют файлов миграций в репозитории | OBSERVED |
| 9 enum не имеют файлов миграций в репозитории | OBSERVED |

### 10.2 Что неизвестно

| Вопрос | Причина |
|--------|---------|
| Содержимое `_prisma_migrations` | База данных недоступна |
| Существующие таблицы в базе данных | База данных недоступна |
| Существующие enum в базе данных | База данных недоступна |
| Наличие дрейфа | База данных недоступна |
| Причина отсутствия миграций | База данных недоступна |
| Правильная стратегия восстановления | База данных недоступна |

### 10.3 Результаты диагностики

Анализ репозитория завершён. Анализ базы данных неполон, так как PostgreSQL недоступен.

Текущий отчёт содержит только наблюдения из репозитория. Заключения об истории миграций, дрейфе базы данных или стратегии восстановления не могут считаться окончательными до проверки базы данных.

Следующий шаг: установить Docker, запустить PostgreSQL, выполнить диагностику на Фазе 2 (см. раздел 9).

---

*Отчёт сгенерирован 2026-07-22. Требует проверки базы данных.*
