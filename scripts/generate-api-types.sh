#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC="${ROOT_DIR}/services/backend/openapi.json"
OUT="${ROOT_DIR}/packages/api/src/generated.ts"

if [ ! -f "${SPEC}" ]; then
  echo "OpenAPI spec not found at ${SPEC}" >&2
  exit 1
fi

echo "Generating API SDK types from ${SPEC}"
pnpm --filter @atlas/api exec openapi-typescript "${SPEC}" \
  --output "${OUT}" \
  --alphabetize \
  --export-type

echo "Generated ${OUT}"
