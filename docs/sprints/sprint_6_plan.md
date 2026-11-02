# Sprint 6 Plan: Platform Data Sovereignty, Outbound Mirror Decommissioning & Inbound Bulk Upload Engine

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 6
- **Target Phase:** Data Sovereignty & Guarded Bulk Opportunity Ingestion
- **Subsystem Directives:** M2-FR14 (`@ingest/scout`), M9-FR13 (`@ui/command-center`), and `@workspace/google` OAuth Hardening
- **Sprint Goal:** 
  1. **Eliminate Outbound Google Sheet Mirroring:** Permanently decommission downstream spreadsheet synchronization queues, 429 quota handlers, and export routines to protect platform data sovereignty and prevent external harvesting of proprietary qualification scores, company teardowns, and enriched contact intelligence.
  2. **Revoke Google OAuth `spreadsheets` Scope:** Confine cloud workspace OAuth permissions strictly to `documents`, `drive.file`, `gmail.compose`, `gmail.readonly`, and `calendar.events`, providing cryptographic and permission-level assurance against sheet data dumping.
  3. **Deliver Guarded Inbound Bulk Upload Pipeline (.csv & .xlsx):** Provide an inbound bulk upload engine enforcing a standardized 6-column schema, a 50-row batch hard cap, pre-validation row-level diagnostics (HTTP 422), canonical deduplication (`normalized_company + normalized_title`), and immediate pass-through to Module 3 deterministic scoring.
  4. **Command Center Import UI:** Implement an interactive "Import Opportunities" modal with a Precision Cobalt & Steel drag-and-drop zone, a downloadable template CTA (`GET /api/ingest/template`), and an optimistic feed refresh.
- **Vertical Slice Mandate:** Every task spans database/engine models, API routes, user-facing UI components, and automated test verification.
- **Sprint Status:** `IN_PROGRESS`
- **Target Timeline:** Sprint 6 Master Cycle

---

## 2. Planned Features Breakdown: Backend vs. Frontend Task Allocation

| Task ID | Feature Title | Backend Deliverables | Frontend Deliverables | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`S6-T01`** | Outbound Sheet Mirror Decommissioning & OAuth Scope Revocation | Drop `spreadsheets` scope in `src/engine/google-auth.ts` and `settings.ts`. Decommission `executeSheetSyncBatch` and remove `/api/sheet/sync`. | Remove Google Sheet mirror card, "Sync Now" CTA button, and "Open Sheet ↗" link from `/health` and `/settings`. | `COMPLETED` | Security / Backend Lead |
| **`S6-T02`** | Standardized Inbound Bulk Upload Engine (`@ingest/scout` M2-FR14) | Build `src/engine/bulk-upload.ts`: RFC 4180 CSV parser, 6-column schema validator, 50-row cap, canonical deduplication, and M3 scoring pass-through. | Integration hooks for receiving scored opportunities in state. | `COMPLETED` | Ingestion Lead |
| **`S6-T03`** | Standardized Template Distribution (`GET /api/ingest/template`) | Deliver `GET /api/ingest/template` route serving standard 6-column CSV template with headers and valid sample row. | "Download Template (CSV)" action buttons in Import modal and database template store. | `COMPLETED` | Backend Lead |
| **`S6-T04`** | Guarded Bulk Upload API Route (`POST /api/ingest/bulk-upload`) | Deliver `POST /api/ingest/bulk-upload` route supporting multipart/form-data, returning HTTP 400 for >50 rows and HTTP 422 with structured diagnostics. | Real-time validation error reporting and batch ingestion response. | `COMPLETED` | API Lead |
| **`S6-T05`** | Command Center "Import Opportunities" Modal (`@ui/command-center` M9-FR13) | Support state integration with Morning Radar feed (`INITIAL_RADAR_JOBS`). | Build `src/components/ingest/ImportModal.tsx`: Precision Cobalt drag-and-drop zone, template action, error table, and optimistic refresh. Add "📥 Import" buttons to `/radar` and `/`. | `COMPLETED` | Frontend Lead |
| **`S6-T06`** | Forensic Invariant Suite & Telemetry Regression Suite | Unit & integration tests in `tests/bulk-upload.test.ts`, `tests/frontend/bulk-import-modal.test.tsx`, and updated `tests/sheet-mirror-worker.test.ts`. | AST scanner enforcing Rule R7 (zero forbidden colors) and strict linguistic rules across all touched components. | `COMPLETED` | QA / Sentinel |
| **`S6-T07`** | Tri-Segmented Source Fleet, Multi-Role Feeds, Inbound Streams (LinkedIn/Naukri Emails, Slack, Twitter/X) | Model role tags (`applicableRoles`) & sections on sources; dynamic track query interpolation on aggregators (JSearch, Apollo, Google Jobs); LinkedIn & Naukri India email digest parsers (LPA CTC, metro normalization); Slack `#jobs` webhook/bot stream listener; Twitter post parser pipeline via `safe-fetch.ts`. | Tri-segmented `/settings` Sources tab: (1) Popular ATS with bulk toggle, (2) Platform APIs with role filters (`Product`, `Engineering`, `Design/UX`, `Legal`, `Finance`), (3) Inbound & Social Streams (LinkedIn/Naukri email forwarding cards, Slack channel connector, Twitter handle manager). | `COMPLETED` | Fullstack Lead |
| **`S6-T08`** | Categorized Platform Tiers (Remote, Startup, Product) & Regional API Discovery Hub | Platform category sub-segmentation (`remote`, `startup`, `product_dynamic`), role relevance filter matching candidate's active tracks, Regional Job API directory with search query interpolation and 1-click BYOK integration. | Section 2 tab pills: `Remote Jobs`, `Startup Jobs (YC & Wellfound)`, `Product & Dynamic Feeds`, and interactive "API Discovery & Regional Paid Feeds" search hub with direct integration dialog. | `COMPLETED` | Fullstack Lead |
| **`S6-T09`** | Direct Gmail Alert Ingest & Morning Radar Dual-View Source Filtering | Autonomous Gmail API inbox scanner (`gmail.readonly`) querying LinkedIn/Naukri alert digests (bypassing email forwarding); exact source tagging (`linkedin_alert`, `naukri_alert`). | Morning Radar toolbar Source Filter selector (`sourceFilter: string | 'ALL'`) operational across both Bento (Kanban) and Dense Table (List) views; explicit source provenance badges on every role card/row. | `COMPLETED` | Fullstack Lead |

---

## 3. Detailed Feature Specifications: Backend, Frontend & End-to-End User Experience

### Feature `S6-T01`: Outbound Sheet Mirror Decommissioning & OAuth Scope Revocation
- **Objective:** Eliminate data exfiltration vectors by deprecating downstream spreadsheet mirroring while preserving internal decision audit telemetry and pipeline conversion funnels.
- **Backend Implementation:**
  - Create `src/engine/google-auth.ts`: Define `AUTHORIZED_GOOGLE_OAUTH_SCOPES` strictly containing `documents`, `drive.file`, `gmail.compose`, `gmail.readonly`, and `calendar.events`. Permanently exclude `https://www.googleapis.com/auth/spreadsheets`.
  - Update `src/engine/settings.ts`: Enforce authorized scopes across profile settings.
  - Decommission `executeSheetSyncBatch` and `getSheetSyncSummary` in `src/engine/sheet-mirror.ts`.
  - Remove deprecated endpoint `src/app/api/sheet/sync/route.ts`.
  - Preserve `getConversionFunnelTelemetry()`, `exportDecisionEventsToCsv()`, and add `logDecisionEvent()`.
- **Frontend Implementation:**
  - In `src/app/health/page.tsx`: Replace the Google Sheet mirror card with the "Decision Audit Ledger & Security Telemetry" card.
  - Remove all sheet sync buttons, "Sync to Sheet Now" CTAs, and external spreadsheet links.
- **Verification:** `npm run test:node tests/sheet-mirror-worker.test.ts`.

---

### Feature `S6-T02`: Standardized Inbound Bulk Upload Engine (`src/engine/bulk-upload.ts`)
- **Objective:** Enable candidate ingestion of external curated opportunities without compromising system integrity.
- **Standard 6-Column Schema:**
  1. `company_name` (string, required, trimmed)
  2. `job_title` (string, required, trimmed)
  3. `apply_url` (valid HTTP/HTTPS URL, required)
  4. `location` (string, required, trimmed)
  5. `workplace_type` (enum, required: `remote` | `hybrid` | `on-site`)
  6. `raw_description` (string, required, min 20 chars)
- **Ingestion Guardrails:**
  - **50-Row Hard Cap:** Rejects datasets exceeding 50 data rows with HTTP 400 (`"Upload exceeds maximum batch limit of 50 rows"`).
  - **Pre-Validation Error Feedback:** Returns HTTP 422 with structured array `[{ row: number, column: string, message: string }]`.
  - **Canonical Deduplication:** Computes `dedup_match_key = normalized_company + normalized_title`. Updates existing records without duplication; inserts new records with `source = 'bulk_upload'`.
  - **Instant Module 3 Pass-Through:** Evaluates Tier 1 eligibility and Tier 2 mathematical suitability (0–100 score) immediately upon ingestion, logging events to `decision_events`.
- **Verification:** `npm run test:node tests/bulk-upload.test.ts`.

---

### Feature `S6-T03` & `S6-T04`: API Endpoints (`/api/ingest/template` & `/api/ingest/bulk-upload`)
- **`GET /api/ingest/template`:**
  - Serves downloadable CSV template with standard 6 headers and sample valid row.
  - Header: `Content-Disposition: attachment; filename="backdoor_opportunities_template.csv"`.
- **`POST /api/ingest/bulk-upload`:**
  - Accepts `multipart/form-data` with `.csv` or `.xlsx` file, or raw JSON text payload.
  - Parses CSV using RFC 4180 rules (handling escaped quotes, embedded commas, CRLF/LF).
  - Enforces 50-row limit (HTTP 400) and schema validation (HTTP 422).
  - Returns `{ success: true, total: number, imported: number, deduplicated: number, jobs: [...] }`.

---

### Feature `S6-T05`: Command Center "Import Opportunities" Modal (`src/components/ingest/ImportModal.tsx`)
- **Visual Design:** Follows **Precision Cobalt & Steel** (`bg-slate-900`, `text-sky-400`, `border-slate-800`, `border-dashed border-slate-700 bg-slate-900/60 hover:border-sky-500/50`).
- **Modal Components:**
  - Drag-and-Drop Dropzone accepting `.csv` and `.xlsx`.
  - "Download Template (CSV)" action triggering `GET /api/ingest/template`.
  - Visual limit badge: `"Limit: 50 rows per batch"`.
  - Pre-import validation error table displaying `Row #`, `Column`, and `Issue Description`.
  - Optimistic toast feedback: `"✓ X opportunities imported & scored"`.
- **Navigation Placement:**
  - Morning Radar Toolbar (`src/app/radar/page.tsx`): Prominent **"📥 Import"** button adjacent to "+ Add Job".
  - Command Bar (`src/app/page.tsx`): Primary **"📥 Import Opportunities"** button.
- **Verification:** `npm run test:unit tests/frontend/bulk-import-modal.test.tsx`.

---

### Feature `S6-T06`: Comprehensive Verification & Invariant Audits
- **Test Matrix:**
  1. `UT-BULK-01`: Standard 6-column template verification.
  2. `UT-BULK-02`: 50-row batch hard cap rejection.
  3. `UT-BULK-03`: Pre-validation error reporting for missing fields, bad URLs, and invalid workplace types.
  4. `UT-BULK-04`: Successful ingestion, deduplication key computation, and Module 3 scoring.
  5. `UT-BULK-05`: Google OAuth scope initialization strictly excluding spreadsheets.
  6. `UT-BULK-06`: Strict design system AST color check (zero forbidden colors).
  7. `IT-IMPORT-01` to `03`: Frontend SSR rendering, keyboard dismissal, and color audit.
  8. `UT-SM-01` to `05`: Decommissioning of outbound sheet sync and retention of audit telemetry.

---

### Feature `S6-T07`: Tri-Segmented Source Fleet, Multi-Role Feeds & Inbound Streams (LinkedIn/Naukri Emails, Slack, Twitter/X)
- **Objective:** Modernize Settings source controls by partitioning the ingestion fleet into 3 logical tiers, generalizing platform feeds to serve multi-role candidates (UX, Legal, Accounting, Engineering) through dynamic track title interpolation, and providing comprehensive inbound stream ingestion across LinkedIn Emails, Naukri India Emails, Slack Community channels, and Public Twitter/X accounts.
- **Backend Implementation:**
  - Enhance `SourceDefinition` in `src/engine/scraper.ts`:
    - Add `section: 'ATS' | 'PLATFORM_API' | 'SOCIAL_INBOUND'`.
    - Add `applicableRoles: ('all' | 'product' | 'engineering' | 'design' | 'legal' | 'finance')[]`.
  - Extend `SettingsWorkspaceState` in `src/engine/settings.ts`:
    - Add `monitoredTwitterHandles: string[]` default `['@levelsio', '@sama']`.
    - Add `inboundEmailAddress: string` (`jobs+<uid>@inbound.backdoor.app`).
    - Add `slackCommunityChannels: { id: string; name: string; workspace: string; enabled: boolean }[]`.
  - LinkedIn Email Digest Ingestion Engine:
    - Multipart email parser isolating individual job recommendation cards.
    - Strips LinkedIn tracking query parameters (`trk=`, `trkInfo=`) to resolve canonical job URLs (`https://www.linkedin.com/jobs/view/...`).
  - Naukri India Job Alert Ingestion Engine:
    - Parses Indian compensation structures: Lacs/LPA (`₹25 - 40 Lacs P.A.`, `30 LPA`).
    - Normalizes Indian metropolitan tech clusters (Bengaluru, NCR/Gurugram/Noida, Hyderabad, Pune, Mumbai, Chennai).
    - Unwraps Naukri redirection tracking links, extracts recruiter profile attributes for automated Door 2 Recruiter lead enrichment.
  - Slack Community Channel Ingestion Engine:
    - Ingests posts from connected Slack workspace hiring channels (`#jobs`, `#hiring`, `#job-board`).
    - Connects via Backdoor Slack App bot token (`channels:history`) or channel webhooks.
    - Extracts unstructured announcements via `extractJobFromRawText()` in `src/engine/safe-fetch.ts`.
  - Public Twitter Ingest Pipeline:
    - Ingests public tweets via Apify Twitter Actor (BYOK) or Twitter API v2.
    - Match hiring triggers (`/(hiring|open role|join our team|we're looking for|apply:)/i`) and routes to `extractJobFromSnippet()`.
  - Generalize Negative Filtering in `src/engine/scraper.ts`:
    - Replace static PM exclusion regex with dynamic regex constructed from `state.negativeFilters.excludedTitlePatterns`.
  - Multi-Role Dynamic Query Interpolation:
    - Update BYOK aggregators (`rapidapi_jsearch`, `serpapi_jobs`, `apollo_jobs`) to pull search queries dynamically from active `dynamicTracks.targetTitles` rather than hardcoded "Product Manager".
- **Frontend Implementation (`src/app/settings/page.tsx`):**
  - Section 1: **Popular ATS Systems** (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, BambooHR, Rippling, Recruitee, Careers JSON-LD) with individual switches and "Enable / Disable All ATS" master switch.
  - Section 2: **Platform & Role-Specific Feeds**: Category filter chips (`All`, `Product`, `Engineering`, `Design & UX`, `Legal & Compliance`, `Finance & Accounting`) with BYOK badges.
  - Section 3: **Public Social, Community & Inbound Messaging Streams**:
    - *LinkedIn Email Digest Card:* Displays candidate's dedicated `jobs+<uid>@inbound.<domain>` with 1-click copy and auto-forwarding rule helper.
    - *Naukri India Forwarder Card:* Inbound configuration with Indian LPA CTC thresholds and metro location filters.
    - *Slack Channel Connector:* Management view for connected community Slack channels (`#jobs`, `#hiring`).
    - *Public Twitter / X Manager:* Interactive `@handle` tag editor with chip add/remove controls.
- **Verification:**
  - `npm run test:node tests/source-categorization.test.ts`.
  - `npm run test:unit tests/frontend/settings-workspace.test.tsx`.

---

### Feature `S6-T08`: Categorized Platform Tiers (Remote, Startup, Product) & Regional API Discovery Hub
- **Objective:** Provide focused, high-signal platform feed views tailored specifically to Product Management & candidate dynamic tracks, partition feeds into clear categories (Remote, Startup, Product), and provide an interactive search & BYOK integration directory for regional job APIs.
- **Backend & Engine Implementation:**
  - In `src/engine/scraper.ts`:
    - Extend `SourceDefinition` with optional `platformCategory?: 'remote' | 'startup' | 'product_dynamic' | 'aggregator'`.
    - Map verified platform sources cleanly:
      - `REMOTE`: `remotive`, `remoteok`, `weworkremotely`, `jobspresso`, `himalayas`, `justremote`.
      - `STARTUP`: `yc_startup`, `wellfound`, `hn_hiring`, `product_hunt`.
      - `PRODUCT_DYNAMIC`: `lennys_jobs`, `mind_the_product`, `mindstone`, `otta`, `levels_fyi`, `builtin`, `the_muse`.
      - `AGGREGATOR`: `apify_greenhouse`, `apify_linkedin`, `rapidapi_jsearch`, `apollo_jobs`, `hunter_leads`, `serpapi_jobs`.
  - In `src/engine/settings.ts`:
    - Catalog of regional & role-specific job APIs (`POPULAR_JOB_APIS`) with metadata: name, provider, roleAffinity (`product`, `engineering`, `all`), regions (`India`, `US`, `UK`, `EU`, `Remote`, `Global`), protocol (`REST_API`, `BYOK_AGGREGATOR`), pricing (`Free Tier Available`, `Paid API / BYOK`), documentation URL, and integration schema.
    - Helper `searchJobApis(query?: string, role?: string, region?: string)` for filtered discovery.
- **Frontend Implementation (`src/components/settings/SettingsWorkspace.tsx`):**
  - Section 2 Sub-Tabs / Filter Pills:
    - `All Relevant (X)`: Default view scoped strictly to Product Management & active dynamic tracks.
    - `Remote Jobs (6)`: Dedicated remote boards view.
    - `Startup Jobs (4)`: High-signal YC & Wellfound startup ecosystem boards.
    - `Product & Dynamic Feeds (7)`: Curated PM communities and salary/culture platforms.
    - `BYOK Aggregators (6)`: High-capacity multi-engine aggregators.
  - Interactive "API Discovery & Regional Paid Feeds" Search Bar & Directory:
    - Search input by keyword (e.g. "Adzuna", "Jooble", "India", "Remote").
    - Role selector (`Product Manager`, `Engineering`, `All Roles`).
    - Region selector (`All Regions`, `India`, `United States`, `United Kingdom`, `European Union`, `Global Remote`).
    - Card grid showing matching APIs with status (Configured vs. Not Configured), regional badge, role badge, pricing tier.
    - "Integrate API" action opening direct BYOK configuration dialog to save key/token/endpoint into active fleet.
- **Verification:**
  - `npm run test:node tests/source-categorization.test.ts`.
  - `npm run test:unit tests/frontend/settings-workspace.test.tsx`.

---

### Feature `S6-T09`: Direct Gmail Alert Ingestion & Morning Radar Dual-View Source Filtering
- **Objective:** Eliminate manual email forwarding friction by leveraging existing Google OAuth (`gmail.readonly`) to autonomously sweep inbox for LinkedIn and Naukri alert digests, attribute precise job source metadata, and deliver real-time source filtering across both Bento (Kanban) and Dense Table (List) views on `/radar`.
- **Backend & Engine Implementation:**
  - Direct Gmail Inbox Scanner (`src/engine/gmail-ingest.ts`):
    - Autonomous crawler running daily at 04:00 AM (and on-demand via `POST /api/ingest/gmail-sync`).
    - Queries candidate's Gmail inbox with targeted filters:
      - `from:(jobalerts-noreply@linkedin.com) newer_than:1d`
      - `from:(alerts@naukri.com) newer_than:1d`
    - Parses HTML message bodies, extracting individual role cards, titles, companies, locations, and clean canonical URLs (stripping tracking query params).
    - Assigns canonical source identifiers: `linkedin_alert` and `naukri_alert`.
    - Pushes jobs through `dedup_match_key` canonical deduplication and Module 3 deterministic fit scoring.
  - Granular Source Attribution:
    - Normalizes sources across the entire pool: `greenhouse`, `lever`, `ashby`, `workday`, `linkedin_alert`, `naukri_alert`, `twitter_scout`, `slack_channel`, `yc_startup`, `remotive`, `remoteok`, etc.
- **Frontend Implementation (`src/app/radar/page.tsx` & `/settings`):**
  - Morning Radar Dual-View Source Filter Toolbar:
    - Adds `sourceFilter` selector dropdown / pill filter (`[Filter by Source: All Sources ▾]`) adjacent to Density and Crawl Scope selectors.
    - Dynamically populated with active sources present in the scored pool + configured ingestion sources.
    - Reactive Filtering: Seamlessly filters opportunities across **both 1:1 Bento Cards (Kanban view)** and **Dense Command Table (List view)** simultaneously.
    - Preserves keyboard navigation (`j`/`k`/`s`/`c`/`Enter`), continuous match-score sorting, and unread triage counts.
  - Granular Source Provenance Badging:
    - Bento Cards: Distinct, formatted source badge (`LinkedIn Alert`, `Naukri Alert`, `Ashby ATS`, etc.) with visual provenance icon.
    - Dense Table: Clean font-mono source indicator tag in the Source column.
  - Settings Workspace Direct Gmail Inbox Card:
    - Provides a dedicated card in Section 3 with connection status pill (`Google OAuth Connected: gmail.readonly`), 1-click **"⚡ Sync Inbox Now"** trigger button, and last sync timestamp telemetry.
- **Verification:**
  - `npm run test:node tests/radar-source-filtering.test.ts`.
  - `npm run test:unit tests/frontend/radar-source-filter.test.tsx`.

---

## 4. Architectural Guardrails & Invariants
- **Rule R1 (Absolute Zero Automated Sends):** Unchanged. Bulk imported roles generate drafts only upon explicit candidate review.
- **Rule R3 ($0.00 Cost Baseline):** Inbound CSV/XLSX parser runs entirely locally with zero external paid APIs.
- **Rule R5 (Metric Verification):** Zero metric hallucination on imported roles.
- **Rule R6 (SSRF & Security):** Inbound apply URLs validated against private IP / SSRF filters.
- **Rule R7 (Strict Design System Colors):** Strictly zero saturated indigo, violet, amber, orange, or terracotta.
- **Data Sovereignty Mandate:** Zero outbound Google Sheet mirroring; proprietary qualification metrics and stakeholder intelligence remain strictly within the candidate's authenticated workspace.
- **Linguistic Rules:** Strictly zero occurrences of legacy branding phrases (`"three doors"`, `"daily Pm outreach"`).

---

## 5. Verification Checklist & Gate Results

- [x] `npm run typecheck` passes with zero errors across all 26 routes.
- [x] `npm run lint` passes with zero ESLint warnings or errors.
- [x] `npm run test:node` passes 93/93 tests.
- [x] `npm run test:unit` passes 54/54 frontend tests.
- [x] `npm run build` succeeds generating all production pages.
- [x] Outbound sync route `/api/sheet/sync` completely removed.
- [x] Inbound endpoints `/api/ingest/template` and `/api/ingest/bulk-upload` active.
- [x] Working on dedicated branch `feature/p6-ingest-bulk-upload`.

