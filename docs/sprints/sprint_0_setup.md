# Sprint 0 Plan: Foundation, Canonical Schema & PM Release Governance

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 0
- **Target Phase:** Phase 0 (Setup & Scaffolding)
- **Sprint Goal:** Establish the bedrock foundation of Three Doors (backdoorv.1) by deploying the canonical PostgreSQL 16 schema (18 tables, 5 enums, 9 indexes, 11 RLS policies), configuring the Precision Cobalt & Steel token engine with strict color purges, wiring the 6-gate preflight commit verification pipeline, and formalizing non-technical PM governance and GitHub release protocols.
- **Sprint Status:** `COMPLETED`
- **Target Start Date:** 2026-10-28
- **Target Completion Date:** 2026-10-29

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Branch Name | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S0-T01` | Canonical PostgreSQL 16 Schema & RLS Policies | Subsystem 1 (Database) | `feature/p0-db-canonical-schema` | `DONE` | Backend Lead / Agent |
| `S0-T02` | Precision Cobalt & Steel Tokens & Color Scanner | Subsystem 2 (Frontend) | `feature/p0-fe-design-tokens` | `DONE` | Frontend Lead / Agent |
| `S0-T03` | 6-Gate Preflight Pipeline & Git Hook Wiring | Infrastructure / Gating | `feature/p0-infra-preflight-gate` | `DONE` | DevOps / Sentinel |
| `S0-T04` | PM Governance, Safe Git & Sprint Tracking Engine | PM Governance / Ops | `feature/p0-pm-governance-runbook` | `DONE` | Lead PM / Agent |

---

## 3. Detailed Task Specifications & Acceptance Criteria

### Task `S0-T01`: Canonical PostgreSQL 16 Schema & RLS Policies
- **Objective:** Deploy Artifact 2 PostgreSQL 16 DDL migration, replacing legacy schema with 18 relational tables across 11 sections, 5 enums, 9 performance indexes, and 11 tenant-isolated RLS policies.
- **Subsystem & Scope:** Subsystem 1 (`@core/db`), `supabase/migrations/20261029000000_backdoorv1_canonical_schema.sql`, `scripts/db-check.sh`.
- **Acceptance Criteria:**
  - [x] All 5 enums created: `posting_status`, `application_stage`, `outreach_door`, `cadence_step_status`, `contact_confidence`.
  - [x] 18 tables created across 11 functional sections matching Artifact 2 exactly.
  - [x] 9 performance indexes established (e.g. `idx_jobs_track_status`, `idx_evaluations_fit_stage`).
  - [x] All 11 user-owned tables enforce `auth.uid() = user_id` Row Level Security.
  - [x] `decision_events` enforces append-only semantics (`REVOKE UPDATE, DELETE`).
- **Test & Verification Steps:**
  - Unit Test: `node --experimental-strip-types --test tests/sql-policy-static.test.ts`
  - Catalog Validation: `bash scripts/db-check.sh`

### Task `S0-T02`: Precision Cobalt & Steel Tokens & Color Scanner
- **Objective:** Establish the Tailwind design token palette matching Artifact 3 (Canvas `#080B11`, Card `#0F1523`, Drawer `#161F33`, Cobalt `#2563EB`) and implement an automated AST scanner to permanently forbid indigo, violet, orange, and amber shades.
- **Subsystem & Scope:** Subsystem 2 (`@ui/command-center`), `tailwind.config.ts`, `app/globals.css`, `tests/frontend/design-system-tokens.test.tsx`.
- **Acceptance Criteria:**
  - [x] Precision Cobalt & Steel tokens exported as CSS variables.
  - [x] Strict exclusion of indigo, violet, orange, and amber across all styling definitions.
  - [x] Typography tokens configured for Inter Variable and JetBrains Mono.
- **Test & Verification Steps:**
  - Token AST Scan: `npm run test:unit tests/frontend/design-system-tokens.test.tsx`

### Task `S0-T03`: 6-Gate Preflight Pipeline & Git Hook Wiring
- **Objective:** Create `scripts/preflight.sh` executing TypeScript verification, Node core tests, Jest frontend tests, PostgreSQL checks, Playwright E2E suites, and Next.js production builds. Wire script to Git `pre-commit` and `pre-push` hooks.
- **Subsystem & Scope:** Infrastructure & Quality Gating, `scripts/preflight.sh`, `.git/hooks/pre-commit`, `.git/hooks/pre-push`.
- **Acceptance Criteria:**
  - [x] `scripts/preflight.sh` executes all 6 gates sequentially with `set -euo pipefail`.
  - [x] Git pre-commit and pre-push hooks execute preflight automatically.
  - [x] Direct commit or push without passing preflight is completely blocked.
- **Test & Verification Steps:**
  - Execution Verification: `bash scripts/preflight.sh` exits with code 0.

### Task `S0-T04`: PM Governance, Safe Git & Sprint Tracking Engine
- **Objective:** Formalize non-technical PM governance, isolated feature branch rules (`feature/<phase>-<subsystem>-<feature>`), PR-first workflow, mandatory approval gate phrasing, live PM production verification checklists, and dedicated sprint tracking documents.
- **Subsystem & Scope:** Documentation & PM Governance, `docs/build_instructions_runbook.md`, `docs/sprints/`.
- **Acceptance Criteria:**
  - [x] Comprehensive build runbook updated with Sections 10–13.
  - [x] Plain-English Git architecture documented for Product Managers.
  - [x] Mandatory approval gate phrase integrated: *"Quality checks, unit tests, integration tests, and e2e tests have all passed. Ready for your review and approval."*
  - [x] Live production verification checklist documented with 8 specific test areas.
  - [x] Sprint plan template and `sprint_0_plan.md` created.
- **Test & Verification Steps:**
  - Documentation Verification: Review against 30-point compliance rubric.

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [x] TypeScript verification clean (`npm run typecheck` — 0 errors)
- [x] Node.js core logic tests pass (`npm run test:node` — all suites green)
- [x] Jest frontend component tests pass (`npm run test:unit` — tokens & badges green)
- [x] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh` — 18 tables, 11 RLS verified)
- [x] Playwright E2E tests pass (`npm run test:e2e` — navigation & viewport suites green)
- [x] Production build succeeds (`npm run build` — Next.js compiled standalone bundle)

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #01 | `feature/p0-db-canonical-schema` | PostgreSQL 16 DDL migration, 18 tables, 11 RLS policies | [x] Yes ("Quality checks...") | 2026-10-28 | `a1f94c2` |
| #02 | `feature/p0-fe-design-tokens` | Precision Cobalt & Steel palette, color blacklist test | [x] Yes ("Quality checks...") | 2026-10-28 | `c48e910` |
| #03 | `feature/p0-infra-preflight-gate` | scripts/preflight.sh and pre-commit hook wiring | [x] Yes ("Quality checks...") | 2026-10-29 | `e8371bd` |
| #04 | `feature/p0-pm-governance-runbook`| Non-technical Git guide, PM release gates, sprint docs | [x] Yes ("Quality checks...") | 2026-10-29 | `7f4392a` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main`, the Product Manager executed the live verification checklist:
- [x] Production health check verified (`/api/health` returns 200 connected)
- [x] Database migration applied cleanly (18 tables, 5 enums, 9 indexes, 11 RLS policies active)
- [x] Zero forbidden colors (zero indigo, violet, orange, or amber detected)
- [x] Rule R1 compliance verified (Zero send calls in static code analysis)
- [x] Mobile responsive layout verified (380px breakpoint test passes)

**PM Sign-Off Signature:** *Hardi Jain (Lead Product Manager)*  
**Date:** 2026-10-29

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BUG-S0-01` | P2 | Legacy migration file contained deprecated `auth.users` foreign key syntax incompatible with Supabase local CLI. | `hotfix/s0-db-auth-fk-syntax` | Updated foreign key reference to standard `auth.users(id)` with `ON DELETE CASCADE`. Preflight re-executed clean. | `RESOLVED` |

---

## 8. Product Manager Documentation Updates Log
- [x] `docs/build_instructions_runbook.md` updated with Sections 10, 11, 12, 13 (2,578 lines total)
- [x] `docs/sprints/sprint_0_plan.md` created as authoritative baseline demonstration artifact
- [x] Table of Contents and 30-Point Compliance Rubric synchronized
- [x] Features, User Value, Operational Behaviors, and Boundaries documented from PM perspective
