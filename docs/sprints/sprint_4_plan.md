# Sprint 4 Plan: Company Intelligence Teardowns, Tier 3 Deep Dossier & Meet Audio Intelligence

## 1. Executive Summary & Sprint Goal
- **Sprint Identifier:** Sprint 4
- **Target Phase:** Phase 4 (Depth & Polish)
- **Sprint Goal:** Deliver complete, verified end-to-end vertical slices for Tier 3 deep LLM fit evaluation, multi-source company intelligence teardowns (Reddit & App Store review auditor), Google Meet audio capture with Groq Whisper transcription into structured action items, the interview notes workspace (`/interviews`), and the embedded interactive AI Copilot panel.
- **Vertical Slice Mandate:** Every feature picked in this sprint must be delivered as a complete end-to-end experience spanning database schema, backend APIs, business logic engines, frontend UI components, keyboard navigation, and live verification. No partial mock layers or disconnected endpoints are permitted.
- **Sprint Status:** `PLANNING`
- **Target Start Date:** 2026-12-19
- **Target Completion Date:** 2027-01-01

---

## 2. Planned Features Breakdown: Backend vs. Frontend Task Allocation

| Task ID | Feature Title | Backend Deliverables | Frontend Deliverables | Status | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S4-T01` | Tier 3 LLM Fit Evaluation & Proof-Point Synthesis | Prompt pipeline grounding on candidate proof points, caching in `evaluations` | Tab 2 "Match Breakdown" Tier 3 synthesis card, positioning angle pill, gap chips | `IN_PROGRESS` | Fullstack Lead |
| `S4-T02` | Company Review Auditor (Reddit, App Store, Play Store) | Polite scrapers for Reddit/App Store/Play Store, sentiment analysis, pain point clustering | Tab 3 "Teardown 1-Pager" sentiment gauges, customer pain point list, direct quotes | `DEFERRED` (PM Scope Cut) | Fullstack Lead |
| `S4-T03` | Executive Product Teardown 1-Pager & Google Docs Export | Teardown generator (Quick Win, Growth Loop, Monetization), Google Docs API export | Live 3-proposal preview cards, "Open Teardown in Google Docs" primary CTA button | `PLANNED` | Fullstack Lead |
| `S4-T04` | Google Meet Audio Capture & Groq Whisper Pipeline | Multipart audio chunk receiver, Groq Whisper API integration, LLM notes extractor | Chrome Extension `audio-capture.js` recording Meet tab audio in 10-min WAV chunks | `PLANNED` | Extension Lead |
| `S4-T05` | Interview Notes & Debrief Workspace (`/interviews`) | Interview rounds API, action items CRUD, persistence to `meetings` & `decision_events` | Timeline view of interviews, transcript accordion, interactive action items checklist | `PLANNED` | Fullstack Lead |
| `S4-T06` | In-Drawer AI Copilot Panel & Contextual Role Sparring | Streaming LLM endpoint (`/api/copilot/chat`) with auto-injected JD, teardown & proof points | Collapsible drawer chat panel, streaming markdown renderer, quick-prompt action chips | `DEFERRED` (PM Scope Cut) | Fullstack Lead |

---

## 3. Detailed Feature Specifications: Backend, Frontend & End-to-End User Experience

### Feature `S4-T01`: Tier 3 LLM Fit Evaluation & Proof-Point Synthesis

#### Backend Tasks
- Build Tier 3 evaluation engine in `@eval/brain` (M3) executing for roles where Tier 2 `fit_score >= 70`.
- Construct context injection prompt grounding LLM strictly on candidate verified `proof_points` in `dossier/identity` (M8).
- Extract structured JSON payload containing:
  1. 3 tailored bullet points citing exact `proof_point_id` references.
  2. 1 strategic positioning angle customized to company culture and stage.
  3. "Score Booster Gaps": missing portfolio artifacts or skills worth $\ge 5$ formula points.
- Store output in PostgreSQL `evaluations` table with timestamped cache.

#### Frontend Tasks
- Enhance Tab 2 ("Match Breakdown") in `DossierDrawer.tsx` to render Tier 3 synthesis card above formula scores.
- Build verified proof point badges linking directly to candidate portfolio entries.
- Display "Strategic Positioning Angle" banner styled in Cobalt accent (`#2563EB/10`, border `#2563EB`).
- Render "Score Booster Gaps" chips in Amber-free Sky palette (`text-sky-400 bg-sky-950/40`).

#### End-to-End User Experience & Verification
- **User Journey:** Candidate opens a high-match role ($\ge 70\%$) in the Dossier Drawer. Tab 2 immediately displays 3 tailored bullets proving exactly how the candidate's verified career achievements solve the company's pain points, plus a strategic positioning angle for conversations.
- **Verification:** `npm run test:node tests/tier3-eval.test.ts` asserting proof point ID presence and execution time $\le 3000$ms.

---

### Feature `S4-T02`: Company Review Auditor (Reddit, App Store, Play Store Scraping)

#### Backend Tasks
- Build polite scrapers in `@intel/teardown` (M5) for Reddit community threads, iOS App Store customer reviews, and Google Play Store reviews.
- Enforce strict crawling boundaries: $\ge 500$ms inter-request spacing, User-Agent identification, and robots.txt check.
- Run NLP sentiment analysis clustering reviews into recurring customer complaints, churn triggers, and feature requests.
- Persist structured sentiment distribution and top 5 friction points into `company_intelligence` table.

#### Frontend Tasks
- Build customer sentiment meter in Tab 3 ("Teardown 1-Pager") of Dossier Drawer.
- Render top 5 customer friction points with user quotes, review source badges (Reddit, App Store, Play Store), and frequency indicators.
- Add "Refresh Review Analysis" manual re-sync button with loading state.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate prepares for an interview by opening the company teardown tab. Instead of generic marketing copy, candidate reads real customer complaints from App Store and Reddit, giving them authentic, unvarnished insight into where the product is struggling.
- **Verification:** `npm run test:node tests/review-scraper.test.ts` with mocked HTML/JSON fixtures.

---

### Feature `S4-T03`: Executive Product Teardown 1-Pager & Google Docs Exporter

#### Backend Tasks
- Build teardown synthesis engine in `@intel/teardown` (M5) synthesizing company funding, business model, and scraped user complaints into 3 strategic proposals:
  - **Quick Win:** 0–30 day immediate friction fix.
  - **Growth Loop:** 30–90 day retention/acquisition multiplier.
  - **Monetization Expansion:** 90+ day revenue enhancement.
- Integrate Google Docs API (`docs.create` / `documents.batchUpdate`) to generate an executive-ready 1-pager in the candidate's Google Drive.
- Save Google Doc URL and Drive file ID to `company_intelligence` record.

#### Frontend Tasks
- Build 3 structured proposal cards inside Tab 3 of Dossier Drawer highlighting the Quick Win, Growth Loop, and Monetization proposals.
- Render prominent "Open Teardown in Google Docs" CTA button with authenticated external link.
- Display "Regenerate Proposals" button allowing candidate to refine strategic angle.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate clicks "Generate Product Teardown" in the drawer. In 3 seconds, 3 concrete product proposals appear. Candidate clicks "Open Teardown in Google Docs" to open a beautifully styled document in Google Drive ready to share with the VP of Product during their interview.
- **Verification:** `npm run test:node tests/teardown-generator.test.ts` and Google Drive API integration test.

---

### Feature `S4-T04`: Google Meet Audio Capture & Groq Whisper Pipeline

#### Backend Tasks
- Build `/api/interviews/transcribe` multipart audio upload handler supporting WAV chunk streaming.
- Integrate Groq Whisper API (whisper-large-v3, sub-second transcription inference) converting audio to timestamped verbatim text.
- Build LLM structured notes extraction pipeline parsing:
  1. Interview questions asked by interviewers.
  2. Candidate answers given.
  3. Action items and follow-up commitments made.
  4. Overall interviewer sentiment and reaction.
- Persist structured output to PostgreSQL `meetings` table.

#### Frontend & Browser Extension Tasks
- Implement `extension/audio-capture.js` capturing tab audio stream from active Google Meet tab in 10-minute WAV chunks with user consent modal.
- Display floating recording status pill ("Backdoor Audio Capture Active") inside Google Meet tab.
- Automatically upload recorded chunks to `/api/interviews/transcribe` upon call termination.

#### End-to-End User Experience & Verification
- **User Journey:** Candidate enters a Google Meet interview and clicks "Capture Audio" in the Backdoor extension. The extension records the tab audio cleanly without external bots. Upon ending the call, notes and action items automatically appear in Backdoor without manual note-taking.
- **Verification:** `npm run test:node tests/audio-transcription.test.ts` testing 10-minute WAV chunk processing.

---

### Feature `S4-T05`: Interview Notes & Debrief Workspace (`/interviews`, `/dossiers`)

#### Backend Tasks
- Implement CRUD endpoints for `/api/interviews` managing interview rounds (Screen, HM, Case Study, Executive).
- Build action items management API allowing check-off, reordering, and deadline updates.
- Record every action item update and round progression to `decision_events`.

#### Frontend Tasks
- Build dedicated `/interviews` workspace accessed via left rail.
- Display chronological timeline of past and upcoming rounds grouped by company.
- Build collapsible transcript viewer with speaker turn separation and search filter.
- Build interactive action items checklist (e.g. "Send portfolio deck to Sarah by Friday") with instant checkbox toggle and strikethrough styling.

#### End-to-End User Experience & Verification
- **User Journey:** Immediately after an interview, candidate opens `/interviews`, reviews the verbatim transcript, sees the AI-extracted follow-up commitments, and checks off items as they complete them.
- **Verification:** `npm run test:unit tests/frontend/interview-notes.test.tsx`.

---

### Feature `S4-T06`: In-Drawer AI Copilot Panel & Contextual Role Sparring

#### Backend Tasks
- Build `/api/copilot/chat` streaming SSE endpoint powered by Gemini / Groq LLMs.
- Context Injector: automatically injects role description, company teardown, and candidate verified proof points into system prompt.
- **Rule R5 Safety Check:** Ensure copilot responses never invent metrics not present in candidate's proof points.

#### Frontend Tasks
- Implement collapsible slide-out Copilot sub-panel inside Dossier Drawer (accessible via drawer cue or `Cmd/Ctrl + K`).
- Build streaming markdown chat interface with typewriter effect and zero lag.
- Provide quick-action prompt chips: "Simulate 5-minute case question", "Draft objection handling for career switch", "Highlight my top metrics for this JD".
- Add "Copy Response" and "Pin to Interview Notes" buttons.

#### End-to-End User Experience & Verification
- **User Journey:** While inspecting a role, candidate opens Copilot, clicks "Simulate 5-minute case question", and gets an instant mock question tailored to the company's real challenges. Candidate types their response and gets instant critique grounded in their actual past metrics.
- **Verification:** `npm run test:unit tests/frontend/copilot-chat.test.tsx` testing streaming and context injection.

---

## 4. Quality Gating & Preflight Checklist
Before submitting any Pull Request in this sprint, the following must pass:
- [ ] TypeScript verification clean (`npm run typecheck`)
- [ ] Node.js core logic tests pass (`npm run test:node`)
- [ ] Jest frontend component tests pass (`npm run test:unit`)
- [ ] PostgreSQL schema & RLS check pass (`bash scripts/db-check.sh`)
- [ ] Playwright E2E tests pass (`npm run test:e2e`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Review scraper compliance test passes (delay $\ge 500$ms, SSRF safety check).
- [ ] Groq Whisper chunking test passes under 25MB file boundaries.

---

## 5. Pull Requests & Mandatory PM Approval Log

| PR # | Feature Branch | Summary of Changes | Approval Prompt Delivered? | PM Approval Date | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #-- | `feature/p4-eval-tier3-llm` | Tier 3 LLM evaluation and proof-point synthesis | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p4-intel-teardown-scraper` | Multi-source company review scraper and sentiment | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p4-intel-teardown-doc` | Google Docs teardown 1-pager generator | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p4-workspace-meet-whisper` | Google Meet audio capture and Groq Whisper pipeline| [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p4-fe-interview-hub` | Interview hub and meeting notes workspace | [ ] Yes | YYYY-MM-DD | `[hash]` |
| #-- | `feature/p4-copilot-interactive-panel`| Contextual AI Copilot drawer sparring interface | [ ] Yes | YYYY-MM-DD | `[hash]` |

---

## 6. Live Production Verification Sign-Off
Following deployment of `main`, the Product Manager executes the live verification checklist:
- [ ] Opening drawer on role $\ge 70\%$ displays Tier 3 synthesis bullets citing valid `proof_points`.
- [ ] Teardown tab displays 3 concrete product opportunities and opens generated Google Doc cleanly.
- [ ] Test audio upload to `/api/interviews/transcribe` returns Groq Whisper transcript and action items.
- [ ] Copilot panel answers contextual questions referencing the selected job description.
- [ ] Interview notes page allows checking off action items with persistent database update.
- [ ] Zero forbidden colors (zero orange/indigo/amber).
- **PM Sign-Off Signature:** ____________________ **Date:** ___________

---

## 7. Defects, Blockers & Incident Resolution Log

| Bug ID | Severity | Description | Hotfix Branch | Root Cause & Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | *No defects logged during planning phase.* | — | *Any defects emerging during sprint execution must be logged here immediately.* | `PLANNED` |

---

## 8. Product Manager Documentation Updates Log
- [ ] `docs/build_instructions_runbook.md` updated with Phase 4 operational behaviors
- [ ] `docs/PRODUCT-ARCHITECTURE.md` updated with Groq Whisper & Teardown contracts
- [ ] `docs/system_architecture_maps.md` updated with Audio pipeline topology
- [ ] `CHANGELOG.md` updated with user-facing release notes
