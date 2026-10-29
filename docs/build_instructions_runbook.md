# Three Doors (backdoorv.1): Comprehensive Product-Centric Build Instruction & Operational Runbook

**Document Version:** backdoorv.1 Master Production Runbook  
**Target Platform:** Next.js 15 (App Router, React 19, TypeScript), PostgreSQL 16 (Supabase), Google Workspace APIs, Groq Whisper API  
**Authoritative Sources:** Brain Artifacts 1–7 (`da7482c2-623f-4e73-a571-96799e8cb128`), Phase 0 Spec Mining & Quality Gating Reports  
**Primary Deliverable File:** `docs/build_instructions_runbook.md`  
**Target Audience:** Core Engineers, Subsystem Implementers, Forensic Auditors, Site Reliability Engineers  
**Engineering Integrity Mode:** Development / Zero Facade Policy  

---

## Table of Contents

1. [Master Product Vision & Architectural Invariants](#1-master-product-vision--architectural-invariants)
   - 1.1 [The Backdoor Executive Thesis (Bypassing ATS via Three Human Doors)](#11-the-backdoor-executive-thesis-bypassing-ats-via-three-human-doors)
   - 1.2 [Candidate Profile, Career Context & Strict Negative Boundaries](#12-candidate-profile-career-context--strict-negative-boundaries)
   - 1.3 [System Topology, Module Inventory & Inter-Module Contracts](#13-system-topology-module-inventory--inter-module-contracts)
   - 1.4 [The Eight Cardinal Engineering Rules (R1–R8) as Technical Invariants](#14-the-eight-cardinal-engineering-rules-r1r8-as-technical-invariants)
2. [Subsystem 1: Database & Backend Engine (`@core/db`)](#2-subsystem-1-database--backend-engine-coredb)
   - 2.1 [Product Mental Model: The Opportunity Lake, Entity Graphs & Audit Integrity](#21-product-mental-model-the-opportunity-lake-entity-graphs--audit-integrity)
   - 2.2 [PostgreSQL 16 Schema Specification (11 Sections, 18 Tables, 5 Enums, 9 Indexes)](#22-postgresql-16-schema-specification-11-sections-18-tables-5-enums-9-indexes)
   - 2.3 [Multi-Tenant Row Level Security (RLS) Isolation Architecture](#23-multi-tenant-row-level-security-rls-isolation-architecture)
   - 2.4 [Append-Only Audit Event Ledger (`decision_events`) & Tamper-Proof Guarantees](#24-append-only-audit-event-ledger-decision_events--tamper-proof-guarantees)
   - 2.5 [Downstream Google Sheet Asynchronous Mirroring Worker](#25-downstream-google-sheet-asynchronous-mirroring-worker)
   - 2.6 [Ground-Zero Clean Bootstrap DDL (00000000000000_init_schema.sql)](#26-ground-zero-clean-bootstrap-ddl-00000000000000_init_schemasql)
   - 2.7 [Subsystem 1 Verification Runbook & Gating Commands](#27-subsystem-1-verification-runbook--gating-commands)
3. [Subsystem 2: Frontend & Component Engineering (`@ui/command-center`)](#3-subsystem-2-frontend--component-engineering-uicommand-center)
   - 3.1 [Product Mental Model: Zero Chromatic Fatigue, Telemetry Badges & Keyboard Supremacy](#31-product-mental-model-zero-chromatic-fatigue-telemetry-badges--keyboard-supremacy)
   - 3.2 [Precision Cobalt & Steel Design System](#32-precision-cobalt--steel-design-system)
   - 3.3 [Morning Radar Component Engineering (Top 20 Roles, 24h Window, Fit $\ge 70\%$)](#33-morning-radar-component-engineering-top-20-roles-24h-window-fit-ge-70)
   - 3.4 [Dual-View Switcher: 1:1 Bento Cards ($320\text{px} \times 320\text{px}$) vs Dense Command Table](#34-dual-view-switcher-11-bento-cards-320textpx-times-320textpx-vs-dense-command-table)
   - 3.5 [Dense Command Table & Mouse-Free Keyboard Engine (`j`, `k`, `Enter`, `s`, `c`, `/`, `Esc`)](#35-dense-command-table--mouse-free-keyboard-engine-j-k-enter-s-c--esc)
   - 3.6 [Three Doors Segmented Indicator Chips & Inline Telemetry](#36-three-doors-segmented-indicator-chips--inline-telemetry)
   - 3.7 [Subsystem 2 Verification Runbook & Gating Commands](#37-subsystem-2-verification-runbook--gating-commands)
4. [Subsystem 3: Navigation, Routing & Modals Architecture](#4-subsystem-3-navigation-routing--modals-architecture)
   - 4.1 [Product Mental Model: Focused Workspace Navigation & Zero-Reload Triage](#41-product-mental-model-focused-workspace-navigation--zero-reload-triage)
   - 4.2 [Next.js 15 App Router Layout & Workspace Route Hierarchy](#42-nextjs-15-app-router-layout--workspace-route-hierarchy)
   - 4.3 [Slide-Out Dossier Drawer Routing (`$640\text{px}`, `@drawer/(.)discover/[job_id]`)](#43-slide-out-dossier-drawer-routing-640textpx-drawerdiscoverjob_id)
   - 4.4 [Universal Ingest Modal Engine (`Shift + I` / `+ Add Job`)](#44-universal-ingest-modal-engine-shift--i---add-job)
   - 4.5 [Responsive Mobile Breakpoint Architecture ($380\text{px}$ Support)](#45-responsive-mobile-breakpoint-architecture-380textpx-support)
   - 4.6 [Subsystem 3 Verification Runbook & Gating Commands](#46-subsystem-3-verification-runbook--gating-commands)
5. [Subsystem 4: Business Logic, Scrapers & Cadence Workflows](#5-subsystem-4-business-logic-scrapers--cadence-workflows)
   - 5.1 [Product Mental Model: Autonomous Intelligence & Safe Human Outreach](#51-product-mental-model-autonomous-intelligence--safe-human-outreach)
   - 5.2 [35-Source Ingestion & Polite Scraping Engine (`@ingest/scout` M2)](#52-35-source-ingestion--polite-scraping-engine-ingestscout-m2)
   - 5.3 [3-Tier Suitability Engine (`@eval/brain` M3)](#53-3-tier-suitability-engine-evalbrain-m3)
   - 5.4 [Document Automation & Audio Intelligence (`@workspace/google` M4)](#54-document-automation--audio-intelligence-workspacegoogle-m4)
   - 5.5 [Company Intelligence & Review Auditor (`@intel/teardown` M5)](#55-company-intelligence--review-auditor-intelteardown-m5)
   - 5.6 [The Three Doors Contact Allocation (`@people/enrichment` M6)](#56-the-three-doors-contact-allocation-peopleenrichment-m6)
   - 5.7 [Multi-Channel Cadence Engine (`@cadence/engine` M7)](#57-multi-channel-cadence-engine-cadenceengine-m7)
   - 5.8 [Subsystem 4 Verification Runbook & Gating Commands](#58-subsystem-4-verification-runbook--gating-commands)
6. [Quality Gating Protocols & Preflight Automation](#6-quality-gating-protocols--preflight-automation)
   - 6.1 [Mandatory Local Branch Commit Preflight Gate (`scripts/preflight.sh`)](#61-mandatory-local-branch-commit-preflight-gate-scriptspreflightsh)
   - 6.2 [Git Pre-Commit & Pre-Push Hook Wiring](#62-git-pre-commit--pre-push-hook-wiring)
   - 6.3 [Phased Execution Exit Gates Architecture (Phase 0 through Phase 4)](#63-phased-execution-exit-gates-architecture-phase-0-through-phase-4)
   - 6.4 [Binary Veto Checklists & Rollback Procedures](#64-binary-veto-checklists--rollback-procedures)
7. [Comprehensive Test & Verification Criteria Specification](#7-comprehensive-test--verification-criteria-specification)
   - 7.1 [Subsystem 1 (Database & Backend) Test Suite](#71-subsystem-1-database--backend-test-suite)
   - 7.2 [Subsystem 2 (Frontend & Design System) Test Suite](#72-subsystem-2-frontend--design-system-test-suite)
   - 7.3 [Subsystem 3 (Navigation & Routing) Test Suite](#73-subsystem-3-navigation--routing-test-suite)
   - 7.4 [Subsystem 4 (Business Logic & Cadence) Test Suite](#74-subsystem-4-business-logic--cadence-test-suite)
8. [100% Compliance Verification Rubric (Artifacts 1 through 7)](#8-100-compliance-verification-rubric-artifacts-1-through-7)
9. [Operational Runbooks & Incident Response](#9-operational-runbooks--incident-response)
   - 9.1 [Ingestion Scraper Failure & Drift Recovery](#91-ingestion-scraper-failure--drift-recovery)
   - 9.2 [Google OAuth Disconnection & Token Rotation](#92-google-oauth-disconnection--token-rotation)
   - 9.3 [Safety Cap & Quota Throttling Response](#93-safety-cap--quota-throttling-response)
   - 9.4 [Supabase Inactivity Prevention & Database Replay](#94-supabase-inactivity-prevention--database-replay)
10. [Non-Technical Safe Git & GitHub Release Workflow](#10-non-technical-safe-git--github-release-workflow)
   - 10.1 [Plain-English Git Architecture for Product Managers](#101-plain-english-git-architecture-for-product-managers)
   - 10.2 [Strict Branch Isolation Invariant (`feature/<phase>-<subsystem>-<feature>`)](#102-strict-branch-isolation-invariant-featurephase-subsystem-feature)
   - 10.3 [Staging Preflight Verification & The PR-First Protocol](#103-staging-preflight-verification--the-pr-first-protocol)
   - 10.4 [Mandatory User Approval Gate & Exact Communication Protocol](#104-mandatory-user-approval-gate--exact-communication-protocol)
   - 10.5 [Step-by-Step GitHub Web Interface Review Guide for Non-Technical Approvers](#105-step-by-step-github-web-interface-review-guide-for-non-technical-approvers)
11. [Production Testing, Deployment & Bug Resolution Protocol](#11-production-testing-deployment--bug-resolution-protocol)
   - 11.1 [Strict Merge Ordering & Production Release Sequence](#111-strict-merge-ordering--production-release-sequence)
   - 11.2 [Live Production Verification Checklist for the Product Manager](#112-live-production-verification-checklist-for-the-product-manager)
   - 11.3 [Production Defect & Incident Classification Taxonomy (P0–P3)](#113-production-defect--incident-classification-taxonomy-p0p3)
   - 11.4 [Isolated Hotfix Branch Resolution Workflow (`hotfix/<issue-id>`)](#114-isolated-hotfix-branch-resolution-workflow-hotfixissue-id)
   - 11.5 [Root Cause Analysis (RCA) & Remediation Audit Trail](#115-root-cause-analysis-rca--remediation-audit-trail)
12. [Product Manager System Documentation Governance](#12-product-manager-system-documentation-governance)
   - 12.1 [The PM Documentation Mandate (Features, User Impact, Operational Behavior, Limitations)](#121-the-pm-documentation-mandate-features-user-impact-operational-behavior-limitations)
   - 12.2 [Post-Production Verification Documentation Trigger](#122-post-production-verification-documentation-trigger)
   - 12.3 [Documentation Maintenance Matrix & Living Document Registry](#123-documentation-maintenance-matrix--living-document-registry)
   - 12.4 [PM Release Notes & User-Facing Changelog Standard](#124-pm-release-notes--user-facing-changelog-standard)
13. [Sprint Planning & Sprint Tracking Protocol](#13-sprint-planning--sprint-tracking-protocol)
   - 13.1 [Upfront Sprint Planning Protocol (Pre-Execution Scoping & Definition of Done)](#131-upfront-sprint-planning-protocol-pre-execution-scoping--definition-of-done)
   - 13.2 [Dedicated Sprint Document Architecture (`docs/sprints/sprint_<N>_plan.md`)](#132-dedicated-sprint-document-architecture-docssprintssprint_n_planmd)
   - 13.3 [Live Sprint Execution Tracking & Status Lifecycle](#133-live-sprint-execution-tracking--status-lifecycle)
   - 13.4 [Bug Tracking & Remediation within Sprint Documents](#134-bug-tracking--remediation-within-sprint-documents)
   - 13.5 [Authoritative Sprint Plan Markdown Template (`template_sprint_plan.md`)](#135-authoritative-sprint-plan-markdown-template-template_sprint_planmd)

---

# 1. Master Product Vision & Architectural Invariants

## 1.1 The Backdoor Executive Thesis (Bypassing ATS via Three Human Doors)

Traditional job seeking is broken by Applicant Tracking Systems (ATS) that function as algorithmic shredders. Thousands of resumes pour into black-box parsing engines that discard high-caliber candidates based on brittle keyword heuristics. Candidates are reduced to desperate applicants competing in an asymmetric, low-signal lottery.

**Three Doors (`backdoorv.1`) reverses this power dynamic.**

Rather than submitting cold applications to public web forms, Three Doors discovers high-signal executive product opportunities within 24 hours of posting, evaluates them against verifiable proof points, and orchestrates surgical, multi-door human-in-the-loop outreach directly to three targeted human stakeholders:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE THREE HUMAN DOORS                                    │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ DOOR 1: DECISION MAKER   │ DOOR 2: THE GATEKEEPER      │ DOOR 3: THE ALLY              │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ Founder, VP of Product,  │ Technical Recruiter,        │ Peer Product Manager,         │
│ Head of Product, or GPM  │ Lead Talent Partner,        │ Tech Lead, or Former PayU     │
│ experiencing operational │ managing headcount quotas   │ colleague who can champion    │
│ pain and revenue gaps.   │ and pipeline velocity.      │ an internal referral.         │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ Value Pitch: Teardown    │ Value Pitch: Tailored       │ Value Pitch: Peer curiosity,  │
│ 1-Pager + Proof Point    │ 2-Page CV Google Doc        │ technical architecture chat,  │
│ solving their exact bug. │ mapped to exact job JD.     │ culture exploration.          │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

The system operates on an asymmetric outreach principle: **never automate sending, automate preparation**. By removing 95% of the manual labor required to research companies, tailor resumes, find decision-makers, and format timezone-optimized drafts, Three Doors empowers the candidate to conduct 10x more targeted, high-touch conversations while maintaining 100% human authenticity.

---

## 1.2 Candidate Profile, Career Context & Strict Negative Boundaries

All system behavior, scoring algorithms, and outreach pipelines are customized around the candidate profile of **Hardi Jain**:

### Candidate Baseline & Strengths:
- **Baseline Profession:** Chartered Accountant (CA) possessing deep financial rigor, audit methodologies, internal control frameworks, and unit economics expertise.
- **Product Track Record:** 3 years of hands-on Product Management experience at **PayU**, owning payment gateway latency, high-throughput transaction routing, and core checkout conversion.
- **AI-Native Side Projects:** Active builder with production-deployed applications, including **Pantry Vault AI** (intelligent pantry inventory management) and **Med-Voice** (clinical voice-to-action recording).
- **Target Persona Tracks:**
  1. `AI-Native PM`: LLM orchestration, evaluation frameworks, prompt caching, token economics, latency reduction.
  2. `Growth PM`: Funnel optimization, activation loops, CAC/LTV payback compression, virality experiments.
  3. `UX PM`: Workflow simplification, cognitive load reduction, micro-interactions, enterprise usability.
- **Target Geographies:** India, United States, United Kingdom, European Union, and Global Remote.

### Strict Negative Boundaries (Enforced at Database & Scraper Ingestion):
- **Banned Industries:** **FinTech, Payments, Crypto, Web3, and Neo-banking.** (Hardi is executing a deliberate career transition *out* of payments; any role belonging to these verticals is dropped before persistence).
- **Banned Title Keywords:** *Product Marketing Manager (PMM)*, *Engineering Manager*, *Technical Program Manager (TPM)*, *Scrum Master*, *Project Manager*.
- **Zero Hallucinated Numbers:** Resume bullets and AI teardowns must mirror Hardi's verified career metrics byte-for-byte.

---

## 1.3 System Topology, Module Inventory & Inter-Module Contracts

Three Doors is architected as a modular TypeScript monorepo operating on top of Next.js 15 App Router, Supabase PostgreSQL 16, Google Workspace, and Groq Whisper.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM TOPOLOGY & MODULE MAP                              │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Module Name                    │ Architectural Boundary & Core Responsibility          │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@core/db` (M1)                │ PostgreSQL 16 schema, multi-tenant RLS, immutable     │
│                                │ decision audit log, Google Sheets downstream mirror.  │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@ingest/scout` (M2)           │ 35-source crawler engine, 04:00 AM cron, dedup key     │
│                                │ calculation, negative regex filters, polite fetcher.  │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@eval/brain` (M3)             │ 3-tier suitability engine: Tier 1 gate (<100ms),       │
│                                │ Tier 2 formula (0–100), Tier 3 AI dossier synthesis.   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@workspace/google` (M4)       │ Google OAuth token vault, deterministic CV Doc clone, │
│                                │ zero-cost Drive PDF export, Groq Whisper Meet notes.  │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@intel/teardown` (M5)         │ Public complaint harvester (Reddit/AppStore), friction│
│                                │ tagging, 3 actionable product opportunities 1-pager.  │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@people/enrichment` (M6)      │ Door 1/2/3 contact identification, public activity    │
│                                │ scoring (0–100), verified work email resolution.      │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@cadence/engine` (M7)         │ Recipient timezone geocoding (09:15 AM window), Gmail  │
│                                │ draft staging in `ThreeDoors/Drafts`, thread watcher. │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@dossier/identity` (M8)       │ Candidate persona tracks, atomic proof points bank,   │
│                                │ CA-to-PM universal competency translation matrix.     │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ `@ui/command-center` (M9)      │ Morning Radar, Dual-View Switcher (1:1 Bento vs Dense │
│                                │ Table), $640\text{px}$ slide-out drawer, keyboard hotkeys.   │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

### Inter-Module Interface Contracts:
1. **`@core/db` $\longleftrightarrow$ `@ui/command-center`:**
   - Frontend reads `jobs` joined with `evaluations`, `companies`, and `tracks`.
   - All mutations dispatch RPC actions that commit changes and write immutable records to `public.decision_events`.
2. **`@ui/command-center` $\longleftrightarrow$ Navigation & Drawer:**
   - Dossier Drawer mounts via parallel route `@drawer/(.)discover/[job_id]` or URL search param `?drawer=[job_id]`.
   - Single-key navigation (`j`/`k`) mutates cursor state; `Enter` opens drawer; `↑`/`↓` updates route parameters without remounting parent layout or triggering page reload.
3. **`@ui/command-center` $\longleftrightarrow$ `@cadence/engine`:**
   - Dossier drawer initiates cadence staging via `POST /api/cadence/start` with payload `{ job_id, door, contact_id }`.
   - Response returns `{ cadence_id, status: 'DRAFT_CREATED', gmail_draft_id, draft_preview, linkedin_note }`.
   - Frontend displays read-only preview with "View in Gmail" and "Copy LinkedIn Note" triggers — **zero automated send buttons**.

---

## 1.4 The Eight Cardinal Engineering Rules (R1–R8) as Technical Invariants

Every subsystem implementation must enforce the following 8 non-negotiable rules. Any violation constitutes an immediate build failure and forensic rejection.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE EIGHT CARDINAL RULES (R1 – R8)                              │
├─────┬──────────────────────────┬───────────────────────────────────────────────────────┤
│ ID  │ Rule Invariant           │ Concrete Engineering Enforcement                      │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R1  │ Human Sends              │ No module calls `users.messages.send`, LinkedIn API   │
│     │                          │ messaging, or ATS auto-apply. OAuth requests          │
│     │                          │ `gmail.compose` & `gmail.readonly` only. Drafts stage │
│     │                          │ strictly in `ThreeDoors/Drafts`. Zero send calls.     │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R2  │ Free by Default          │ Base system operates at $0.00/month. Tiers 1 and 2    │
│     │                          │ run deterministically without external LLM API keys.  │
│     │                          │ Drive PDF uses native Google Drive export endpoint.   │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R3  │ User Keys, User Cost     │ Paid integrations (Groq, Anthropic, Apollo, Hunter)   │
│     │                          │ run strictly on user's BYOK encrypted keys. Missing   │
│     │                          │ key gracefully logs `Skipped: no key` without crash.  │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R4  │ Every Fact Has a Source  │ Stored claims require source URL, confidence rating   │
│     │                          │ (`VERIFIED`, `INFERRED`, `HYPOTHESIS`), and date.     │
│     │                          │ Unknown fields render "Unavailable", never guessed.   │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R5  │ No Invented Numbers      │ LLM rewriters cannot modify or round numbers. Regex   │
│     │                          │ diff ensures generated CV numbers match M8 proof      │
│     │                          │ points byte-for-byte. Violations trigger fallback.    │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R6  │ Polite Fetching          │ SSRF-safe HTTP client (`safe-fetch.ts`), named User-  │
│     │                          │ Agent, >= 500ms spacing per host, robots.txt honored. │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R7  │ Audit State Changes      │ Every lifecycle mutation writes append-only event to  │
│     │                          │ `decision_events`. Database revokes UPDATE & DELETE.  │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ R8  │ Fair Use Safety Caps     │ Hard limits: max 40 draft creations per rolling 24h,  │
│     │                          │ max 200 tracked companies, max 80 link checks.        │
└─────┴──────────────────────────┴───────────────────────────────────────────────────────┘
```

### 1.4.1 The Five Cardinal PM Governance & Release Invariants (G1–G5)

In addition to technical runtime rules R1–R8, all engineering agents, contributors, and automation workflows must strictly adhere to the five Cardinal PM Governance & Release Invariants:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   THE FIVE CARDINAL PM GOVERNANCE RULES (G1 – G5)                      │
├─────┬──────────────────────────┬───────────────────────────────────────────────────────┤
│ ID  │ Rule Invariant           │ Concrete Governance & Release Enforcement             │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ G1  │ Strict Branch Isolation  │ Zero direct pushes to `main`. All work must occur on  │
│     │                          │ isolated branches (`feature/<phase>-<subsystem>-...`).│
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ G2  │ Staging Preflight Gate   │ Full 6-gate preflight (`scripts/preflight.sh`) must   │
│     │                          │ pass before any commit or PR creation. Zero bypass.   │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ G3  │ Human PM Approval Gate   │ Pull Requests require explicit PM approval. Agent must│
│     │                          │ notify PM: "Quality checks, unit tests, integration   │
│     │                          │ tests, and e2e tests have all passed. Ready for your  │
│     │                          │ review and approval." Merge strictly gated on approval│
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ G4  │ Post-Approval Production │ Code is merged and deployed ONLY after PM approval.   │
│     │ Release & Live Testing   │ PM executes live verification checklist; production   │
│     │                          │ bugs trigger isolated hotfix branch workflow.         │
├─────┼──────────────────────────┼───────────────────────────────────────────────────────┤
│ G5  │ PM Living Documentation  │ Upfront sprint planning in `docs/sprints/`; live task │
│     │ & Sprint Tracking        │ & defect logging; post-deployment PM doc updates on   │
│     │                          │ features, user impact, operational behavior & limits. │
└─────┴──────────────────────────┴───────────────────────────────────────────────────────┘
```

---

# 2. Subsystem 1: Database & Backend Engine (`@core/db`)

## 2.1 Product Mental Model: The Opportunity Lake, Entity Graphs & Audit Integrity

The database is structured around a two-tier mental model:
1. **The Canonical Global Lake:** A shared, deduplicated repository of companies, postings, source provenance, and public complaints harvested from 35 web channels. Jobs in the lake are immutable records of market reality.
2. **The Private Executive Dossier (Tenant Isolated):** The candidate's private operational workspace containing persona tracks, atomic proof points, tailored evaluations, identified human contacts, scheduled cadences, and meeting notes.

Multi-tenancy is enforced natively at the database engine level via PostgreSQL 16 Row Level Security (RLS). Every candidate action produces an unalterable audit event in `decision_events`, guaranteeing complete historical forensic visibility.

```
                      GLOBAL LAKE (Shared, Canonical)
         ┌───────────────────┐               ┌───────────────────┐
         │ public.companies  │ 1 ──────── ∞ │    public.jobs    │
         └─────────┬─────────┘               └─────────┬─────────┘
                   │ 1                                 │ 1
                   │                                   │
                   │ ∞                                 │ ∞
         ┌─────────┴─────────┐               ┌─────────┴─────────┐
         │ public.complaints │               │public.job_sources │
         └───────────────────┘               └───────────────────┘
                   │                                   │
═══════════════════╪═══════════════════════════════════╪═══════════════════════════
                   │ RLS BOUNDARY (auth.uid() = user_id)│
                   v                                   v
         ┌───────────────────┐               ┌───────────────────┐
         │  public.contacts  │ ∞           ∞ │public.evaluations │
         └─────────┬─────────┘               └─────────┬─────────┘
                   │ 1                                 │ 1
                   │                                   │
                   │            ┌───────────────────┐  │
                   └──────────> │  public.cadences  │ <┘
                                └───────────────────┘
                                          │
                                          v
                               ┌──────────────────────┐
                               │public.decision_events│ (REVOKE UPDATE, DELETE)
                               └──────────────────────┘
```

---

## 2.2 PostgreSQL 16 Schema Specification (11 Sections, 18 Tables, 5 Enums, 9 Indexes)

The target backend must implement the exact schema specified in **Artifact 2**. Below is the complete, production-grade DDL defining all cryptographic extensions, enums, tables, performance indexes, RLS policies, and permission revocations.

```sql
-- ============================================================================
-- THREE DOORS (backdoorv.1) CANONICAL POSTGRESQL 16 SCHEMA
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES (5 Custom Types)
-- ============================================================================
CREATE TYPE posting_status_enum AS ENUM (
    'OPEN', 
    'STALE', 
    'CLOSED'
);

CREATE TYPE application_stage_enum AS ENUM (
    'DISCOVERED', 
    'CHOSEN', 
    'OUTREACH_STARTED', 
    'IN_CONVERSATION', 
    'INTERVIEW_SCHEDULED', 
    'OFFER_RECEIVED', 
    'ARCHIVED', 
    'SKIPPED', 
    'NOT_A_FIT'
);

CREATE TYPE outreach_door_enum AS ENUM (
    'DOOR_1', 
    'DOOR_2', 
    'DOOR_3'
);

CREATE TYPE cadence_step_status_enum AS ENUM (
    'DRAFT_PENDING', 
    'DRAFT_CREATED', 
    'SENT', 
    'REPLIED', 
    'BOUNCED', 
    'CANCELLED', 
    'SKIPPED'
);

CREATE TYPE contact_confidence_enum AS ENUM (
    'VERIFIED', 
    'INFERRED', 
    'HYPOTHESIS', 
    'CURATED'
);

-- ============================================================================
-- SECTION 1: PROFILES & IDENTITY (User-Owned)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    work_countries TEXT[] NOT NULL DEFAULT ARRAY['India', 'US', 'UK', 'EU'],
    linkedin_url TEXT NOT NULL,
    baseline_profession TEXT NOT NULL DEFAULT 'Chartered Accountant',
    google_tokens JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- SECTION 2: DYNAMIC PERSONA TRACKS (User-Owned)
-- ============================================================================
CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. 'AI-Native PM', 'Growth PM', 'UX PM'
    target_titles TEXT[] NOT NULL,
    skill_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
    seniority_levels TEXT[] NOT NULL,
    regions TEXT[] NOT NULL,
    excluded_industries TEXT[] NOT NULL DEFAULT ARRAY['FinTech', 'Payments'],
    featured_proof_point_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: PROOF POINTS & SIDE PROJECTS (User-Owned)
-- ============================================================================
CREATE TABLE public.proof_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    metric_number NUMERIC NOT NULL,
    metric_unit TEXT NOT NULL, -- '%', 'USD', 'tickets', 'ms'
    metric_direction TEXT NOT NULL, -- 'UP', 'DOWN'
    time_frame TEXT NOT NULL,
    employer TEXT NOT NULL,
    evidence_url TEXT,
    skills_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.side_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'Pantry Vault AI', 'Med-Voice'
    description TEXT NOT NULL,
    live_url TEXT,
    repo_url TEXT,
    tech_stack TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: GLOBAL COMPANIES & INTELLIGENCE (Canonical / Global)
-- ============================================================================
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    funding_stage TEXT,
    total_funding_usd NUMERIC,
    hq_location TEXT,
    headcount_estimate INTEGER,
    wikidata_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.company_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    one_sentence_summary TEXT NOT NULL,
    funding_details TEXT,
    recent_news JSONB NOT NULL DEFAULT '[]'::jsonb,
    founders JSONB NOT NULL DEFAULT '[]'::jsonb,
    why_you_fit TEXT,
    unconfirmed_points TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id)
);

CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'reddit', 'app_store_ios', 'pasted_excerpt'
    review_date DATE,
    source_url TEXT,
    excerpt TEXT NOT NULL,
    friction_tag TEXT NOT NULL, -- 'ONBOARDING', 'BILLING', 'BUG', 'FEATURE_GAP', 'SUPPORT'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 5: CANONICAL JOBS POOL & INGESTION (Canonical / Global)
-- ============================================================================
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    normalized_title TEXT NOT NULL,
    locations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    region TEXT NOT NULL,
    workplace TEXT NOT NULL, -- 'remote', 'hybrid', 'on-site'
    seniority TEXT,
    specializations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    apply_url TEXT NOT NULL,
    primary_source TEXT NOT NULL,
    dedup_match_key TEXT UNIQUE NOT NULL, -- normalized company + normalized title
    salary_raw TEXT,
    description_text TEXT NOT NULL,
    posted_at TIMESTAMPTZ,
    posting_status posting_status_enum NOT NULL DEFAULT 'OPEN',
    link_checked_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.job_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'greenhouse', 'remotive', 'linkedin_pasted'
    url TEXT NOT NULL,
    raw_payload JSONB,
    confidence contact_confidence_enum NOT NULL DEFAULT 'VERIFIED',
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, source, url)
);

CREATE TABLE public.sources (
    id TEXT PRIMARY KEY, -- 'greenhouse', 'ashby', 'reddit'
    display_name TEXT NOT NULL,
    group_type TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    requires_user_key BOOLEAN NOT NULL DEFAULT false,
    user_key_reference TEXT,
    last_run_at TIMESTAMPTZ,
    last_status TEXT,
    last_error TEXT
);

CREATE TABLE public.source_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    jobs_found INTEGER NOT NULL DEFAULT 0,
    jobs_stored INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT
);

-- ============================================================================
-- SECTION 6: USER-SPECIFIC EVALUATIONS (User-Owned)
-- ============================================================================
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    tier1_result BOOLEAN NOT NULL DEFAULT true,
    tier1_reason TEXT,
    fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
    tier2_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    score_confidence TEXT NOT NULL DEFAULT 'HIGH',
    strategic_positioning_angle TEXT,
    why_you_excel JSONB NOT NULL DEFAULT '[]'::jsonb,
    score_booster_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
    stage application_stage_enum NOT NULL DEFAULT 'DISCOVERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, job_id, track_id)
);

-- ============================================================================
-- SECTION 7: THE THREE DOORS CONTACTS (User-Owned)
-- ============================================================================
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    door outreach_door_enum NOT NULL,
    email TEXT,
    email_status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- 'VERIFIED', 'PROBABLE', 'UNVERIFIED'
    linkedin_url TEXT,
    source_url TEXT NOT NULL,
    confidence contact_confidence_enum NOT NULL DEFAULT 'INFERRED',
    activity_score INTEGER NOT NULL DEFAULT 50 CHECK (activity_score BETWEEN 0 AND 100),
    last_active_date DATE,
    do_not_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: CADENCES & GMAIL DRAFT TRACKING (User-Owned)
-- ============================================================================
CREATE TABLE public.cadences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    door outreach_door_enum NOT NULL,
    channel TEXT NOT NULL DEFAULT 'GMAIL', -- 'GMAIL', 'LINKEDIN_NOTE'
    step_number INTEGER NOT NULL DEFAULT 1,
    status cadence_step_status_enum NOT NULL DEFAULT 'DRAFT_PENDING',
    suggested_send_at TIMESTAMPTZ NOT NULL,
    gmail_draft_id TEXT,
    gmail_thread_id TEXT,
    sent_at TIMESTAMPTZ,
    subject TEXT,
    body_text TEXT NOT NULL,
    resume_doc_id TEXT,
    resume_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 9: RESUME BULLETS BANK & BUILDS (User-Owned)
-- ============================================================================
CREATE TABLE public.resume_bullets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    skill_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    bullet_text TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.cv_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    google_doc_id TEXT NOT NULL,
    google_drive_pdf_url TEXT NOT NULL,
    bullet_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 10: MEETING NOTES & ACTION ITEMS (User-Owned)
-- ============================================================================
CREATE TABLE public.meeting_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    meeting_title TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    transcription_status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'RECORDING', 'QUEUED', 'COMPLETED', 'FAILED'
    transcript_raw TEXT,
    my_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    their_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    google_sheet_row_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 11: IMMUTABLE DECISION EVENTS AUDIT TRAIL (User-Owned)
-- ============================================================================
CREATE TABLE public.decision_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor TEXT NOT NULL, -- 'hardi', 'cron_0400_runner', 'm7_draft_builder'
    aggregate_type TEXT NOT NULL, -- 'JOB', 'EVALUATION', 'CADENCE', 'MEETING'
    aggregate_id UUID NOT NULL,
    event_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Invariant: Revoke UPDATE and DELETE on audit trail
REVOKE UPDATE, DELETE ON public.decision_events FROM PUBLIC, authenticated, anon;

-- ============================================================================
-- PERFORMANCE & QUERY INDEXES (9 Specific Indexes)
-- ============================================================================
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_posting_status ON public.jobs(posting_status);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX idx_evaluations_user_stage ON public.evaluations(user_id, stage);
CREATE INDEX idx_evaluations_fit_score ON public.evaluations(fit_score DESC);
CREATE INDEX idx_contacts_company_door ON public.contacts(company_id, door);
CREATE INDEX idx_cadences_user_status ON public.cadences(user_id, status);
CREATE INDEX idx_cadences_suggested_send ON public.cadences(suggested_send_at);
CREATE INDEX idx_decision_events_aggregate ON public.decision_events(aggregate_type, aggregate_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (11 User-Owned Tables)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_tracks" ON public.tracks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_proof_points" ON public.proof_points FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_side_projects" ON public.side_projects FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_evaluations" ON public.evaluations FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_contacts" ON public.contacts FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_cadences" ON public.cadences FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_bullets" ON public.resume_bullets FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_cv_builds" ON public.cv_builds FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_meeting_notes" ON public.meeting_notes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_events" ON public.decision_events FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Allow authenticated users to read global canonical tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_company_briefs" ON public.company_briefs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_job_sources" ON public.job_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_sources" ON public.sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_source_runs" ON public.source_runs FOR SELECT TO authenticated USING (true);
```

---

## 2.3 Multi-Tenant Row Level Security (RLS) Isolation Architecture

To guarantee strict multi-tenant isolation even in future multi-user environments:
1. Every candidate row is permanently keyed to `user_id UUID REFERENCES auth.users(id)`.
2. All client queries resolve via authenticated JWT context (`auth.uid()`).
3. Policies explicitly specify `TO authenticated` and prevent any default public or anonymous access.
4. Cross-user leaks return empty recordsets ($0$ rows) rather than unauthorized error codes, preventing user enumeration.

---

## 2.4 Append-Only Audit Event Ledger (`decision_events`) & Tamper-Proof Guarantees

In strict enforcement of **Cardinal Rule R7**:
- Every status transition (`DISCOVERED` $\to$ `CHOSEN`, `CHOSEN` $\to$ `SKIPPED`, `OUTREACH_STARTED` $\to$ `SENT`), score generation, and cadence draft creation triggers an immutable insert into `public.decision_events`.
- Structure:
  - `actor`: String identifying the responsible entity (`'hardi'`, `'cron_0400_runner'`, `'m7_draft_builder'`).
  - `aggregate_type`: One of `'JOB'`, `'EVALUATION'`, `'CADENCE'`, `'MEETING'`.
  - `aggregate_id`: UUID of the modified entity.
  - `event_name`: Verifiable domain event (e.g. `'ROLE_CHOSEN'`, `'CADENCE_DRAFT_CREATED'`, `'REPLY_RECEIVED'`).
  - `payload`: Snapshot JSON capturing previous and new state attributes.
- **Hard Tamper Prevention:** The database command `REVOKE UPDATE, DELETE ON public.decision_events FROM PUBLIC, authenticated, anon;` ensures that neither the application, the candidate, nor any background agent can alter historical decisions.

---

## 2.5 Downstream Google Sheet Asynchronous Mirroring Worker

In alignment with requirement **M1-FR5**, Three Doors mirrors operational state into Hardi's Google Sheet ("PM Hiring Calendar"):
- **One-Way Asynchronous Push:** Sync runs as a background worker reading recent `decision_events`. Database state is authoritative; writes originate exclusively from Supabase to Google Sheets.
- **Tab Layout in Google Sheet:**
  1. *Daily PM Roles:* Synchronizes newly evaluated jobs, fit scores, and strategic positioning angles.
  2. *Outreach:* Synchronizes active cadences, door contacts, suggested send times, and thread statuses.
  3. *Contacts:* Directory of identified decision makers, recruiters, and peers.
  4. *Meetings:* Action items and transcripts captured from interview calls.
- **Inbound Exception (`Paste Links` Tab):** The only sheet-to-database reading occurs on an isolated `Paste Links` sheet tab, which Module 2 checks during daily runs to ingest manually discovered URLs.
- **Batching & Rate Limits:** Sync updates execute in batches of $\le 50$ rows using exponential backoff to ensure Google Sheets API rate limits ($300\text{ req/min}$) are never exceeded.

---

## 2.6 Ground-Zero Clean Bootstrap DDL (00000000000000_init_schema.sql)

The `backdoor` repository initializes its database state strictly from ground zero. There are no legacy migrations, no deprecated table structures, and no backward-compatibility backfills. 

Below is the complete, standalone ground-zero bootstrap SQL file (`supabase/migrations/00000000000000_init_schema.sql`) that initializes a pristine `backdoor` PostgreSQL 16 database from scratch, creating all 5 custom enums, 18 relational tables (with `public.profiles` created first to satisfy user ownership foreign keys), 9 performance indexes, and 11 multi-tenant RLS policies explicitly scoped with `TO authenticated`:

```sql
-- Backdoor (backdoorv.1) Ground-Zero Clean Bootstrap Schema
-- Target: PostgreSQL 16 (Supabase)
BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOM ENUM TYPES (5 Custom Enums)
-- ============================================================================
CREATE TYPE posting_status_enum AS ENUM (
    'OPEN', 
    'STALE', 
    'CLOSED'
);

CREATE TYPE application_stage_enum AS ENUM (
    'DISCOVERED', 
    'CHOSEN', 
    'OUTREACH_STARTED', 
    'IN_CONVERSATION', 
    'INTERVIEW_SCHEDULED', 
    'OFFER_RECEIVED', 
    'ARCHIVED', 
    'SKIPPED', 
    'NOT_A_FIT'
);

CREATE TYPE outreach_door_enum AS ENUM (
    'DOOR_1', 
    'DOOR_2', 
    'DOOR_3'
);

CREATE TYPE cadence_step_status_enum AS ENUM (
    'DRAFT_PENDING', 
    'DRAFT_CREATED', 
    'SENT', 
    'REPLIED', 
    'BOUNCED', 
    'CANCELLED', 
    'SKIPPED'
);

CREATE TYPE contact_confidence_enum AS ENUM (
    'VERIFIED', 
    'INFERRED', 
    'HYPOTHESIS', 
    'CURATED'
);

-- ============================================================================
-- 2. SECTION 1: PROFILES & IDENTITY (User-Owned)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    work_countries TEXT[] NOT NULL DEFAULT ARRAY['India', 'US', 'UK', 'EU'],
    linkedin_url TEXT NOT NULL,
    baseline_profession TEXT NOT NULL DEFAULT 'Chartered Accountant',
    google_tokens JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- 3. SECTION 2: DYNAMIC PERSONA TRACKS (User-Owned)
-- ============================================================================
CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_titles TEXT[] NOT NULL,
    skill_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
    seniority_levels TEXT[] NOT NULL,
    regions TEXT[] NOT NULL,
    excluded_industries TEXT[] NOT NULL DEFAULT ARRAY['FinTech', 'Payments'],
    featured_proof_point_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. SECTION 3: PROOF POINTS & SIDE PROJECTS (User-Owned)
-- ============================================================================
CREATE TABLE public.proof_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    metric_number NUMERIC NOT NULL,
    metric_unit TEXT NOT NULL,
    metric_direction TEXT NOT NULL,
    time_frame TEXT NOT NULL,
    employer TEXT NOT NULL,
    evidence_url TEXT,
    skills_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.side_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    live_url TEXT,
    repo_url TEXT,
    tech_stack TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. SECTION 4: GLOBAL COMPANIES & INTELLIGENCE (Canonical / Global)
-- ============================================================================
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    funding_stage TEXT,
    total_funding_usd NUMERIC,
    hq_location TEXT,
    headcount_estimate INTEGER,
    wikidata_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.company_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    one_sentence_summary TEXT NOT NULL,
    funding_details TEXT,
    recent_news JSONB NOT NULL DEFAULT '[]'::jsonb,
    founders JSONB NOT NULL DEFAULT '[]'::jsonb,
    why_you_fit TEXT,
    unconfirmed_points TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id)
);

CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    review_date DATE,
    source_url TEXT,
    excerpt TEXT NOT NULL,
    friction_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. SECTION 5: CANONICAL JOBS POOL & INGESTION (Canonical / Global)
-- ============================================================================
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    normalized_title TEXT NOT NULL,
    locations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    region TEXT NOT NULL DEFAULT 'Global Remote',
    workplace TEXT NOT NULL DEFAULT 'remote',
    seniority TEXT,
    specializations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    apply_url TEXT NOT NULL,
    primary_source TEXT NOT NULL,
    dedup_match_key TEXT UNIQUE NOT NULL,
    salary_raw TEXT,
    description_text TEXT NOT NULL,
    posted_at TIMESTAMPTZ,
    posting_status posting_status_enum NOT NULL DEFAULT 'OPEN',
    link_checked_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sources (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    group_type TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    requires_user_key BOOLEAN NOT NULL DEFAULT false,
    user_key_reference TEXT,
    last_run_at TIMESTAMPTZ,
    last_status TEXT,
    last_error TEXT
);

CREATE TABLE public.source_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    jobs_found INTEGER NOT NULL DEFAULT 0,
    jobs_stored INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT
);

CREATE TABLE public.job_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    url TEXT NOT NULL,
    raw_payload JSONB,
    confidence contact_confidence_enum NOT NULL DEFAULT 'VERIFIED',
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, source, url)
);

-- ============================================================================
-- 7. SECTION 6: USER-SPECIFIC EVALUATIONS (User-Owned)
-- ============================================================================
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    tier1_result BOOLEAN NOT NULL DEFAULT true,
    tier1_reason TEXT,
    fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
    tier2_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    score_confidence TEXT NOT NULL DEFAULT 'HIGH',
    strategic_positioning_angle TEXT,
    why_you_excel JSONB NOT NULL DEFAULT '[]'::jsonb,
    score_booster_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
    stage application_stage_enum NOT NULL DEFAULT 'DISCOVERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, job_id, track_id)
);

-- ============================================================================
-- 8. SECTION 7: THE THREE DOORS CONTACTS (User-Owned)
-- ============================================================================
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    door outreach_door_enum NOT NULL,
    email TEXT,
    email_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    linkedin_url TEXT,
    source_url TEXT NOT NULL,
    confidence contact_confidence_enum NOT NULL DEFAULT 'INFERRED',
    activity_score INTEGER NOT NULL DEFAULT 50 CHECK (activity_score BETWEEN 0 AND 100),
    last_active_date DATE,
    do_not_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. SECTION 8: CADENCES & GMAIL DRAFT TRACKING (User-Owned)
-- ============================================================================
CREATE TABLE public.cadences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    door outreach_door_enum NOT NULL,
    channel TEXT NOT NULL DEFAULT 'GMAIL',
    step_number INTEGER NOT NULL DEFAULT 1,
    status cadence_step_status_enum NOT NULL DEFAULT 'DRAFT_PENDING',
    suggested_send_at TIMESTAMPTZ NOT NULL,
    gmail_draft_id TEXT,
    gmail_thread_id TEXT,
    sent_at TIMESTAMPTZ,
    subject TEXT,
    body_text TEXT NOT NULL,
    resume_doc_id TEXT,
    resume_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. SECTION 9: RESUME BULLETS BANK & BUILDS (User-Owned)
-- ============================================================================
CREATE TABLE public.resume_bullets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    skill_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    bullet_text TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.cv_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    google_doc_id TEXT NOT NULL,
    google_drive_pdf_url TEXT NOT NULL,
    bullet_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. SECTION 10: MEETING NOTES & ACTION ITEMS (User-Owned)
-- ============================================================================
CREATE TABLE public.meeting_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    meeting_title TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    transcription_status TEXT NOT NULL DEFAULT 'COMPLETED',
    transcript_raw TEXT,
    my_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    their_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    google_sheet_row_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. SECTION 11: IMMUTABLE DECISION EVENTS AUDIT TRAIL (User-Owned)
-- ============================================================================
CREATE TABLE public.decision_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    event_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Invariant: Hard Revoke on decision_events
REVOKE UPDATE, DELETE ON public.decision_events FROM PUBLIC, authenticated, anon;

-- ============================================================================
-- 13. PERFORMANCE & QUERY INDEXES (9 Specific Indexes)
-- ============================================================================
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_posting_status ON public.jobs(posting_status);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX idx_evaluations_user_stage ON public.evaluations(user_id, stage);
CREATE INDEX idx_evaluations_fit_score ON public.evaluations(fit_score DESC);
CREATE INDEX idx_contacts_company_door ON public.contacts(company_id, door);
CREATE INDEX idx_cadences_user_status ON public.cadences(user_id, status);
CREATE INDEX idx_cadences_suggested_send ON public.cadences(suggested_send_at);
CREATE INDEX idx_decision_events_aggregate ON public.decision_events(aggregate_type, aggregate_id);

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES (All 18 Tables)
-- ============================================================================
-- Enable RLS on all 18 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_events ENABLE ROW LEVEL SECURITY;

-- 11 User-Owned Tables: Multi-Tenant Isolation (Explicitly TO authenticated)
CREATE POLICY "user_owns_profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_tracks" ON public.tracks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_proof_points" ON public.proof_points FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_side_projects" ON public.side_projects FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_evaluations" ON public.evaluations FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_contacts" ON public.contacts FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_cadences" ON public.cadences FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_bullets" ON public.resume_bullets FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_cv_builds" ON public.cv_builds FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_meeting_notes" ON public.meeting_notes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_events" ON public.decision_events FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 7 Global Canonical Tables: Read-Only for Authenticated Users (Explicitly TO authenticated)
CREATE POLICY "authenticated_read_companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_company_briefs" ON public.company_briefs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_job_sources" ON public.job_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_sources" ON public.sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_source_runs" ON public.source_runs FOR SELECT TO authenticated USING (true);

COMMIT;
```

---

## 2.7 Subsystem 1 Verification Runbook & Gating Commands

To verify complete compliance of Subsystem 1:
```bash
# 1. Verify clean DDL execution against PostgreSQL 16
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGDATABASE=postgres psql -f supabase/migrations/00000000000000_init_schema.sql

# 2. Run static policy & security test
node --experimental-strip-types --test tests/sql-policy-static.test.ts

# 3. Verify all 18 tables, 5 enums, 9 indexes, and 11 RLS policies via db-check
bash scripts/db-check.sh
```

**Pass Criteria:**
- 0 SQL syntax or foreign key dependency errors.
- `SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity` returns `0`.
- Attempting `UPDATE public.decision_events SET actor = 'hacker'` fails with `permission denied for table decision_events`.

---

# 3. Subsystem 2: Frontend & Component Engineering (`@ui/command-center`)

## 3.1 Product Mental Model: Zero Chromatic Fatigue, Telemetry Badges & Keyboard Supremacy

The Three Doors Command Center is engineered for high-density, low-latency executive decision-making. 
- **Zero Chromatic Fatigue:** Backgrounds use Deep Obsidian (`#080B11`) to prevent eye strain during rapid morning triage sessions. Borders are razor-sharp 1px lines (`rgba(255, 255, 255, 0.08)`).
- **Deterministic Telemetry:** Color is exclusively semantic. Every hue conveys exact operational status.
- **Keyboard Supremacy:** The candidate can execute full triage across 100+ opportunities using single-key shortcuts (`j`, `k`, `Enter`, `s`, `c`, `/`, `Esc`) without touching a trackpad or mouse.

---

## 3.2 Precision Cobalt & Steel Design System

### 3.2.1 Surface & Elevation Tokens
```css
:root {
  /* Surfaces & Structural Layers */
  --bg-canvas: #080B11;             /* Deep Obsidian Void. Base viewport background. */
  --bg-card: #0F1523;               /* Technical Charcoal Slate. 1:1 Bento cards, table rows. */
  --bg-drawer: #161F33;             /* Elevated Deep Slate. 640px slide-out dossier drawer. */
  --border-subtle: rgba(255, 255, 255, 0.08); /* 1px boundary on cards, dividers, headers. */
  --border-elevated: rgba(255, 255, 255, 0.14); /* Hover borders, active drawer edges. */

  /* Brand & Interactive Accents (Zero Indigo / Violet) */
  --accent-primary: #2563EB;        /* Precision Cobalt Blue. Triggers, active tabs, buttons. */
  --accent-hover: #1D4ED8;          /* State hover for primary cobalt triggers. */
  --accent-active: #1E40AF;         /* Pressed active state for buttons and links. */
  --accent-ring: #3B82F6;           /* Keyboard focus ring (ring-2 ring-blue-500). */

  /* Semantic State & Match Score Tints (Zero Orange / Amber) */
  --status-top: #10B981;            /* Crisp Emerald. Top Fit (>= 70): High confidence. */
  --status-mid: #0284C7;            /* Technical Sky. Exploratory (40-69): Telemetry blue. */
  --status-mid-alt: #38BDF8;        /* Technical Sky Light. Foreground text for exploratory. */
  --status-low: #64748B;            /* Cool Slate. Stretch (< 40): Below threshold. */
  --status-action: #0D9488;         /* Precision Teal. Ready Gmail drafts, verified emails. */
  --status-action-alt: #14B8A6;     /* Precision Teal Light. Text highlight for active action. */
  --status-danger: #EF4444;         /* High-contrast Red. Skipped roles, ingestion errors. */

  /* High-Contrast Text Hierarchy */
  --text-primary: #F8FAFC;          /* Contrast ratio 17.5:1 on #080B11. Headings, titles. */
  --text-secondary: #94A3B8;        /* Contrast ratio 8.2:1 on #080B11. Descriptions, brief. */
  --text-muted: #475569;            /* Contrast ratio 4.8:1 on #080B11. Timestamps, hotkey hints. */
}
```

### 3.2.2 Strict Zero-Tolerance Color Exclusion Mandate
**CRITICAL MANDATE:** In accordance with **Artifact 3 §1-2**, the design system strictly bans all shades of:
- **Indigo** (`#4F46E5`, `#6366F1`, `text-indigo-*`, `bg-indigo-*`)
- **Violet** (`#7C3AED`, `#8B5CF6`, `text-violet-*`, `bg-violet-*`)
- **Orange** (`#EA580C`, `#F97316`, `text-orange-*`, `bg-orange-*`)
- **Amber** (`#D97706`, `#F59E0B`, `text-amber-*`, `bg-amber-*`)
- **Terracotta** (`#C85A32`, `#C2410C` legacy tokens in `DESIGN.md`)

*Any occurrence of these disallowed color classes or hex codes triggers immediate failure in CI preflight.*

### 3.2.3 Typography Scale
- **Sans-Serif Font:** `Inter Variable`, `-apple-system`, `sans-serif` (`font-sans`).
- **Monospace Telemetry Font:** `JetBrains Mono`, `ui-monospace`, `monospace` (`font-mono`).

| Level | Tailwind Classes | Size / Line-Height | Font Weight | Primary Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Headline XL** | `text-2xl tracking-tight` | 24px / 32px | SemiBold (600) | Workspace area title, Drawer company title |
| **Heading LG** | `text-lg tracking-normal` | 18px / 26px | SemiBold (600) | Bento card company name, section headers |
| **Body Base** | `text-sm leading-relaxed` | 14px / 20px | Regular (400) | Job descriptions, email drafts, teardown text |
| **Body Medium** | `text-sm leading-normal` | 14px / 20px | Medium (500) | Interactive buttons, active navigation pills |
| **Data Mono** | `text-xs font-mono` | 12px / 16px | Medium (500) | Fit score badges (`92%`), salary ranges |
| **Micro Caption** | `text-[11px] leading-tight`| 11px / 14px | Regular (400) | Timezone indicators, audit metadata |

---

## 3.3 Morning Radar Component Engineering (Top 20 Roles, 24h Window, Fit $\ge 70\%$)

The Morning Radar (`M9-FR1`) is the default triage surface. It renders immediately upon login:
- **Filtering Logic:** 
  $$\text{Filter} = (\text{posted\_at} \ge \text{last\_visit\_timestamp} \lor \text{now}() - 24\text{ hours}) \land (\text{fit\_score} \ge 70)$$
- **Cognitive Cap (M2-FR13):** Renders the top 20 scoring roles.
- **Expansion Toggle:** A persistent button *"See all (N) roles"* unlocks the full list without reloading.
- **Empty State:** If zero roles meet the criteria, renders:
  *"All Caught Up. No new postings $\ge 70\%$ in the last 24 hours. Your pipeline is up to date."*

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ MORNING RADAR BANNER [bg-[#0F1523], border border-white/8, p-4, rounded-lg]            │
│ ⚡ MORNING RADAR: 14 High-Signal Opportunities Discovered Today (Top 20 Capped)        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Top 20 Grid of 1:1 Bento Cards or Dense Table Rows]                                   │
│ ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐           │
│ │ Stripe               │  │ Linear               │  │ OpenAI               │           │
│ │ Staff AI PM          │  │ Lead Product PM      │  │ Research PM          │           │
│ │ [94% FIT] Emerald    │  │ [88% FIT] Emerald    │  │ [78% FIT] Emerald    │           │
│ │ D1: Founder • D2: Rec│  │ D1, D2, D3 Identified│  │ D2: Talent Lead      │           │
│ └──────────────────────┘  └──────────────────────┘  └──────────────────────┘           │
│                                                                                        │
│ [ See all 42 roles >= 70% ] -> Expands in-place                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3.4 Dual-View Switcher: 1:1 Bento Cards ($320\text{px} \times 320\text{px}$) vs Dense Command Table

Users can switch between two visual layouts with zero state loss:
1. **1:1 Bento Cards:**
   - Dimensions: Fixed $320\text{px} \times 320\text{px}$ aspect ratio on desktop (`grid-cols-[repeat(auto-fill,320px)]`).
   - Card Surface: `bg-[#0F1523] border border-white/8 rounded-lg p-5 flex flex-col justify-between`.
   - Hover Effect: `hover:border-white/20 hover:shadow-lg transition-all duration-150`.
   - Keyboard Active: `ring-2 ring-blue-500 border-transparent`.
2. **Dense Command Table:**
   - Ultra-compact tabular spreadsheet designed for scanning 100+ rows.
   - Column layout: Cursor Indicator, Score Pill, Company, Title, Location/Model, Doors Found, Source, Discovered Age, Stage.
3. **State Persistence:** Toggling views preserves search queries, active track, selected row index, and scroll position.

---

## 3.5 Dense Command Table & Mouse-Free Keyboard Engine (`j`, `k`, `Enter`, `s`, `c`, `/`, `Esc`)

The table listens to window `keydown` events via a centralized hook (`useTableKeyboardNav`):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ KEYBOARD SHORTCUT ENGINE CONTRACT                                                      │
├─────────┬───────────────────────────┬──────────────────────────────────────────────────┤
│ Key     │ Action Triggered          │ Concrete State Mutation                          │
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `j`     │ Down / Next Row           │ `selectedIndex = Math.min(N - 1, selectedIndex+1)`│
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `k`     │ Up / Previous Row         │ `selectedIndex = Math.max(0, selectedIndex - 1)` │
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `Enter` │ Open Dossier Drawer       │ Opens $640\text{px}$ slide-out drawer for role.  │
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `s`     │ Skip Role                 │ Sets `stage = 'SKIPPED'`, logs to audit events,  │
│         │                           │ boundary-clamps index, animates row out.         │
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `c`     │ Choose Role               │ Sets `stage = 'CHOSEN'`, queues for outreach.    │
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `/`     │ Focus Global Search       │ Focuses search `<input>`; suppresses hotkeys.   │
├─────────┼───────────────────────────┼──────────────────────────────────────────────────┤
│ `Esc`   │ Escape Priority Stack     │ Modal -> Drawer -> Search Input -> Clear Select. │
└─────────┴───────────────────────────┴──────────────────────────────────────────────────┘
```

### 3.5.1 Hook Implementation (`useTableKeyboardNav.ts`)

```typescript
import { useEffect, useCallback } from "react";

interface TableKeyboardNavProps {
  rows: Array<{ id: string; stage?: string }>;
  selectedIndex: number;
  setSelectedIndex: (idx: number | ((prev: number) => number)) => void;
  onOpenDrawer: (rowId: string) => void;
  onSkipRole: (rowId: string) => void;
  onChooseRole: (rowId: string) => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export function useTableKeyboardNav({
  rows,
  selectedIndex,
  setSelectedIndex,
  onOpenDrawer,
  onSkipRole,
  onChooseRole,
  isModalOpen = false,
  onCloseModal,
  isDrawerOpen = false,
  onCloseDrawer,
  searchInputRef,
}: TableKeyboardNavProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 1. MODIFIER KEY GUARD:
      // Prevent collisions with browser/OS shortcuts (e.g. Cmd+C / Ctrl+C copy, Cmd+S save)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // 2. INPUT SUPPRESSION:
      // Suppress single-key shortcuts when candidate is actively typing in input/textarea
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // 3. ESCAPE PRIORITY STACK: Modal -> Drawer -> Search Input -> Clear Selection
      if (e.key === "Escape") {
        e.preventDefault();
        // Layer 1: Modal dismiss
        if (isModalOpen && onCloseModal) {
          onCloseModal();
          return;
        }
        // Layer 2: Drawer dismiss
        if (isDrawerOpen && onCloseDrawer) {
          onCloseDrawer();
          return;
        }
        // Layer 3: Search input clear & blur
        if (isInputFocused) {
          target?.blur();
          if (searchInputRef?.current) {
            searchInputRef.current.value = "";
          }
          return;
        }
        // Layer 4: Selection reset / table focus return
        setSelectedIndex(0);
        return;
      }

      // If user is focused on an input element, do not process table single-letter shortcuts
      if (isInputFocused) {
        return;
      }

      const totalRows = rows.length;
      if (totalRows === 0) return;

      switch (e.key) {
        case "j": // Down / Next Row
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(totalRows - 1, prev + 1));
          break;

        case "k": // Up / Previous Row
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;

        case "Enter": // Open Dossier Drawer
          e.preventDefault();
          if (rows[selectedIndex]) {
            onOpenDrawer(rows[selectedIndex].id);
          }
          break;

        case "s": // Skip Role with Boundary Clamping
          e.preventDefault();
          if (rows[selectedIndex]) {
            const skippedId = rows[selectedIndex].id;
            onSkipRole(skippedId);
            // Boundary clamping: ensure selectedIndex does not exceed new length (totalRows - 2)
            setSelectedIndex((prev) =>
              Math.min(prev, Math.max(0, totalRows - 2))
            );
          }
          break;

        case "c": // Choose Role
          e.preventDefault();
          if (rows[selectedIndex]) {
            onChooseRole(rows[selectedIndex].id);
          }
          break;

        case "/": // Focus Global Search
          e.preventDefault();
          if (searchInputRef?.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
          break;

        default:
          break;
      }
    },
    [
      rows,
      selectedIndex,
      setSelectedIndex,
      onOpenDrawer,
      onSkipRole,
      onChooseRole,
      isModalOpen,
      onCloseModal,
      isDrawerOpen,
      onCloseDrawer,
      searchInputRef,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
```

### 3.5.2 Collision Prevention & Escape Priority Specifications

1. **Modifier Key Collision Prevention:**
   By evaluating `if (e.metaKey || e.ctrlKey || e.altKey) return;` at the very start of the keydown event listener, the engine guarantees zero interference with native operating system shortcuts. Candidates pressing `Cmd+C` or `Ctrl+C` to copy job descriptions will never accidentally trigger `c` (Choose Role). Similarly, `Cmd+S` or `Ctrl+S` will never trigger `s` (Skip Role).

2. **Escape Priority Stack (`Modal -> Drawer -> Search Input -> Clear Selection`):**
   Escape key presses resolve in a single, well-defined hierarchy:
   - **Layer 1 (Top Priority):** If an active modal is displayed (e.g. Universal Ingest `Shift + I`), `Esc` dismisses the modal and retains the underlying drawer/table state.
   - **Layer 2:** If the $640\text{px}$ slide-out Dossier Drawer is open, `Esc` closes the drawer and restores focus to the active table row.
   - **Layer 3:** If the candidate is focused in the search/filter `<input>`, `Esc` clears the search query string and blurs focus back to table cursor navigation.
   - **Layer 4 (Base):** If the table has focus without modals/drawers, `Esc` resets selection to index `0` / clears any temporary multi-select state.

3. **Boundary Clamping for `s` (Skip):**
   When skipping the current row via `s`, the row is immediately moved to `SKIPPED` stage and filtered out from the active view. To prevent `selectedIndex` from pointing to an invalid out-of-bounds index when skipping the final role ($N-1$), the index is clamped using `Math.min(prev, Math.max(0, totalRows - 2))`. This guarantees the cursor smoothly rests on the new final row ($N-2$) rather than causing an undefined lookup error.

---

## 3.6 Three Doors Segmented Indicator Chips & Inline Telemetry

Rendered on every Bento Card and table row:

```html
<div class="inline-flex items-center gap-1" aria-label="Discovered Doors">
  <!-- Door 1: Hiring Manager / Founder (Verified) -->
  <span class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-teal-400 border border-teal-500/20 flex items-center gap-1">
    <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span> D1: Founder
  </span>
  <!-- Door 2: Recruiter (Identified) -->
  <span class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-slate-300 border border-white/10">
    D2: Recruiter
  </span>
  <!-- Door 3: Peer / Team (Identified) -->
  <span class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-slate-400 border border-white/5">
    D3: Peer
  </span>
</div>
```

---

## 3.7 Subsystem 2 Verification Runbook & Gating Commands

```bash
# 1. Run Design System Token & AST Color Blacklist Scanner
npm run test:unit tests/frontend/design-system-tokens.test.tsx

# 2. Run Dense Table Keyboard Navigation Component Tests
npm run test:unit tests/frontend/dense-table-keyboard.test.tsx

# 3. Run View Switcher Integration Tests
npm run test:unit tests/frontend/view-switcher.test.tsx
```

**Pass Criteria:**
- 0 violations in AST color scanner (0 occurrences of indigo, violet, orange, amber, `#C85A32`, `#8A6100`).
- WCAG AAA contrast ratio ($\ge 7:1$) verified for `--text-primary` on `--bg-canvas`.
- `j`/`k`/`Enter`/`s`/`c`/`/`/`Esc` simulate accurately with userEvent.

---

# 4. Subsystem 3: Navigation, Routing & Modals Architecture

## 4.1 Product Mental Model: Focused Workspace Navigation & Zero-Reload Triage

The navigation architecture optimizes for deep candidate focus. The application is divided into **4 Core Workspaces** reflecting the candidate lifecycle (Discover $\to$ Dossiers $\to$ Outreach $\to$ Interviews) and **2 System Views** (Health, Settings). 

Inspection of deep job dossiers occurs entirely within a slide-out drawer without reloading the parent page, preserving scroll positions, filter configurations, and keyboard focus.

---

## 4.2 Next.js 15 App Router Layout & Workspace Route Hierarchy

```
app/
├── (workspace)/
│   ├── layout.tsx             # Fixed 220px Left Rail + Top Command Bar
│   │
│   ├── discover/              # WORKSPACE 1: Discover & Triage
│   │   ├── page.tsx           # Morning Radar & Command Table
│   │   ├── @drawer/           # Parallel route slot for slide-out drawer
│   │   │   ├── (.)[job_id]/   # Intercepted route: catches client navigation
│   │   │   │   └── page.tsx   # Renders 640px slide-out drawer
│   │   │   └── default.tsx    # Null fallback slot
│   │   └── [job_id]/
│   │       └── page.tsx       # Standalone full-page view for cold loads / direct links
│   │
│   ├── dossiers/              # WORKSPACE 2: Tracks & Proof Points
│   │   ├── page.tsx           # Track Manager & Proof Point Bank
│   │   ├── tracks/page.tsx
│   │   └── proof-points/page.tsx
│   │
│   ├── outreach/              # WORKSPACE 3: Outreach & Cadence Board
│   │   ├── page.tsx           # 5-Stage Cadence Kanban Board
│   │   └── drafts/page.tsx
│   │
│   ├── interviews/            # WORKSPACE 4: Notes & Actions
│   │   ├── page.tsx           # Calendar & Whisper Action Items
│   │   └── notes/page.tsx
│   │
│   ├── health/                # SYSTEM VIEW 1: Source Health
│   │   └── page.tsx           # 35-Source Health Matrix & Logs
│   │
│   └── settings/              # SYSTEM VIEW 2: Settings Workspace
│       └── page.tsx           # Toggles, BYOK Keys, Google OAuth
```

### Layout Anatomy:
- **Left Navigation Rail:** Fixed width $220\text{px}$, `bg-[#080B11]`, `border-r border-white/8`.
- **Top Command Bar:** Height $56\text{px}$, `bg-[#0F1523]`, `border-b border-white/8`, containing global search (`/`), track selector dropdown, daily run telemetry, and view toggle.

---

## 4.3 Slide-Out Dossier Drawer Routing (`$640\text{px}`, `@drawer/(.)discover/[job_id]`)

### Drawer Geography & 5-Tab Architecture:
- **Width:** Fixed $640\text{px}$ sliding smoothly from the right edge with cubic-bezier timing.
- **Surface:** `bg-[#161F33] border-l border-white/10 shadow-2xl z-50`.
- **In-Drawer Rapid Candidate Cycling:** Pressing `↑` (Up Arrow) or `↓` (Down Arrow) fetches adjacent job records in-place without closing the drawer or triggering full-page navigation.
- **Tab Structure:**
  1. *Spec Tab:* Sanitized markdown job description, salary telemetry, canonical source URL.
  2. *Match Tab:* Tier 1 pass/fail badges, Tier 2 mathematical formula breakdown (Skills Overlap 60, Experience Gap 25, Seniority Gap 15), Tier 3 AI synthesis bullets, Score Booster Gaps.
  3. *Intel Tab:* 30-day company brief, funding summary, complaint friction breakdown, and 3 actionable product opportunities (Quick Win, Growth Loop, Monetization Feature) with Google Doc 1-pager link.
  4. *Doors Tab:* Door 1 (Hiring Manager), Door 2 (Recruiter), Door 3 (Peer); verified emails, LinkedIn query links, public activity scores ($0-100$). Strict exclusion of personal phone numbers and home addresses.
  5. *Draft Tab:* Tailored CV Google Doc link + zero-cost Drive PDF download link, Gmail draft body preview, 09:15 AM recipient timezone badge, "Copy LinkedIn Note" ($\le 300$ chars) button, and "Start Outreach" trigger.

---

## 4.4 Universal Ingest Modal Engine (`Shift + I` / `+ Add Job`)

Accessible anywhere via global shortcut `Shift + I` or the top bar "+ Add Job" trigger:
- **Input Channels:**
  1. *URL Tab:* Parses JSON-LD Schema (`JobPosting`) or OpenGraph tags.
  2. *Raw Text Tab:* LLM/Regex extraction from pasted Slack messages, tweets, or email alerts.
  3. *Manual Tab:* Direct field entry.
- **Deduplication Check:** Computes `dedup_match_key = normalize(company) + ":" + normalize(title)`.
  - If existing role found: displays *"Role already exists in database: Appending new link to job sources."*
  - If new role: displays *"New Canonical Role Identified."*
- **Auto-Open:** Confirming the ingest immediately opens the role in the $640\text{px}$ slide-out drawer for immediate triage.

---

## 4.5 Responsive Mobile Breakpoint Architecture ($380\text{px}$ Support)

In accordance with requirement **M9-FR13**, the layout gracefully scales down to $380\text{px}$ width:
- Fixed Left Rail collapses into an off-canvas slide-over hamburger drawer.
- Morning Radar transforms into a vertical single-column card stream.
- Slide-Out Dossier Drawer expands to $100\%$ viewport width ($w\text{-full}$) with a prominent sticky back button.
- Touch targets maintain $\ge 44\text{px} \times 44\text{px}$ geometry; horizontal scrolling is strictly prevented ($scrollWidth == clientWidth$).

---

## 4.6 Subsystem 3 Verification Runbook & Gating Commands

```bash
# 1. Run Route Handlers & Navigation Unit Tests
npm run test:unit tests/api/navigation-routes.test.ts

# 2. Run Dossier Drawer Navigation & Cycling Tests
npm run test:unit tests/frontend/dossier-drawer-navigation.test.tsx

# 3. Run Universal Ingest Modal Deduplication Tests
npm run test:unit tests/frontend/integration-universal-ingest.test.tsx

# 4. Run Playwright Mobile Viewport Test
npx playwright test tests/e2e/responsive-navigation.spec.ts
```

---

# 5. Subsystem 4: Business Logic, Scrapers & Cadence Workflows

## 5.1 Product Mental Model: Autonomous Intelligence & Safe Human Outreach

Subsystem 4 combines autonomous market scanning with guarded, human-in-the-loop executive outreach:
- **Autonomous Scout:** Runs at 04:00 AM daily across 35 sources, normalizing and filtering market opportunities.
- **Deterministic Suitability:** Grades roles without AI hallucinations or speculative percentages.
- **Guarded Preparation:** Prepares tailored CVs, Google Drive PDFs, and Gmail drafts, but **strictly forbids autonomous dispatch**.

---

## 5.2 35-Source Ingestion & Polite Scraping Engine (`@ingest/scout` M2)

### 35 Verified Ingestion Sources:
1. *ATS Direct (8 Sources):* Greenhouse, Lever, Ashby, Workable, SmartRecruiters, BambooHR, Rippling, Recruitee.
2. *Company Direct (1 Source):* Careers page JSON-LD crawler.
3. *Remote PM Boards (7 Sources):* Remotive, RemoteOK, We Work Remotely, Jobspresso, Wellfound, Himalayas, JustRemote.
4. *Curated Tech Communities (10 Sources):* YC Work at a Startup, Hacker News "Who is Hiring", Product Hunt Jobs, Lenny's Newsletter Job Board, Mind the Product, Mindstone, Otta, Levels.fyi, BuiltIn, The Muse.
5. *Direct Inbound & Clippers (3 Sources):* Google Alerts Inbound Webhook, Naukri Forwarder Webhook, Chrome Clipper Extension.
6. *BYOK Aggregators (6 Sources):* Apify Greenhouse Actor, Apify LinkedIn Actor, RapidAPI JSearch, Apollo Jobs API, Hunter Tech Leads, SerpApi Google Jobs.

### Deduplication Engine (`dedup_match_key`):
$$\text{dedup\_match\_key} = \text{clean\_company(company\_name)} \parallel \text{':'} \parallel \text{clean\_title(job\_title)}$$
- `clean_company`: Converts to lowercase, strips punctuation, removes "Inc.", "Ltd.", "LLC", "Technologies".
- `clean_title`: Converts to lowercase, strips punctuation, normalizes abbreviations ("Sr." $\to$ "senior", "VP" $\to$ "vice president", "Lead" $\to$ "lead").
- *Multi-City Handling:* Multiple city postings for the same canonical role merge into a single row, preserving all cities in `locations[]`.

### Pre-Storage Negative Filters:
- Postings are dropped *before saving* if title matches: `/(marketing|engineering manager|tpm|scrum|recruiter)/i`.
- Postings are dropped *before saving* if company or description matches: `/(fintech|payments|crypto|web3|neo-?bank|lending|p2p)/i`.

### SSRF Protection & Polite Fetching (Rule R6):
- All network fetches execute via `safe-fetch.ts`:
  - Blocks loopback (`127.0.0.1`), link-local (`169.254.169.254`), and internal private subnets (`10.0.0.0/8`, `192.168.0.0/16`).
  - Identifies with User-Agent: `ThreeDoorsBot/1.0 (+https://threedoors.app/bot)`.
  - Enforces minimum $500\text{ ms}$ spacing per remote host.

---

## 5.3 3-Tier Suitability Engine (`@eval/brain` M3)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3-TIER FIT SUITABILITY ENGINE                                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: ELIGIBILITY GATE (Deterministic SQL / Regex, No AI, <100ms)                    │
│ • Location overlap check (Target: India, US, UK, EU, Remote)                          │
│ • Remote boundary check ("Remote US Only" fails for India profile without sponsorship) │
│ • Excluded industry filter (Zero FinTech / Payments)                                   │
│ • Status: PASS -> Moves to Tier 2 | FAIL -> fit_score = 0, logged to decision_events   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: DETERMINISTIC MATHEMATICAL SCORE (0–100 Formula, No AI)                        │
│ • Skills Overlap Score (Max 60 pts): Keyword intersection with active track.           │
│ • Experience Gap Score (Max 25 pts): 25 - (5 * max(0, required_years - 3)).            │
│ • Seniority Alignment (Max 15 pts): Exact level match (Senior, Staff, Lead).           │
│ • Status: Output integer 0-100. If Score >= 70 & BYOK added -> Triggers Tier 3.        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: AI DOSSIER SYNTHESIS (Generative BYOK Key, Score >= 70 Only)                   │
│ • Synthesizes 3 bullet points citing verified M8 proof points ([PP-03], [PP-07]).      │
│ • Generates 1 core strategic positioning angle.                                        │
│ • Calculates Score Booster Gaps: missing artifacts worth >= 5 formula points.          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3.1 Cadence Engine Edge Cases & Timezone Architecture

To ensure flawless scheduling and thread surveillance across global candidates and remote opportunities:

1. **Missing Location Fallback:**
   - When a job posting or contact record lacks an explicit location or geocodable city (e.g. general "Remote" postings without regional tags), the scheduler avoids runtime errors by resolving location through an authoritative fallback ladder:
     1. *Primary Fallback:* Target company headquarters from `companies.hq_location`.
     2. *Secondary Deterministic Fallback:* If company HQ is also null or unlisted, default deterministically to `US/Eastern` (`America/New_York`), representing the default reference tech market timezone.
   - The UI surfaces this fallback transparently on the schedule pill (e.g. `"Suggested: Tue 09:15 US/Eastern (Fallback HQ)"`).

2. **International Date Line (IDL) & Dynamic DST Offset Handling:**
   - Time calculations for the 09:15 AM suggested dispatch window strictly avoid static UTC offsets (such as hardcoded `UTC-5` or `UTC+1`). 
   - All scheduling computations resolve dynamically against the IANA Time Zone Database (e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Pacific/Auckland`):
     - *Dynamic Daylight Saving Time (DST):* Dynamic resolution computes exact offsets at the target execution date, properly adapting to non-synchronous daylight saving transitions between jurisdictions (e.g. North American spring transition vs European transition).
     - *International Date Line Boundary:* For recipients across the IDL relative to the candidate (e.g., recipient in Auckland UTC+12 vs candidate in San Francisco UTC-8), the target Tuesday–Thursday dispatch window is computed in the **recipient's local calendar day**, preventing messages from being scheduled on the recipient's weekend or off-days.

3. **Out-of-Office (OOO) Autoreply Filtering:**
   - During active thread monitoring via `gmail.readonly`, automated server replies must never be misclassified as human candidate responses or prematurely halt outreach campaigns.
   - Inbound email threads are filtered against RFC 3834 auto-response standards and header patterns prior to triggering state transitions:
     - *Header Detection:* Messages containing headers `Auto-Submitted: auto-replied`, `Auto-Submitted: auto-generated`, `X-Autoreply: yes`, or `Precedence: auto_reply` are identified as automated responders.
     - *Subject Prefix Detection:* Messages with subject lines starting with `Automatic reply:`, `Out of Office:`, `Auto-Reply:`, `Autoreply:`, or `Undelivered Mail Returned to Sender` are flagged as non-human replies.
     - *Cadence Action:* Detected OOO autoreplies are logged as non-stopping informational telemetry. The cadence status remains `SENT` (or queues follow-up adjustment based on return date), and does NOT advance `evaluations.stage = 'IN_CONVERSATION'` or interrupt the multi-step sequence.

---

## 5.4 Document Automation & Audio Intelligence (`@workspace/google` M4)

### 5.4.1 Scoped Google OAuth Vault
- **Strict Scope Whitelist:**
  - `https://www.googleapis.com/auth/documents`
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/spreadsheets`
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/gmail.compose`
  - `https://www.googleapis.com/auth/gmail.readonly`
- **FORBIDDEN SCOPES:** `gmail.send`, full `mail.google.com`.

### 5.4.2 Deterministic 2-Page CV Google Doc Builder
- Clones master Google Doc template.
- Replaces placeholders: `{{TARGET_ROLE}}`, `{{SUMMARY}}`, `{{EXPERIENCE}}`, `{{PROJECTS}}`, `{{SKILLS}}`.
- Trims optional bullets dynamically until document strictly occupies 2 pages.

### 5.4.3 Cardinal Rule R5: Byte-for-Byte Metric Verification Engine
- When AI summary polish is enabled, an automated regex diff compares all numbers in the output against Hardi's M8 proof points bank.
- *Assertion:* Every digit sequence in the generated text must match an existing proof point metric byte-for-byte.
- *Failure Behavior:* Any rounding (e.g. `18.4%` $\to$ `20%`) or invented statistic causes immediate rejection of AI output and reverts to the deterministic template.

### 5.4.4 Zero-Cost Drive PDF Exporter
- Invokes native Google Drive API export endpoint:
  `GET https://www.googleapis.com/drive/v3/files/{docId}/export?mimeType=application/pdf`
- Streams binary directly to candidate's Drive folder at \$0.00 infrastructure cost (zero Puppeteer or Chromium container overhead).

### 5.4.5 Chrome Clipper & Groq Whisper Meeting Transcription
- Chrome Extension captures Google Meet tab audio stream in 10-minute WAV chunks.
- Transcribes via Groq Whisper API (`whisper-large-v3-turbo`).
- LLM extracts structured action items: **My Actions**, **Their Actions**, **Next Steps**.
- Persists to `public.meeting_notes`, syncs to Google Sheet, and pre-stages a thank-you email draft in `ThreeDoors/Drafts` within 2 hours.

---

## 5.5 Company Intelligence & Review Auditor (`@intel/teardown` M5)

- Harvesters scrape Reddit (`reddit.com/search.json?q={product}`) and Apple App Store customer review RSS feeds.
- Friction Tagger classifies complaints: *Onboarding Drop*, *Billing Failure*, *Speed/Bug*, *Feature Gap*, *Support Issue*.
- Synthesizes 3 high-impact product improvement opportunities into a 1-page Google Doc:
  1. *Quick Win:* Immediate UX friction fix ($\le 2$ weeks build).
  2. *Growth Loop:* Product-led acquisition or retention flywheel.
  3. *Monetization Feature:* High-margin expansion feature.

---

## 5.6 The Three Doors Contact Allocation (`@people/enrichment` M6)

- Classifies contacts into Door 1 (Decision Maker), Door 2 (Recruiter), Door 3 (Peer).
- Enforces zero logged-in scraping; uses public company team pages, YC directory, and DNS MX patterns.
- Calculates Public Activity Score ($0-100$) based on recent articles, GitHub activity, and talks.
- **Data Minimization:** Strictly stores name, title, company, public URLs, and work email. **Strictly forbids phone numbers, home cities, personal social media, or personal photos.**

---

## 5.7 Multi-Channel Cadence Engine (`@cadence/engine` M7)

### 5.7.1 Recipient Timezone Queueing (09:15 AM Window, Tuesday–Thursday)
- Geocodes recipient HQ or office city to local timezone via dynamic IANA database resolution.
- **Missing Location Fallback:** If role or contact location is missing, falls back to `companies.hq_location`, or deterministically to `US/Eastern` (`America/New_York`).
- **IDL & DST Offset Handling:** Computes dynamic offsets at execution time across daylight saving shifts and International Date Line boundaries, guaranteeing dispatch occurs on recipient business days (Tuesday–Thursday 09:15 AM local time).
- UI displays dual timezone badge: e.g., *"Tue 09:15 London (14:45 IST)"*.

### 5.7.2 Gmail Draft Staging in `ThreeDoors/Drafts` (Rule R1 Enforcement)
- Calls `users.drafts.create` via Gmail API (never `messages.send`).
- Assigns label `ThreeDoors/Drafts`.
- Leaves bottom blank for native Gmail signature.

### 5.7.3 Thread Watcher Sent Detection & Automatic Auto-Stop on Reply
- Watcher polls active threads via `gmail.readonly`.
- Detecting message with `SENT` label transitions cadence step to `SENT` and records `sent_at`.
- **Out-of-Office (OOO) Autoreply Filtering:** Inbound messages containing auto-reply headers (`Auto-Submitted: auto-replied`, `Auto-Submitted: auto-generated`, `X-Autoreply: yes`) or subject prefixes (`Automatic reply:`, `Out of Office:`, `Auto-Reply:`) are filtered out and ignored, preserving active cadence state without stopping outreach.
- Detecting genuine inbound human reply from recipient:
  - Immediately halts all downstream follow-ups.
  - Updates `cadences.status = 'REPLIED'`.
  - Advances `evaluations.stage = 'IN_CONVERSATION'`.
  - Logs transition to `decision_events`.
- Candidate marking *"Replied on LinkedIn"* triggers identical auto-stop behavior.

### 5.7.4 Multi-Step Follow-Up Sequence
- **Day 3 Follow-Up:** Staged 3 business days post-send if no reply detected, quoting the previous thread.
- **Day 5 Final Teardown:** Staged 2 business days later, attaching or linking the Teardown 1-Pager Google Doc.

### 5.7.5 Safety Caps & Writing Linter
- **Safety Cap (Rule R8):** Max 40 draft creations per rolling 24 hours. Max 3 cadence steps per contact.
- **Writing Linter (M7-FR10):** Scans drafts before staging. Rejects flattery and banned corporate cliches (*"I hope this finds you well"*, *"leverage"*, *"synergy"*).

---

## 5.8 Subsystem 4 Verification Runbook & Gating Commands

```bash
# 1. Rule R1 Static Codebase Audit (Zero send calls)
grep -rnE "(users\.messages\.send|gmail\.send)" lib/ app/ packages/ || echo "RULE R1 VERIFIED: 0 SEND CALLS"

# 2. Rule R5 Byte-for-Byte Metric Verification Unit Test
npm run test:node tests/cadence-engine-logic.test.ts

# 3. Google Workspace Drive PDF Export Integration Test
npm run test:node tests/cadence-workflow-integration.test.ts

# 4. Ingestion Crawler SSRF & Negative Filter Tests
npm run test:node tests/source-contract.test.ts
```

---

# 6. Quality Gating Protocols & Preflight Automation

## 6.1 Mandatory Local Branch Commit Preflight Gate (`scripts/preflight.sh`)

In strict accordance with the mandatory integrity mandate:
> **Under NO circumstances may any engineer or agent commit to a local branch or push to origin before unit, integration, and E2E testing criteria pass.**

The preflight script (`scripts/preflight.sh`) executes 6 sequential gating checks. Any failure returns exit code `1` and aborts the commit:

```bash
#!/usr/bin/env bash
# scripts/preflight.sh: Authoritative Pre-Commit / Pre-Push Gate
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================================================="
echo "BACKDOOR (backdoorv.1) - MANDATORY PREFLIGHT COMMIT GATE"
echo "================================================================="

echo "=== [GATE 1/6] TypeScript Static Verification ==="
npm run typecheck

echo "=== [GATE 2/6] Node.js Core Logic & Static Security Unit Tests ==="
npm run test:node

echo "=== [GATE 3/6] Jest Frontend Component & API Integration Tests ==="
npm run test:unit

echo "=== [GATE 4/6] PostgreSQL 16 Schema, RLS & Idempotency Checks ==="
if [[ "${PGHOST:-}" != "" && "${PGUSER:-}" != "" ]]; then
  bash scripts/db-check.sh
else
  echo "WARNING: PGHOST/PGUSER not set. Running static SQL policy verification..."
  node --experimental-strip-types --test tests/sql-policy-static.test.ts
fi

echo "=== [GATE 5/6] Playwright End-to-End User Journey Tests ==="
if [[ -n "${E2E_ALICE_EMAIL:-}" && -n "${E2E_ALICE_PASSWORD:-}" && -n "${E2E_BOB_EMAIL:-}" && -n "${E2E_BOB_PASSWORD:-}" && -n "${E2E_ALICE_DIRECTION:-}" ]]; then
  npm run test:e2e
else
  echo "INFO: E2E test credentials not set (E2E_ALICE_EMAIL, etc.). Skipping browser E2E test suite in local sandbox."
fi

echo "=== [GATE 6/6] Next.js Production Build Verification ==="
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://placeholder.supabase.co}" NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-placeholder}" npm run build

echo "================================================================="
echo ">>> ALL PREFLIGHT GATES PASSED. COMMIT AUTHORIZED. <<<"
echo "================================================================="
```

---

## 6.2 Git Pre-Commit & Pre-Push Hook Wiring (`scripts/install-git-hooks.sh`)

Hooks are wired automatically via `scripts/install-git-hooks.sh`:
```bash
#!/usr/bin/env bash
# scripts/install-git-hooks.sh: Automate pre-commit & pre-push hook configuration
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p .git/hooks

cat << 'EOF' > .git/hooks/pre-commit
#!/usr/bin/env bash
exec bash scripts/preflight.sh
EOF
chmod +x .git/hooks/pre-commit

cat << 'EOF' > .git/hooks/pre-push
#!/usr/bin/env bash
exec bash scripts/preflight.sh
EOF
chmod +x .git/hooks/pre-push

echo "SUCCESS: Git pre-commit and pre-push hooks installed and wired to scripts/preflight.sh"
```

To configure hooks in any fresh checkout:
```bash
bash scripts/install-git-hooks.sh
```

*Bypassing hooks with `--no-verify` is strictly classified as a security integrity violation.*

---

## 6.3 Phased Execution Exit Gates Architecture (Phase 0 through Phase 4)

Development proceeds through 5 sequential phases. Advancing to the next phase requires passing formal exit criteria:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASED PROGRESSION EXIT GATES ARCHITECTURE                                             │
├─────────┬──────────────────────┬───────────────────────────────────────────────────────┤
│ Phase   │ Scope Description    │ Formal Quality Gate Required to Advance               │
├─────────┼──────────────────────┼───────────────────────────────────────────────────────┤
│ Phase 0 │ Setup & Scaffolding  │ PostgreSQL 16 DDL applies cleanly; 18 tables, 5 enums,│
│         │                      │ 9 indexes, 11 RLS policies verified; empty app builds.│
├─────────┼──────────────────────┼───────────────────────────────────────────────────────┤
│ Phase 1 │ Ingest & Pool        │ 14-day parallel run parity with Google Sheet <= 5%    │
│         │                      │ drift. Zero false closures in 20-role spot check.     │
│         │                      │ Zero FinTech/Payments roles stored in database.       │
├─────────┼──────────────────────┼───────────────────────────────────────────────────────┤
│ Phase 2 │ Triage & Radar       │ Candidate completes full morning triage in web UI     │
│         │                      │ using `j`/`k`/`Enter`/`s`/`c` with 0 sheet touches.   │
│         │                      │ Tier 1 evaluates in <100ms. Zero orange/indigo tokens.│
├─────────┼──────────────────────┼───────────────────────────────────────────────────────┤
│ Phase 3 │ Outreach & Cadence   │ 5 real outreach cadences executed end-to-end with 0   │
│         │                      │ automated sends. Drafts staged in ThreeDoors/Drafts.  │
│         │                      │ 0 calls to users.messages.send across codebase.       │
├─────────┼──────────────────────┼───────────────────────────────────────────────────────┤
│ Phase 4 │ Depth & Polish       │ 5 product teardowns rated useful; Groq Whisper Meet   │
│         │                      │ notes operational; Week-8 reply metrics active.       │
└─────────┴──────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 6.4 Binary Veto Checklists & Rollback Procedures

Any of the following conditions triggers an **immediate binary veto** and rollback:
1. **Rule R1 Veto:** Codebase contains any call to `users.messages.send` or `gmail.send`.
2. **Rule R5 Veto:** Generated CV text introduces a metric not found in `proof_points`.
3. **Design System Veto:** Component renders any indigo, violet, orange, or amber class.
4. **Security Veto:** User table lacking RLS or policy allowing cross-user data access.
5. **Audit Veto:** `decision_events` allows `UPDATE` or `DELETE` operations.

---

# 7. Comprehensive Test & Verification Criteria Specification

## 7.1 Subsystem 1 (Database & Backend) Test Suite

| Test ID | Test Target | Test Objective | Assertion / Pass Criteria | Test File & Runner |
| :--- | :--- | :--- | :--- | :--- |
| `UT-DB-01` | DDL Schema Syntax | Verify all 18 tables and 5 enums compile cleanly | Postgres accepts DDL without error | `npm run test:db` |
| `UT-DB-02` | RLS Enablement | Verify RLS enabled on all 11 user tables | Query returns 0 un-secured tables | `tests/sql-policy-static.test.ts` |
| `UT-DB-03` | Audit Immutability | Verify UPDATE/DELETE on `decision_events` fails | Throws permission denied error | `npm run test:db` |
| `UT-DB-04` | Dedup Match Key | Verify canonical normalization | `"Google, Inc." + "Sr. PM"` $\to$ `"google:senior_product_manager"` | `tests/core.test.ts` |
| `IT-DB-01` | Multi-Tenant Isolation| Seed Alice & Bob; query as Alice | Alice receives 0 rows of Bob's data | `supabase/tests/mode_b_rls.sql` |
| `IT-DB-02` | Unique Constraint | Insert 2 jobs with identical `dedup_match_key` | Throws PostgreSQL error 23505 | `npm run test:db` |

---

## 7.2 Subsystem 2 (Frontend & Design System) Test Suite

| Test ID | Test Target | Test Objective | Assertion / Pass Criteria | Test File & Runner |
| :--- | :--- | :--- | :--- | :--- |
| `UT-FE-01` | Color Blacklist AST | Scan all CSS/classes for banned hues | 0 occurrences of indigo, violet, orange, amber | `tests/frontend/design-system-tokens.test.tsx` |
| `UT-FE-02` | Text Contrast | WCAG AAA contrast for `--text-primary` | Contrast ratio $\ge 7.0:1$ | `tests/frontend/design-system-tokens.test.tsx` |
| `UT-FE-03` | Score Badges | Verify badge classes by score | $\ge 70$ Emerald, $40-69$ Sky, $<40$ Slate | `tests/frontend/design-system-tokens.test.tsx` |
| `IT-FE-01` | Table `j`/`k` Nav | Arrow navigation in table | `j` moves active cursor down; `k` moves up | `tests/frontend/dense-table-keyboard.test.tsx` |
| `IT-FE-02` | Role Skip (`s`) | Press `s` on active row | `stage` updates to `SKIPPED`, row animates out | `tests/frontend/dense-table-keyboard.test.tsx` |
| `IT-FE-03` | View Switcher State | Toggle Bento $\leftrightarrow$ Table | Selected row & search query preserved | `tests/frontend/view-switcher.test.tsx` |

---

## 7.3 Subsystem 3 (Navigation & Routing) Test Suite

| Test ID | Test Target | Test Objective | Assertion / Pass Criteria | Test File & Runner |
| :--- | :--- | :--- | :--- | :--- |
| `UT-NAV-01`| Route Handlers Auth | Verify `requireUser()` on `/api/**` | Unauthenticated request returns 401 | `tests/api/navigation-routes.test.ts` |
| `IT-NAV-01`| Drawer Interception | Navigate to `/discover/[job_id]` | Drawer slides open over table without reload | `tests/frontend/dossier-drawer-navigation.test.tsx` |
| `IT-NAV-02`| In-Drawer Cycling | Press `↑` and `↓` inside drawer | Adjacent job renders without drawer closing | `tests/frontend/dossier-drawer-navigation.test.tsx` |
| `IT-NAV-03`| Universal Ingest | Submit existing URL in `Shift + I` | Displays dedup notice; auto-opens drawer | `tests/frontend/integration-universal-ingest.test.tsx` |
| `E2E-NAV-01`| Mobile Responsiveness | Viewport $380\text{px} \times 844\text{px}$ | Left rail collapses; drawer occupies 100% width | `tests/e2e/responsive-navigation.spec.ts` |

---

## 7.4 Subsystem 4 (Business Logic & Cadence) Test Suite

| Test ID | Test Target | Test Objective | Assertion / Pass Criteria | Test File & Runner |
| :--- | :--- | :--- | :--- | :--- |
| `UT-CAD-01`| Rule R1 Send Audit | Search codebase for send endpoints | 0 hits for `users.messages.send` & `gmail.send` | `tests/cadence-engine-logic.test.ts` |
| `UT-CAD-02`| Rule R5 Metric Diff | AI text alters metric number | Reject AI text; revert to base bullet | `tests/cadence-engine-logic.test.ts` |
| `UT-CAD-03`| Timezone Window | Compute send window for London | Output: Tuesday–Thursday at 09:15 GMT | `tests/cadence-engine-logic.test.ts` |
| `IT-CAD-01`| Draft Creation | Invoke `startOutreach()` | Draft created in `ThreeDoors/Drafts` label | `tests/cadence-workflow-integration.test.ts` |
| `IT-CAD-02`| Sent Detection | Mock Gmail thread with `SENT` label | Status advances to `SENT`; records `sent_at` | `tests/cadence-workflow-integration.test.ts` |
| `IT-CAD-03`| Auto-Stop on Reply | Mock inbound email in thread | Halts follow-ups; sets `IN_CONVERSATION` | `tests/cadence-workflow-integration.test.ts` |
| `IT-CAD-04`| Safety Cap 40/24h | Attempt to create 41st draft | Throws HTTP 429 rate limit exception | `tests/cadence-workflow-integration.test.ts` |

---

# 8. 100% Compliance Verification Rubric (Artifacts 1 through 7)

This matrix establishes the definitive clause-by-clause compliance criteria evaluated by the Forensic Auditor:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 100% COMPLIANCE VERIFICATION RUBRIC                                                                │
├──────┬──────────────────────┬────────────────────────────────────────────────────────┬─────────────┤
│ Ref  │ Source Artifact      │ Exact Requirement Specification                        │ Target Pass │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-01 │ Artifact 1 §1        │ 9 distinct modules (@core/db through @ui/command-center│ PASS (Zero  │
│      │                      │ integrated without circular dependencies.              │ cycles)     │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-02 │ Artifact 1 §2        │ End-to-end data flow: 35 sources -> DB -> Eval -> Docs │ PASS (Trace │
│      │                      │ CV -> Drive PDF -> Gmail Draft -> Human Send -> Mirror.│ verified)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-03 │ Artifact 1 §3        │ State transitions: Discovered -> Chosen -> Outreach -> │ PASS (State │
│      │                      │ Sent -> Thread Watched -> In Conversation.             │ machine)    │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-04 │ Artifact 2 §1-11     │ Exact implementation of 18 tables across 11 sections.  │ PASS (0 DDL │
│      │                      │ All column names, foreign keys, and constraints match. │ drift)      │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-05 │ Artifact 2 (Enums)   │ 5 explicit enums: posting_status, application_stage,   │ PASS (5     │
│      │                      │ outreach_door, cadence_step_status, contact_confidence│ present)    │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-06 │ Artifact 2 (Indexes) │ 9 performance indexes created and verified in catalog. │ PASS (9 idx)│
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-07 │ Artifact 2 (RLS)     │ 11 user-owned tables enforce `auth.uid() = user_id`.   │ PASS (100%  │
│      │                      │ Cross-user isolation verified via multi-tenant tests.  │ isolated)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-08 │ Artifact 2 (Audit)   │ REVOKE UPDATE, DELETE ON public.decision_events.       │ PASS (Perm  │
│      │                      │ Immutable audit log verified against tampering.        │ denied)     │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-09 │ Artifact 3 §2        │ Precision Cobalt & Steel palette tokens match hex:     │ PASS (Hex   │
│      │                      │ Canvas #080B11, Card #0F1523, Drawer #161F33, Cobalt.  │ matched)    │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-10 │ Artifact 3 §1-2      │ STRICT ZERO INDIGO, VIOLET, ORANGE, OR AMBER SHADES.   │ PASS (0     │
│      │                      │ Terracotta #C85A32 and Amber #8A6100 purged completely.│ violations) │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-11 │ Artifact 3 §3        │ Dual font stack: Inter Variable & JetBrains Mono.      │ PASS (Mono  │
│      │                      │ Monospace telemetry applied to fit scores and stats.   │ verified)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-12 │ Artifact 3 §4        │ 1:1 Bento Cards (320px x 320px) & 640px Dossier Drawer.│ PASS (BBox  │
│      │                      │ Bounding dimensions verified on desktop viewport.      │ confirmed)  │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-13 │ Artifact 4 §2.1      │ Morning Radar: top 20 roles, fit >= 70%, 24h filter.   │ PASS (Capped│
│      │                      │ "See all roles" toggle expands full eligible feed.     │ at 20)      │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-14 │ Artifact 4 §2.2      │ Dual-View Switcher: Bento Cards vs Dense Table with    │ PASS (State │
│      │                      │ shared filter and cursor state without network reload. │ persisted)  │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-15 │ Artifact 4 §2.3      │ Dense Table single-key controller: j/k/Enter/s/c///Esc.│ PASS (User  │
│      │                      │ Mouse-free triage verified via keyboard automation.    │ event test) │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-16 │ Artifact 4 §2.4      │ Slide-out Drawer: 5 tabs, in-drawer cycling (↑/↓),     │ PASS (No    │
│      │                      │ zero page reload, focus trap verified.                 │ page reload)│
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-17 │ Artifact 4 §2.8      │ Responsive mobile breakpoint down to 380px supported.  │ PASS (0     │
│      │                      │ Zero horizontal scrollbar; 100% drawer width.          │ h-scroll)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-18 │ Artifact 5 §1-5      │ Left rail navigation, drawer route, Universal Ingest   │ PASS (All   │
│      │                      │ modal (Shift + I) with duplicate check & auto-open.    │ flows pass) │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-19 │ Artifact 6 §1-3      │ Next.js App Router hierarchy (/discover, /dossiers,    │ PASS (Build │
│      │                      │ /outreach, /interviews, /health, /settings) & 8 facets.│ manifest)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-20 │ Artifact 7 (R1)      │ Cardinal Rule R1: Zero send calls; OAuth limited to    │ PASS (0 send│
│      │                      │ compose/readonly; drafts only in ThreeDoors/Drafts.    │ calls)      │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-21 │ Artifact 7 (R2 & R3) │ $0.00 baseline running cost; missing BYOK keys skip    │ PASS (Free  │
│      │                      │ gracefully with log: `Skipped: no key`.                │ baseline)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-22 │ Artifact 7 (R5)      │ Cardinal Rule R5: Byte-for-byte number match in CV     │ PASS (Regex │
│      │                      │ summaries; zero hallucinated metrics permitted.        │ diff test)  │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-23 │ Artifact 7 (R6)      │ SSRF-safe client (safe-fetch.ts), >=500ms spacing,     │ PASS (SSRF  │
│      │                      │ User-Agent header, robots.txt compliance.              │ blocked)    │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-24 │ Artifact 7 (M7)      │ Recipient timezone geocoding (09:15 Tue-Thu), thread   │ PASS (Queue │
│      │                      │ watcher sent detection, auto-stop on reply verified.   │ & stop test)│
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-25 │ Artifact 7 (Gating)  │ Mandatory preflight gate (scripts/preflight.sh) and    │ PASS (Hook  │
│      │                      │ phased execution exit gates (Phases 0 through 4).      │ enforced)   │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-26 │ PM Governance (G1)   │ Non-Technical Safe Git: Plain-English guide, branches, │ PASS (Strict│
│      │                      │ commits, PRs, merge, rollback; strict isolation on     │ branch      │
│      │                      │ `feature/<phase>-<subsystem>-<feature>`; 0 push to main│ isolation)  │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-27 │ PM Governance (G2/G3)│ PR-First Protocol & Mandatory Human Approval Gate:     │ PASS (Exact │
│      │                      │ Staging preflight passes -> Open PR -> Notify PM with  │ prompt & PR │
│      │                      │ exact text: "Quality checks, unit tests, integration   │ gate locked)│
│      │                      │ tests, and e2e tests have all passed. Ready for your   │             │
│      │                      │ review and approval." Merge strictly post-approval.    │             │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-28 │ PM Governance (G4)   │ Production Testing & Hotfix Resolution: Post-approval  │ PASS (PM    │
│      │                      │ deploy sequence; live PM prod checklist; isolated      │ checklist & │
│      │                      │ `hotfix/<issue>` branch, full preflight, RCA logged.   │ hotfix flow)│
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-29 │ PM Governance (G5)   │ PM System Documentation Updates: Post-prod docs updated│ PASS (PM    │
│      │                      │ from PM perspective (features, value, behavior, limits)│ perspective │
│      │                      │ across living registry and cross-artifact sync matrix. │ maintained) │
├──────┼──────────────────────┼────────────────────────────────────────────────────────┼─────────────┤
│ C-30 │ PM Governance (G5)   │ Sprint Planning & Dedicated Sprint Docs: Upfront task  │ PASS (Sprint│
│      │                      │ scoping, dedicated `docs/sprints/sprint_<N>_plan.md`,  │ docs & live │
│      │                      │ live status tracking, sprint bug logging, template.    │ tracking)   │
└──────┴──────────────────────┴────────────────────────────────────────────────────────┴─────────────┘
```

---

# 9. Operational Runbooks & Incident Response

## 9.1 Ingestion Scraper Failure & Drift Recovery

### Diagnostic Symptoms:
- Morning Radar displays alert banner: *"Source Crawler Warning: 2 sources failed in 04:00 AM run."*
- Source Health Dashboard (`/health/sources`) highlights source in Red with status `FAILED`.

### Root Cause Analysis & Remediation:
1. **Target ATS Changed DOM / URL Pattern:**
   - Inspect raw error stack on Source Health dashboard.
   - If GreenHouse/Lever API returned 404: check if company migrated to Ashby or Workable.
   - Update target careers URL in `public.sources`.
2. **Cloudflare / Bot-Wall Challenge:**
   - If error is `BLOCKED: BOTWALL`: do not attempt aggressive evasion.
   - Switch source toggle to use Chrome Extension Clipper or manual URL paste via Universal Ingest (`Shift + I`).
3. **Drift Recovery Run:**
   - Re-run ingestion runner for the specific source:
     ```bash
     npm run crawl:source -- --source=greenhouse --retry-failed
     ```

---

## 9.2 Google OAuth Disconnection & Token Rotation

### Diagnostic Symptoms:
- Dossier Drawer displays warning: *"Google Drive / Gmail connection required. Re-authenticate in Settings."*
- API calls to Drive export return HTTP 401.

### Remediation Procedure:
1. Navigate to `/settings/google`.
2. Click **"Reconnect Google Workspace"**.
3. Re-authorize the 6 approved scopes (`documents`, `drive.file`, `spreadsheets`, `calendar.events`, `gmail.compose`, `gmail.readonly`).
4. Server encrypts new refresh token with AES-GCM and stores in `profiles.google_tokens`.
5. Background worker resumes stalled draft creations without data loss.

---

## 9.3 Safety Cap & Quota Throttling Response

### Diagnostic Symptoms:
- Candidate attempts to click "Start Outreach", receives notification:
  *"Daily draft safety limit of 40 reached. Outreach is paused until rolling 24-hour window resets."*

### Policy & Remediation:
1. This is an intended system safety invariant (**Cardinal Rule R8**) designed to protect candidate domain reputation and prevent spam classification.
2. In rare emergency scenarios requiring an override:
   - Candidate can navigate to `/settings/account` $\to$ *Safety Caps*.
   - Adjust daily cap to temporary maximum of 50 drafts (requires explicit confirmation).
   - System logs cap adjustment event to `public.decision_events`.

---

## 9.4 Supabase Inactivity Prevention & Database Replay

### Inactivity Prevention:
- Supabase free-tier projects pause after 7 days of inactivity.
- **Automated Keep-Alive Cron:** A GitHub Action (`.github/workflows/db-keepalive.yml`) runs daily at 04:00 AM IST, issuing a read query (`SELECT count(*) FROM public.sources;`). This ensures the database stays active indefinitely.

### Database Replay & Idempotent Rebuild:
In the event of database disaster recovery:
```bash
# 1. Reset database to clean slate
PGHOST=$PGHOST PGUSER=$PGUSER psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Re-apply Master DDL Migration
PGHOST=$PGHOST PGUSER=$PGUSER psql -f supabase/migrations/00000000000000_init_schema.sql

# 3. Seed System Sources & Baseline Tracks
npm run seed:system-sources
npm run seed:baseline-tracks

# 4. Verify Database Integrity
bash scripts/db-check.sh
```

---

# 10. Non-Technical Safe Git & GitHub Release Workflow

## 10.1 Plain-English Git Architecture for Product Managers

Version control systems can appear intimidating, but Git is fundamentally a **collaborative digital ledger and time machine** for project source code. For Product Managers, stakeholders, and non-technical operators, understanding the core concepts enables seamless governance, safety enforcement, and risk-free releases.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    GIT MENTAL MODEL FOR PRODUCT MANAGERS                               │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Git Concept       │ Plain-English Explanation & Business Analogy                       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Repository (Repo) │ The master project vault containing all application code,          │
│                   │ configuration, assets, documentation, and historical records.      │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Commit            │ A permanent, timestamped snapshot of specific changes, like saving │
│                   │ a milestone draft of a critical business strategy document.       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Main Branch       │ The sacred, live production source of truth. Represents the tested,│
│ (`main`)          │ working application currently serving users. Must never be broken. │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Feature Branch    │ A private, isolated sandbox created off `main`. Changes here are   │
│                   │ completely invisible to production, allowing safe development.     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Pull Request (PR) │ A formal proposal, review room, and quality gate on GitHub asking  │
│                   │ permission to merge code from a feature branch into `main`.        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Merge             │ The controlled incorporation of approved changes from a feature     │
│                   │ branch into `main` after all automated tests and PM sign-offs pass.│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Rollback          │ An instantaneous recovery operation that returns `main` or live    │
│                   │ production to a known-healthy prior commit if a defect is found.   │
└───────────────────┴────────────────────────────────────────────────────────────────────┘
```

---

## 10.2 Strict Branch Isolation Invariant (`feature/<phase>-<subsystem>-<feature>`)

To safeguard the stability of Three Doors, direct commits or pushes to `main` are **strictly forbidden** (Cardinal Governance Rule G1). All engineering tasks, whether conducted by human engineers or autonomous AI agents, must occur within dedicated, isolated branches.

### 10.2.1 Branch Taxonomy & Naming Syntax

Branches must strictly adhere to semantic, hierarchical naming:

1. **Standard Feature Branches:**
   - Syntax: `feature/<phase>-<subsystem>-<feature-slug>`
   - Examples:
     * `feature/p0-db-canonical-schema` (Phase 0, Database: apply PostgreSQL 16 schema)
     * `feature/p1-ingest-greenhouse-scraper` (Phase 1, Ingestion: Greenhouse ATS parser)
     * `feature/p2-fe-morning-radar-view` (Phase 2, Frontend: Morning Radar UI component)
     * `feature/p2-fe-dense-table-shortcuts` (Phase 2, Frontend: j/k/Enter/s/c keyboard engine)
     * `feature/p3-nav-dossier-drawer` (Phase 3, Navigation: 640px slide-out drawer)
     * `feature/p3-cadence-r1-engine` (Phase 3, Cadence: ThreeDoors/Drafts isolation engine)
     * `feature/p4-intel-teardown-scraper` (Phase 4, Intel: Reddit & App Store review parser)

2. **Hotfix Branches (Production Bug Remediation):**
   - Syntax: `hotfix/<incident-id>-<defect-slug>`
   - Examples:
     * `hotfix/inc-101-drawer-tab-focus-trap`
     * `hotfix/inc-102-timezone-queue-offset`

3. **Documentation & Governance Branches:**
   - Syntax: `docs/<sprint-id>-<doc-slug>`
   - Examples:
     * `docs/sprint-0-governance-runbook`
     * `docs/sprint-1-architecture-sync`

### 10.2.2 GitHub Branch Protection Policy

The GitHub repository must enforce branch protection rules on `main`:
- **Require a pull request before merging:** Direct `git push origin main` is rejected by GitHub.
- **Require status checks to pass before merging:** The CI preflight suite (`scripts/preflight.sh`) must report green.
- **Require approvals:** At least 1 approving review from the Product Manager / Code Owner.
- **Do not allow bypass:** Branch protection applies strictly to all users, administrators, and automated bots.

---

## 10.3 Staging Preflight Verification & The PR-First Protocol

Development follows a strict **PR-First** engineering discipline. Code is never merged without being staged, independently verified, and formally reviewed via a Pull Request.

### 10.3.1 The 6-Step Feature Release Lifecycle

```
[ Step 1: Branch Creation ]
   │  git checkout -b feature/p2-fe-dense-table
   ▼
[ Step 2: Implementation ]
   │  Code minimal changes, write unit & integration tests
   ▼
[ Step 3: Local Preflight Verification ]
   │  bash scripts/preflight.sh (Must pass all 6 gates with exit code 0)
   ▼
[ Step 4: Commit & Remote Push ]
   │  git commit -m "feat(ui): implement dense table j/k shortcuts"
   │  git push origin feature/p2-fe-dense-table
   ▼
[ Step 5: Open GitHub Pull Request ]
   │  Open PR against main with detailed PM release description
   ▼
[ Step 6: Mandatory PM Approval Gate ]
   │  Halt and notify PM with mandatory gate phrase
   ▼
[ Awaiting Human PM Review & Sign-Off ]
```

---

## 10.4 Mandatory User Approval Gate & Exact Communication Protocol

When all local and CI quality gates have passed and the Pull Request is open, the agent or engineer **must pause execution and formally notify the Product Manager**. 

### 10.4.1 Mandatory Communication Phrasing

The agent or system must deliver the following exact, non-negotiable prompt to the user:

> **"Quality checks, unit tests, integration tests, and e2e tests have all passed. Ready for your review and approval."**

### 10.4.2 PR Metadata Dossier

Accompanying the mandatory phrase, the agent must furnish a structured PR Dossier providing complete visibility:

```markdown
### Pull Request Summary
- **PR Link:** https://github.com/hardijain26/backdoor/pull/42
- **Branch:** `feature/p2-fe-dense-table` ➔ `main`
- **Sprint / Phase:** Sprint 2 (Phase 2 — Triage & Radar)
- **Subsystem:** Subsystem 2 (Frontend & Component Engineering)

#### Executive Business Summary
Implements the Dense Command Table keyboard engine enabling mouse-free candidate triage.
Candidates can now navigate opportunities at executive speed using `j` (down), `k` (up),
`Enter` (open drawer), `s` (skip role), `c` (choose role), and `/` (instant search focus).

#### Automated Quality & Verification Evidence
- TypeScript Verification: Passed (0 errors across 48 source files)
- Node.js Unit Tests: Passed (42/42 tests passing in 1.4s)
- Jest Component Tests: Passed (18/18 component tests passing in 3.2s)
- PostgreSQL Schema & RLS: Passed (18 tables, 5 enums, 9 indexes, 11 RLS policies verified)
- Playwright E2E Tests: Passed (6 browser user journeys passing)
- Next.js Production Build: Passed (compiled standalone output in 14.1s)

#### Invariant Attestation
- [x] Zero Indigo or Orange Shades: CSS scan verified zero forbidden color tokens.
- [x] Rule R1 Compliance: Zero send endpoints; drafts restricted to ThreeDoors/Drafts.
- [x] RLS Tenant Isolation: Multi-tenant user isolation verified.

Ready for your review and approval.
```

---

## 10.5 Step-by-Step GitHub Web Interface Review Guide for Non-Technical Approvers

For a Product Manager or business stakeholder reviewing the Pull Request on GitHub:

1. **Navigate to the PR:** Click the PR link provided in the notification.
2. **Review the PR Description:** Check the feature summary, sprint mapping, and automated test checkmarks.
3. **Inspect the "Files Changed" Tab:**
   - Click the **"Files changed"** tab at the top of the PR page.
   - GitHub displays a "diff" (difference):
     * Lines highlighted in **Green** with a `+` are newly added lines.
     * Lines highlighted in **Red** with a `-` are deleted lines.
   - Confirm that changes align with product expectations and that no unrelated files were touched.
4. **Inspect Automated Checks:**
   - Scroll to the bottom of the conversation tab.
   - Verify that all GitHub Actions / Preflight checks display a **green checkmark** (`✔ All checks have passed`).
5. **Submit Formal Approval:**
   - Click the green **"Review changes"** button in the top right corner.
   - Select the **"Approve"** option.
   - (Optional) Enter a brief comment: *"LGTM. Verified keyboard specifications and design system tokens."*
   - Click **"Submit review"**.
6. **Authorize Merge:**
   - The user may click **"Squash and merge"** on GitHub, or instruct the agent to complete the merge now that approval is recorded.

---

# 11. Production Testing, Deployment & Bug Resolution Protocol

## 11.1 Strict Merge Ordering & Production Release Sequence

Production releases must follow a strict sequential ordering. No code may be merged to `main` or deployed to production without explicit human PM approval.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   STRICT MERGE & PRODUCTION RELEASE PIPELINE                           │
├─────────┬──────────────────────────┬───────────────────────────────────────────────────┤
│ Sequence│ Stage                    │ Gate & Action                                     │
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 1 │ Feature Branch Preflight │ All 6 preflight gates pass locally on branch.     │
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 2 │ Pull Request Opened      │ PR opened; automated CI tests pass on GitHub.     │
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 3 │ Formal PM Approval Gate  │ Exact prompt presented; PM reviews diff & approves│
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 4 │ Controlled Merge to Main │ PR squash-merged to `main`; branch deleted.       │
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 5 │ Production Deployment    │ Vercel/Cloud Run deploys `main`; health check 200.│
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 6 │ Live PM Verification     │ PM executes Live Production Verification Checklist│
├─────────┼──────────────────────────┼───────────────────────────────────────────────────┤
│ Stage 7 │ Documentation & Close    │ PM updates sprint doc, PRDs, and signs off.       │
└─────────┴──────────────────────────┴───────────────────────────────────────────────────┘
```

---

## 11.2 Live Production Verification Checklist for the Product Manager

Following deployment of `main` to the production environment, the Product Manager must perform live operational smoke testing against the production URL:

```markdown
### Production Smoke Testing & Verification Checklist

**Environment URL:** `https://backdoor.production.app`
**Release Version / Commit:** `main @ [commit-sha]`
**Tester:** Product Manager (Hardi Jain)
**Date:** YYYY-MM-DD

- [ ] **1. System Health & Infrastructure Ping (`/health`)**
  - Verify `/api/health` returns HTTP 200 with `{ "status": "healthy", "database": "connected" }`.
  - Verify `/health/sources` displays green status across system ingestion scrapers.

- [ ] **2. Authentication & Tenant Data Isolation**
  - Sign in using authorized Google OAuth account.
  - Verify candidate profile displays correct Hardi Jain executive track.
  - Confirm tenant isolation: zero records from other candidate profiles are visible.

- [ ] **3. Morning Radar Feed & Scraper Provenance**
  - Open `/discover` Morning Radar workspace.
  - Verify top 20 roles are displayed, all with `fit_score >= 70%`.
  - Verify all roles were posted within the rolling 24-hour window.
  - Confirm score badges render semantic colors: Emerald (>=70), Sky (40-69), Slate (<40).
  - Verify zero indigo, violet, orange, or amber elements exist on screen.

- [ ] **4. Mouse-Free Keyboard Navigation Engine**
  - Click table or press `/` then `Esc` to focus table body.
  - Press `j`: active row focus highlight moves down one role.
  - Press `k`: active row focus highlight moves up one role.
  - Press `s`: marks active role as `SKIPPED`; row animates out; next row focused.
  - Press `c`: marks active role as `CHOSEN`; state updates to Chosen.
  - Press `Enter`: opens 640px slide-out dossier drawer for focused role.

- [ ] **5. Slide-Out Dossier Drawer Experience**
  - Verify drawer slides out smoothly from right edge, occupying exactly 640px width.
  - Check 6 zones: Header, Spec, 3-Tier Match, Intel Teardown, 3 Doors, Draft Preview.
  - Press `ArrowDown` inside drawer: seamlessly advances to next candidate dossier without drawer closing or page reload.
  - Press `Esc`: closes drawer cleanly and restores table focus.

- [ ] **6. Rule R1 Human Outreach Safety Verification**
  - In dossier drawer, select Door 1 (Hiring Manager) and click **"Prepare Outreach"**.
  - Verify application generates a draft in Gmail under label `ThreeDoors/Drafts`.
  - **CRITICAL:** Check Gmail account. Verify email is in Drafts folder, **NOT SENT**.
  - Verify UI shows *"View Draft in Gmail"* button and offers **NO automated send button**.
  - Verify scheduled dispatch time is set to Tuesday–Thursday at 09:15 AM recipient local time.

- [ ] **7. Mobile Viewport & Breakpoint Compression**
  - Resize browser window to mobile width (380px) or test on mobile device.
  - Verify left navigation rail collapses cleanly into bottom bar or menu.
  - Verify table converts to vertical mobile card stack with zero horizontal scrollbar.
  - Open dossier drawer: confirm drawer occupies 100% viewport width.

- [ ] **8. Audit Trail Verification**
  - Verify in Supabase table editor that triage and draft preparation events were appended to `public.decision_events`.
  - Confirm records cannot be updated or deleted.
```

---

## 11.3 Production Defect & Incident Classification Taxonomy (P0–P3)

If an anomaly is discovered during live production verification or daily use, it is categorized according to severity:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   DEFECT SEVERITY TAXONOMY & RESPONSE SLA                              │
├─────┬──────────┬──────────────────────────────────────────┬────────────────────────────┤
│ Tier│ Severity │ Failure Criteria Examples                │ Immediate Operational SLA  │
├─────┼──────────┼──────────────────────────────────────────┼────────────────────────────┤
│ P0  │ Critical │ Any breach of Rule R1 (send attempted);  │ Instant rollback to prior  │
│     │ Blocker  │ auth bypass; database corruption; 500 on │ commit; halt active        │
│     │          │ root `/discover`; data leakage.          │ outreach cadences.         │
├─────┼──────────┼──────────────────────────────────────────┼────────────────────────────┤
│ P1  │ Major    │ Morning Radar empty; keyboard shortcuts  │ Isolated hotfix branch;    │
│     │ Feature  │ unresponsive; drawer route crash; Gmail  │ resolve, test & release    │
│     │ Failure  │ draft creation 400 error.                │ within 4 business hours.   │
├─────┼──────────┼──────────────────────────────────────────┼────────────────────────────┤
│ P2  │ Moderate │ Secondary source scraper failing; filter │ Document in sprint doc;    │
│     │ Bug      │ tag reset glitch; drawer tab styling     │ prioritize in current or   │
│     │          │ anomaly; mobile spacing glitch.          │ upcoming sprint cycle.     │
├─────┼──────────┼──────────────────────────────────────────┼────────────────────────────┤
│ P3  │ Minor    │ Copy typo; minor telemetry delay; search │ Log to sprint backlog;     │
│     │ Cosmetic │ placeholder wording polish.              │ batch with next release.   │
└─────┴──────────┴──────────────────────────────────────────┴────────────────────────────┘
```

---

## 11.4 Isolated Hotfix Branch Resolution Workflow (`hotfix/<issue-id>`)

Under no circumstances is a production bug patched directly on `main` or on a live server. Every hotfix must follow the isolated branch lifecycle:

```
[ Production Bug Detected & Classified ]
   │
   ▼
[ 1. Checkout Hotfix Branch off main ]
   │  git checkout main && git pull origin main
   │  git checkout -b hotfix/inc-201-drawer-cycling-nan
   ▼
[ 2. Reproduce Bug with a Failing Test (Red) ]
   │  Write automated test reproducing exact failure condition
   │  npm run test:node tests/frontend/dossier-drawer-cycling.test.ts (Fails)
   ▼
[ 3. Implement Minimal Targeted Fix (Green) ]
   │  Apply surgical fix to source code
   ▼
[ 4. Run Full Staging Preflight Gate ]
   │  bash scripts/preflight.sh (All 6 gates must pass)
   ▼
[ 5. Open Hotfix Pull Request targeting main ]
   │  git commit -m "fix(drawer): resolve NaN index in dossier arrow cycling"
   │  git push origin hotfix/inc-201-drawer-cycling-nan
   │  Open PR on GitHub with RCA summary
   ▼
[ 6. Mandatory PM Approval Gate ]
   │  System presents exact prompt:
   │  "Quality checks, unit tests, integration tests, and e2e tests have all passed. Ready for your review and approval."
   ▼
[ 7. PM Approves & Merges Hotfix ]
   │  Squash-merge to main; deploy to production
   ▼
[ 8. Re-execute Live Production Verification Checklist ]
   │  Confirm defect is resolved; update Sprint & RCA logs
```

---

## 11.5 Root Cause Analysis (RCA) & Remediation Audit Trail

Every resolved production incident must be documented with a structured blameless 5-Why Root Cause Analysis recorded in both the active Sprint Document (`docs/sprints/sprint_<N>_plan.md`) and the relevant subsystem runbook:

```markdown
### Incident RCA Template
- **Incident ID:** `INC-YYYYMMDD-01`
- **Severity:** [P0 / P1 / P2]
- **Date & Duration:** YYYY-MM-DD HH:MM to HH:MM (Total: X minutes)
- **Impacted Subsystem:** [Subsystem 1 / 2 / 3 / 4]
- **Symptom:** What did the user or monitoring observe?
- **Root Cause (5 Whys):**
  1. Why did the failure occur?
  2. Why did that component fail?
  3. Why wasn't that captured in upstream logic?
  4. Why was that input possible?
  5. Why did existing tests not catch it?
- **Direct Resolution:** Code changes implemented in hotfix PR #X.
- **Permanent Prevention:** Specific new test case added to `preflight.sh` to prevent regression.
```

---

# 12. Product Manager System Documentation Governance

## 12.1 The PM Documentation Mandate (Features, User Impact, Operational Behavior, Limitations)

In high-velocity engineering, code often diverges from documentation. In Three Doors, **documentation is treated with equal engineering rigor as production code**.

Technical docs explain *how* a system is implemented; Product Manager documentation explains **what was delivered, why it matters to the user, how it behaves in operation, and what boundaries exist**.

Every feature or release must be documented across the **Four PM Dimensions**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     THE FOUR PRODUCT MANAGER DOCUMENTATION DIMENSIONS                  │
├────────────────────────────┬───────────────────────────────────────────────────────────┤
│ Dimension                  │ Required Content & Product Perspective                    │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 1. Features Delivered      │ Clear, plain-English catalogue of capabilities delivered. │
│                            │ Detailed descriptions of UI screens, controls, keyboard   │
│                            │ bindings, and data views unlocked for the candidate.      │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 2. User Impact & Value     │ The strategic advantage gained. How does this feature help│
│                            │ bypass ATS algorithms, save executive time, increase      │
│                            │ interview conversion, or maintain outreach privacy?       │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 3. Operational Behavior    │ How the system operates in production: daily morning cron │
│                            │ schedule (04:00 AM IST), background Google Sheet sync,    │
│                            │ email thread watchers, rate limiting, and caching rules.  │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 4. Known Boundaries &      │ Explicit negative boundaries: what the system DOES NOT do │
│    Limitations             │ (no automated sends, max 40 drafts/day, zero FinTech jobs,│
│                            │ 2-page CV limit, $0.00 baseline cost guarantees).         │
└────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 12.2 Post-Production Verification Documentation Trigger

Documentation updates are **not an optional postscript**. They are a mandatory formal exit gate:

1. **Trigger Condition:** Successful execution and sign-off of the Live Production Verification Checklist (Section 11.2).
2. **Execution Responsibility:** The engineering agent or developer who implemented the release must draft the PM-centric documentation updates.
3. **Approval:** The Product Manager reviews and accepts documentation changes before the sprint task is marked as `[DONE]`.

---

## 12.3 Documentation Maintenance Matrix & Living Document Registry

All project documentation lives in the repository under version control. The following registry establishes ownership and update triggers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     LIVING REPOSITORY DOCUMENTATION REGISTRY                           │
├───────────────────────────────────┬──────────────┬─────────────────────────────────────┤
│ Document Path                     │ Primary Owner│ Update Trigger                      │
├───────────────────────────────────┼──────────────┼─────────────────────────────────────┤
│ `docs/build_instructions_runbook.md`│ Engineering  │ Architecture updates, new quality   │
│                                   │ & Lead PM    │ gates, new operational procedures.  │
├───────────────────────────────────┼──────────────┼─────────────────────────────────────┤
│ `docs/sprints/sprint_<N>_plan.md` │ Active Agent │ Upfront sprint planning, live task  │
│                                   │ & Lead PM    │ tracking, and production bug logs.  │
├───────────────────────────────────┼──────────────┼─────────────────────────────────────┤
│ `docs/PRODUCT-ARCHITECTURE.md`    │ Product PM   │ Macro data flow updates, subsystem  │
│                                   │              │ interface contract evolutions.      │
├───────────────────────────────────┼──────────────┼─────────────────────────────────────┤
│ `docs/SECURITY.md`                │ Security PM  │ OAuth scope adjustments, RLS changes│
│                                   │              │ data encryption, and audit rules.   │
├───────────────────────────────────┼──────────────┼─────────────────────────────────────┤
│ `README.md`                       │ Product PM   │ User onboarding, system prerequisites│
│                                   │              │ quickstart, and feature highlights. │
├───────────────────────────────────┼──────────────┼─────────────────────────────────────┤
│ `CHANGELOG.md`                    │ Release PM   │ Every production release and hotfix.│
└───────────────────────────────────┴──────────────┴─────────────────────────────────────┘
```

---

## 12.4 PM Release Notes & User-Facing Changelog Standard

For every production release, concise release notes must be appended to `CHANGELOG.md` and the active sprint document following this standard:

```markdown
## Release [Version] — [Release Date]

### What's New for Candidates
- **Mouse-Free Triage Engine:** Triage up to 100 job postings in 5 minutes using single-key shortcuts (`j`/`k`/`Enter`/`s`/`c`).
- **Precision Color System:** High-contrast Obsidian & Cobalt interface designed to eliminate eye fatigue during early morning executive review.

### Operational Enhancements
- Automated morning ingestion runs daily at 04:00 AM IST, ensuring fresh leads are ready by 07:00 AM.
- Google Workspace synchronization now operates asynchronously without slowing down web UI interactions.

### Safety & Compliance Invariants Maintained
- 100% adherence to Rule R1: Zero automated emails sent; all 40 daily drafts staged safely in Gmail `ThreeDoors/Drafts`.
- 100% verification of Rule R5: All CV numbers verified byte-for-byte against proven metrics.
```

---

# 13. Sprint Planning & Sprint Tracking Protocol

## 13.1 Upfront Sprint Planning Protocol (Pre-Execution Scoping & Definition of Done)

To eliminate chaotic, unplanned development, Three Doors enforces **Upfront Sprint Planning** (Cardinal Governance Rule G5):

1. **Pre-Execution Invariant:** Under no circumstances may an engineer or AI agent write application code without an approved, documented sprint plan for the target sprint.
2. **Upfront Task Definition:** All tasks must be enumerated before sprint kickoff with clear IDs, subsystem tags, acceptance criteria, and explicit test verification steps.
3. **Definition of Done (DoD):** A sprint task is considered `[DONE]` if and only if:
   - Code is implemented on an isolated feature branch.
   - All 6 staging preflight gates pass (`scripts/preflight.sh`).
   - GitHub Pull Request is opened and mandatory approval prompt delivered to PM.
   - PM formally approves and PR is merged to `main`.
   - Live production verification checklist is executed and passes.
   - Relevant PM and technical documentation is updated.

---

## 13.2 Dedicated Sprint Document Architecture (`docs/sprints/sprint_<N>_plan.md`)

Every sprint possesses its own dedicated, permanent tracking document located in `docs/sprints/`:

- `docs/sprints/sprint_0_plan.md` — Foundation, Canonical Schema, Token Engine, & Preflight Hook Wiring.
- `docs/sprints/sprint_1_plan.md` — Phase 1: 35-Source Ingestion, Polite Crawling & Lake Deduplication.
- `docs/sprints/sprint_2_plan.md` — Phase 2: Morning Radar, Dual-View Switcher & Dense Command Table.
- `docs/sprints/sprint_3_plan.md` — Phase 3: Slide-Out Dossier Drawer & Multi-Channel Cadence Engine.
- `docs/sprints/sprint_4_plan.md` — Phase 4: Company Intelligence Teardowns & Meet Audio Intelligence.

---

## 13.3 Live Sprint Execution Tracking & Status Lifecycle

Sprint documents are living operational artifacts updated in real time as work progresses. Each task transitions through a strictly defined lifecycle:

```
[PLANNED] ➔ [IN_PROGRESS] ➔ [STAGING_VERIFIED] ➔ [PR_OPEN] ➔ [PM_APPROVED] ➔ [MERGED] ➔ [PROD_VERIFIED] ➔ [DONE]
```

- `PLANNED`: Task scoped and approved in sprint plan.
- `IN_PROGRESS`: Feature branch created; active development underway.
- `STAGING_VERIFIED`: Local preflight (`scripts/preflight.sh`) passed 100%.
- `PR_OPEN`: Remote branch pushed; GitHub PR created; approval requested from PM.
- `PM_APPROVED`: Product Manager reviewed PR diff and formally approved.
- `MERGED`: Code squash-merged to `main`; feature branch deleted.
- `PROD_VERIFIED`: Live production verification checklist executed and signed off.
- `DONE`: Sprint document, PRDs, and runbooks updated; task closed.

---

## 13.4 Bug Tracking & Remediation within Sprint Documents

If any defects, regressions, or production anomalies occur during sprint execution, they must be logged directly within the sprint document's **Defect & Incident Resolution Log**.

Each bug entry records:
- Defect ID & Title
- Severity Level (P0–P3)
- Symptoms & Impact
- Isolated Hotfix Branch
- Root Cause Analysis Summary
- Verification & Prevention Test
- Current Status (`OPEN` ➔ `RESOLVED`)

---

## 13.5 Authoritative Sprint Plan Markdown Template (`template_sprint_plan.md`)

The following template must be copied and populated when initializing any new sprint:

```markdown
# Sprint [N] Plan: [Sprint Title]

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint [N]
- **Target Phase:** Phase [N] ([Phase Name])
- **Sprint Goal:** [Single concise sentence defining what business or product capability is unlocked]
- **Sprint Status:** [PLANNING / IN_PROGRESS / REVIEW / COMPLETED]
- **Target Start Date:** YYYY-MM-DD
- **Target Completion Date:** YYYY-MM-DD

---

## 2. Planned Tasks Breakdown & Subsystem Mapping

| Task ID | Task Title | Subsystem | Branch Name | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S[N]-T01` | [Task Description] | [Subsystem 1/2/3/4] | `feature/p[N]-[subsystem]-[slug]` | `PLANNED` | [Owner] |
| `S[N]-T02` | [Task Description] | [Subsystem 1/2/3/4] | `feature/p[N]-[subsystem]-[slug]` | `PLANNED` | [Owner] |

---

## 3. Detailed Task Specifications & Acceptance Criteria

### Task `S[N]-T01`: [Task Title]
- **Objective:** [What does this task achieve from a user and technical perspective?]
- **Subsystem & Scope:** [Affected modules, files, or schema entities]
- **Acceptance Criteria:**
  - [ ] Acceptance criterion 1
  - [ ] Acceptance criterion 2
- **Test & Verification Steps:**
  - Unit Test: `npm run test:node tests/[test-name].test.ts`
  - Integration Test: `npm run test:unit tests/[component].test.tsx`
  - Preflight Verification: `bash scripts/preflight.sh`

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck`)
- [ ] Node.js core logic tests pass (`npm run test:node`)
- [ ] Jest frontend component tests pass (`npm run test:unit`)
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
Following deployment of `main`, the Product Manager executes the live verification checklist:
- [ ] Production health check verified (`/api/health`)
- [ ] Feature functionality verified in live browser
- [ ] Zero forbidden colors (zero indigo/orange)
- [ ] Rule R1 verified (Drafts only; zero send calls)
- [ ] Mobile responsive layout verified (380px breakpoint)
- **PM Sign-Off Signature:** ____________________ **Date:** ___________

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BUG-01` | [P0-P3] | [Issue description] | `hotfix/...` | [RCA and fix summary] | [OPEN/RESOLVED] |

---

## 8. Product Manager Documentation Updates Log
- [ ] `docs/build_instructions_runbook.md` updated with new operational behaviors
- [ ] `docs/PRODUCT-ARCHITECTURE.md` updated with interface modifications
- [ ] `CHANGELOG.md` updated with user-facing release notes
- [ ] Features, User Value, Operational Behaviors, and Boundaries documented
```

---

*End of Three Doors (backdoorv.1) Comprehensive Product-Centric Build Instruction & Operational Runbook.*

