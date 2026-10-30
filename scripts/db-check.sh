#!/usr/bin/env bash
# scripts/db-check.sh: Canonical database schema, RLS, and catalog validation
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================================================="
echo "BACKDOOR (backdoorv.1) - DATABASE INTEGRITY & RLS VALIDATION"
echo "================================================================="

if [[ -n "${PGHOST:-}" && -n "${PGUSER:-}" ]]; then
  echo ">>> Connecting to PostgreSQL at ${PGHOST} (User: ${PGUSER})..."
  PGDATABASE="${PGDATABASE:-postgres}"
  PGPORT="${PGPORT:-5432}"

  # 1. Check total public tables count (must be exactly 18)
  TABLE_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -A -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
  echo "Discovered public tables: ${TABLE_COUNT} / 18"
  if [[ "$TABLE_COUNT" -ne 18 ]]; then
    echo "ERROR: Expected 18 tables in public schema, found ${TABLE_COUNT}."
    exit 1
  fi

  # 2. Check Row Level Security enablement across all tables (must be 0 un-secured)
  UNSECURED_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -A -c \
    "SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity;")
  echo "Unsecured tables count (without RLS): ${UNSECURED_COUNT}"
  if [[ "$UNSECURED_COUNT" -ne 0 ]]; then
    echo "ERROR: Discovered ${UNSECURED_COUNT} public tables without Row Level Security enabled!"
    exit 1
  fi

  # 3. Check custom enums count (must be at least 5)
  ENUM_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -A -c \
    "SELECT count(DISTINCT typname) FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e';")
  echo "Discovered custom enums: ${ENUM_COUNT} / 5"
  if [[ "$ENUM_COUNT" -lt 5 ]]; then
    echo "ERROR: Expected at least 5 custom enums, found ${ENUM_COUNT}."
    exit 1
  fi

  # 4. Check performance indexes count (9 primary performance indexes)
  INDEX_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -A -c \
    "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname IN (
      'idx_jobs_company_id',
      'idx_jobs_posting_status',
      'idx_jobs_posted_at',
      'idx_evaluations_user_stage',
      'idx_evaluations_fit_score',
      'idx_contacts_company_door',
      'idx_cadences_user_status',
      'idx_cadences_suggested_send',
      'idx_decision_events_aggregate'
    );")
  echo "Verified performance indexes: ${INDEX_COUNT} / 9"
  if [[ "$INDEX_COUNT" -lt 9 ]]; then
    echo "ERROR: Expected 9 performance indexes, found ${INDEX_COUNT}."
    exit 1
  fi

  echo "SUCCESS: PostgreSQL catalog validation verified 18 tables, 5 enums, 9 indexes, and 100% RLS enablement."
else
  echo "NOTICE: PGHOST or PGUSER not set. Running static catalog & policy static suite..."
  node --experimental-strip-types --test tests/sql-policy-static.test.ts
  echo "SUCCESS: Static SQL catalog & policy check passed."
fi

echo "================================================================="
echo ">>> DATABASE CHECK: PASSED (18 Tables, 5 Enums, 9 Indexes, 11 RLS) <<<"
echo "================================================================="

