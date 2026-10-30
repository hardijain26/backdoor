# Sprint 3 Plan: Slide-Out Dossier Drawer, Contact Enrichment & Multi-Channel Cadence Engine

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 3
- **Target Phase:** Phase 3 (Outreach & Cadence)
- **Sprint Goal:** Deliver complete, verified end-to-end vertical slices for the 640px slide-out dossier drawer with route interception, Universal Ingest modal (`Shift + I`), Three Doors contact discovery, automated CV generation with zero metric hallucination (Rule R5), and the multi-channel Gmail cadence engine enforcing zero automatic sends (Rule R1) wired to the live Outreach Kanban board.
- **Vertical Slice Mandate:** Every feature picked in this sprint must be delivered as a complete end-to-end experience spanning database schema, backend APIs, business logic engines, frontend UI components, keyboard navigation, and live verification. No partial mock layers or disconnected endpoints are permitted.
- **Sprint Status:** `PLANNING`
- **Target Start Date:** 2026-12-05
- **Target Completion Date:** 2026-12-18

---

## 2. Planned Features Breakdown: Backend vs. Frontend Task Allocation

| Task ID | Feature Title | Backend Deliverables | Frontend Deliverables | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S3-T01` | 640px Slide-Out Dossier Drawer & Route Interception | Server-side composite loader for job, company, eval & contacts | Route interception `@drawer/(.)discover/[job_id]`, 640px drawer, `↑`/`↓` cycling | `COMPLETED` | Fullstack Lead |
| `S3-T02` | Universal Ingest Modal & Deduplication (`Shift + I`) | SSRF-safe scraper (`safe-fetch.ts`), canonical key generator, dedup API | Global `Shift + I` modal, duplicate alert badge, auto-drawer open | `COMPLETED` | Fullstack Lead |
| `S3-T03` | Three Doors Contact Discovery & Multi-Provider Enrichment | Apollo/Hunter scraper pipeline, Door 1/2/3 classification, confidence score | Tab 4 "Backdoor" UI: 3-column contact cards, LinkedIn search CTA, target selector | `COMPLETED` | Fullstack Lead |
| `S3-T04` | Tailored CV Builder & Google Drive PDF Staging (Rule R5) | Proof-point matcher, Rule R5 AST metric verifier, Google Docs/Drive PDF export | Tab 6 "CV Preview" UI: bullet diff viewer, Drive PDF badge, embedded preview | `PLANNED` | Fullstack Lead |
| `S3-T05` | Gmail Draft Staging Engine (Rule R1) & Timezone Scheduler | Recipient timezone geocoder (09:15 Tue-Thu), `ThreeDoors/Drafts` creator, AST send check | Outreach draft editor, send-time badge, "Stage Draft in Gmail" CTA, deep link to Gmail | `PLANNED` | Fullstack Lead |
| `S3-T06` | Outreach & Cadence Board (`/outreach`) & Lifecycle Engine | Application stage state machine, Gmail thread watcher, decision event logging | Kanban board (5 swimlanes), "Copy LinkedIn Note" ($\le 300$ chars), stage advancement UI | `PLANNED` | Fullstack Lead |

---

## 3. Detailed Feature Specifications: Backend, Frontend & End-to-End User Experience

### Feature `S3-T01`: 640px Slide-Out Dossier Drawer & Route Interception

#### Backend Tasks
- Implement composite server-side data loader fetching job record, company intelligence, 3-tier evaluation details, and linked contacts in a single query.
- Create `/api/jobs/[id]/dossier` endpoint supporting both intercepted drawer views and direct standalone page loads.
- Enforce multi-tenant Row Level Security (RLS) guaranteeing users can only fetch their own job dossiers.

#### Frontend Tasks
- Implement Next.js 15 route interception at `@drawer/(.)discover/[job_id]/page.tsx` and parallel slot fallback `discover/[job_id]/page.tsx`.
- Build 640px sliding panel component (`src/components/dossier/DossierDrawer.tsx`) styled with Precision Cobalt & Steel tokens (`bg-[#161F33]`, border `#2563EB/20`).
- Wire keyboard listeners: `↑` (previous job in table), `↓` (next job in table), and `Esc` (close drawer, returning focus to table row).
- Implement 5 functional tabs: (1) Job Details, (2) Match Breakdown, (3) Teardown 1-Pager, (4) Three Doors, (5) Outreach & CV Preview.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate navigates table using `j`/`k` and presses `Enter`. Without a page refresh, the 640px drawer slides in over the table. The candidate presses `↑`/`↓` to cycle through roles with instantaneous data updates, and presses `Esc` to return focus to the exact table row. Refreshing the browser renders the full-page standalone view.
- **Verification:** `npm run test:unit tests/frontend/dossier-drawer-navigation.test.tsx` and Playwright route interception test.

---

### Feature `S3-T02`: Universal Ingest Modal & URL Deduplication Engine (`Shift + I`)

#### Backend Tasks
- Implement SSRF-safe URL scraper (`src/engine/safe-fetch.ts`) blocking loopback/private IP ranges (`127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`).
- Build canonical normalization engine (`src/engine/dedup.ts`) generating `company:normalized_title` match keys.
- Create `/api/ingest/universal` endpoint that checks for duplicate `dedup_match_key`, inserts into `jobs` table if new, runs Tier 1 & 2 scoring, and logs to `decision_events`.

#### Frontend Tasks
- Implement global keyboard shortcut listener for `Shift + I` active across all workspace views.
- Build `UniversalIngestModal.tsx` dialog with auto-focused URL input, target track selector, and loading spinner.
- Handle API responses: if duplicate, render "Role Already in Lake" badge and auto-open the existing role's drawer; if new, render "Role Ingested" and immediately transition into the new role's drawer.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate finds an unlisted role on Twitter/Slack, presses `Shift + I` anywhere in Backdoor, pastes the URL, and presses `Enter`. The modal scrapes and scores the role within 2 seconds, closes itself, and immediately slides open the Dossier Drawer with Tier 1/2 match scores computed.
- **Verification:** `npm run test:node tests/universal-ingest.test.ts` and `npm run test:unit tests/frontend/integration-universal-ingest.test.tsx`.

---

### Feature `S3-T03`: The Three Doors Contact Discovery & Multi-Provider Enrichment

#### Backend Tasks
- Build `@people/enrichment` (M6) pipeline classifying contacts into three specific doors:
  - **Door 1:** Hiring Manager / Team Lead (VP Product, Director of Product, Head of Product).
  - **Door 2:** Peer / Team PM (Senior PM, Staff PM on target product squad).
  - **Door 3:** Recruiter / Talent Acquisition (Lead Technical Recruiter, Head of Talent).
- Integrate external enrichment providers (Hunter.io, Apollo.io) with fallback to deterministic LinkedIn Boolean query generators.
- Compute composite `contact_confidence` score ($0 - 100$) based on email verification and source corroboration; persist to PostgreSQL `contacts` table.

#### Frontend Tasks
- Build Tab 4 ("Three Doors") UI inside `DossierDrawer.tsx` displaying 3 segmented cards.
- Render contact name, headline, verified email pill, confidence rating badge (Emerald $\ge 70$, Sky $40-69$), and direct "Search on LinkedIn" external link.
- Add "Select as Primary Outreach Target" radio action on each door card, saving the chosen door to the active application.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate opens a role's drawer, clicks "Three Doors" tab, and immediately sees verified profiles for the Hiring Manager, Peer PM, and Recruiter. Candidate selects Door 1 (Hiring Manager), and the UI instantly binds this contact to the application for personalized CV tailoring and email draft generation.
- **Verification:** `npm run test:node tests/contact-enrichment.test.ts` and component test for Three Doors tab.

---

### Feature `S3-T04`: Tailored CV Builder & Google Drive PDF Staging (Rule R5 Invariant)

#### Backend Tasks
- Implement `@workspace/google` (M4) CV generator selecting 4–6 high-impact bullets from candidate's verified `proof_points` library in `dossier/identity` (M8).
- **Rule R5 AST Security Invariant:** Implement regex AST metric verifier checking every integer, percentage, currency figure, and multiplier against candidate profile proof points. If any metric does not match byte-for-byte, the build aborts immediately.
- Integrate Google Docs API (`docs.create` / `batchUpdate`) to populate executive CV template, convert to PDF, and stage in candidate's private Google Drive folder.

#### Frontend Tasks
- Build "Outreach & CV" tab inside Dossier Drawer with "Generate Tailored CV" action button.
- Render live preview diff highlighting which proof points were selected from the candidate's portfolio.
- Display "Open in Google Drive" link badge and embedded PDF preview frame once generation completes.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate clicks "Generate Tailored CV" in drawer. The engine extracts the exact proof points matching the role's requirements, verifies zero metric hallucination, generates the document, and presents an embedded PDF preview alongside a Google Drive link—all completed in under 4 seconds.
- **Verification:** `npm run test:node tests/cv-builder-r5-audit.test.ts` asserting 100% byte-for-byte metric equality.

---

### Feature `S3-T05`: Gmail Draft Staging Engine (Rule R1 Invariant) & Timezone Scheduler

#### Backend Tasks
- **Rule R1 Security Invariant:** Restrict Google OAuth scopes strictly to `gmail.compose` and `gmail.readonly`. Run static code audit ensuring 0 references to `users.messages.send` or `gmail.send`.
- Implement recipient timezone geocoding service: calculates target city timezone and schedules delivery window for Tuesday–Thursday at 09:15 recipient local time.
- Implement Gmail Draft creator creating drafts exclusively under `ThreeDoors/Drafts` label with tailored subject line, personalization, and Drive CV link.
- Enforce strict safety cap blocking creation of $>40$ drafts in any rolling 24-hour window.

#### Frontend Tasks
- Build email draft preview editor inside Dossier Drawer pre-filled with Door-specific copy.
- Display recipient timezone badge (e.g., *"Suggested Delivery: Tue 09:15 London (14:45 IST)"*).
- Provide "Stage Draft in Gmail" CTA button with quota counter (e.g., *"36/40 drafts remaining today"*).
- Upon staging, display "Draft Staged in Gmail" success banner with a direct one-click deep link to open the draft in Gmail web app for human review.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate reviews personalized email copy in drawer, confirms suggested Tuesday 09:15 London delivery window, and clicks "Stage Draft in Gmail". Draft appears immediately in user's Gmail `ThreeDoors/Drafts` folder. No email is ever sent automatically—the candidate retains 100% human dispatch control.
- **Verification:** `npm run test:node tests/cadence-engine-logic.test.ts` and `npm run test:node tests/cadence-workflow-integration.test.ts`.

---

### Feature `S3-T06`: Outreach & Cadence Board (`/outreach`) & Lifecycle State Machine

#### Backend Tasks
- Build application cadence lifecycle state machine:
  `DRAFT_CREATED` $\to$ `SENT` $\to$ `AWAITING_REPLY` $\to$ `IN_CONVERSATION` $\to$ `CLOSED`.
- Implement Gmail thread watcher monitoring `SENT` message labels and inbound replies.
- When an inbound reply is detected from the contact, automatically halt future follow-up reminders, advance stage to `IN_CONVERSATION`, and log event to `decision_events`.

#### Frontend Tasks
- Deliver visual Kanban board at `/outreach` with 5 columns:
  1. *Draft Ready in Gmail*
  2. *Sent (Awaiting Reply)*
  3. *Follow-Up Due (Day 3/5)*
  4. *In Conversation*
  5. *Bounced / Cancelled*
- Build `CadenceCard.tsx` rendering Door chip, company name, contact title, delivery window countdown, and thread status pill.
- Add "Copy LinkedIn Note" one-click button copying $\le 300$-character tailored connection message to clipboard.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate tracks all active outreach campaigns on the `/outreach` board. When the candidate sends a staged draft in Gmail, the thread watcher updates the card to "Sent". When the contact replies, the card shifts into "In Conversation", alerting the candidate to prepare for an interview.
- **Verification:** `npm run test:unit tests/frontend/outreach-kanban.test.tsx` and full state transition integration test.

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck`)
- [ ] Node.js core logic tests pass (`npm run test:node`)
- [ ] Jest frontend component tests pass (`npm run test:unit`)
- [ ] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh`)
- [ ] Playwright E2E tests pass (`npm run test:e2e`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Rule R1 send audit verified: 0 occurrences of `gmail.send` or `messages.send`.
- [ ] Rule R5 metric audit verified: 0 hallucinated numbers in CV generation.

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #-- | `feature/p3-nav-dossier-drawer` | 640px slide-out drawer with route interception | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p3-nav-universal-ingest` | Universal Ingest modal and SSRF-safe intake | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p3-enrichment-three-doors` | Contact allocation across 3 Doors & Apollo/Hunter | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p3-workspace-cv-builder` | Tailored CV builder with Rule R5 metric guard | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p3-cadence-r1-engine` | Gmail draft engine with Rule R1 invariant | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p3-fe-outreach-board` | Outreach Kanban board and state transitions | [ ] Yes | YYYY-MM-DD | `[hash]` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main`, the Product Manager executes the live verification checklist:
- [ ] Pressing `Enter` on Morning Radar opens 640px drawer without full page reload.
- [ ] Drawer arrow cycling (`↑`/`↓`) cycles through jobs with zero latency.
- [ ] Pressing `Shift + I` opens Universal Ingest modal; pasting URL triggers ingest and opens drawer.
- [ ] Generated CV contains 100% exact numerical matches to candidate profile metrics.
- [ ] Triggering outreach creates a draft in `ThreeDoors/Drafts`; zero automated emails sent.
- [ ] Outreach board at `/outreach` displays active draft cards in proper columns.
- [ ] Precision Cobalt & Steel palette validated: 0 indigo/orange/amber hexes.
- **PM Sign-Off Signature:** ____________________ **Date:** ___________

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | *No defects logged during planning phase.* | — | *Any defects emerging during sprint execution must be logged here immediately.* | `PLANNED` |

---

## 8. Product Manager Documentation Updates Log
- [ ] `docs/build_instructions_runbook.md` updated with Phase 3 operational behaviors
- [ ] `docs/PRODUCT-ARCHITECTURE.md` updated with Dossier Drawer & Cadence contracts
- [ ] `docs/navigation_flow.md` updated with route interception specs
- [ ] `CHANGELOG.md` updated with user-facing release notes
