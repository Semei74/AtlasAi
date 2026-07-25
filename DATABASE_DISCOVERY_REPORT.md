# DATABASE_DISCOVERY_REPORT.md

> Atlas AI — Infrastructure Startup & Database Discovery
> Date: 2026-07-22
> Status: **INFRASTRUCTURE NOT STARTED**

---

## Executive Summary

Infrastructure startup was attempted but could not proceed.

**Reason:** Docker is not installed. No container runtime is available to start the PostgreSQL database or any other infrastructure services defined in `docker/docker-compose.yml`.

All commands that depend on a running PostgreSQL server (`docker compose`, `psql`, `prisma migrate status`, `prisma db pull`) could not execute. Their outputs document connection errors.

**Verified facts:**

| Fact | Classification |
|------|---------------|
| Docker not installed | VERIFIED |
| PostgreSQL not accessible | VERIFIED |
| Prisma CLI works (cannot connect) | VERIFIED |
| 3 migration files exist on disk | OBSERVED |
| 12 models lack migration files | OBSERVED |
| Database tables | UNKNOWN |
| Database enums | UNKNOWN |
| Database indexes | UNKNOWN |
| `_prisma_migrations` table | UNKNOWN |

---

## Docker Status

| Check | Command | Result | Classification |
|-------|---------|--------|---------------|
| Docker binary | `docker --version` | `command not found` | VERIFIED |
| Docker Compose | `docker compose version` | `command not found` | VERIFIED |
| Docker Desktop | `/Applications/Docker.app` | Not found | VERIFIED |
| Alternative runtimes | `colima`, `podman`, `rancher` | Not found | VERIFIED |

**Conclusion:** Docker is not installed on this system. Infrastructure cannot be started.

---

## PostgreSQL Status

| Check | Attempt | Result | Classification |
|-------|---------|--------|---------------|
| psql client | `pg_isready` | Not found | VERIFIED |
| Port 5432 | `lsof -i :5432` | No listener | VERIFIED |
| Docker postgres | `docker compose exec postgres pg_isready` | Cannot execute (no Docker) | UNKNOWN |
| `SELECT version()` | Could not execute | No connection | UNKNOWN |
| `SELECT current_database()` | Could not execute | No connection | UNKNOWN |
| `SELECT current_user()` | Could not execute | No connection | UNKNOWN |

---

## Prisma Status

### Commands Executed

| Command | Output | Classification |
|---------|--------|---------------|
| `npx prisma migrate status` | `Error: P1001: Can't reach database server at localhost:5432` | VERIFIED |
| `npx prisma db pull` | `Error: P1001: Can't reach database server at localhost:5432` | VERIFIED |

### Commands That Work Without Database

| Command | Result | Classification |
|---------|--------|---------------|
| `npx prisma validate` | Schema valid | VERIFIED |
| `npx prisma generate` | Generated Prisma Client 7.8.0 | VERIFIED |

### Prisma Configuration

| Parameter | Value | Classification |
|-----------|-------|---------------|
| Prisma CLI version | 7.8.0 | VERIFIED |
| Datasource provider | postgresql | OBSERVED |
| Database target | localhost:5432/atlas_ai_dev | OBSERVED |
| Database URL source | `process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/atlas_ai_dev'` | OBSERVED |

---

## Tables Inventory

**Cannot be obtained.** PostgreSQL is not accessible.

| Check | SQL | Result |
|-------|-----|--------|
| All tables | `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename` | **UNKNOWN** — No connection |

**Migration files on disk reference these tables:**

| Table | Migration File | Classification |
|-------|---------------|---------------|
| organizations | 0001 | OBSERVED |
| workspaces | 0001 | OBSERVED |
| memberships | 0001 | OBSERVED |
| invitations | 0001 | OBSERVED |
| ai_requests | 0002 | OBSERVED |

**All other tables in schema.prisma have no migration files on disk (see Prisma Migration History).**

---

## Enum Inventory

**Cannot be obtained.** PostgreSQL is not accessible.

| Check | SQL | Result |
|-------|-----|--------|
| All enums | `SELECT typname FROM pg_type WHERE typtype='e' ORDER BY typname` | **UNKNOWN** — No connection |

**Migration files on disk reference these enums:**

| Enum | Migration File | Classification |
|------|---------------|---------------|
| membership_role | 0001 | OBSERVED |
| membership_status | 0001 | OBSERVED |
| invitation_status | 0001 | OBSERVED |

**All other enums defined in schema.prisma have no migration files on disk (see Prisma Migration History).**

---

## Index Inventory

**Cannot be obtained.** PostgreSQL is not accessible.

| Check | SQL | Result |
|-------|-----|--------|
| All indexes | `SELECT tablename, indexname FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname` | **UNKNOWN** — No connection |

**Indexes defined in schema.prisma:**

| Model | Index Definition | Classification |
|-------|-----------------|---------------|
| User | `@@unique([email])` | OBSERVED |
| PasswordHistory | `@@index([userId])` | OBSERVED |
| PasswordResetToken | `@@index([userId])` | OBSERVED |
| Organization | `@@unique([slug])`, `@@index([ownerId])`, `@@index([slug])` | OBSERVED |
| Workspace | `@@index([organizationId])` | OBSERVED |
| Membership | `@@unique([organizationId, userId])`, `@@index([organizationId])`, `@@index([userId])` | OBSERVED |
| Invitation | `@@index([organizationId, email, userId, inviterId, workspaceId, status])` (6 indexes) | OBSERVED |
| AiRequest | `@@index([organizationId, workspaceId, userId, provider, model, createdAt])` (6 indexes) | OBSERVED |
| Prompt | `@@unique([slug, organizationId])`, `@@index([organizationId, workspaceId, ownerId, categoryId, status])`, `@@index([tags] type: Gin)` | OBSERVED |
| PromptVersion | `@@unique([promptId, version])`, `@@index([promptId, createdById, createdAt])` | OBSERVED |
| PromptExecution | `@@index([promptId, versionId, workspaceId, userId, organizationId, createdAt])` (6 indexes) | OBSERVED |
| KnowledgeDocument | `@@index([organizationId, organizationId+deletedAt, workspaceId, ownerId, status, createdAt])`, `@@index([tags] type: Gin)` | OBSERVED |
| KnowledgeDocumentMetadataHistory | `@@unique([documentId, version])`, `@@index([documentId])` | OBSERVED |
| KnowledgeDocumentOcr | `@@index([documentId])` | OBSERVED |
| KnowledgeDocumentParse | `@@index([documentId])` | OBSERVED |
| Project | `@@index([workspaceId, organizationId, organizationId+status+updatedAt, organizationId+workspaceId, organizationId+deletedAt+status+updatedAt, ownerId, status, createdAt, updatedAt, deletedAt, organizationId+deletedAt])` (11 indexes) | OBSERVED |
| ActivityLog | `@@index([projectId, workspaceId, organizationId, actorId, type, createdAt])` (6 indexes) | OBSERVED |

**Note:** These indexes are defined in schema.prisma only. Whether they exist in the database is **UNKNOWN**.

---

## Sequences Inventory

**Cannot be obtained.** PostgreSQL is not accessible.

| Check | SQL | Result |
|-------|-----|--------|
| All sequences | `SELECT sequencename FROM pg_sequences ORDER BY sequencename` | **UNKNOWN** — No connection |

---

## Prisma Migration History

### `_prisma_migrations` Table

**Cannot be inspected.** PostgreSQL is not accessible.

| Check | SQL | Result |
|-------|-----|--------|
| Migration history | `SELECT * FROM _prisma_migrations ORDER BY started_at` | **UNKNOWN** — No connection |

### Migration Files on Disk

| Migration | Path | Type | Classification |
|-----------|------|------|---------------|
| 0001 | `.../migrations/0001_add_org_workspace_models/migration.sql` | Directory with migration.sql | OBSERVED |
| 0002 | `.../migrations/0002_add_ai_request_model/migration.sql` | Directory with migration.sql | OBSERVED |
| 0003 | `.../migrations/0003_enable_pg_trgm.sql` | Standalone SQL file | OBSERVED |

### Migration 0001 Contents

- Creates enums: `membership_role`, `membership_status`, `invitation_status`
- Creates tables: `organizations`, `workspaces`, `memberships`, `invitations`
- Creates indexes on all referenced columns
- Adds foreign keys between these tables

### Migration 0002 Contents

- Creates table: `ai_requests`
- Creates indexes on `organization_id`, `workspace_id`, `user_id`, `provider`, `model`, `created_at`

### Migration 0003 Contents

- Enables extension: `pg_trgm`
- Designed for trigram-based fuzzy text search on Project name/description

### Models Defined in schema.prisma vs Migration Files

| Model | schema.prisma | Migration File | Classification |
|-------|---------------|----------------|---------------|
| User | ✅ | ❌ | OBSERVED |
| PasswordHistory | ✅ | ❌ | OBSERVED |
| PasswordResetToken | ✅ | ❌ | OBSERVED |
| Organization | ✅ | ✅ 0001 | OBSERVED |
| Workspace | ✅ | ✅ 0001 | OBSERVED |
| Membership | ✅ | ✅ 0001 | OBSERVED |
| Invitation | ✅ | ✅ 0001 | OBSERVED |
| AiRequest | ✅ | ✅ 0002 | OBSERVED |
| PromptCategory | ✅ | ❌ | OBSERVED |
| Prompt | ✅ | ❌ | OBSERVED |
| PromptVersion | ✅ | ❌ | OBSERVED |
| PromptExecution | ✅ | ❌ | OBSERVED |
| KnowledgeDocument | ✅ | ❌ | OBSERVED |
| KnowledgeDocumentMetadataHistory | ✅ | ❌ | OBSERVED |
| KnowledgeDocumentOcr | ✅ | ❌ | OBSERVED |
| KnowledgeDocumentParse | ✅ | ❌ | OBSERVED |
| Project | ✅ | ❌ | OBSERVED |
| ActivityLog | ✅ | ❌ | OBSERVED |

### Summary: Migration Coverage

| Metric | Count | Classification |
|--------|-------|---------------|
| Models with migration files | 6 | OBSERVED |
| Models without migration files | 12 | OBSERVED |
| Enums with migration files | 3 | OBSERVED |
| Enums without migration files | 9 | OBSERVED |

---

## Schema vs Database Comparison

**Cannot be performed.** Database inspection is not possible.

| Comparison | Status | Classification |
|------------|--------|---------------|
| schema.prisma vs actual tables | Cannot compare | UNKNOWN |
| schema.prisma vs actual enums | Cannot compare | UNKNOWN |
| schema.prisma vs actual indexes | Cannot compare | UNKNOWN |
| schema.prisma vs migration history | Partially comparable (files only) | OBSERVED |

---

## Drift Inventory

**Drift cannot be assessed.** Only observable facts are listed below.

### Objects Only in schema.prisma (confirmed)

The following tables are defined in `schema.prisma` but have no corresponding migration file on disk:

```
users
password_history
password_reset_tokens
prompt_categories
prompts
prompt_versions
prompt_executions
knowledge_documents
knowledge_document_metadata_history
knowledge_document_ocr
knowledge_document_parse
projects
activity_logs
```

**Classification:** OBSERVED

### Objects Only in Database

**UNKNOWN** — Database cannot be inspected.

### Objects Existing in Both

**UNKNOWN** — Database cannot be inspected.

### Objects Impossible to Verify

| Item | Reason |
|------|--------|
| All database tables | No PostgreSQL connection |
| All database enums | No PostgreSQL connection |
| All database indexes | No PostgreSQL connection |
| `_prisma_migrations` contents | No PostgreSQL connection |
| Migration application status | No PostgreSQL connection |
| Schema drift | No PostgreSQL connection |

---

## Unknown Items

| Item | Reason | Classification |
|------|--------|---------------|
| Whether database has any tables | PostgreSQL not started | UNKNOWN |
| Whether `_prisma_migrations` exists | PostgreSQL not started | UNKNOWN |
| Whether migrations were applied | PostgreSQL not started | UNKNOWN |
| Which tables exist in database | PostgreSQL not started | UNKNOWN |
| Which enums exist in database | PostgreSQL not started | UNKNOWN |
| Which indexes exist in database | PostgreSQL not started | UNKNOWN |
| Whether database matches schema.prisma | PostgreSQL not started | UNKNOWN |
| Database version | PostgreSQL not started | UNKNOWN |
| Current database name | PostgreSQL not started | UNKNOWN |
| Current database user | PostgreSQL not started | UNKNOWN |

---

## Blocking Issues

| # | Issue | Impact | Classification |
|---|-------|--------|---------------|
| 1 | Docker not installed | Infrastructure cannot start | VERIFIED |
| 2 | PostgreSQL not accessible | All database commands fail | VERIFIED |
| 3 | Prisma cannot connect | `prisma migrate status` and `prisma db pull` return P1001 | VERIFIED |
| 4 | No container runtime | Cannot execute any `docker compose` commands | VERIFIED |

---

## Raw Command Outputs

### Command: `npx prisma migrate status`

```
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "atlas_ai_dev", schema "public" at "localhost:5432"
Error: P1001: Can't reach database server at `localhost:5432`

Please make sure your database server is running at `localhost:5432`.
```

### Command: `npx prisma db pull`

```
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "atlas_ai_dev", schema "public" at "localhost:5432"

- Introspecting based on datasource defined in prisma/schema.prisma
✖ Introspecting based on datasource defined in prisma/schema.prisma

Error: P1001

Can't reach database server at `localhost:5432`

Please make sure your database server is running at `localhost:5432`.
```

### Command: `docker --version`

```
zsh:1: command not found: docker
```

### Command: `docker compose version`

```
zsh:1: command not found: docker
```

---

## Final Status

Database discovery **could not be performed** because Docker is not installed.

### What Was Verified

| Status | Description |
|--------|-------------|
| ✅ Docker status | Docker not installed |
| ✅ Prisma CLI status | CLI works, cannot connect |
| ✅ Migration files | 3 files exist on disk |
| ✅ Schema file | schema.prisma exists with 18 models |
| ✅ Schema-coverage gap | 12 models lack migration files |

### What Remains Unknown

| Status | Description |
|--------|-------------|
| ❌ All database state | Every database object is UNKNOWN |
| ❌ Migration history | `_prisma_migrations` uninspectable |
| ❌ Schema alignment | schema.prisma vs database cannot be compared |

### Required Action

```
1. Install Docker Desktop for macOS Apple Silicon
   Download: https://www.docker.com/products/docker-desktop/
2. Start infrastructure:
   docker compose -f docker/docker-compose.yml up -d
3. Verify PostgreSQL:
   docker compose exec postgres pg_isready
4. Re-run database discovery:
   cd services/backend && npx prisma migrate status && npx prisma db pull
5. Inspect _prisma_migrations:
   docker compose exec -T postgres psql -U postgres atlas_ai_dev \
     -c "SELECT * FROM _prisma_migrations ORDER BY started_at"
```

---

*Report generated 2026-07-22.*
*Database discovery incomplete — blocked by missing Docker.*
