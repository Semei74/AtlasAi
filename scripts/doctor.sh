#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

echo "=== Atlas AI — Doctor Check ==="
echo ""

# ─── Node.js ──────────────────────────────────────────────────────────
echo "── Node.js"

if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    pass "Node.js ${NODE_VER} (>=20)"
  else
    fail "Node.js ${NODE_VER} (<20) — upgrade to Node 20+"
  fi
else
  fail "Node.js not found — install Node 20+"
fi

# ─── pnpm ──────────────────────────────────────────────────────────────
echo ""
echo "── pnpm"

if command -v pnpm &>/dev/null; then
  PNPM_VER=$(pnpm -v)
  PNPM_MAJOR=$(echo "$PNPM_VER" | cut -d. -f1)
  if [ "$PNPM_MAJOR" -ge 10 ]; then
    pass "pnpm ${PNPM_VER} (>=10)"
  else
    fail "pnpm ${PNPM_VER} (<10) — upgrade to pnpm 10+"
  fi
else
  fail "pnpm not found — install pnpm 10+"
fi

# ─── Docker ────────────────────────────────────────────────────────────
echo ""
echo "── Docker"

if command -v docker &>/dev/null; then
  if docker info &>/dev/null; then
    pass "Docker daemon is running"
  else
    warn "Docker is installed but daemon is not running"
  fi
else
  warn "Docker not found — required for infrastructure and production deployment"
fi

if command -v docker-compose &>/dev/null || docker compose version &>/dev/null; then
  pass "Docker Compose is available"
else
  warn "Docker Compose not found"
fi

# ─── Prisma CLI ────────────────────────────────────────────────────────
echo ""
echo "── Prisma"

if [ -f "services/backend/node_modules/.bin/prisma" ] || command -v prisma &>/dev/null; then
  pass "Prisma CLI is available"
else
  warn "Prisma CLI not found — run 'pnpm install' in services/backend"
fi

# ─── Environment Variables ────────────────────────────────────────────
echo ""
echo "── Environment Variables"

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  pass ".env file exists"
else
  warn ".env file not found — copy from .env.example"
fi

REQUIRED_VARS=("DATABASE_URL" "REDIS_HOST" "STORAGE_ENDPOINT" "JWT_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -n "${!var:-}" ]; then
    pass "${var} is set"
  else
    warn "${var} is not set — required for runtime"
  fi
done

# ─── Database Connectivity ────────────────────────────────────────────
echo ""
echo "── Database"

DB_URL="${DATABASE_URL:-}"

if [ -n "$DB_URL" ]; then
  if command -v psql &>/dev/null; then
    DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\(.*\):.*/\1/p')
    DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    if [ -z "$DB_PORT" ]; then DB_PORT="5432"; fi

    if command -v nc &>/dev/null; then
      if nc -z -w5 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        pass "Database reachable at ${DB_HOST}:${DB_PORT}"
      else
        fail "Cannot reach database at ${DB_HOST}:${DB_PORT}"
      fi
    else
      warn "nc not found — skipping database connectivity check"
    fi
  else
    warn "psql not found — skipping database connectivity check"
  fi
else
  warn "DATABASE_URL not set — skipping database connectivity check"
fi

# ─── Summary ──────────────────────────────────────────────────────────
echo ""
echo "── Summary"
echo "  Check complete. Review any warnings (⚠) and fix failures (✗) before proceeding."
