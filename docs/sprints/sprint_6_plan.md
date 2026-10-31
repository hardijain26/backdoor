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

