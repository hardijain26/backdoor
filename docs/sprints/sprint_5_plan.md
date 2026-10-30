# Sprint 5 Plan: System Observability, Settings Vault, Chrome Clipper & Production Hardening

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 5
- **Target Phase:** Production Hardening & Fleet Observability
- **Sprint Goal:** Deliver complete, verified end-to-end vertical slices for the 35-source health monitoring dashboard (`/health`), encrypted Settings & BYOK vault (`/settings`), Chrome Extension 1-click job clipper (`extension/clipper.js`), downstream Google Sheet async mirroring worker, mobile $380\text{px}$ responsive hardening, and comprehensive end-to-end audit compliance (clauses C-01 to C-30).
- **Vertical Slice Mandate:** Every feature picked in this sprint must be delivered as a complete end-to-end experience spanning database schema, backend APIs, business logic engines, frontend UI components, browser extension integration, and live verification. No partial mock layers or disconnected endpoints are permitted.
- **Sprint Status:** `PLANNING`
- **Target Start Date:** 2027-01-02
- **Target Completion Date:** 2027-01-15

---

## 2. Planned Features Breakdown: Backend vs. Frontend Task Allocation

| Task ID | Feature Title | Backend Deliverables | Frontend Deliverables | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S5-T01` | 35-Source Fleet Health & Observability Dashboard (`/health`) | Telemetry collector from `sources` & `source_runs`, manual test runner API | 35-source matrix, status pills, 7-day sparklines, raw error traces, Radar banner | `PLANNED` | Fullstack Lead |
| `S5-T02` | Encrypted Settings Workspace & BYOK Key Vault (`/settings`) | AES-256 / pgcrypto secrets vault, negative filter regex engine, OAuth refresher | Tabbed settings UI, source toggles (1–35), masked BYOK vault, OAuth status pill | `PLANNED` | Fullstack Lead |
| `S5-T03` | Chrome Extension Job Clipper (`extension/clipper.js`) | Authenticated clipper ingest endpoint (`/api/ingest/universal`), instant scoring | Content script DOM extractors (LinkedIn, Greenhouse, Lever, etc.), 1-click popup UI | `PLANNED` | Extension Lead |
| `S5-T04` | Asynchronous Google Sheet Mirroring Worker & Audit Telemetry | Batch sync worker with exponential backoff, conversion funnel telemetry calculator | Telemetry conversion chart on `/health`, manual "Sync Now" CTA button | `PLANNED` | Fullstack Lead |
| `S5-T05` | Mobile Responsive Adaptation ($380\text{px}$ Breakpoint Support) | Optimized mobile payloads, lightweight card projections for low bandwidth | Mobile drawer navigation, stacked 1-col Bento cards, full-width drawer, 0 h-scroll | `PLANNED` | Frontend Lead |
| `S5-T06` | Full Compliance Audit, Playwright E2E Suite & Release Readiness | Static security AST checks (0 send calls, RLS audit, immutable log checks) | AST color scan (0 forbidden hues), full-journey automated Playwright E2E suite | `PLANNED` | QA / Sentinel |

---

## 3. Detailed Feature Specifications: Backend, Frontend & End-to-End User Experience

### Feature `S5-T01`: 35-Source Fleet Health & Observability Dashboard (`/health`)

#### Backend Tasks
- Build telemetry query service pulling real-time metrics from `sources` and `source_runs` PostgreSQL tables.
- Implement `/api/health/test-source` endpoint allowing on-demand execution of individual scrapers.
- Build scraper anomaly detector: if any enabled source encounters 3 consecutive failures, flag system status as degraded.

#### Frontend Tasks
- Deliver `/health` dashboard page displaying all 35 verified sources grouped into ATS, Remote Boards, Aggregators, and BYOK.
- Render status pills (`HEALTHY` Emerald, `FAILED` Crimson, `SKIPPED: NO KEY` Slate) with last execution timestamps.
- Render 7-day ingestion volume sparkline/bar charts for each source.
- Build collapsible error drawer rendering raw error messages and stack traces upon clicking a failed source.
- Add persistent, dismissible alert banner on `/discover` (Morning Radar) whenever an enabled source is down.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate opens `/health` to check scraping status. A failed scraper row is highlighted with a clear red pill. Clicking the row displays the exact stack trace and a "Test Source Now" button. Testing resolves the transient error and updates the status pill to green across the app.
- **Verification:** `npm run test:node tests/source-health-telemetry.test.ts` and `npm run test:unit tests/frontend/source-health-page.test.tsx`.

---

### Feature `S5-T02`: Encrypted Settings Workspace & BYOK Key Vault (`/settings`)

#### Backend Tasks
- Implement AES-256 / pgcrypto encryption layer for storing sensitive BYOK credentials (Apify, Hunter, Apollo, Groq, Gemini) in database.
- Build negative filtering engine: matches incoming postings against excluded companies list, excluded title regex, and blocked industries (`FinTech`, `Payments`).
- Implement dynamic tracks management API enabling user to customize track weights without database migrations.
- Implement Google OAuth token status checker and refresh handler.
- Implement User Location & Timezone preference endpoint (`PATCH /api/settings/profile`): stores user's home country and state/province to resolve their canonical IANA timezone for all cadence delivery window calculations.

#### Frontend Tasks
- Deliver tabbed `/settings` workspace: (1) Source Toggles, (2) Negative Filter Rules, (3) Dynamic Tracks, (4) Google Connection, (5) BYOK Secrets Vault, (6) Profile & Timezone.
- Build Candidate Location & Timezone card: dropdown inputs for Country and State/Province with auto-detected browser timezone fallback, displaying resolved IANA timezone (e.g. `Asia/Kolkata`, `America/New_York`, `Europe/London`).
- Build source toggle list with individual on/off switches for sources 1–35.
- Build masked password inputs for BYOK keys with "Show/Hide" toggle and validation test buttons.
- Display Google OAuth connection card with connected Gmail address, active token lifespan, and "Reconnect" button.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate navigates to `/settings`, sets their Country ("India") and State ("Karnataka"), and pastes their Apollo.io API key. The location resolves to `Asia/Kolkata`. When reviewing an outreach draft to a London-based recruiter, the cadence engine computes 09:15 AM London working hours and displays the dispatch window in the candidate's local time (`Tue 14:45 IST`). Negative filter rules and encrypted keys update instantly.
- **Verification:** `npm run test:node tests/settings-encryption.test.ts` and `npm run test:unit tests/frontend/settings-workspace.test.tsx`.

---

### Feature `S5-T03`: Chrome Extension Job Clipper (`extension/clipper.js`)

#### Backend Tasks
- Expose authenticated endpoint `/api/ingest/universal` accepting direct DOM extraction payloads from Chrome extension.
- Validate JWT session tokens passed by extension; match extracted job against `dedup_match_key`.
- Trigger immediate Tier 1 & 2 scoring upon ingest, creating new `jobs` record and logging to `decision_events`.

#### Frontend & Browser Extension Tasks
- Build `extension/clipper.js` content script with DOM parsers for LinkedIn, Greenhouse, Lever, Workday, and Indeed.
- Build browser extension popup UI displaying detected job title, company name, and single-click "Add to Backdoor" button.
- Show instant browser toast notification with fit score upon ingestion and direct hyperlink to open role in Backdoor.

#### End-to-End User Experience & Verification
- **User Journey:** While browsing LinkedIn, candidate spots an intriguing role and clicks the Backdoor extension icon. The extension extracts the job title, company, and JD in 1 click. Candidate clicks "Add to Backdoor", and a toast confirms: "Job Saved (91% FIT)". Clicking the toast opens the role directly in Backdoor's Dossier Drawer.
- **Verification:** `npm run test:node tests/extension-clipper.test.ts`.

---

### Feature `S5-T04`: Asynchronous Google Sheet Mirroring Worker & Audit Telemetry

#### Backend Tasks
- Implement asynchronous mirror worker batching PostgreSQL mutations across `jobs`, `applications`, and `contacts` to the user's private Google Sheet.
- Implement exponential backoff and rate limiting to prevent Google Sheets API 429 quota errors.
- Build audit telemetry engine querying `decision_events` to compute conversion funnels (Discovered $\to$ Chosen $\to$ Sent $\to$ In Conversation).

#### Frontend Tasks
- Display funnel conversion metrics card on `/outreach` and `/health`.
- Render manual "Sync to Sheet Now" action button with last synced timestamp badge.
- Provide CSV export button for audit event logs.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate triages jobs in Backdoor. In the background, their personal Google Sheet stays synchronized in real time with zero UI delay. Candidate views conversion funnel telemetry showing reply rates across Door 1 vs. Door 2.
- **Verification:** `npm run test:node tests/sheet-mirror-worker.test.ts`.

---

### Feature `S5-T05`: Mobile Responsive Adaptation ($380\text{px}$ Breakpoint Support)

#### Backend Tasks
- Optimize API payloads for mobile: include lightweight projections for card views to conserve cellular data bandwidth.
- Implement caching headers (`Cache-Control: private, max-age=60`) on mobile feed endpoints.

#### Frontend Tasks
- Implement responsive layout down to $380\text{px} \times 844\text{px}$ (iPhone SE):
  - Left navigation rail collapses into a touch-friendly slide-over mobile drawer with hamburger trigger.
  - Morning Radar transitions into a clean single-column card list.
  - Slide-out Dossier Drawer expands to 100% viewport width with sticky top action/close bar.
  - Ensure all touch targets meet WCAG minimum $44\text{px} \times 44\text{px}$.
  - Strict verification: 0 horizontal scrollbars (overflow-x hidden).

#### End-to-End User Experience & Verification
- **User Journey:** Candidate opens Backdoor on their mobile phone while commuting. Navigation collapses cleanly into a hamburger drawer; jobs appear in an easily scrollable vertical feed; tapping a job smoothly slides open the 100% width drawer with full readability and zero horizontal scroll glitches.
- **Verification:** Playwright responsive test suite `npm run test:e2e tests/e2e/responsive-navigation.spec.ts`.

---

### Feature `S5-T06`: Full Compliance Audit, Playwright E2E Suite & Release Readiness

#### Backend Tasks
- Run static security AST verification proving 0 occurrences of `messages.send` or `gmail.send` (Cardinal Rule R1).
- Audit all PostgreSQL tables for 100% Row Level Security (RLS) enforcement and audit table immutability.

#### Frontend Tasks
- Execute AST color scanner over entire codebase ensuring 0 occurrences of indigo, violet, orange, or amber hex codes.
- Verify WCAG AAA contrast ratio ($\ge 7.0:1$) for all body and heading typography.

#### E2E Master Suite
- Execute master Playwright test suite exercising the complete candidate journey:
  Ingest $\to$ Morning Radar $\to$ Table triage (`j`/`k`/`c`) $\to$ Drawer open (`Enter`) $\to$ Ingest (`Shift + I`) $\to$ Three Doors contact selection $\to$ Tailored CV build $\to$ Gmail draft staging $\to$ Audio transcribe $\to$ Health check.
- Verify all 30 compliance clauses (C-01 to C-30) pass with zero deviations.

#### End-to-End User Experience & Verification
- **User Journey:** The Sentinel verification suite runs `scripts/preflight.sh` and `scripts/compliance-audit.sh`. All 6 preflight gates pass with 100% test coverage, confirming that the entire application is completely verified and production-ready for v1.0 release.
- **Verification:** `bash scripts/preflight.sh` and `bash scripts/compliance-audit.sh`.

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck`)
- [ ] Node.js core logic tests pass (`npm run test:node`)
- [ ] Jest frontend component tests pass (`npm run test:unit`)
- [ ] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh`)
- [ ] Playwright E2E tests pass (`npm run test:e2e`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Mobile viewport test pass ($380\text{px}$ width verification).
- [ ] Zero color violations AST verification.

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #-- | `feature/p5-ops-health-dashboard` | 35-source health dashboard & Radar alert banner | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p5-sec-settings-vault` | Settings workspace and encrypted BYOK key vault | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p5-ext-clipper-tool` | Chrome extension 1-click job clipping tool | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p5-db-sheet-mirror-worker` | Google Sheet async mirroring & funnel telemetry | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p5-fe-mobile-responsive` | Mobile 380px breakpoint adaptation & touch UI | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p5-qa-compliance-hardening`| Full C-01 to C-30 compliance audit & release gates| [ ] Yes | YYYY-MM-DD | `[hash]` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main`, the Product Manager executes the live verification checklist:
- [ ] `/health` page renders all 35 sources with accurate real-time telemetry.
- [ ] Changing a BYOK key in `/settings` updates vault without exposing secret.
- [ ] Chrome extension clips a job from LinkedIn/Greenhouse and immediately opens it in Backdoor.
- [ ] Google Sheet downstream mirrors newly ingested and triaged jobs within scheduled interval.
- [ ] Mobile view at $380\text{px}$ shows fully collapsed rail, clean touch targets, and full-width drawer.
- [ ] Zero forbidden colors (zero orange/indigo/amber).
- [ ] Cardinal Rule R1 verified: zero send calls across entire live system.
- **PM Sign-Off Signature:** ____________________ **Date:** ___________

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | *No defects logged during planning phase.* | — | *Any defects emerging during sprint execution must be logged here immediately.* | `PLANNED` |

---

## 8. Product Manager Documentation Updates Log
- [ ] `docs/build_instructions_runbook.md` updated with full production operation guidelines
- [ ] `docs/PRODUCT-ARCHITECTURE.md` updated with completed system specification
- [ ] `docs/system_architecture_maps.md` updated with full production telemetry topology
- [ ] `CHANGELOG.md` updated with v1.0 Production Release Notes
