# Backdoor (v1.0): Comprehensive Functional PRD & System Specification

**Product Name:** Backdoor  
**Document Version:** 1.0.0 (Production Master)  
**Date:** October 29, 2026  
**Repository:** `backdoor` (`https://github.com/hardijain26/backdoor`)  
**Author / Sole User (Release 1):** Hardi Jain  
**Candidate Baseline Profile:** Chartered Accountant with 3 years as Product Manager at PayU; targeting SaaS & AI PM roles in India, US, UK, EU, or Remote; strictly excluding FinTech and Payments companies.  
**Tech Stack:** Next.js 15 (App Router, TypeScript), Supabase (PostgreSQL 16), Google Workspace API, Groq Whisper API.  
**Zero-Cost Operating Rule:** \$0.00/month baseline operating cost with no third-party keys added.

---

## 1. Product Overview, Goals & Non-Goals

### 1.1 Executive Summary & Core Thesis
**Backdoor** is an intelligent, high-density career acceleration command center engineered to bypass Applicant Tracking Systems (ATS) by systematically discovering high-signal opportunities early and routing candidates directly into organizations through three high-leverage entry pathways:
*   **Pathway 1 (The Decision Maker):** Founder, Head of Product, VP of Product, or Group PM who feels the operational pain directly.
*   **Pathway 2 (The Gatekeeper):** Technical Recruiter or Talent Partner evaluating specific headcount criteria.
*   **Pathway 3 (The Ally / Referral):** Peer PM, Tech Lead, or Ex-Employee who can provide insider insights and champion an internal employee referral.

### 1.2 Universal Candidate Model & Case Study Persona

> [!IMPORTANT]
> **Universal Architecture:** Backdoor is architected from the ground up as a **universal career acceleration and transition engine for all types of professionals** (Software Engineers $\to$ Tech PM, Management Consultants $\to$ Strategy/Ops, Customer Operations $\to$ UX PM, Marketing $\to$ Growth, Lawyers $\to$ Policy/Product, Finance $\to$ FinTech/AI PM). 
> 
> In Release 1, Hardi Jain's profile (Chartered Accountant $\to$ AI/Growth PM) is utilized as the primary reference showcase to validate deep cross-disciplinary competency translation.

#### Universal User Profile Capabilities
*   **Arbitrary Baseline Professions:** Users can onboard from *any* professional background (`baseline_profession`), defining their historical domain credentials without constraints.
*   **Dynamic Target Tracks:** Any user can define and switch between multiple custom target role tracks (`tracks`), tailoring skills weights, target titles, seniority floors, and geographic preferences.
*   **Configurable Industry Exclusions:** Individualized positive and negative industry constraints (e.g., Hardi excludes FinTech and Payments; an engineering candidate might exclude Crypto or Gambling).

#### Reference Case Study Persona (Hardi Jain)
*   **Candidate Baseline:** Chartered Accountant with 3 years of hands-on PM experience at PayU and deployed AI-native side projects (Pantry Vault AI, Med-Voice).
*   **Active Target Tracks:** AI-Native Product Manager, Growth Product Manager, UX/Technical Product Manager.
*   **Target Geographies:** India, United States, United Kingdom, European Union, and Global Remote.
*   **User Exclusions:** Companies in FinTech, Payments, or Neo-banking (enforced at ingestion and evaluation).

### 1.3 Core Product Goals (Release 1)
1. **Universal High-Signal Discovery Feed:** Every job opening matching the candidate's active filters across 35 verified sources reaches one clean feed within 24 hours of posting.
2. **Automated Zero-Work Resume & Teardown Synthesis:** Any role scored $\ge 70$ automatically generates a tailored CV Google Doc, a zero-cost Drive PDF, a 1-page company teardown, and up to three verified entry contacts without manual effort.
3. **Sub-10-Minute Outreach Pipeline:** Total time from discovering a role to a reviewed, scheduled Gmail draft is under 10 minutes.
4. **Human-in-the-Loop Safety & Zero Spam:** Zero emails leave Gmail without the candidate manually clicking Send in Gmail. Zero logged-in LinkedIn bot scraping or account risks.
5. **Zero Running Cost Baseline:** Operating infrastructure runs strictly on free tiers and public endpoints ($0.00/month) with optional BYOK keys for power features.
6. **Continuous Downstream Data Portability:** All active roles, outreach cadences, contacts, and interview action items automatically mirror to a personal Google Sheet for offline ownership.

### 1.4 Non-Goals
*   No auto-apply to ATS web forms (burns recruiter goodwill; contradicts the direct referral thesis).
*   No automated email sending on the user's behalf (human review required).
*   No automated LinkedIn connection invites or InMails.
*   No public billing or team management in Release 1 UI (schema supports multi-tenancy; UI is single-user locked for release 1 validation).
*   No speculative probability scoring (quantifies factual suitability only).

---

## 2. Global System Boundaries & Cardinal Rules (R1 – R8)

Every module requirement and automated background job must strictly follow these 8 rules:

| ID | Rule | Description & Hard Enforcement |
| :--- | :--- | :--- |
| **R1** | **Human Sends.** | No module calls Gmail `send`, LinkedIn messaging, or an ATS apply endpoint. OAuth requests `gmail.compose` and `gmail.readonly`, never `gmail.send`. Grepping codebase for `send` returns 0 hits. |
| **R2** | **Free by Default.** | With no user keys added, all scheduled jobs run on public endpoints with \$0 monthly cost. |
| **R3** | **User Keys, User Cost.** | Paid APIs (Apify, RapidAPI, Crunchbase, Hunter, Apollo, AI models) run strictly on the user's BYOK keys stored encrypted at rest. Missing key skips source with log: `Skipped: no key`. |
| **R4** | **Every Fact Has a Source.** | Every stored claim carries source URL, confidence level (`verified`, `inferred`, `hypothesis`, `curated`), and fetched date. Unknowns render as "Unavailable", never guessing. |
| **R5** | **No Invented Numbers.** | AI models may rephrase or order text, but cannot alter or generate metrics. Proof-point numbers are copied byte-for-byte from M8. Automated regex diff rejects any unlisted numbers. |
| **R6** | **Polite Fetching.** | SSRF-safe client, named user agent, $\ge 500\text{ ms}$ spacing per host, and `robots.txt` respected. |
| **R7** | **Audit State Changes.** | State transitions write an append-only row to `decision_events`. Database revokes `UPDATE` and `DELETE`. |
| **R8** | **Fair Use Limits.** | Hard caps: 200 tracked companies, 40 drafts per rolling 24 hours, 80 link checks, and 15 public LinkedIn profile checks per run. |

---

## 3. End-to-End User Journeys

### Journey 1: Morning Discovery & Triage (Target: $\le 15$ mins)
1. **04:00 AM IST:** Automated cron runs Module 2 across 35 sources, normalizes, deduplicates, and evaluates all new jobs against Hardi's active tracks.
2. **08:00 AM IST:** Hardi opens Backdoor on desktop. The **Morning Radar** displays the top 20 new roles scored $\ge 70$.
3. **Keyboard Triage:** Hardi switches to the **Dense Command Table** (`j`/`k` navigation).
   * Reads match breakdown, tags, and Door chips.
   * Pressing `s` skips uninteresting roles.
   * Pressing `c` marks high-conviction roles as `CHOSEN`.
   * Pressing `Enter` opens the $640\text{px}$ slide-out dossier drawer.

### Journey 2: Dossier Review & Outreach Prep (Target: $\le 5$ mins per role)
1. **In-Drawer Inspection:** Hardi reviews the 3-Tier match breakdown, company brief, and 3 product opportunities from the teardown.
2. **Contact Selection:** Reviews Door 1 (Hiring Manager), Door 2 (Recruiter), and Door 3 (Peer).
3. **Start Outreach:** Hardi clicks **"Start Outreach"**:
   * Module 4 clones the master Google Doc template, injects tailored proof points, and exports a zero-cost PDF to Google Drive.
   * Module 7 computes the recipient's office timezone and generates a draft in Gmail under `Backdoor/Drafts` with a suggested send time (e.g., *"Tue 09:15 London (14:45 IST)"*).
   * Module 7 formats a customized $\le 300$-character LinkedIn connection note.

### Journey 3: Review, Send & Thread Cadence
1. **Review & Dispatch:** Hardi opens Gmail (web or mobile), opens the staged draft, reviews the text and attached PDF, and clicks **Send** manually.
2. **Sent Detection:** Background worker detects message with `SENT` label, records `sent_at`, and begins monitoring the thread.
3. **Cadence Progression:**
   * *If reply received:* Cadence immediately halts, stage advances to `IN_CONVERSATION`.
   * *If no reply after 3 business days:* Module 7 creates a Day 3 follow-up draft in the same thread.
   * *If no reply after Day 5:* Module 7 creates a final value-add draft attaching the Teardown 1-Pager Google Doc.

### Journey 4: Meeting Audio Capture & AI Action Items
1. Hardi joins a Google Meet interview.
2. The Chrome clipper extension captures the Meet tab audio (with participants informed).
3. Post-call, the audio is transcribed via Groq's free Whisper API and parsed into **My Actions**, **Their Actions**, and **Next Steps**.
4. Action items are saved to Supabase `meeting_notes` and mirrored to the candidate's Google Sheet. Module 7 stages a thank-you email draft within 2 hours.

---

## 4. In-Depth Functional Specifications by Module

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MODULE OWNERSHIP MAP                            │
├────────────────────────────────┬───────────────────────────────────────┤
│ Module                         │ Core Domain Responsibilities          │
├────────────────────────────────┼───────────────────────────────────────┤
│ M1: @core/db                   │ Auth, Sessions, RLS, Audit, DB Schema  │
│ M2: @ingest/scout              │ 35 Sources, Scrapers, Dedup, Webhooks  │
│ M3: @eval/brain                │ 3-Tier Fit Engine, Gap Analysis        │
│ M4: @workspace/google          │ Docs CV, Drive PDF, Meet Audio Whisper│
│ M5: @intel/teardown            │ Complaint Scraper, 3 Product Ideas    │
│ M6: @people/enrichment         │ Doors 1/2/3 Contacts, Activity Scores │
│ M7: @cadence/engine            │ Timezones, Gmail Drafts, Thread Watch │
│ M8: @dossier/identity          │ Tracks, Proof Points, Side Projects   │
│ M9: @ui/command-center         │ Bento/Table Views, Drawer, Navigation │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

### M1 core/db: Data Persistence, Authentication & Audit

#### 1. Scope & Ownership
*   **Authentication & Session Management:** Built natively on Supabase Auth.
*   **Primary System of Record:** PostgreSQL 16 schema.
*   **Audit Logging:** Append-only event store (`decision_events`).
*   **Portability:** Downstream Google Sheet sync worker.

#### 2. Detailed Functional Requirements
*   **M1-FR1 (P0) Authentication & Sessions:**
    *   *Implementation:* Supabase Auth with Google OAuth provider.
    *   *Session Persistence:* Secure, HTTP-only JWT cookies managed via `@supabase/ssr` with automatic token refresh.
    *   *Release 1 Scope:* Single user (Hardi). Public sign-up routes are locked; only Hardi's authorized email is granted access.
*   **M1-FR2 (P0) Multi-Tenant Row Level Security (RLS):**
    *   Every user-owned table (`profiles`, `tracks`, `proof_points`, `side_projects`, `evaluations`, `contacts`, `cadences`, `resume_bullets`, `cv_builds`, `meeting_notes`, `decision_events`) enforces `auth.uid() = user_id`.
    *   Global pool tables (`companies`, `jobs`, `job_sources`, `sources`) are globally readable by authenticated users and writeable by server cron workers.
*   **M1-FR3 (P0) Immutable Decision Audit Log:**
    *   `decision_events` captures every stage move, score calculation, draft generation, and source run.
    *   PostgreSQL security rule: `REVOKE UPDATE, DELETE ON public.decision_events FROM PUBLIC, authenticated, anon;`.
*   **M1-FR4 (P0) Source Provenance Tracking:**
    *   `job_sources` maintains a full historical audit trail for every URL where a job is listed, recording raw payloads, first seen, last seen, and confidence ratings.
*   **M1-FR5 (P0) Downstream Data Portability & Mirroring:**
    *   An asynchronous worker writes daily sync batches to a connected Google Sheet across four dedicated tabs: *Daily PM Roles*, *Outreach*, *Contacts*, and *Meetings*.
    *   One-way synchronization: writes originate exclusively from the app database to ensure zero cell collision or race conditions. The only inbound sheet reading is an isolated `Paste Links` inbox tab monitored by Module 2.
*   **M1-FR6 (P0) Clean Bootstrap & Seed Initialization:**
    *   Database initializes from ground zero via clean idempotent DDL scripts.
    *   System seeds essential operational rows out of the box: default system sources (M2 catalogue), baseline tracks (*AI-Native PM*, *Growth PM*, *UX PM*), and default user configuration. Zero external ETL or legacy migration scripts required.

#### 3. Edge Cases & Fallback Strategies
*   **Supabase Free-Tier Pausing (7 Days Idle):** The automated daily 04:00 AM GitHub Action cron pings the database via API, keeping the database permanently active.
*   **Database Connection Saturation:** Connection pooling enabled via Supabase Transaction Pooler (PgBouncer) on port 6543.
*   **Sheet API Quota Exhaustion (429 Rate Limit):** The mirror writer queues updates in BullMQ/Redis and uses exponential backoff with batch updates capped at 50 rows per batch.

---

### M2 ingest/scout: Job Sources & Intake (35 Sources)

#### 1. Scope & Ownership
*   Autonomous daily runner (04:00 AM IST) and Saturday snapshot runner (03:00 AM IST).
*   Ingestion across 35 distinct sources (8 ATS boards, company JSON-LD, 7 remote boards, community boards, webhooks, Chrome clipper, and BYOK actors).
*   Deduplication engine, pre-storage filters, and polite close-checking.

#### 2. Detailed Functional Requirements
*   **M2-FR1 (P0) Scheduled Execution:**
    *   Runs autonomously at 04:00 AM in the user's timezone (04:00 IST).
    *   Backup watchdog runner fires at 04:45 AM if the 04:00 AM run failed to complete.
    *   Saturday 03:00 AM snapshot run computes open role counts per company to feed Hiring Trends.
*   **M2-FR2 (P0) Ingestion Toggles & Health:**
    *   Every source has an on/off toggle and encrypted API key field in Settings.
    *   Tracks status (`HEALTHY`, `FAILED`, `SKIPPED: NO KEY`), run duration, and jobs found.
*   **M2-FR3 (P0) Pre-Storage Negative Filters:**
    *   Drops postings before saving if title matches exclusion regex (e.g., *Product Marketing Manager*, *Engineering Manager*).
    *   Drops postings if company or description matches excluded industries: **FinTech, Payments, Crypto, Neo-banking**.
*   **M2-FR4 (P0) Normalization:**
    *   Normalizes raw HTML/JSON into 13 canonical fields: title, normalized title, company, domain, locations array, region, workplace (`remote`, `hybrid`, `on-site`), posted date, salary raw, seniority, specializations, apply URL, and clean description text.
*   **M2-FR5 (P0) Deduplication Engine:**
    *   Match key = `normalized_company + normalized_title` (case-insensitive, punctuation stripped, "Sr." $\to$ "Senior", "Inc./Ltd" stripped).
    *   One role in multiple cities merges into 1 canonical job with all cities preserved. Board links merge under the company's direct careers page URL.
*   **M2-FR6 (P0) Polite Close-Checking:**
    *   When an ATS posting disappears from today's feed, it is NOT marked Closed immediately. The system makes a direct HTTP check to the apply link. Only a 404, redirect to jobs home, or explicit "This job is closed" phrase marks `CLOSED`.
*   **M2-FR8 (P0) Universal Ingest Modal:**
    *   Accepts any careers URL, LinkedIn job URL, raw Slack/WhatsApp text, or tweet URL.
    *   Parses schema.org `JobPosting` JSON-LD, OpenGraph, or uses regex/LLM parsing. Shows preview card before saving.
*   **M2-FR13 (P1) Inbound Webhooks (Naukri & Google Alerts):**
    *   User forwards job alerts to `jobs+<uid>@inbound.<domain>`.
    *   Cloudflare Email Routing + Worker extracts subject, body, unwraps Google redirect URLs, and posts to `/api/webhooks/inbound-mail`.

#### 3. Edge Cases & Fallback Strategies
*   **Target Company Changes ATS Board:** Old board returns 404 $\to$ flagged on Source Health dashboard. When Hardi pastes a new link from that company, the system auto-detects the new ATS platform and updates the company's crawler configuration.
*   **Missing Posted Date:** If a job post lacks a date, `posted_at` defaults to `first_seen_at` (current timestamp).
*   **Bot-Block on Careers Pages:** Scrapers never bypass bot-walls. If a site returns 403/Cloudflare challenge, the fetch aborts, logs `BLOCKED: BOTWALL`, and suggests using the Chrome extension clipper.

---

### M3 eval/brain: 3-Tier Fit Evaluation

#### 1. Scope & Ownership
*   Calculates candidate-role suitability across 3 progressive tiers.
*   Zero AI cost for Tiers 1 and 2; deterministic scoring ensures complete reproducibility.
*   Generates strategic positioning angles and Score Booster gap reports.

#### 2. Detailed Functional Requirements
*   **M3-FR1 (P0) Tier 1 Eligibility Gate (Zero AI, $< 100\text{ ms}$):**
    *   Hard SQL/Regex filter checking: Location overlap (`work_countries`), remote boundary ("US Only" fails for India-based search), excluded industries (FinTech/Payments), and visa sponsorship constraints.
    *   Fails set `tier1_result = false`, `fit_score = 0`, and log the reason (e.g., `Ineligible: Remote US Only`). Job is retained for historical tracking.
*   **M3-FR2 (P0) Tier 2 Mathematical Match Score (0–100, Zero AI):**
    *   *Skills Overlap (60 points):* Intersection of job description keywords against active track's weighted skill list.
    *   *Experience Gap (25 points):* Target role seniority/years asked vs. Hardi's verified years in product (scaled proportionally).
    *   *Title Alignment (15 points):* Exact keyword matching of title level (e.g., Senior PM, Staff PM, Lead PM).
*   **M3-FR3 (P0) Score Buckets & Triggers:**
    *   `Top Match (70–100)`: Highlights green, unlocks automated CV generation and Gmail draft creation.
    *   `Exploratory (40–69)`: Highlights sky blue, kept for manual review.
    *   `Stretch (<40)`: Highlights slate gray, hidden from default views.
*   **M3-FR4 (P0) Transparent Rationale:**
    *   Every score renders an explicit breakdown: *"Matched 8 of 12 skills; asks 5 years, you have 3"*.
*   **M3-FR5 (P1) Tier 3 Dossier Synthesis (AI BYOK):**
    *   Fires *only* for jobs scoring $\ge 70$ using Hardi's BYOK AI key.
    *   Generates 3 bullet points citing exact M8 proof point IDs and 1 strategic positioning angle (e.g., *"Framed as an AI-Native PM who optimizes LLM inference costs and latency"*).
*   **M3-FR6 (P1) Score Booster Gaps:**
    *   Calculates which missing portfolio artifact or skill would add $\ge 5$ formula points to Tier 2 score, giving actionable side project guidance.

#### 3. Edge Cases & Fallback Strategies
*   **Extremely Short Job Description ($< 300$ chars):** Tier 2 calculates score from title and meta tags only; marks `score_confidence = LOW`.
*   **No AI Key Added:** System runs Tiers 1 and 2 flawlessly. Tier 3 is skipped with note: *"Dossier synthesis requires AI key in Settings"*.
*   **Rule R8 (Suitability, Never Prediction):** Generated text is forbidden from using speculative hiring probabilities (e.g., "90% chance of getting hired"). Only fit and qualification overlap are expressed.

---

### M4 workspace/google: Document Automation & Audio Intelligence

#### 1. Scope & Ownership
*   Sole module holding Google OAuth tokens.
*   Resume bank management, deterministic Google Docs CV builder, and zero-cost PDF Drive export.
*   Google Calendar sync, Meet tab audio capture via Chrome extension, and Groq Whisper transcription.

#### 2. Detailed Functional Requirements
*   **M4-FR1 (P0) Scoped Google Authentication:**
    *   Scopes requested: `documents`, `drive.file`, `spreadsheets`, `calendar.events`, `gmail.compose`, and `gmail.readonly`.
    *   **Strict Security:** Never requests `gmail.send`. Tokens are encrypted at rest with AES-GCM.
*   **M4-FR2 (P0) Resume Bullets Bank:**
    *   Central repository of verified resume bullets tagged by skill, track, and metrics.
*   **M4-FR3 (P0) Deterministic Tailored CV Builder:**
    *   Selects bullets from the bank overlapping the job's skills.
    *   Clones master Google Doc template, replaces placeholders (`{{TARGET_ROLE}}`, `{{SUMMARY}}`, `{{EXPERIENCE}}`, `{{PROJECTS}}`, `{{SKILLS}}`), and trims optional bullets until the document strictly fits 2 pages.
*   **M4-FR4 (P1) AI Polish & Byte-for-Byte Metric Check:**
    *   Optional AI summary rewrite on user key.
    *   **Enforcement of Rule R5:** Automated regex diff ensures every number in the generated summary matches the resume bank byte-for-byte. Any hallucinated metric immediately rejects the AI version and reverts to the deterministic draft.
*   **M4-FR6 (P0) Zero-Cost Drive PDF Conversion:**
    *   Calls native Drive API: `GET https://www.googleapis.com/drive/v3/files/{docId}/export?mimeType=application/pdf`.
    *   Streams binary to Google Drive folder at \$0.00 infrastructure cost (no headless browser instances).
*   **M4-FR9 (P1) Google Meet Tab Audio Capture & Groq Whisper:**
    *   Chrome extension captures tab audio in 10-minute WAV chunks (participants notified prior).
    *   Sends chunks to Groq's free Whisper API (`whisper-large-v3-turbo`).
    *   Parses transcript into **My Actions**, **Their Actions**, and **Next Steps**, storing them in `meeting_notes` and appending to the Google Sheet.

#### 3. Edge Cases & Fallback Strategies
*   **Google OAuth Token Revocation:** If token refresh fails, M9 displays an amber warning banner: *"Google disconnected — Re-authenticate in Settings"*. All background jobs continue without crashing.
*   **Google Drive Storage Full:** If export returns 507/storage error, system aborts export, alerts user, and provides the direct editable Google Doc link.
*   **Groq Whisper Rate Limit (7,200 audio-sec/hr):** If an interview exceeds 60 minutes, remaining chunks are marked `QUEUED` and processed at the start of the next hour. Audio files are deleted immediately after successful transcription.

---

### M5 intel/teardown: Company Intelligence & Review Auditor

#### 1. Scope & Ownership
*   Generates 30-day company briefs and strategic product teardowns.
*   Scrapes public complaint feeds (Reddit JSON, Apple App Store RSS) and tags user friction.
*   Synthesizes 3 high-impact product improvement opportunities into a 1-page Google Doc.

#### 2. Detailed Functional Requirements
*   **M5-FR1 (P0) Company Brief:**
    *   Auto-researched for chosen companies: what they sell (1 sentence), funding stage/amount, 2 news items with URLs, founders, and fit rationale.
*   **M5-FR2 (P0) Sunday Auto-Pick:**
    *   Every Sunday, the 5 top-scoring companies not yet applied to are queued for research.
*   **M5-FR3 (P1) Public Complaint Mining:**
    *   Gathers up to 100 complaint items from Reddit search JSON (`reddit.com/search.json?q={product}`) and Apple App Store customer review RSS feeds.
    *   Supports user-pasted review excerpts from G2, Trustpilot, or Glassdoor.
*   **M5-FR4 (P1) Friction Tagging:**
    *   Tags complaints into: *Onboarding Drop*, *Billing/Payment Failure*, *Speed/Bugs*, *Missing Feature*, and *Support Issue*.
*   **M5-FR5 (P1) Three Product Opportunities:**
    1. *Quick Win:* Immediate friction fix ($\le 2$ weeks build).
    2. *Growth Loop:* Product-led acquisition or retention flywheel.
    3. *Monetization Feature:* High-margin expansion feature.
    *   Exported as a 1-page Google Doc linkable in Day 5 follow-up drafts.
*   **M5-FR7 (P0) Budget & Privacy Guards:**
    *   Max 6 searches and 5 page fetches per company. Reviews are scrubbed of personal names, emails, and phone numbers.

#### 3. Edge Cases & Fallback Strategies
*   **B2B Enterprise Company with No Public Mobile App or Reddit Posts:** System records *"Too little public feedback available"* rather than fabricating complaints.
*   **Disputed / Ambiguous Company News:** Entity disambiguation checks domain name against news article URL. If domain does not match, news item is discarded.

---

### M6 people/enrichment: Contact Discovery (The Three Entry Doors)

#### 1. Scope & Ownership
*   Identifies Door 1 (Hiring Manager), Door 2 (Recruiter), and Door 3 (Peer/Ex-Employee).
*   Enforces zero logged-in scraping; calculates public activity scores ($0 - 100$).
*   Finds verified work emails via public pages, MX patterns, and optional user keys.

#### 2. Detailed Functional Requirements
*   **M6-FR1 (P0) Door Allocation:**
    *   Each role maintains 1 primary and up to 2 backup contacts per door.
*   **M6-FR2 (P0) Founder Lookup:**
    *   For startups $\le 100$ roles, automatically identifies founders from YC directory, Wikidata, and team pages.
*   **M6-FR3 (P0) LinkedIn Policy (Strict Compliance):**
    *   Zero logged-in scraping. Profile links are stored only when discovered on public web pages; otherwise, generates a direct search link (`linkedin.com/search/results/people/?keywords={name}+{company}`).
*   **M6-FR5 (P1) Email Discovery Pipeline:**
    *   Order of resolution: (1) Address published on public company page; (2) Apollo/Hunter on user BYOK key; (3) Pattern generation (`first.last`, `first`, `flast`) verified against MX DNS records.
    *   Pattern guesses are explicitly labeled `UNVERIFIED, GUESSED` with a warning in M7 drafts.
*   **M6-FR6 (P1) Public Activity Score (0–100):**
    *   Measures recency of public blog posts, conference talks, podcasts, and GitHub activity. Scores $\ge 70$ flag the contact as *"Active Lately"*.
*   **M6-FR8 (P0) Data Minimization:**
    *   Stores name, title, company, public URLs, and work email only. **Strictly no phone numbers, home cities, personal social media accounts, or personal photos.**

#### 3. Edge Cases & Fallback Strategies
*   **Contact Has Left the Company:** If public source indicates former employment, contact is flagged as `FORMER` and moved to Door 3 (Ex-Employee referral pathway).
*   **Do-Not-Contact Requests:** If a contact requests not to be contacted, Hardi toggles `do_not_contact = true`, which permanently blocks M7 from generating drafts for that individual.

---

### M7 cadence/engine: Drafts, Timing & Follow-Ups

#### 1. Scope & Ownership
*   Calculates suggested send times based on recipient timezone.
*   Creates drafts under `Backdoor/Drafts` via Gmail API (`gmail.compose`).
*   Watches email threads and automatically halts follow-ups upon incoming reply.

#### 2. Detailed Functional Requirements
*   **M7-FR1 (P0) Explicit Start Outreach:**
    *   Outreach is never started automatically. Hardi must click **"Start Outreach"** in the UI.
*   **M7-FR2 (P0) Day 0 Draft Generation:**
    *   Creates 1 Gmail draft per door with known email address.
    *   Creates 1 tailored LinkedIn connection note ($\le 300$ chars) per door.
    *   *Door 1 Draft:* Problem-first pitch citing 1 proof point, teardown link, and 15-min chat ask.
    *   *Door 2 Draft:* Headcount/role fit summary with attached tailored PDF resume.
    *   *Door 3 Draft:* Peer-to-peer technical question and referral request.
    *   **No automated signature:** System leaves bottom clear; user's default Gmail signature applies.
*   **M7-FR3 (P0) Recipient Timezone Scheduling:**
    *   Resolves contact's office timezone from city, job location, or company HQ.
    *   Recommends sending Tuesday through Thursday at **09:15 AM recipient local time**, displaying Hardi's equivalent time (e.g., *"Tue 09:15 London (14:45 IST)"*).
*   **M7-FR4 (P0) Sent Detection:**
    *   Thread watcher checks Gmail thread; when a message carries `SENT` label, step status advances to `SENT` with timestamp recorded.
*   **M7-FR5 (P0) Automated Follow-Up Drafts:**
    *   *Day 3 Follow-Up:* Created 3 business days post-send if no reply detected, referencing the original thread.
    *   *Day 5 Final Follow-Up:* Created 2 business days later attaching the Teardown Google Doc.
*   **M7-FR6 (P0) Auto-Stop on Reply:**
    *   Any incoming reply in the thread, or Hardi marking *"Replied on LinkedIn"*, immediately halts all pending follow-ups for that contact and moves the role to `IN_CONVERSATION`.
*   **M7-FR9 (P0) Rate Limiting & Safety Caps:**
    *   Capped at 40 draft creations per rolling 24 hours. Max 3 cadence steps per contact.
*   **M7-FR10 (P0) Strict Writing Lint:**
    *   Every draft is scanned before saving: no flattery, no banned cliches (*"I hope this finds you well"*, *"leverage"*, *"synergy"*), and exact numbers matching M8.

#### 3. Edge Cases & Fallback Strategies
*   **No Email Found for Contact:** M7 creates the copyable LinkedIn connection note only; email draft step is skipped.
*   **Email Bounces:** When a Mail Delivery Subsystem bounce email is detected in the thread, status marks `BOUNCED`, and the email is flagged as bad in M6.
*   **Public Holidays:** Suggested send times skip known national holidays in the recipient's country when holiday calendar data is available.

---

### M8 dossier/identity: Profile, Tracks & Proof Points

#### 1. Scope & Ownership
*   Authoritative source of candidate truth and verified proof points.
*   Dynamic persona track configuration (*AI-Native PM*, *Growth PM*, *UX PM*).
*   Career pivot competency translation (e.g., Chartered Accountant $\to$ Product Manager).

#### 2. Detailed Functional Requirements
*   **M8-FR1 (P0) Profile Setup:**
    *   Parsed from CV upload (PDF/DOCX) with manual confirmation for all extracted fields.
*   **M8-FR2 (P0) Structured Proof Points:**
    *   Stores statements, exact numbers, units, directions (`UP`/`DOWN`), employers, and evidence URLs.
*   **M8-FR3 (P0) Dynamic Persona Tracks:**
    *   Stored as user database rows (not enums).
    *   Hardi's initial tracks:
        1. *AI-Native PM:* Highlights prompt evals, RAG pipelines, token economics, latency, and AI side projects.
        2. *Growth PM:* Highlights funnel conversion, viral loops, CAC/LTV payback, and activation experiments.
        3. *UX PM:* Highlights usability heuristics, journey mapping, and time-to-value compression.
*   **M8-FR5 (P1) Universal Competency Map (Case Study: CA to PM):**
    *   Translates foundational domain rigor into product leadership:
        *   *Statutory Audit & Internal Controls* $\to$ Risk Mitigation, Fraud Systems, Compliance PM.
        *   *Financial Modeling & DCF* $\to$ Product Unit Economics, Monetization, Gross Margin Optimization.
        *   *Ledger Reconciliation* $\to$ Core Ledger Architecture, Multi-Currency Settlement Rails.
        *   *ERP Systems Audit* $\to$ B2B SaaS Enterprise Workflows.
*   **M8-FR6 (P1) AI-Native Side Projects:**
    *   Dedicated records for Pantry Vault AI, Med-Voice, and upcoming repos, featured prominently in the top third of AI-Native CVs.

#### 3. Edge Cases & Fallback Strategies
*   **Proof Point Edited After Outreach Draft Created:** Existing drafts in Gmail remain untouched; new drafts use the updated proof point version.
*   **Two Tracks Claiming Same Role:** If a role matches both AI-Native and Growth tracks, M3 scores against both and binds to the track yielding the higher score (user can override in drawer).

---

### M9 ui/command-center: Bento Command Workspace

#### 1. Scope & Ownership
*   Desktop command center with 4 workspace views: Discover, Dossiers, Outreach, Interviews.
*   Dual-view switcher (1:1 Bento Cards vs. Dense Command Table with `j`/`k` keyboard shortcuts).
*   Zero-reload $640\text{px}$ slide-out dossier drawer.
*   Strict adherence to the **Precision Cobalt & Steel** design system (zero indigo/orange).

#### 2. Detailed Functional Requirements
*   **M9-FR1 (P0) Morning Radar:**
    *   Prioritized feed of new roles ($\ge 70$ fit score) discovered in the morning run. Capped at 20 roles by default.
*   **M9-FR2 (P0) Dual-View Switcher:**
    *   Seamless toggle between 1:1 Bento Cards and Dense Command Table without state loss.
*   **M9-FR3 (P0) Mouse-Free Keyboard Navigation:**
    *   `j`/`k`: Navigate rows.
    *   `Enter`: Open drawer.
    *   `s`: Skip role (mark `SKIPPED`).
    *   `c`: Choose role (mark `CHOSEN`).
    *   `/`: Focus search filter.
    *   `Esc`: Close drawer / clear search.
*   **M9-FR5 (P0) Zero-Reload Dossier Drawer:**
    *   $640\text{px}$ slide-out drawer rendering job spec, 3-tier match breakdown, company teardown, Door contacts, and draft preview with in-drawer `↑`/`↓` cycling.
*   **M9-FR7 (P0) Outreach Board:**
    *   Kanban/List view tracking cadence steps: *Draft Ready*, *Sent*, *Follow-Up Due*, *In Conversation*.
*   **M9-FR9 (P0) Source Health Dashboard:**
    *   Live status, latency, error strings, and 7-day volume graphs for all 35 sources.
*   **M9-FR12 (P1) Pacing & Well-Being Aids:**
    *   Dismissible break reminder after 45 minutes of continuous use; soft warning when starting more than 5 out多年reach cadences in a single day.

#### 3. Edge Cases & Fallback Strategies
*   **Slow Network / API Latency:** Drawer renders instant optimistic skeletons while fetching deep company teardown data asynchronously.
*   **Mobile Screen (<640px):** Drawer transitions to a full-screen mobile view with a persistent top navigation bar.

---

## 5. System Observability, Health & Telemetry

### 5.1 Source Health Matrix
Monitored via `sources` and `source_runs` tables in Supabase:
*   *Healthy:* Completed with $> 0$ jobs found and 0 fatal exceptions.
*   *Failed:* HTTP 5xx, network timeout, or parser schema mismatch. Displays raw error message on the health dashboard.
*   *Skipped (No Key):* User key missing for sources 32–35.

### 5.2 Application Telemetry & Metrics Tracking
*   Every state mutation logs to `decision_events`:
    *   `aggregate_type`: `JOB`, `EVALUATION`, `CADENCE`, `MEETING`.
    *   `actor`: `hardi`, `cron_0400_runner`, `m7_draft_builder`.
    *   `payload`: JSON snapshot of changed attributes.

---

## 6. Phasing, Validation Gates & Release Criteria

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Phase 0:   │     │  Phase 1:   │     │  Phase 2:   │     │  Phase 3:   │     │  Phase 4:   │
│   Decide    │ ──> │    Pool     │ ──> │   Triage    │ ──> │  Reach Out  │ ──> │    Depth    │
│  (Week 1)   │     │ (2-4 Weeks) │     │ (4-6 Weeks) │     │ (6-9 Weeks) │     │(9-12 Weeks) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

| Phase | Scope | Hard Gate to Advance |
| :--- | :--- | :--- |
| **Phase 0: Setup** | Repo initialization, Supabase DB, Next.js 15 scaffolding. | The DDL applies cleanly to Supabase; empty app deploys. |
| **Phase 1: Ingest & Pool** | 35-Source Ingestion engine, deduplication, Sheet mirror worker. | **14 consecutive days of scheduled 04:00 AM runs:** Zero fatal ingest errors across enabled sources; deduplication precision $\ge 98\%$; 0 false closures in a 20-role spot check. |
| **Phase 2: Triage** | M8 tracks/proof points, M3 Tiers 1 & 2 scoring, M9 Morning Radar and Dense Table (`j`/`k`). | Hardi completes a full morning triage in the new web UI without touching Google Sheets. |
| **Phase 3: Reach Out** | M4 CV builder and PDF export, M6 Doors 1/2/3 contacts, M7 Gmail drafts. | **5 real outreach cadences completed end-to-end** with 0 automated sends and 100% human-verified dispatches. |
| **Phase 4: Depth** | M3 Tier 3 Dossier, M5 Teardown Docs, M4 Groq Whisper Meet notes, M9 Copilot panel. | 5 product teardowns rated useful; Groq Whisper Meet notes operational; Week-8 reply metrics read. |

---

## 7. Non-Technical PM GitHub Governance & Sprint Protocol

To ensure seamless, error-free execution for a Product Manager without a technical engineering background, all code contributions, git operations, and releases must strictly adhere to this four-step release cycle:

### 7.1 Safe GitHub & Branching Protocol (PR-First)
*   **Zero Direct Commits to `main`:** The `main` production branch is strictly protected. No agent or human may push directly to `main`.
*   **Isolated Feature Branches:** Every task begins in a dedicated, isolated branch named according to the sprint and feature (e.g., `feat/sprint-1-supabase-schema`, `feat/sprint-2-morning-radar`).
*   **Pre-Commit Quality Gate:** A branch can only be committed locally after unit tests, integration tests, and end-to-end tests pass cleanly.
*   **Staging & Pull Request (PR) Notification:**
    *   Once code is staged and automated CI checks pass, a Pull Request is opened against `main`.
    *   The agent/system explicitly notifies Hardi with a plain-English message:
        > *"Quality checks, unit tests, integration tests, and E2E tests have all passed on staging. Pull Request #X is ready for your product review and approval."*
*   **Human Approval Requirement:** Merging into `main` requires Hardi's explicit review and approval.

### 7.2 Post-Approval Production Testing & Bug Resolution
*   **Live Production Verification:** Immediately following PR merge and deployment, automated and manual smoke tests verify live functionality against acceptance criteria.
*   **Zero-Defect Production Gate:** If any production bugs emerge, feature work stops immediately. Bugs are resolved, re-tested on staging, and pushed through the same PR cycle before any new feature work begins.
*   **Bug Resolution Logging:** Every bug encountered in production is recorded with its symptoms, root cause, and verified fix.

### 7.3 Product Manager Perspective Documentation Updates
*   Following successful production testing, all technical and user-facing documentation must be updated from a **Product Manager's perspective**:
    *   What user capability was delivered.
    *   How the feature functions in the UI.
    *   Operational constraints, safeguards, and telemetry indicators.

### 7.4 Sprint Planning & Dedicated Sprint Documents
*   **Pre-Execution Sprint Planning:** Before starting any phase, the system or agent must outline exactly which tasks will be picked up and completed for that specific sprint.
*   **Dedicated Sprint Artifacts:** Each sprint maintains a new, dedicated markdown document (e.g., `docs/sprints/sprint_1_database_and_ingest.md`, `docs/sprints/sprint_2_triage_and_scoring.md`):
    *   *Sprint Objective:* High-level user goal.
    *   *Task Breakdown & Live Status:* Checklists updated in real time (`NOT STARTED`, `IN PROGRESS`, `STAGED`, `PASSED QA`, `MERGED`).
    *   *Production Bug Log:* Dedicated section recording all production defects, fixes applied, and verification timestamps.

---

*End of Deep Functional PRD (backdoorv.1).*
