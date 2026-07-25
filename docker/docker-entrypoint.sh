#!/bin/sh
set -e

echo "==> [entrypoint] Running prisma generate..."
npx prisma generate

echo "==> [entrypoint] Attempting prisma migrate deploy..."
if npx prisma migrate deploy 2>/dev/null; then
  echo "==> [entrypoint] Migrations applied successfully."
else
  echo "==> [entrypoint] No migration history found — syncing schema via prisma db push..."
  echo "==> [entrypoint] Note: This is expected on first startup. Create a baseline migration for production."
  npx prisma db push --accept-data-loss 2>&1 || {
    echo "ERROR: [entrypoint] Failed to sync database schema."
    echo "ERROR: [entrypoint] Ensure PostgreSQL is accessible at the configured DATABASE_URL."
    exit 1
  }
  echo "==> [entrypoint] Database schema synced via db push."
fi

exec node services/backend/dist/main.js
