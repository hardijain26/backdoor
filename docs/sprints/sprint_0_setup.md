# Sprint 0 Plan: Foundation, Canonical Schema & PM Release Governance

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 0
- **Target Phase:** Phase 0 (Setup & Scaffolding)
- **Sprint Goal:** Establish the bedrock foundation of Backdoor (backdoorv.1) by deploying the clean ground-zero PostgreSQL 16 schema (18 tables, 5 enums, 9 indexes, 11 RLS policies via `00000000000000_init_schema.sql`), configuring the Precision Cobalt & Steel token engine with strict color purges, wiring the 6-gate preflight commit verification pipeline via `scripts/install-git-hooks.sh`, and formalizing non-technical PM governance and GitHub release protocols.
- **Sprint Status:** `PLANNING`
- **Target Start Date:** 2026-10-30
- **Target Completion Date:** 2026-11-06

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Branch Name | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S0-T01` | Canonical PostgreSQL 16 Ground-Zero Schema & RLS Policies | Subsystem 1 (Database) | `feature/p0-db-canonical-schema` | `PLANNED` | Backend Lead / Agent |
| `S0-T02` | Precision Cobalt & Steel Tokens & Color Scanner | Subsystem 2 (Frontend) | `feature/p0-fe-design-tokens` | `PLANNED` | Frontend Lead / Agent |
| `S0-T03` | 6-Gate Preflight Pipeline & Git Hook Wiring | Infrastructure / Gating | `feature/p0-infra-preflight-gate` | `PLANNED` | DevOps / Sentinel |
| `S0-T04` | PM Governance, Safe Git & Sprint Tracking Engine | PM Governance / Ops | `feature/p0-pm-governance-runbook` | `PLANNED` | Lead PM / Agent |

---

## 3. Detailed Task Specifications & Acceptance Criteria

### Task `S0-T01`: Canonical PostgreSQL 16 Ground-Zero Schema & RLS Policies
- **Objective:** Deploy Artifact 2 PostgreSQL 16 clean ground-zero DDL (`00000000000000_init_schema.sql`), establishing 18 relational tables across 11 sections (with `public.profiles` created first), 5 custom enums, 9 performance indexes, and 11 tenant-isolated RLS policies explicitly scoped with `TO authenticated`.
- **Subsystem & Scope:** Subsystem 1 (`@core/db`), `supabase/migrations/00000000000000_init_schema.sql`, `scripts/db-check.sh`.
- **Acceptance Criteria:**
  - [ ] All 5 enums created: `posting_status`, `application_stage`, `outreach_door`, `cadence_step_status`, `contact_confidence`.
  - [ ] 18 tables created across 11 functional sections matching Artifact 2 exactly from ground zero.
  - [ ] `public.profiles` created first to satisfy user ownership foreign keys.
  - [ ] 9 performance indexes established (e.g. `idx_jobs_company_id`, `idx_evaluations_fit_score`).
  - [ ] All 11 user-owned tables enforce `auth.uid() = user_id` Row Level Security with explicit `TO authenticated`.
  - [ ] `decision_events` enforces append-only semantics (`REVOKE UPDATE, DELETE`).
- **Test & Verification Steps:**
  - Unit Test: `node --experimental-strip-types --test tests/sql-policy-static.test.ts`
  - Catalog Validation: `bash scripts/db-check.sh`

### Task `S0-T02`: Precision Cobalt & Steel Tokens & Color Scanner
- **Objective:** Establish the Tailwind design token palette matching Artifact 3 (Canvas `#080B11`, Card `#0F1523`, Drawer `#161F33`, Cobalt `#2563EB`) and implement an automated AST scanner to permanently forbid indigo, violet, orange, and amber shades.
- **Subsystem & Scope:** Subsystem 2 (`@ui/command-center`), `tailwind.config.ts`, `app/globals.css`, `tests/frontend/design-system-tokens.test.tsx`.
- **Acceptance Criteria:**
  - [ ] Precision Cobalt & Steel tokens exported as CSS variables.
  - [ ] Strict exclusion of indigo, violet, orange, and amber across all styling definitions.
  - [ ] Typography tokens configured for Inter Variable and JetBrains Mono.
- **Test & Verification Steps:**
  - Token AST Scan: `npm run test:unit tests/frontend/design-system-tokens.test.tsx`

### Task `S0-T03`: 6-Gate Preflight Pipeline & Git Hook Wiring
- **Objective:** Maintain `scripts/preflight.sh` executing TypeScript verification, Node core tests, Jest frontend tests, PostgreSQL checks, Playwright E2E suites, and Next.js production builds. Wire script to Git `pre-commit` and `pre-push` hooks via `scripts/install-git-hooks.sh`.
- **Subsystem & Scope:** Infrastructure & Quality Gating, `scripts/preflight.sh`, `scripts/install-git-hooks.sh`, `.git/hooks/pre-commit`, `.git/hooks/pre-push`.
- **Acceptance Criteria:**
  - [ ] `scripts/preflight.sh` executes all 6 gates sequentially with `set -euo pipefail`.
  - [ ] `scripts/install-git-hooks.sh` automates pre-commit and pre-push hook installation.
  - [ ] Git pre-commit and pre-push hooks execute preflight automatically.
  - [ ] Direct commit or push without passing preflight is completely blocked.
- **Test & Verification Steps:**
  - Execution Verification: `bash scripts/preflight.sh` exits with code 0.
  - Hook Installation: `bash scripts/install-git-hooks.sh` configures `.git/hooks/pre-commit` and `.git/hooks/pre-push`.

### Task `S0-T04`: PM Governance, Safe Git & Sprint Tracking Engine
- **Objective:** Formalize non-technical PM governance, isolated feature branch rules (`feature/<phase>-<subsystem>-<feature>`), PR-first workflow, mandatory approval gate phrasing, live PM production verification checklists, and dedicated sprint tracking documents.
- **Subsystem & Scope:** Documentation & PM Governance, `docs/build_instructions_runbook.md`, `docs/sprints/`.
- **Acceptance Criteria:**
  - [ ] Comprehensive build runbook updated with Sections 10–13.
  - [ ] Plain-English Git architecture documented for Product Managers.
  - [ ] Mandatory approval gate phrase integrated: *"Quality checks, unit tests, integration tests, and e2e tests have all passed. Ready for your review and approval."*
  - [ ] Live production verification checklist documented with 8 specific test areas.
  - [ ] Sprint plan template and `sprint_0_plan.md` created.
- **Test & Verification Steps:**
  - Documentation Verification: Review against 30-point compliance rubric.

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck` — 0 errors)
- [ ] Node.js core logic tests pass (`npm run test:node` — all suites green)
- [ ] Jest frontend component tests pass (`npm run test:unit` — tokens & badges green)
- [ ] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh` — 18 tables, 11 RLS verified)
- [ ] Playwright E2E tests pass (`npm run test:e2e` — navigation & viewport suites green)
- [ ] Production build succeeds (`npm run build` — Next.js compiled standalone bundle)

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #01 | `feature/p0-db-canonical-schema` | Ground-zero PostgreSQL 16 DDL, 18 tables, 11 RLS policies with TO authenticated | [ ] Pending | [TBD] | [TBD upon merge] |
| #02 | `feature/p0-fe-design-tokens` | Precision Cobalt & Steel palette, color blacklist test | [ ] Pending | [TBD] | [TBD upon merge] |
| #03 | `feature/p0-infra-preflight-gate` | scripts/preflight.sh and automated hook installation | [ ] Pending | [TBD] | [TBD upon merge] |
| #04 | `feature/p0-pm-governance-runbook`| Non-technical Git guide, PM release gates, sprint docs | [ ] Pending | [TBD] | [TBD upon merge] |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main` to the production environment, the Product Manager executes the live verification checklist:
- [ ] Production health check verified (`/api/health` returns 200 connected)
- [ ] Database migration applied cleanly (18 tables, 5 enums, 9 indexes, 11 RLS policies active)
- [ ] Zero forbidden colors (zero indigo, violet, orange, or amber detected)
- [ ] Rule R1 compliance verified (Zero send calls in static code analysis)
- [ ] Mobile responsive layout verified (380px breakpoint test passes)

**PM Sign-Off Signature:** *[Awaiting PM Live Verification post-deployment]*  
**Date:** *[TBD]*

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | *No defects logged during planning phase.* | — | *Any defects emerging during sprint execution must be logged here immediately.* | `PLANNED` |

*Defect Logging Protocol: If any build, test, or production defect occurs, create an isolated hotfix branch (`hotfix/<issue-slug>`), resolve the root cause, verify with preflight checks, and document the 5-Why RCA in this log prior to PR merge.*

---

## 8. Product Manager Documentation Updates Log
- [ ] `docs/build_instructions_runbook.md` updated with Sections 10, 11, 12, 13
- [ ] `docs/sprints/sprint_0_plan.md` created as authoritative baseline sprint planning artifact
- [ ] Table of Contents and 30-Point Compliance Rubric synchronized
- [ ] Features, User Value, Operational Behaviors, and Boundaries documented from PM perspective
