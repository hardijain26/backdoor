# Backdoor (v1.0) — Executive PM Career Command Center

Backdoor is an autonomous, high-velocity career acceleration command center engineered for **Senior, Staff, Principal, and Executive Product Managers**. It operationalizes job discovery, automated suitability scoring, multi-channel outreach, resume tailoring, and interview intelligence based on the proven **Three Doors Thesis**.

---

## 🚪 The Three Doors Thesis

Traditional job boards subject candidates to algorithmic black holes. Backdoor circumvents standard application queues by triangulating three distinct avenues of entry for every opportunity:

* **Door 1: Decision Maker (Executive / Hiring Manager)**  
  Direct outreach to VP of Product, Head of Product, or Founder. Highest response yield and strategic alignment.
* **Door 2: Gatekeeper (Technical Recruiter / Talent Lead)**  
  Targeted contact with the lead recruiter or talent partner managing the pipeline.
* **Door 3: Ally (Peer PM / Senior Colleague)**  
  Warm peer connection with a current PM or engineer on the team for insider context and internal referrals.

---

## ⚡ Core Capabilities & Subsystems

### 1. Morning Radar & Ingestion Feed (`/radar`)
* **Dual View Architecture:** Switch seamlessly between high-density **1:1 Bento Cards** and a keyboard-accelerated **Dense Table View**.
* **Top 20 / 24h Triage Gate:** Curates the top 20 roles with suitability score $\ge 70\%$ discovered in the last 24 hours.
* **Keyboard Hotkey Command Engine:** Instant triage without a mouse:
  * `j` / `k` or `↓` / `↑` — Navigate between opportunities
  * `c` — Mark role as **CHOSEN** and stage into outreach
  * `x` — Dismiss / Skip role
  * `Enter` — Slide open the full 640px Dossier Drawer
  * `Shift + I` — Open Universal Ingestion modal

### 2. 640px Slide-Out Dossier Drawer
* **Tab 1: Spec:** Clean, formatted job description with salary, location, and requirement chips.
* **Tab 2: Match Breakdown & Tier 3 Synthesis:**
  * **Deterministic Fit Score (0–100%):** Weighted scoring across target title, domain skills, and seniority.
  * **Strategic Positioning Angle:** Executive narrative framing for how to position your background.
  * **Verified Proof Bullets:** 3 tailored achievements selected from your career library with 100% byte-for-byte metric exactness (Rule R5).
  * **Score Booster Gaps:** High-ROI recommendation chips (+5 to +6 pts) identifying key experience gaps to address.
* **Tab 3: Intel & Teardown:** Company brief, funding, headcount, and Glassdoor candidate complaints.
* **Tab 4: Three Doors Contacts:** Enriched contacts for Door 1 (Exec), Door 2 (Recruiter), and Door 3 (Ally) with confidence scores.
* **Tab 5: Gmail Draft Staging:** One-click generation of personalized outreach drafts directly in Gmail.

### 3. Multi-Channel Cadence & Kanban Board (`/outreach`)
* **Kanban Swimlanes:** Track conversations across 5 stages:
  `Draft Ready in Gmail` $\to$ `Sent (Awaiting Reply)` $\to$ `Follow-Up Due (Day 3/5)` $\to$ `In Conversation` $\to$ `Closed / Archived`.
* **Smart Delivery Window Scheduling:** Calculates recipient local timezone and schedules outreach for peak engagement windows (Tuesday–Thursday 09:15 AM recipient working hours).
* **Candidate Local Timezone Conversion:** Automatically converts foreign delivery windows into candidate local time (e.g. London 09:15 AM $\to$ `Tue 14:45 IST`).
* **Safety Rate Limiter (Rule R8):** Rolling 40 drafts per 24 hours quota cap with live remaining quota badges.

### 4. Tailored CV Builder & Metric Verifier (`/cv/preview`)
* **Deterministic LaTeX / PDF Generator:** Dynamic PDF resume tailored to the target role's required competencies.
* **Rule R5 Metric Verification Engine:** Strict byte-for-byte regex validation guaranteeing zero hallucinated numbers, altered percentages, or rounded metrics.

### 5. Interview Notes & Audio Intelligence (`/interviews`)
* **Google Meet Tab Audio Capture Extension (`extension/audio-capture.js`):** Attaches to active Meet tab audio in 10-minute WAV chunks (< 25MB) with candidate consent and floating timer pill.
* **Groq Whisper Transcription Pipeline:** Sub-second speech-to-text inference with Groq Whisper (`whisper-large-v3-turbo`) with offline fallback ($0.00 cost per Rule R3).
* **Structured Debrief Workspace:** Automatically extracts verbatim speaker turns, Q&A pairs, candidate commitments, and next steps.
* **Interactive Action Items Checklist:** Check off follow-up tasks with optimistic UI strike-through and persistence.
* **One-Click Thank-You Note Staging:** Generates personalized post-interview follow-up drafts directly in Gmail.

### 6. 35-Source Fleet Health & Observability (`/health`)
* **35 Ingestion Sources Monitored:** Grouped across Direct ATS (8), Company Direct (1), Remote Boards (7), Curated Tech Communities (10), Inbound Clippers (3), and BYOK Aggregators (6).
* **Visual Status Indicators:** Real-time health pills (`HEALTHY` Emerald, `DEGRADED` Crimson, `SKIPPED: NO KEY` Slate) with latency and 24h yields.
* **On-Demand Diagnostics:** Click any degraded source to inspect raw stack traces and trigger an immediate "Test Source Now" verification run.
* **Pipeline Conversion Funnel:** Real-time funnel yields (Discovered $\to$ Chosen $\to$ Sent $\to$ In Conversation $\to$ Offer) and Door 1 vs. Door 2 reply comparison.
* **Immutable RFC 4180 CSV Export:** Instant download of all decision audit logs (`/api/audit/export-csv`).

### 7. Encrypted Settings & BYOK Vault (`/settings`)
* **Candidate Location & Canonical Timezone:** Configure Country and State/Province to automatically resolve canonical IANA timezone (`Asia/Kolkata`, `America/New_York`, `Europe/London`).
* **AES-256-GCM Cryptographic Vault:** Secure encryption at rest for sensitive external API tokens (Apify, Apollo, Hunter, Groq, Gemini) with secret masking (`sk-••••••••4819`).
* **Negative Filter Rules:** Block unwanted postings before they hit your radar by defining excluded companies, banned title patterns, and blocked industries.
* **Dynamic Candidate Tracks:** Customize candidate scoring weights (Staff PM: 40%, AI-Native PM: 35%, Growth PM: 15%, Founding PM: 10%) without database migrations.

### 8. Chrome Extension Job Clipper (`extension/`)
* **1-Click DOM Parsers:** Dedicated extractors for LinkedIn, Greenhouse, Lever, Workday, and Indeed, with universal JSON-LD schema.org fallback.
* **Instant Suitability Scoring:** Evaluates the role in sub-100ms and displays a non-intrusive floating toast: `Job Saved (94% FIT) — Open Role`.

### 9. Mobile Responsive Adaptation ($380\text{px}$ Breakpoint Support)
* **Slide-Over Navigation Drawer:** Header navigation collapses into a touch-friendly slide-over drawer with a WCAG AAA compliant $44\text{px} \times 44\text{px}$ hamburger button.
* **Zero Horizontal Scroll:** Strict `overflow-x: hidden` and single-column card stacking optimized for small mobile viewports ($380\text{px} \times 844\text{px}$ iPhone SE).

---

## 🏛️ Architecture & Cardinal Invariants (Rules R1 – R8)

Backdoor is built with unyielding technical invariants governed by automated preflight commit gates:

* **Rule R1: Absolute Zero Automated Sends:**  
  The codebase contains 0 calls to `messages.send` or `gmail.send`. All outreach emails are staged as Gmail drafts (`ThreeDoors/Drafts`) or opened in native compose windows. The human candidate must always review and click send.
* **Rule R2 & R3: $0.00 Infrastructure Running Cost & BYOK:**  
  Built entirely on free-tier services (Next.js, Supabase, Groq Whisper free tier). Any missing external API key skips gracefully (`SKIPPED: NO KEY`) without unhandled errors.
* **Rule R4: Local & Privacy First:**  
  Single-user PostgreSQL instance with AES-256-GCM encrypted secrets vault. No centralized tracking or data resale.
* **Rule R5: Zero Metric Hallucination:**  
  Every metric in tailored CVs and synthesis bullets is validated byte-for-byte against the candidate's verified proof point library (`HARDI_PROOF_POINTS_LIBRARY`).
* **Rule R6: SSRF Prevention & Polite Crawling:**  
  All crawlers enforce $\ge 500\text{ms}$ politeness delays, User-Agent identification, and strict blocking of private IP subnets and cloud metadata endpoints (`169.254.169.254`).
* **Rule R7: Precision Cobalt & Deep Obsidian Design Tokens:**  
  High-contrast WCAG AAA theme (`#080B11` canvas, `#0F1523` card, `#161F33` drawer, `#2563EB` Cobalt accent). Strictly 0 forbidden color tokens (zero orange, amber, indigo, violet, terracotta).
* **Rule R8: Strict Git Governance & Preflight Verification:**  
  Feature branch isolation (`feature/p[N]-[subsystem]-[slug]`), PR-first workflow, and mandatory 7-gate preflight script execution prior to every commit.

---

## 📂 Project Structure

```
backdoor/
├── database/
│   ├── schema.sql                 # PostgreSQL 16 schema with 18 tables & Row Level Security
│   └── seeds/                     # Seed data for roles, proof points, and candidates
├── docs/
│   ├── broadcasts/                # 3-Tier release broadcasts (Slack, Email, Executive 1-Liner)
│   ├── sprints/                   # Sprint execution plans (Sprints 0 to 5) and audit reports
│   └── prompts/                   # Engineering runbooks and architecture guidelines
├── extension/
│   ├── manifest.json              # Chrome Extension Manifest V3
│   ├── clipper.js                 # 1-Click DOM parser for LinkedIn, Greenhouse, Lever, etc.
│   ├── audio-capture.js           # Google Meet tab audio recorder in 10-minute WAV chunks
│   ├── popup.html                 # Extension popup interface
│   └── popup.js                   # Popup controller script
├── scripts/
│   └── preflight.sh               # Mandatory 7-gate preflight commit verification script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit/             # RFC 4180 CSV audit log exporter
│   │   │   ├── cadence/           # Cadence board, transitions, and quota endpoints
│   │   │   ├── cv/                # Tailored CV builder endpoint
│   │   │   ├── enrichment/        # Three Doors contact enrichment endpoint
│   │   │   ├── eval/tier3/        # Tier 3 executive synthesis & pitch strategy endpoint
│   │   │   ├── health/            # 35-source fleet health & test runner endpoints
│   │   │   ├── ingest/universal/  # Universal ingest & clipper endpoint
│   │   │   ├── interviews/        # Audio transcription & interview debrief endpoints
│   │   │   ├── settings/          # AES-256 vault, timezone profile, and BYOK endpoints
│   │   │   └── sheet/             # Google Sheet asynchronous mirror sync endpoint
│   │   ├── health/                # Fleet Health Dashboard page (/health)
│   │   ├── interviews/            # Interview Notes & Audio Transcripts page (/interviews)
│   │   ├── outreach/              # Multi-channel Cadence Kanban Board (/outreach)
│   │   ├── radar/                 # Morning Radar Bento & Table view (/radar)
│   │   └── settings/              # Candidate Location, Vault, & Negative Filters (/settings)
│   ├── components/
│   │   ├── dossier/               # 640px Dossier Drawer with 5-tab architecture
│   │   ├── ingest/                # Universal Ingestion Modal
│   │   ├── outreach/              # Cadence Kanban Cards
│   │   ├── Navbar.tsx             # Responsive Navigation with mobile slide-over drawer
│   │   └── ThreeDoorsChips.tsx    # Door 1 / Door 2 / Door 3 contact indicator chips
│   └── engine/
│       ├── audio-transcription.ts # Groq Whisper inference & structured note parser
│       ├── cadence.ts             # Timezone scheduling & delivery window resolver
│       ├── contact-enrichment.ts  # Three Doors contact classifier & resolver
│       ├── cv-builder.ts          # Tailored CV pipeline & Rule R5 metric verifier
│       ├── fleet-health.ts        # 35-source telemetry collector & anomaly detector
│       ├── scorer.ts              # Tier 1 boolean gate & Tier 2 mathematical scoring
│       ├── scraper.ts             # 35 verified ingestion channels & SSRF validator
│       ├── settings.ts            # AES-256 cryptographic vault & negative filters
│       ├── sheet-mirror.ts        # Async Google Sheet mirror worker & conversion funnel
│       └── tier3-eval.ts          # Tier 3 executive synthesis & Score Booster engine
└── tests/
    ├── compliance-master-audit.test.ts # Master compliance audit (Clauses C-01 to C-30)
    ├── extension-clipper.test.ts       # Chrome extension DOM extractors unit tests
    ├── fleet-health.test.ts            # 35-source fleet health unit tests
    ├── settings-encryption.test.ts     # AES-256-GCM encryption & vault unit tests
    ├── sheet-mirror-worker.test.ts     # Async Google Sheet mirror worker unit tests
    └── frontend/                       # React SSR component & responsive tests
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18.17.0+ (Tested on Node v20 / v26)
* **npm:** v9.0.0+
* **PostgreSQL:** v16+ (or Supabase project)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hardijain26/backdoor.git
   cd backdoor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and add your optional BYOK keys:
   ```bash
   cp .env.example .env.local
   ```
   *Note: All external keys are optional. Backdoor operates deterministically with zero vendor cost without them.*

4. **Initialize Database Schema:**
   Apply the canonical DDL schema to your PostgreSQL / Supabase instance:
   ```bash
   # In your Supabase SQL editor or psql:
   \i database/schema.sql
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

6. **Load Chrome Extension (Optional):**
   * Open Chrome and navigate to `chrome://extensions`.
   * Enable **Developer mode** (top right toggle).
   * Click **Load unpacked** and select the `extension/` folder in this repository.

---

## 🧪 Quality Assurance & Mandatory Preflight Gates

Backdoor enforces a **Mandatory 7-Gate Preflight Verification** (`scripts/preflight.sh`) before any commit or release:

```bash
bash scripts/preflight.sh
```

| Preflight Gate | Verification Scope | Status |
| :--- | :--- | :---: |
| **Gate 1/7** | **TypeScript Static Verification** (`tsc --noEmit`) | **PASS (0 Errors)** |
| **Gate 2/7** | **Frontend Lint Verification** (`next lint`) | **PASS (Clean)** |
| **Gate 3/7** | **Node.js Unit & Compliance Tests** (87 Tests) | **PASS (87/87 Passed)** |
| **Gate 4/7** | **Frontend Component & Token Isolation Tests** | **PASS (Clean)** |
| **Gate 5/7** | **PostgreSQL 16 Schema, RLS & Idempotency** | **PASS (18/18 Tables RLS)** |
| **Gate 6/7** | **Playwright End-to-End User Journey Tests** | **PASS (Certified)** |
| **Gate 7/7** | **Next.js Production Build** (`next build`) | **PASS (26/26 Routes)** |

To run the standalone unit and invariant test suite:
```bash
npm run test:node
```

---

## 📄 License & Confidentiality

Copyright © 2026 Hardi Jain. All rights reserved.  
Backdoor is proprietary software engineered for executive career intelligence. Unauthorized redistribution or public disclosure is strictly prohibited.
