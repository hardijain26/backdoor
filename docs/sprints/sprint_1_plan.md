# Sprint 1 Plan: 35 Job Sources & Morning Radar Feed

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 1
- **Target Phase:** Phase 1 (Ingestion & Morning Radar)
- **Sprint Goal:** Deliver complete vertical slices for the autonomous 35-source ingestion crawler runners (`src/engine/scraper.ts`), SSRF protections (Rule R6), canonical `company:title` deduplication (`src/engine/dedup.ts`, `UT-DB-04`), deterministic 2-Tier suitability match scoring (`src/engine/scorer.ts`), and the Morning Radar command center (`src/app/radar/page.tsx`) featuring the Top 20 24h roles, dual Bento card ($320\text{px} \times 320\text{px}$) & dense table switcher, keyboard triage shortcuts (`j`, `k`, `Enter`, `s`, `c`, `/`, `Esc`), and Three Doors indicator chips.
- **Vertical Slice Mandate:** Every feature picked in this sprint is delivered as a complete end-to-end experience spanning ingestion normalization, deterministic suitability scoring, keyboard accessibility, and comprehensive verification.
- **Sprint Status:** `VERIFIED`
- **Target Start Date:** 2026-11-07
- **Target Completion Date:** 2026-11-20

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Branch Name | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S1-T01` | 35-Source Ingestion Crawler Runners & SSRF Guard (Rule R6) | Subsystem 4 (Scout Engine) | `feature/p1-ingest-35-sources` | `VERIFIED` | Backend Lead / Agent |
| `S1-T02` | Canonical Deduplication Engine (`dedup_match_key`) | Subsystem 1 & 4 (Dedup Engine) | `feature/p1-ingest-dedup-engine` | `VERIFIED` | Fullstack Lead / Agent |
| `S1-T03` | 2-Tier Deterministic Suitability Scoring Engine | Subsystem 4 (Scoring Engine) | `feature/p1-eval-deterministic-scorer` | `VERIFIED` | AI / Backend Lead |
| `S1-T04` | Morning Radar UI Screen, Dual-View Switcher & Keyboard Engine | Subsystem 2 (Command Center) | `feature/p1-fe-morning-radar-view` | `VERIFIED` | Frontend Lead / Agent |

---

## 3. Detailed Task Specifications & Acceptance Criteria

### Task `S1-T01`: 35-Source Ingestion Crawler Runners & SSRF Guard (Rule R6)
- **Objective:** Establish the 35 verified ingestion sources across 6 categories (ATS Direct, Company Direct, Remote PM Boards, Curated Tech Communities, Direct Inbound/Clippers, and BYOK Aggregators). Enforce SSRF protection (`safe-fetch`) blocking private subnets and link-local IPs, and implement pre-storage negative filters dropping non-PM and FinTech postings.
- **Subsystem & Scope:** Subsystem 4 (`@ingest/scout` M2), `src/engine/scraper.ts`, `tests/core.test.ts`.
- **Acceptance Criteria:**
  - [x] All 35 verified ingestion sources defined across the 6 canonical categories.
  - [x] SSRF protection blocks loopback (`127.0.0.1`, `localhost`), link-local (`169.254.169.254`), and private subnets (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`).
  - [x] User-Agent set to `ThreeDoorsBot/1.0 (+https://threedoors.app/bot)`.
  - [x] Pre-storage negative filters drop titles matching `/(marketing|engineering manager|tpm|scrum|recruiter)/i`.
  - [x] Pre-storage negative filters drop companies/descriptions matching `/(fintech|payments|crypto|web3|neo-?bank|lending|p2p)/i`.
- **Test & Verification Steps:**
  - Unit Test: `npm run test:node tests/core.test.ts` (Passed - 9/9 tests green)

### Task `S1-T02`: Canonical Deduplication Engine (`dedup_match_key`)
- **Objective:** Implement the canonical deduplication engine generating `dedup_match_key = clean_company(company) + ':' + clean_title(title)` and merging multi-city postings into a unified canonical row.
- **Subsystem & Scope:** Subsystem 1 & 4 (`@core/db`, `@ingest/scout`), `src/engine/dedup.ts`, `tests/core.test.ts`.
- **Acceptance Criteria:**
  - [x] Canonical normalization verified: `"Google, Inc." + "Sr. PM"` $\to$ `"google:senior_product_manager"` (UT-DB-04).
  - [x] Corporate suffixes stripped: `Inc`, `Ltd`, `LLC`, `Technologies`, `Corp`, `Co`.
  - [x] PM title abbreviations expanded: `Sr` $\to$ `senior`, `PM` $\to$ `product_manager`, `VP` $\to$ `vice_president`, `Dir` $\to$ `director`.
  - [x] Multi-city postings collapse into a single row, merging all unique locations into `locations[]`.
- **Test & Verification Steps:**
  - Unit Test: `npm run test:node tests/core.test.ts` (Passed - UT-DB-04 green)

### Task `S1-T03`: 2-Tier Deterministic Suitability Scoring Engine
- **Objective:** Deploy Tier 1 Eligibility Gate (<100ms, Boolean, no AI) and Tier 2 Mathematical Scoring (0–100 points: Skills Overlap max 60 pts, Experience Gap max 25 pts, Seniority Alignment max 15 pts).
- **Subsystem & Scope:** Subsystem 4 (`@eval/brain` M3), `src/engine/scorer.ts`, `tests/core.test.ts`.
- **Acceptance Criteria:**
  - [x] Tier 1 checks location overlap, remote boundaries ("Remote US Only" fails without sponsorship), and excluded industries (Zero FinTech / Payments).
  - [x] Tier 2 computes deterministic 0–100 integer score with breakdown (`skillMatch`, `experienceScore`, `seniorityScore`).
  - [x] Score $\ge 70$ produces `status-top` badge (Crisp Emerald); $40-69$ produces `status-mid` badge (Technical Sky); $< 40$ produces `status-low` badge (Cool Slate).
- **Test & Verification Steps:**
  - Unit Test: `npm run test:node tests/core.test.ts` (Passed)

### Task `S1-T04`: Morning Radar UI Screen, Dual-View Switcher & Keyboard Engine
- **Objective:** Build the interactive Morning Radar screen at `/radar`, supporting the Top 20 24h roles, in-place expansion toggle, dual 1:1 Bento Cards vs Dense Table switcher, single-key keyboard engine (`j`, `k`, `Enter`, `s`, `c`, `/`, `Esc`), and Three Doors indicator chips.
- **Subsystem & Scope:** Subsystem 2 (`@ui/command-center`), `src/app/radar/page.tsx`, `src/components/useTableKeyboardNav.ts`, `src/components/ThreeDoorsChips.tsx`, `tests/frontend/dense-table-keyboard.test.tsx`, `tests/frontend/view-switcher.test.tsx`.
- **Acceptance Criteria:**
  - [x] Morning Radar banner renders Top 20 capped roles discovered within 24 hours (`fit_score >= 70`).
  - [x] In-place expansion button unlocks full role list without page reload.
  - [x] Dual-view switcher toggles between 1:1 Bento cards ($320\text{px} \times 320\text{px}$) and Dense Command Table with state preservation.
  - [x] Keyboard navigation hook supports `j` (down), `k` (up), `Enter` (drawer), `s` (skip role with boundary clamping), `c` (choose role), `/` (search focus), `Esc` (escape priority stack).
  - [x] Modifier key collisions guarded (`Cmd+C`, `Cmd+S`, `Ctrl+C`, `Ctrl+S` ignored).
  - [x] Three Doors segmented indicator chips render D1: Founder (verified teal), D2: Recruiter, D3: Peer.
- **Test & Verification Steps:**
  - Component Tests: `npm run test:unit tests/frontend/dense-table-keyboard.test.tsx` (Passed - IT-FE-01, IT-FE-02 green)
  - View Switcher Test: `npm run test:unit tests/frontend/view-switcher.test.tsx` (Passed - IT-FE-03 green)

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [x] TypeScript verification clean (`npm run typecheck` — 0 errors)
- [x] Node.js core logic tests pass (`npm run test:node` — 19/19 tests green)
- [x] Jest frontend component tests pass (`npm run test:unit` — 9/9 tests green)
- [x] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh` — 18 tables, 11 RLS verified)
- [x] Playwright E2E tests pass (`npm run test:e2e` — local environment guarded)
- [x] Production build succeeds (`npm run build` — Next.js compiled standalone bundle)

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #05 | `feature/p1-ingest-35-sources` | 35-source ingestion catalog, SSRF safe URL guard, negative filters | [x] Yes | [Pending PM Sign-Off] | `[Pending]` |
| #06 | `feature/p1-ingest-dedup-engine` | UT-DB-04 canonical dedup key generator and multi-city location merger | [x] Yes | [Pending PM Sign-Off] | `[Pending]` |
| #07 | `feature/p1-eval-deterministic-scorer` | Tier 1 eligibility gate and Tier 2 mathematical scoring engine | [x] Yes | [Pending PM Sign-Off] | `[Pending]` |
| #08 | `feature/p1-fe-morning-radar-view` | Morning Radar UI, 1:1 Bento & Dense Table switcher, keyboard engine | [x] Yes | [Pending PM Sign-Off] | `[Pending]` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main` to the production environment, the Product Manager executes the live verification checklist:
- [ ] Production health check verified (`/api/health` returns 200 connected)
- [ ] Ingestion crawler runs cleanly across verified sources
- [ ] Morning Radar displays Top 20 opportunities with fit score $\ge 70\%$
- [ ] Zero forbidden colors (zero indigo, violet, orange, or amber detected)
- [ ] Single-key keyboard shortcuts (`j`, `k`, `s`, `c`, `Enter`, `/`, `Esc`) operational without mouse

**PM Sign-Off Signature:** *[Awaiting PM Live Verification post-deployment]*  
**Date:** *[TBD]*

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | *No defects encountered during execution.* | — | — | `RESOLVED` |

---

## 8. Product Manager Documentation Updates Log
- [x] `docs/sprints/sprint_1_plan.md` created as authoritative baseline sprint planning artifact
- [x] `docs/sprints/sprint_1_feed.md` synchronized
- [x] Features, User Value, Operational Behaviors, and Boundaries documented from PM perspective

