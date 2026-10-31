# Sprint Plan: Global Multi-Channel Company Research & Executive Teardown Engine (M5)

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 4-Intel (Company Research & Executive Teardown Engine)
- **Target Phase:** Phase 4 (Depth, Intelligence & Polish)
- **Sprint Goal:** Deliver the complete, end-to-end vertical slice for the Multi-Channel Company Intelligence, Review Auditor, and Executive Value Teardown Engine (un-deferring and expanding `S4-T02`, `S4-T03`, and `S4-T06`). This enables candidate users to automatically extract product-scoped customer complaints, plain-English financial translations, a 16-point competitor SWOT, zero-solution diagnostic questions, and dual-track 30–60–90 day execution proposals—exportable to Google Docs and interactive via the In-Drawer AI Copilot (`Cmd + K`).
- **Vertical Slice Mandate:** Every task in this sprint must be delivered as a complete end-to-end experience spanning zero-migration database persistence (reusing `company_briefs` and `evaluations` JSONB columns), polite zero-cost crawlers, LLM structured synthesis, frontend Tab 3 Drawer UI, and Google Workspace Drive API export.
- **Sprint Status:** `IN_PROGRESS`
- **Target Start Date:** 2026-11-01
- **Target Completion Date:** 2026-11-15

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Target Branch | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SCR-T01` | Role & Product-Line Scoping Engine | `@intel/teardown` (M5) | `feature/p4-intel-scoper` | `PLANNED` | Backend Lead |
| `SCR-T02` | Multi-Channel Review Auditor (`S4-T02`) | `@intel/teardown` (M5) | `feature/p4-intel-review-auditor` | `PLANNED` | Fullstack Lead |
| `SCR-T03` | Plain-English Financial Translator & Leadership Compass | `@intel/teardown` (M5) | `feature/p4-intel-financial-translator` | `PLANNED` | Backend Lead |
| `SCR-T04` | Product-Scoped Competitor SWOT & VoC Synthesizer | `@intel/teardown` (M5) | `feature/p4-intel-swot-voc` | `PLANNED` | Backend Lead |
| `SCR-T05` | Universal Semantic Grammar & Dual-Track Blueprint | `@intel/teardown` (M5) | `feature/p4-intel-semantic-grammar` | `PLANNED` | Fullstack Lead |
| `SCR-T06` | Zero-Migration Database Persistence Service | `database` / `@intel/teardown` | `feature/p4-intel-zero-db-persistence` | `PLANNED` | Backend Lead |
| `SCR-T07` | Headless Google Docs Executive 1-Pager Exporter (`S4-T03`) | `@workspace/gdocs` (M7) | `feature/p4-intel-gdocs-exporter` | `PLANNED` | Fullstack Lead |
| `SCR-T08` | Dossier Drawer Tab 3 UI ("Intel & Teardown") Suite | `frontend/dossier` (M4) | `feature/p4-intel-drawer-tab3-ui` | `PLANNED` | Frontend Lead |
| `SCR-T09` | In-Drawer AI Copilot Panel & Role Sparring (`S4-T06`) | `frontend/copilot` (M5) | `feature/p4-intel-copilot-sparring` | `PLANNED` | Fullstack Lead |

---

## 3. Detailed Task Specifications & Acceptance Criteria

---

### Task `SCR-T01`: Role & Product-Line Scoping Engine
- **Objective:** Extract the specific product division (e.g., *Uber Freight* vs. *Uber*, *HubSpot Service Hub* vs. *HubSpot*) and classify the role into one of 11 functional archetypes.
- **Scope:** `src/engine/role-classifier.ts`, `src/types/archetypes.ts`.
- **Acceptance Criteria:**
  - [ ] Regex classifier correctly resolves titles into all 11 archetypes (including Finance, Strategy, and Product Management).
  - [ ] Product-line extractor parses scoped entities from JD titles and descriptions.
  - [ ] Downstream search queries append scoped product name to prevent parent-company noise.
- **Verification:** `npm run test:node tests/role-classifier.test.ts`.

---

### Task `SCR-T02`: Multi-Channel Review Auditor (`S4-T02`)
- **Objective:** Implement polite, zero-cost scrapers across Reddit, App Store RSS, Google Play, G2, Trustpilot, and PissedConsumer.
- **Scope:** `src/engine/scraper.ts`, `src/engine/safe-fetch.ts`.
- **Acceptance Criteria:**
  - [ ] Rate-limits enforced with $\ge 500\text{ ms}$ inter-request backoff per domain.
  - [ ] SSRF safe-url validation active on all outbound requests (Rule R6).
  - [ ] Extracts verbatim user quotes, source badges, and timestamps.
  - [ ] Computes visual sentiment distribution score (0–100).
- **Verification:** `npm run test:node tests/review-scraper.test.ts`.

---

### Task `SCR-T03`: Plain-English Financial Translator & Leadership Compass
- **Objective:** Ingest SEC 10-K/10-Q (public) or Crunchbase/IR decks (private) and translate metrics into management strategy.
- **Scope:** `src/engine/financial-translator.ts`.
- **Acceptance Criteria:**
  - [ ] Translates margin compression into infrastructure/support cost signals.
  - [ ] Translates growing profit with flat dividends into retained earnings expansion signals.
  - [ ] Extracts top 3–5 CEO strategic priorities from earnings calls and press releases.
- **Verification:** `npm run test:node tests/financial-translator.test.ts`.

---

### Task `SCR-T04`: Product-Scoped Competitor SWOT & VoC Synthesizer
- **Objective:** Cluster scraped reviews into the 8-question Voice-of-Customer framework and map competitor SWOT for the specific product line.
- **Scope:** `src/engine/swot-voc-synthesizer.ts`, `src/types/data-product.ts`.
- **Acceptance Criteria:**
  - [ ] Synthesizes direct answers to the 8 Dream Job VoC questions with verbatim quotes.
  - [ ] Identifies top 3 direct product rivals and populates SWOT matrix.
  - [ ] Discrepancy Engine contrasts Layer 1 (Stated Intent) vs. Layer 2 (Review Ground Truth).
- **Verification:** `npm run test:node tests/swot-voc.test.ts`.

---

### Task `SCR-T05`: Universal Semantic Grammar & Dual-Track Blueprint
- **Objective:** Generate 3 zero-solution diagnostic questions, departmental opportunity pitch, and Dual-Track 30–60–90 day options.
- **Scope:** `src/engine/prompt-builder.ts`, `src/types/teardown-strategy.ts`.
- **Acceptance Criteria:**
  - [ ] Injects authentic department vocabulary tokens (e.g. *TTV, churn curves* for PM; *p99, CI sharding* for Eng).
  - [ ] Diagnostic questions strictly withhold solutions (Rule R4 compliant).
  - [ ] Dual-Track roadmap outputs Track A (Velocity / Triage) vs. Track B (Scalability / Structural).
  - [ ] Rule R5 Safety Gate rejects any proposal not anchored to candidate verified proof points.
- **Verification:** `npm run test:node tests/tier3-eval.test.ts`.

---

### Task `SCR-T06`: Zero-Migration Database Persistence Service
- **Objective:** Persist company intelligence and role teardowns into existing PostgreSQL JSONB columns with zero database migrations.
- **Scope:** `src/engine/teardown.ts`.
- **Acceptance Criteria:**
  - [ ] Company-level Data Product payload cached in `public.company_briefs.recent_news` (JSONB) with 30-day TTL.
  - [ ] Google Doc URL stored in `public.company_briefs.funding_details` (TEXT).
  - [ ] Role-specific teardown persisted into `public.evaluations.why_you_excel` and `tier2_breakdown` (JSONB).
  - [ ] Zero `ALTER TABLE` or `CREATE TABLE` required.
- **Verification:** `npm run test:node tests/teardown-persistence.test.ts`.

---

### Task `SCR-T07`: Headless Google Docs Executive 1-Pager Exporter (`S4-T03`)
- **Objective:** Generate a beautifully styled Executive Teardown 1-pager in the candidate's Google Drive via OAuth.
- **Scope:** `src/engine/gdocs-exporter.ts`, `src/app/api/intel/export/route.ts`.
- **Acceptance Criteria:**
  - [ ] Creates doc via `docs.create` and populates styled content via `documents.batchUpdate`.
  - [ ] Formats header, financial translation, competitor SWOT, VoC quotes, and Dual-Track roadmap.
  - [ ] Returns authenticated Drive link and persists URL to `company_briefs`.
- **Verification:** `npm run test:node tests/teardown-generator.test.ts`.

---

### Task `SCR-T08`: Dossier Drawer Tab 3 UI ("Intel & Teardown") Suite
- **Objective:** Rebuild Tab 3 of `DossierDrawer.tsx` to render real intelligence data across 4 progressive accordions.
- **Scope:** `src/components/dossier/DossierDrawer.tsx`, `src/components/dossier/TeardownTab.tsx`.
- **Acceptance Criteria:**
  - [ ] Section 1: Corporate Snapshot, Scoped Product, and Plain-English Financials.
  - [ ] Section 2: Leadership Compass & CEO Priorities.
  - [ ] Section 3: Product-Scoped Competitor SWOT Grid.
  - [ ] Section 4: Customer Friction Score, VoC Quotes, and Dual-Track Roadmap Cards.
  - [ ] "Open Teardown in Google Docs" CTA button and "Refresh Review Analysis" manual re-sync button.
- **Verification:** `npm run test:unit tests/frontend/teardown-tab.test.tsx`.

---

### Task `SCR-T09`: In-Drawer AI Copilot Panel & Role Sparring (`S4-T06`)
- **Objective:** Collapsible slide-out Copilot sub-panel inside Dossier Drawer (`Cmd/Ctrl + K`) for interactive role sparring.
- **Scope:** `src/components/dossier/CopilotPanel.tsx`, `src/app/api/copilot/chat/route.ts`.
- **Acceptance Criteria:**
  - [ ] Streaming SSE markdown response with sub-second time-to-first-token.
  - [ ] Context injector automatically supplies JD, company teardown, and candidate proof points.
  - [ ] Quick-action prompt chips (e.g., *"Simulate 5-minute case interview question"*).
  - [ ] "Copy Response" and "Pin to Interview Notes" buttons persist directly to `meeting_notes`.
- **Verification:** `npm run test:unit tests/frontend/copilot-chat.test.tsx`.

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck` — 0 errors)
- [ ] Node.js core logic tests pass (`npm run test:node` — all suites green)
- [ ] Jest frontend component tests pass (`npm run test:unit` — all components green)
- [ ] Zero Number Hallucination verification (Rule R5 regex test passes with 0 invented metrics)
- [ ] Polite crawling backoff check ($\ge 500\text{ ms}$ inter-request interval verified)
- [ ] Production build succeeds (`npm run build`)

---

## 5. Live Production Verification Sign-Off
Following deployment of `main`, the Product Manager executes the live verification checklist:
- [ ] Tab 3 in Dossier Drawer displays live sentiment score and verified friction points within $\le 20$ seconds.
- [ ] Clicking "Open Teardown in Google Docs" creates a document in candidate's Google Drive in $\le 5$ seconds.
- [ ] In-Drawer Copilot (`Cmd + K`) streams interactive case questions grounded in candidate proof points.
- [ ] Zero database migration executed; data verified in `company_briefs` and `evaluations`.
