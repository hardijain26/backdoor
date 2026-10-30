# Backdoor v1.0: Database Architecture & Customer Data Value Report

**Document Version:** v1.0 Production Schema Asset Guide  
**Database Target:** PostgreSQL 16 (Supabase)  
**Schema Sources:** `database/schema.sql`, `supabase/migrations/00000000000000_init_schema.sql`  
**Target Audience:** Leadership, Investors, Compliance Officers, Product Strategists  

---

## 1. 🏛️ High-Level System Mental Model

The Backdoor database acts as an **intelligent, two-sided career command center**. It bridges a candidate’s private career history and credentials with a live, global intelligence graph of job opportunities, corporate friction points, and decision-maker networks.

The system is strictly partitioned into two data ownership tiers:
1. **The Private Candidate Vault (11 User-Owned Tables):** Cryptographically isolated per user via PostgreSQL Row Level Security (`auth.uid() = user_id`). Contains private contact details, quantified achievement metrics, personalized AI fit evaluations, tailored CV builds, Gmail draft records, and raw interview transcripts.
2. **The Global Market Radar (7 Shared Intelligence Tables):** Read-only canonical knowledge shared across the platform. Contains aggregated corporate profiles, deduplicated job postings, public employer complaints (Glassdoor/Reddit/App Store), and crawler ingestion telemetry.

---

## 2. 📊 Table-by-Table & Column Breakdown (Plain English)

### Section 1: Candidate Identity & Dynamic Tracks

#### `public.profiles` — Candidate Master Profile
- **What it represents:** The root record of the human using Backdoor.
- **Key Columns & What They Store:**
  - `user_id`: Unique identifier linking the profile directly to Supabase authentication.
  - `full_name`, `email`, `phone_number`: Primary contact coordinates used to generate outreach signatures and CV headers.
  - `timezone`: Local time zone (defaults to `'Asia/Kolkata'`), used to calculate optimal outreach sending windows.
  - `work_countries`: Array of geographies the candidate is legally eligible or willing to work in (`['India', 'US', 'UK', 'EU']`).
  - `baseline_profession`: Primary professional domain (e.g., `'Chartered Accountant'`, `'Product Manager'`).
  - `google_tokens`: Secure OAuth access/refresh tokens allowing the app to create Google Docs and stage Gmail drafts on the user's behalf.
- **Data Origin:** Entered directly by the customer during onboarding; enriched via Google OAuth.

#### `public.tracks` — Dynamic Career Personas
- **What it represents:** The different "hats" or role archetypes a candidate targets (e.g., *AI-Native PM*, *Growth PM*, *Operations Lead*).
- **Key Columns & What They Store:**
  - `target_titles`: Exact job titles the candidate is hunting for.
  - `skill_weights`: Custom priority scores assigned to specific competencies (e.g., SQL = 90%, Product Strategy = 100%).
  - `seniority_levels`: Acceptable career tiers (e.g., `['Lead', 'Principal', 'Director']`).
  - `excluded_industries`: Sectors the candidate refuses to work in (defaults to blocking `['FinTech', 'Payments']`).
  - `featured_proof_point_ids`: Specific career achievements pinned to this persona.
- **Data Origin:** Configured by the customer to guide the matching engine.

---

### Section 2: Quantified Career Credentials

#### `public.proof_points` — The Metric-Backed Achievement Ledger
- **What it represents:** Verifiable accomplishments with real numbers. This is the foundation that prevents generative AI from hallucinating on resumes.
- **Key Columns & What They Store:**
  - `statement`: The narrative description of what was accomplished (e.g., *"Scaled enterprise ARR"*).
  - `metric_number`, `metric_unit`, `metric_direction`: The quantitative proof (`4.2`, `Million USD`, `Increased`).
  - `time_frame`: Duration taken to achieve the result (e.g., *"within 9 months"*).
  - `employer`: Company where the metric was achieved.
  - `evidence_url`: Link to public proof, dashboards, PR releases, or verification docs.
- **Data Origin:** Entered by the customer, versioned over time.

#### `public.side_projects` — Portfolio & Proof of Work
- **What it represents:** Independent apps, open-source repositories, or business experiments built by the candidate.
- **Key Columns & What They Store:**
  - `name`, `description`: Product summary and market problem solved.
  - `live_url`, `repo_url`: Direct links for hiring managers to test the working code or demo.
  - `tech_stack`: Array of technologies used (`['Next.js', 'PostgreSQL', 'Tailwind']`).
- **Data Origin:** Customer-provided portfolio data.

---

### Section 3: Global Companies & Market Intelligence

#### `public.companies` — Canonical Global Company Directory
- **What it represents:** Standardized profiles of hiring organizations, deduplicated by web domain.
- **Key Columns & What They Store:**
  - `domain`: Company website (e.g., `stripe.com`), serving as the global unique key.
  - `funding_stage`, `total_funding_usd`: Financial health and capitalization tier (Seed, Series B, Public).
  - `headcount_estimate`: Company scale and organizational maturity.
- **Data Origin:** Enriched automatically via market crawlers, Wikidata, and corporate registries.

#### `public.company_briefs` — Executive Intelligence Teardowns
- **What it represents:** Concise, strategic dossiers summarizing an employer's current business landscape.
- **Key Columns & What They Store:**
  - `one_sentence_summary`: Elevator pitch of what the business actually sells.
  - `recent_news`, `founders`: Key strategic developments and leadership backgrounds.
  - `why_you_fit`: Contextual rationale connecting the candidate's track to the company's trajectory.
  - `unconfirmed_points`: Uncertain claims flagged for verification during interviews.
- **Data Origin:** System-generated via AI synthesis and public news ingestion.

#### `public.complaints` — Friction Points & Organizational Pain Points
- **What it represents:** Unfiltered feedback aggregated from Reddit, Glassdoor, and App Store reviews.
- **Key Columns & What They Store:**
  - `source`: Platform where the feedback originated (e.g., `'Reddit'`, `'App Store'`).
  - `excerpt`: The exact quote highlighting a customer or employee frustration.
  - `friction_tag`: High-level category (e.g., `'Buggy Checkout'`, `'Slow Onboarding'`, `'Leadership Churn'`).
- **Data Origin:** Harvested via public scrapers to give the candidate conversational ammo during executive pitches.

---

### Section 4: Canonical Jobs Pool & Ingestion Telemetry

#### `public.jobs` — Master Deduplicated Opportunities Pool
- **What it represents:** Active employment openings aggregated across 35 distinct hiring sources.
- **Key Columns & What They Store:**
  - `normalized_title`: Standardized job title used to match across varying company naming styles.
  - `dedup_match_key`: Unique string combining company and normalized title (e.g., `google:senior_product_manager`), ensuring multi-city or reposted listings collapse into a single clean record.
  - `locations`: Array of all cities/regions hiring for this role.
  - `apply_url`: Direct destination link to apply.
  - `posting_status`: Enum state (`OPEN`, `STALE`, `CLOSED`).
- **Data Origin:** Autonomous background scrapers and ATS ingestion pipelines.

#### `public.sources` & `public.source_runs` — Crawler Fleet Observability
- **What it represents:** Operational monitoring for the 35 ingestion channels.
- **Key Columns & What They Store:**
  - `group_type`: Category of source (ATS direct, community board, aggregator).
  - `jobs_found`, `jobs_stored`: Ingestion yield per scraping cycle.
  - `last_error`, `error_message`: System health telemetry to alert on broken scrapers.
- **Data Origin:** Automated crawler system telemetry.

#### `public.job_sources` — Multi-Channel Provenance
- **What it represents:** Audit mapping showing every place a specific job was discovered.
- **Key Columns & What They Store:**
  - `raw_payload`: Unmodified JSON payload from the scraping source, preserved for debugging and parsing verification.
- **Data Origin:** Scraper ingestion engine.

---

### Section 5: Evaluations, Contacts & The Three Doors

#### `public.evaluations` — 3-Tier Match Scoring Engine
- **What it represents:** A mathematical and AI assessment of how closely a candidate matches a specific job.
- **Key Columns & What They Store:**
  - `tier1_result`, `tier1_reason`: Pass/Fail boolean checking hard requirements (visa, location, non-negotiable industries).
  - `fit_score`: Deterministic 0–100 compatibility score.
  - `tier2_breakdown`: JSON breakdown of points awarded across skills, titles, and domain experience.
  - `strategic_positioning_angle`: Tailored messaging thesis advising the candidate how to pitch themselves.
  - `score_booster_gaps`: Missing qualifications the candidate must address in their cover pitch.
  - `stage`: Current pipeline stage (`DISCOVERED`, `CHOSEN`, `OUTREACH_STARTED`, `OFFER_RECEIVED`, etc.).
- **Data Origin:** Calculated deterministically by the evaluation algorithm, with LLM synthesis for roles scoring $\ge 70\%$.

#### `public.contacts` — "Three Doors" Decision-Maker Graph
- **What it represents:** Identified key personnel at the hiring company, categorized by outreach angle.
- **Key Columns & What They Store:**
  - `full_name`, `title`: Identity of the decision-maker.
  - `door`: Classification into Door 1 (Hiring Manager), Door 2 (Peer PM), or Door 3 (Recruiter).
  - `email`, `email_status`: Direct business email address and its delivery confidence (`VERIFIED`, `UNVERIFIED`).
  - `activity_score`: 0–100 score indicating recent public engagement or posting frequency on LinkedIn.
  - `do_not_contact`: Safety toggle preventing accidental outreach to sensitive contacts.
- **Data Origin:** Enriched via Apollo/Hunter API pipelines or added manually by the user.

---

### Section 6: Cadences, Resumes & Meeting Notes

#### `public.cadences` — Gmail Staging & Outreach Pipeline
- **What it represents:** Individual outreach messages prepared for delivery.
- **Key Columns & What They Store:**
  - `door`: Which organizational door this message targets.
  - `suggested_send_at`: Mathematically scheduled send time (Tue–Thu 09:15 in recipient's time zone).
  - `gmail_draft_id`: Identifier of the draft created in `ThreeDoors/Drafts`. **Never sent automatically** (Rule R1 safety guarantee).
  - `subject`, `body_text`: The tailored email copy.
  - `resume_pdf_url`: Direct link to the tailored PDF attached to the pitch.
- **Data Origin:** Generated by the AI cadence engine; staged via Google Workspace API.

#### `public.resume_bullets` & `public.cv_builds` — Tailored CV Factory
- **What it represents:** Dynamic resume generation matching specific job requirements.
- **Key Columns & What They Store:**
  - `bullet_text`: Curated accomplishment statements tagged by skill.
  - `google_doc_id`, `google_drive_pdf_url`: Live links to the generated Google Doc and finalized PDF stored in the user's Google Drive.
- **Data Origin:** Synthesized from the user's `proof_points` and exported via Google Docs API.

#### `public.meeting_notes` — Interview Intelligence & Action Items
- **What it represents:** Post-interview processing of Google Meet discussions.
- **Key Columns & What They Store:**
  - `transcript_raw`: Complete text transcription produced by Groq Whisper from browser-recorded audio.
  - `my_action_items`, `their_action_items`: AI-extracted commitments and deliverables agreed upon during the call.
  - `next_steps`: Strategic guidance for subsequent follow-up messages.
- **Data Origin:** Recorded via browser extension; transcribed via Groq API.

---

### Section 7: Audit Integrity & Security

#### `public.decision_events` — Immutable Behavioral Audit Ledger
- **What it represents:** A write-only ledger recording every significant interaction that occurs within the system.
- **Key Columns & What They Store:**
  - `actor`: Identity of who performed the action (`USER`, `CRON_RUNNER`, `SYSTEM_AI`).
  - `event_name`: Standardized event tag (`JOB_SAVED`, `OUTREACH_STAGED`, `FIT_EVALUATED`, `DRAFT_SENT`).
  - `payload`: Detailed JSON context capturing the exact state at the moment the event occurred.
- **Data Origin:** Automatically emitted on every state transition.
- **Security Rule:** Explicitly protected by `REVOKE UPDATE, DELETE`, creating a tamper-proof audit trail.

---

## 3. 👤 Customer Data Classification & Privacy Profile

| Data Class | Stored Attributes | Sensitivity Level | Privacy & Compliance Controls |
| :--- | :--- | :---: | :--- |
| **Personally Identifiable Information (PII)** | Candidate Name, Email, Phone Number, LinkedIn URL, Google OAuth tokens | **CRITICAL** | Encrypted in transit & at rest; isolated via Row Level Security (RLS); wiped via cascade delete on account closure. |
| **Career Credentials & Evidence** | Metric achievements, employer history, evidence URLs, personal portfolio code repos | **HIGH** | User-owned; invisible to external crawlers or other candidates. |
| **Behavioral & Career Intent** | Target job titles, salary expectations, skipped roles, preferred regions, industry blocklists | **HIGH** | Restricted to user session; informs personalization algorithms without public exposure. |
| **Outreach & Communication History** | Decision-maker emails, staged Gmail pitch drafts, response statuses, outreach timestamps | **VERY HIGH** | Subject to Google API Limited Use disclosure; drafts created strictly with explicit user review (Rule R1). |
| **Audio Transcripts & Meeting Intelligence** | Raw interview transcripts, extracted hiring manager questions, agreed next steps | **CRITICAL** | Audio recorded locally via browser tab; transcribed via ephemeral API processing; stored strictly under candidate RLS. |
| **Public Corporate Intelligence** | Company headcounts, funding totals, domain names, public Reddit/Glassdoor reviews | **PUBLIC** | Shared read-only intelligence; non-sensitive public web data. |

---

## 4. 💎 Strategic Business Value to the Company (The Data Moat)

### 1. The Zero-Hallucination Resume Moat
Standard AI resume builders use generic chatbots that invent fake metrics (e.g., *"improved revenue by 30%"*). Backdoor’s schema treats achievements as **discrete mathematical tuples** (`metric_number: 4.2`, `metric_unit: Million USD`, `employer: Stripe`). This gives the company an IP advantage: we can guarantee byte-for-byte fidelity against hallucination, making our resume builder enterprise-grade.

### 2. High-Intent Behavioral Flywheel
Through `public.decision_events`, the platform tracks what high-tier candidates actually choose vs. skip. Over time, this dataset reveals:
- Which compensation ranges attract principal talent.
- What corporate friction points (complaints) cause candidates to reject opportunities.
- Which email subject lines and pitch angles achieve the highest interview conversion rates across Door 1 vs. Door 2.

### 3. The "Three Doors" Decision-Maker Graph
Corporate ATS portals reject 98% of applicants automatically. By indexing companies, verified hiring manager emails, and their organizational doors, Backdoor creates a **proprietary B2B routing graph**. Knowing *who* hires for *what* role and *when* they are active is high-value intelligence that can power future enterprise executive search or recruiting products.

### 4. Zero Data Lock-In as a Sales Driver
The schema is engineered so that every user action can mirror asynchronously to a downstream Google Sheet. Counterintuitively, offering zero lock-in builds customer trust: professionals are willing to entrust their sensitive career history to Backdoor because they know they can export everything to their personal Google Workspace at any moment.

---

## 5. 🛡️ Privacy, Security & Compliance Risk Assessment

### Sensitive Data Hotspots & Protections
1. **Google OAuth Tokens (`public.profiles.google_tokens`):**
   - *Risk:* Unauthorized access would allow unauthorized Gmail or Drive operations.
   - *Mitigation:* Stored in Supabase behind strict RLS; used only by authenticated server actions; scopes limited strictly to `gmail.compose` (cannot read user's inbox) and `drive.file` (can only access files created by Backdoor).
2. **Interview Audio Transcripts (`public.meeting_notes.transcript_raw`):**
   - *Risk:* Accidental recording of confidential corporate IP during technical interviews.
   - *Mitigation:* Recorded strictly inside the candidate's browser extension with a visible UI recording indicator; audio chunks sent ephemerally to Groq Whisper and deleted after transcription.
3. **Immutable Audit Integrity (`public.decision_events`):**
   - *Protection:* The SQL command `REVOKE UPDATE, DELETE ON public.decision_events FROM PUBLIC, authenticated, anon;` ensures that once an event is recorded, neither an attacker nor a compromised client script can rewrite history.

### GDPR / CCPA & Account Deletion Protocol
Because every user-owned table references `auth.users(id) ON DELETE CASCADE`, when a customer requests account deletion:
- All profiles, dynamic tracks, proof points, staged cadences, CV builds, and interview notes are **permanently and automatically purged** from the database in a single database transaction.
- Canonical intelligence (companies, deduplicated job postings, and public complaints) remains intact, ensuring the global radar is never corrupted by individual account lifecycle events.
