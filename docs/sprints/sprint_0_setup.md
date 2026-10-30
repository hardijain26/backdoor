# Sprint 0 Plan: Foundation, Canonical Schema & PM Release Governance

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 0
- **Target Phase:** Phase 0 (Setup & Scaffolding)
- **Sprint Goal:** Establish the bedrock foundation of Backdoor (backdoorv.1) by deploying the clean ground-zero PostgreSQL 16 schema (18 tables, 5 enums, 9 indexes, 11 RLS policies via `00000000000000_init_schema.sql`), configuring the Precision Cobalt & Steel token engine with strict color purges, wiring the 6-gate preflight commit verification pipeline via `scripts/install-git-hooks.sh`, and formalizing non-technical PM governance and GitHub release protocols.
- **Vertical Slice Mandate:** Every foundation component in this sprint is deployed end-to-end: database migrations, static RLS validation, Tailwind CSS tokens and AST scanners, preflight gates, and PM release governance.
- **Sprint Status:** `CLOSED & ARCHIVED`
- **Target Start Date:** 2026-10-30
- **Target Completion Date:** 2026-10-30

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Branch Name | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S0-T01` | Canonical PostgreSQL 16 Ground-Zero Schema & RLS Policies | Subsystem 1 (Database) | `feature/p0-db-canonical-schema` | `VERIFIED` | Backend Lead / Agent |
| `S0-T02` | Precision Cobalt & Steel Tokens & Color Scanner | Subsystem 2 (Frontend) | `feature/p0-fe-design-tokens` | `VERIFIED` | Frontend Lead / Agent |
| `S0-T03` | 6-Gate Preflight Pipeline & Git Hook Wiring | Infrastructure / Gating | `feature/p0-infra-preflight-gate` | `VERIFIED` | DevOps / Sentinel |
| `S0-T04` | PM Governance, Safe Git & Sprint Tracking Engine | PM Governance / Ops | `feature/p0-pm-governance-runbook` | `VERIFIED` | Lead PM / Agent |

---

## 3. Detailed Task Specifications & Acceptance Criteria

### Task `S0-T01`: Canonical PostgreSQL 16 Ground-Zero Schema & RLS Policies
- **Objective:** Deploy Artifact 2 PostgreSQL 16 clean ground-zero DDL (`supabase/migrations/00000000000000_init_schema.sql`), establishing 18 relational tables across 11 sections (with `public.profiles` created first), 5 custom enums, 9 performance indexes, and 11 tenant-isolated RLS policies explicitly scoped with `TO authenticated`.
- **Subsystem & Scope:** Subsystem 1 (`@core/db`), `supabase/migrations/00000000000000_init_schema.sql`, `database/schema.sql`, `scripts/db-check.sh`, `tests/sql-policy-static.test.ts`.
- **Acceptance Criteria:**
  - [x] All 5 enums created: `posting_status_enum`, `application_stage_enum`, `outreach_door_enum`, `cadence_step_status_enum`, `contact_confidence_enum`.
  - [x] 18 tables created across 11 functional sections matching Artifact 2 exactly from ground zero.
  - [x] `public.profiles` created first to satisfy user ownership foreign keys.
  - [x] 9 performance indexes established (e.g. `idx_jobs_company_id`, `idx_evaluations_fit_score`).
  - [x] All 11 user-owned tables enforce `auth.uid() = user_id` Row Level Security with explicit `TO authenticated`.
  - [x] `decision_events` enforces append-only semantics (`REVOKE UPDATE, DELETE`).
- **Test & Verification Steps:**
  - Unit Test: `node --experimental-strip-types --test tests/sql-policy-static.test.ts` (Passed - 8/8 tests green)
  - Catalog Validation: `bash scripts/db-check.sh` (Passed)

### Task `S0-T02`: Precision Cobalt & Steel Tokens & Color Scanner
- **Objective:** Establish the Tailwind design token palette matching Artifact 3 (Canvas `#080B11`, Card `#0F1523`, Drawer `#161F33`, Cobalt `#2563EB`) and implement an automated AST scanner to permanently forbid indigo, violet, orange, and amber shades.
- **Subsystem & Scope:** Subsystem 2 (`@ui/command-center`), `tailwind.config.ts`, `src/app/globals.css`, `tests/frontend/design-system-tokens.test.tsx`.
- **Acceptance Criteria:**
  - [x] Precision Cobalt & Steel tokens exported as CSS variables in `src/app/globals.css`.
  - [x] Strict exclusion of indigo, violet, orange, and amber across all styling definitions and source code.
  - [x] Typography tokens configured for Inter Variable (`font-sans`) and JetBrains Mono (`font-mono`).
  - [x] High-contrast WCAG AAA ratio verified (>= 7.0:1 for `--text-primary` on `--bg-canvas`).
  - [x] Match score badge style mappings verified (>=70 Emerald, 40-69 Sky, <40 Slate).
- **Test & Verification Steps:**
  - Token AST Scan: `npm run test:unit tests/frontend/design-system-tokens.test.tsx` (Passed - 4/4 tests green)

### Task `S0-T03`: 6-Gate Preflight Pipeline & Git Hook Wiring
- **Objective:** Maintain `scripts/preflight.sh` executing TypeScript verification, Node core tests, Jest frontend tests, PostgreSQL checks, Playwright E2E suites, and Next.js production builds. Wire script to Git `pre-commit` and `pre-push` hooks via `scripts/install-git-hooks.sh`.
- **Subsystem & Scope:** Infrastructure & Quality Gating, `scripts/preflight.sh`, `scripts/install-git-hooks.sh`, `.git/hooks/pre-commit`, `.git/hooks/pre-push`.
- **Acceptance Criteria:**
  - [x] `scripts/preflight.sh` executes all 6 gates sequentially with `set -euo pipefail`.
  - [x] `scripts/install-git-hooks.sh` automates pre-commit and pre-push hook installation.
  - [x] Git pre-commit and pre-push hooks execute preflight automatically.
  - [x] Direct commit or push without passing preflight is completely blocked.
- **Test & Verification Steps:**
  - Execution Verification: `bash scripts/preflight.sh` exits with code 0 (All 6 gates green).
  - Hook Installation: `bash scripts/install-git-hooks.sh` configures `.git/hooks/pre-commit` and `.git/hooks/pre-push`.

### Task `S0-T04`: PM Governance, Safe Git & Sprint Tracking Engine
- **Objective:** Formalize non-technical PM governance, isolated feature branch rules (`feature/<phase>-<subsystem>-<feature>`), PR-first workflow, mandatory approval gate phrasing, live PM production verification checklists, and dedicated sprint tracking documents.
- **Subsystem & Scope:** Documentation & PM Governance, `docs/build_instructions_runbook.md`, `docs/sprints/`.
- **Acceptance Criteria:**
  - [x] Comprehensive build runbook updated with Sections 10–13.
  - [x] Plain-English Git architecture documented for Product Managers.
  - [x] Mandatory approval gate phrase integrated: *"Quality checks, unit tests, integration tests, and e2e tests have all passed. Ready for your review and approval."*
  - [x] Live production verification checklist documented with 8 specific test areas.
  - [x] Sprint plan template (`template_sprint_plan.md`) and `sprint_0_plan.md` created.
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
| #06 | `feature/p0-db-canonical-schema` | Ground-zero PostgreSQL 16 DDL, 18 tables, 11 RLS policies with TO authenticated, static policy test & db-check.sh | [x] Yes | 2026-10-30 | `a30989b` |
| #04 | `feature/p0-fe-design-tokens` | Precision Cobalt & Steel palette, CSS variables, AST color blacklist scanner | [x] Yes | 2026-10-30 | `63dc5eb` |
| #02 | `feature/p0-infra-preflight-gate` | scripts/preflight.sh and automated git hook wiring | [x] Yes | 2026-10-30 | `c06fa02` |
| #03 | `feature/p0-pm-governance-runbook`| Non-technical Git guide, PM release gates, sprint docs & templates | [x] Yes | 2026-10-30 | `99c57fa` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main` to the production environment, the Product Manager executes the live verification checklist:
- [x] Production health check verified (`/api/health` returns 200 connected)
- [x] Database migration applied cleanly (18 tables, 5 enums, 9 indexes, 11 RLS policies active)
- [x] Zero forbidden colors (zero indigo, violet, orange, or amber detected)
- [x] Rule R1 compliance verified (Zero send calls in static code analysis)
- [x] Mobile responsive layout verified (380px breakpoint test passes)

**PM Sign-Off Signature:** Hardi Jain (Solo Full-Stack PM — Verified in Production)  
**Date:** 2026-10-30

---

## 7. Defects, Blockers & Incident Resolution Log

### [BUG-S0-01] Automated Quality Gate Timeout (Frontend Linting in CI)
- **Customer / Business Impact:** Updates to the system were temporarily halted because our automated release pipeline stalled and failed to complete deployment checks.
- **Why It Happened:** The code quality inspector ran in an interactive mode that expected someone to click an option, which is impossible in an automated server environment without a human terminal.
- **How It Was Resolved:** We provided the system with a permanent, pre-set configuration file (`.eslintrc.json`) so it automatically knows which rules to apply without stopping to ask.
- **Guardrail Added:** Added this check into our local mandatory pre-flight protocol (`scripts/preflight.sh` Gate 2), ensuring the automated inspector passes cleanly before any engineer can submit code.

### [BUG-S0-02] Automated Test Runner File Discovery Mismatch
- **Customer / Business Impact:** The continuous delivery pipeline falsely reported a test failure, delaying the verification of recent feature work.
- **Why It Happened:** The test runner was configured with an outdated directory search pattern (`tests/**/*.test.js`) and failed to discover test suites located in `tests/*.test.ts` / `tests/*.test.js` under Linux environments.
- **How It Was Resolved:** We updated the test runner's directory instructions in `package.json` so it scans and executes tests regardless of file nesting and type syntax.
- **Guardrail Added:** The automated build pipeline now runs the exact unified command that runs on developer laptops (`npm run test:node`), eliminating discrepancies between local testing and production checks.

### [BUG-S0-03] Direct Code Promotion Bypassing Review Isolation
- **Customer / Business Impact:** Multiple features across the database, user interface, and data collection engines were bundled into a single release package, making changes difficult to trace and audit.
- **Why It Happened:** A signal intended for local milestone sign-off was inadvertently applied directly to the live production branch, skipping the standard peer-review checkpoint.
- **How It Was Resolved:** We segmented the entire release into dedicated, single-responsibility feature branches (`feature/p0-db-canonical-schema`, `feature/p0-fe-design-tokens`, `feature/p0-infra-preflight-gate`, `feature/p0-pm-governance-runbook`) and verified each component individually through automated quality gates.
- **Guardrail Added:** Branch protection rules and strict separation of review environments were reinforced so no changes can reach production without explicit peer review and passing all automated safety checks.

### [BUG-S0-04] Release Script Branch Merge Conflict (`scripts/preflight.sh`)
- **Customer / Business Impact:** Pull requests for newly developed features were momentarily blocked from merging due to conflicting instructions in our pre-flight verification script.
- **Why It Happened:** Two parallel engineering tracks independently improved the same safety script: one added safety checks for offline database tests, while the other adjusted general test routines. When merging, the system couldn't decide which rule to prioritize.
- **How It Was Resolved:** We unified both improvements, ensuring the safety script smartly checks if database tests are present on the current branch before trying to run them (`elif [ -f tests/sql-policy-static.test.ts ]`).
- **Guardrail Added:** Automated merge verification was added to our local pre-flight gates to detect and resolve script discrepancies before opening pull requests.

---

## 8. Product Manager Documentation Updates Log
- [x] `docs/build_instructions_runbook.md` updated with Sections 10, 11, 12, 13
- [x] `docs/sprints/sprint_0_plan.md` created as authoritative baseline sprint planning artifact
- [x] `docs/sprints/template_sprint_plan.md` created for reusable sprint planning
- [x] Table of Contents and 30-Point Compliance Rubric synchronized
- [x] Features, User Value, Operational Behaviors, and Boundaries documented from PM perspective
