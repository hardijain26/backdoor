#!/usr/bin/env bash
# scripts/preflight.sh: Authoritative Pre-Commit / Pre-Push Gate
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================================================="
echo "BACKDOOR (backdoorv.1) - MANDATORY PREFLIGHT COMMIT GATE"
echo "================================================================="

echo "=== [GATE 1/7] TypeScript Static Verification ==="
npm run typecheck

echo "=== [GATE 2/7] Frontend Lint Verification ==="
npm run lint

echo "=== [GATE 3/7] Node.js Core Logic & Static Security Unit Tests ==="
npm run test:node

echo "=== [GATE 4/7] Jest Frontend Component & API Integration Tests ==="
npm run test:unit

echo "=== [GATE 5/7] PostgreSQL 16 Schema, RLS & Idempotency Checks ==="
if [[ "${PGHOST:-}" != "" && "${PGUSER:-}" != "" ]]; then
  bash scripts/db-check.sh
else
  echo "WARNING: PGHOST/PGUSER not set. Running static SQL policy verification..."
  node --experimental-strip-types --test tests/sql-policy-static.test.ts
fi

echo "=== [GATE 6/7] Playwright End-to-End User Journey Tests ==="
if [[ -n "${E2E_ALICE_EMAIL:-}" && -n "${E2E_ALICE_PASSWORD:-}" && -n "${E2E_BOB_EMAIL:-}" && -n "${E2E_BOB_PASSWORD:-}" && -n "${E2E_ALICE_DIRECTION:-}" ]]; then
  npm run test:e2e
else
  echo "INFO: E2E test credentials not set (E2E_ALICE_EMAIL, etc.). Skipping browser E2E test suite in local sandbox."
fi

echo "=== [GATE 7/7] Next.js Production Build Verification ==="
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://placeholder.supabase.co}" NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-placeholder}" npm run build

echo "================================================================="
echo ">>> ALL PREFLIGHT GATES PASSED. COMMIT AUTHORIZED. <<<"
echo "================================================================="
