# Backdoor v1.0: Sprint Tasks PRD Audit & Completion Trajectory

**Document Version:** v1.0 Comprehensive Audit  
**Authoritative Sources:** `docs/prd.md`, `docs/build_instructions_runbook.md` (Artifacts 1–7)  
**Evaluation Scope:** Sprints 0, 1, 2, 3, 4, 5 vs. PRD Functional Modules (M1–M9), User Journeys (1–4), and Cardinal Rules (R1–R8)  
**Target Completion Date:** 2027-01-15 (Sprint 5 Close)  
**Audit Status:** APPROVED — 100% PRD v1.0 Scope Complete by Sprint 5

---

## 1. Executive Summary & Verdict

By the conclusion of Sprint 5, **100% of the Backdoor v1.0 (Release 1) PRD functional scope will be fully completed, tested, and ready for production deployment.**

Every module (M1 through M9), all 4 end-to-end user journeys, the 8 Cardinal Engineering Rules (R1–R8), and all 30 Forensic Compliance Clauses (C-01 to C-30) are accounted for across Sprints 0 through 5 without deferred features or mock facades.

---

## 2. Sprint-by-Sprint Completion Trajectory

| Sprint | Phase & Focus | Key Deliverables | PRD Progress | Cumulative Total |
| :--- | :--- | :--- | :---: | :---: |
| **Sprint 0** | **Phase 0: Setup & Scaffolding** | PostgreSQL 16 canonical schema (18 tables, 5 enums, 9 indexes, 11 RLS), Precision Cobalt & Steel token engine, 6-gate preflight pipeline, non-technical PM Git governance. | 15% | **15%** |
| **Sprint 1** | **Phase 1: Ingest & Pool** | 35-source crawlers & runners, canonical `dedup_match_key` deduplication engine, Tier 1 & 2 deterministic scoring, base Morning Radar feed. | 20% | **35%** |
| **Sprint 2** | **Phase 2: Triage & Radar** | Dual-View Switcher (Bento Cards vs. Dense Table), keyboard engine (`j`/`k`/`s`/`c`/`Enter`/`/`/`Esc`), Morning Radar 24h & top-20 filters, candidate profile & tracks library (`dossier/identity` M8). | 15% | **50%** |
| **Sprint 3** | **Phase 3: Outreach & Cadence** | 640px slide-out dossier drawer with route interception, Universal Ingest modal (`Shift + I`), Three Doors contact allocation (Apollo/Hunter), tailored CV builder with Rule R5 metric guard, Gmail draft engine in `ThreeDoors/Drafts` (Rule R1 invariant), Outreach Kanban board (`/outreach`). | 25% | **75%** |
| **Sprint 4** | **Phase 4: Depth & Polish** | Tier 3 deep LLM fit evaluation, Company Review Auditor (Reddit & App Store scrapers), executive teardown 1-pager Google Docs generator, Google Meet audio capture extension with Groq Whisper transcription, interview notes workspace (`/interviews`), in-drawer AI Copilot panel. | 15% | **90%** |
| **Sprint 5** | **Hardening & Fleet Observability** | 35-source fleet health dashboard (`/health`), encrypted Settings & BYOK vault (`/settings`), Chrome extension 1-click job clipper (`extension/clipper.js`), downstream Google Sheet async mirror worker, mobile $380\text{px}$ responsive hardening, full C-01 to C-30 compliance audit & master Playwright E2E suite. | 10% | **100% (v1.0 Done)** |

---

## 3. Module Completion Matrix (M1 through M9)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               MODULE COMPLETION MATRIX                                 │
├──────┬─────────────────────────────┬───────────┬───────────────────────────────────────┤
│ Mod  │ Domain Scope                │ Sprint    │ Delivery Status & Task Reference      │
├──────┼─────────────────────────────┼───────────┼───────────────────────────────────────┤
│ M1   │ core/db                     │ S0, S5    │ 100% (S0-T01 DDL & RLS, S5-T04 Sheet) │
│ M2   │ ingest/scout (35 Sources)   │ S1, S3, S5│ 100% (S1-T01 scrapers, S3-T02 Ingest, │
│      │                             │           │       S5-T03 Clipper, S5-T01 Health)  │
│ M3   │ eval/brain (3-Tier Fit)     │ S1, S4    │ 100% (S1-T03 Tiers 1/2, S4-T01 Tier 3)│
│ M4   │ workspace/google            │ S3, S4    │ 100% (S3-T04 CV/PDF, S4-T04 Whisper)  │
│ M5   │ intel/teardown              │ S4        │ 100% (S4-T02 Reviews, S4-T03 1-Pager) │
│ M6   │ people/enrichment           │ S3        │ 100% (S3-T03 Three Doors Allocation)  │
│ M7   │ cadence/engine              │ S3        │ 100% (S3-T05 Drafts R1, S3-T06 Board) │
│ M8   │ dossier/identity            │ S2, S3    │ 100% (S2-T04 Tracks, S3-T04 Proofs)   │
│ M9   │ ui/command-center           │ S1-S5     │ 100% (Radar, Table, Drawer, Health,   │
│      │                             │           │       Settings, Mobile 380px)         │
└──────┴─────────────────────────────┴───────────┴───────────────────────────────────────┘
```

### Module Breakdown:
1. **M1 `core/db` (Data Persistence, Auth & Audit) — 100%**
   - Clean PostgreSQL 16 schema with 18 tables, 5 enums, 9 indexes, 11 RLS policies (`auth.uid() = user_id`).
   - Append-only audit trail (`REVOKE UPDATE, DELETE ON decision_events`).
   - Asynchronous Google Sheet downstream mirror worker with exponential backoff across 4 tabs.
2. **M2 `ingest/scout` (Job Sources & Intake) — 100%**
   - Ingestion across 35 verified sources with polite rate limits ($\ge 500$ms) and robots.txt compliance.
   - Canonical normalization and deduplication (`dedup_match_key`).
   - Universal Ingest modal (`Shift + I`) and Chrome Extension 1-click job clipper (`extension/clipper.js`).
3. **M3 `eval/brain` (3-Tier Suitability Engine) — 100%**
   - Tier 1 eligibility gate ($< 100$ms, location, visa, remote boundary, FinTech/Payments blocklist).
   - Tier 2 deterministic mathematical formula (0–100 score).
   - Tier 3 deep LLM synthesis for roles $\ge 70\%$, citing verified `proof_points` IDs, 1 positioning angle, and score booster gaps $\ge 5$ pts.
4. **M4 `workspace/google` (Document Automation & Audio) — 100%**
   - Tailored CV Google Docs builder enforcing Cardinal Rule R5 (byte-for-byte proof point number match).
   - Zero-cost Google Drive PDF export.
   - Chrome Extension Google Meet tab audio capture in 10-minute WAV chunks + Groq Whisper transcription into actionable notes.
5. **M5 `intel/teardown` (Company Intelligence & Review Auditor) — 100%**
   - Scrapes public complaints from Reddit JSON and Apple App Store RSS feeds.
   - Sentiment analysis clustering top 5 recurring friction points.
   - Automated 1-pager Google Doc teardown generator proposing Quick Win, Growth Loop, and Monetization Feature.
6. **M6 `people/enrichment` (Contact Discovery — Three Doors) — 100%**
   - Allocates key contacts across Door 1 (Hiring Manager), Door 2 (Peer PM), and Door 3 (Recruiter).
   - Apollo.io and Hunter.io resolution with public activity scoring ($0 - 100$) and LinkedIn query links.
7. **M7 `cadence/engine` (Drafts, Timing & Follow-Ups) — 100%**
   - Cardinal Rule R1 security invariant: drafts created exclusively in `ThreeDoors/Drafts`; zero calls to `messages.send`.
   - Recipient timezone geocoding scheduling sends for Tue–Thu 09:15 recipient local time.
   - Gmail thread watcher detecting replies and automatically halting pending follow-ups.
8. **M8 `dossier/identity` (Profile, Tracks & Proof Points) — 100%**
   - Candidate profile setup with structured proof points library.
   - Dynamic persona tracks (*AI-Native PM*, *Growth PM*, *UX PM*).
9. **M9 `ui/command-center` (Bento Command Workspace) — 100%**
   - Morning Radar feed (top 20 roles, 24h filter, fit $\ge 70\%$).
   - Dual-view switcher (1:1 Bento Cards vs. Dense Command Table).
   - Mouse-free keyboard navigation (`j`, `k`, `Enter`, `s`, `c`, `/`, `Esc`).
   - 640px slide-out dossier drawer with route interception and in-drawer cycling.
   - Outreach Kanban board, 35-source health dashboard, and encrypted Settings BYOK vault.
   - Mobile responsive layout down to $380\text{px}$.

---

## 4. End-to-End User Journeys Verification

1. **Journey 1: Morning Discovery & Triage ($\le 15$ mins)** — *Unlocked in Sprint 2*  
   Candidate scans top 20 high-fit roles on Morning Radar, switches between Bento Cards and Dense Table, and triages rapidly with `j`/`k`/`s`/`c`.
2. **Journey 2: Dossier Review & Outreach Prep ($\le 5$ mins / role)** — *Unlocked in Sprint 3*  
   Pressing `Enter` opens 640px drawer without page reload. Candidate reviews 3 Doors, generates a verified tailored CV (Rule R5), and stages a draft in Gmail (Rule R1).
3. **Journey 3: Review, Send & Thread Cadence** — *Unlocked in Sprint 3*  
   Candidate conducts final human review in Gmail and dispatches. Thread watcher monitors responses and automatically stops follow-ups upon incoming reply.
4. **Journey 4: Meeting Audio Capture & AI Notes** — *Unlocked in Sprint 4*  
   Extension captures Google Meet tab audio; Groq Whisper transcribes into questions, candidate answers, and action items in `/interviews`.

---

## 5. Technical Invariants & Cardinal Rules (R1 – R8)

- **Rule R1 (Zero Outbound Sends):** Verified via static AST check. Codebase contains 0 hits for `messages.send` or `gmail.send`.
- **Rule R2 ($0.00 Running Cost):** Free-tier architecture (Supabase, Groq Whisper free tier, Google Workspace native endpoints).
- **Rule R3 (BYOK Architecture):** Missing external API keys skip gracefully (`Skipped: no key`).
- **Rule R4 (Local & Privacy First):** Single-user PostgreSQL instance with AES-256 encrypted secrets vault.
- **Rule R5 (Zero Hallucinated Metrics):** Regex diff strictly checks every CV metric against `proof_points` byte-for-byte.
- **Rule R6 (SSRF & Polite Crawling):** All crawlers enforce $\ge 500$ms delays, User-Agent identification, and loopback IP blocking.
- **Rule R7 (Precision Cobalt & Steel Design):** AST color scan enforces 0 instances of indigo, violet, orange, or amber hex codes.
- **Rule R8 (Non-Technical PM Git Governance):** Strict feature branch isolation (`feature/p[N]-[subsystem]-[slug]`), PR-first protocol, and mandatory PM approval prompts.

---

## 6. PRD Non-Goals Confirmation

The following remain **strictly out-of-scope** in compliance with PRD §1.4:
- Automated email or LinkedIn dispatch.
- Automated application form autofill bots (Workday, Lever, etc.).
- Paid proxy networks or bot-wall bypass tools.
- Native mobile app binaries (iOS/Android) — delivered as web-responsive UI down to 380px.
- Multi-user enterprise collaboration.
