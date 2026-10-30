# Sprint [N] Plan: [Sprint Title]

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint [N]
- **Target Phase:** Phase [N] ([Phase Name])
- **Sprint Goal:** [1-2 sentence executive description of what business and user value is unlocked in this sprint]
- **Vertical Slice Mandate:** Every feature picked in this sprint must be delivered as a complete end-to-end experience spanning database persistence, backend APIs, frontend UI, keyboard accessibility, and verification. No partial mock layers or disconnected endpoints are permitted.
- **Sprint Status:** `PLANNING` | `IN_PROGRESS` | `COMPLETED`
- **Target Start Date:** YYYY-MM-DD
- **Target Completion Date:** YYYY-MM-DD

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Branch Name | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S[N]-T01` | [Task Title] | [Subsystem Name] | `feature/p[N]-...` | `PLANNED` | [Role] |
| `S[N]-T02` | [Task Title] | [Subsystem Name] | `feature/p[N]-...` | `PLANNED` | [Role] |

---

## 3. Detailed Task Specifications & Acceptance Criteria

### Task `S[N]-T01`: [Task Title]
- **Objective:** [Clear description of what this task delivers]
- **Subsystem & Scope:** [Subsystem ID], [File Paths], [APIs]
- **Acceptance Criteria:**
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Test & Verification Steps:**
  - Unit Test: `npm run test:node tests/[test-name].test.ts`
  - Integration Test: `npm run test:unit tests/[component].test.tsx`
  - Preflight Verification: `bash scripts/preflight.sh`

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck` — 0 errors)
- [ ] Node.js core logic tests pass (`npm run test:node` — all suites green)
- [ ] Jest frontend component tests pass (`npm run test:unit` — all components green)
- [ ] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh`)
- [ ] Playwright E2E tests pass (`npm run test:e2e`)
- [ ] Production build succeeds (`npm run build`)

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #-- | `feature/p[N]-...` | [Brief summary] | [ ] Yes ("Quality checks...") | YYYY-MM-DD | `[hash]` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main` to the production environment, the Product Manager executes the live verification checklist:
- [ ] Production health check verified (`/api/health` returns 200 connected)
- [ ] Feature smoke test verified in production
- [ ] Telemetry & audit logging verified (`decision_events` recorded)

**PM Sign-Off Signature:** *[Awaiting PM Live Verification post-deployment]*  
**Date:** *[TBD]*

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | *No defects logged.* | — | — | `PLANNED` |

---

## 8. Product Manager Documentation Updates Log
- [ ] `docs/build_instructions_runbook.md` updated with relevant operational sections
- [ ] Features, User Value, Operational Behaviors, and Boundaries documented

