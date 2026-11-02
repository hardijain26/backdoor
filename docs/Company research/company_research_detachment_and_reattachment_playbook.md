# Company Research Submodule: Detachment & Re-Attachment Playbook

> **Repository:** `hardijain26/backdoor`  
> **Status:** Detached / Sandbox Mode Active  
> **Location of Detached Code:** [`sandbox/intel-lab/`](file:///Users/hardijain/backdoor/sandbox/intel-lab/)  
> **Date:** November 2026  

---

## 1. Executive Summary & Purpose

The **Company Research & Executive Teardown** module generates company intelligence, financial translation, customer friction analysis, and 3 diagnostic "reverse-grill" interview questions.

During initial development, the module was detached from the main production application (`src/app/`, `src/components/`, `src/engine/`) because:
1. **Output Quality & Noise**: The initial automated synthesis leaned too heavily on generic academic SWOT analysis, website traffic estimates, and high-level marketing descriptions, rather than actionable operational constraints and insider friction needed for executive interview sparring.
2. **Production Integrity**: To maintain a fast, stable, and clean production build with 100% test pass rates, all unproven, experimental intelligence logic was quarantined into an isolated testing lab.
3. **External Iteration Speed**: Moving to a standalone runner allows prompts, scrapers, and synthesis templates to be tested, benchmarked, and tuned in 0.1s without running Next.js or touching Supabase databases.

This playbook documents:
- **How the submodule is currently isolated.**
- **How to test and iterate externally to improve output quality.**
- **The exact step-by-step protocol to re-attach the module to production in the future.**

---

## 2. Current Architecture: Detached Sandbox Setup

All experimental engines, algorithms, types, tests, and UI prototypes are contained within [`sandbox/intel-lab/`](file:///Users/hardijain/backdoor/sandbox/intel-lab/).

### Directory Map
```
sandbox/intel-lab/
├── README.md               # Guide to running tests and benchmarks
├── intel-lab.ts            # Standalone CLI runner (0.1s execution)
├── engine/                 # Detached research & synthesis logic
│   ├── prompt-builder.ts          # Master LLM synthesis prompts
│   ├── role-classifier.ts        # 6-archetype classifier
│   ├── financial-translator.ts   # 10-K / unit economics parser
│   ├── swot-voc-synthesizer.ts   # Customer friction & insider sentiment
│   ├── review-scraper.ts         # Glassdoor/Reddit/Trustpilot scrapers
│   ├── rapidapi-connectors.ts    # RapidAPI integrations
│   ├── gslides-exporter.ts       # Google Slides presentation generator
│   ├── gsheets-exporter.ts       # Google Sheets matrix generator
│   ├── gdocs-exporter.ts         # Google Docs headless brief generator
│   └── research-queue.ts         # Background queue worker
├── types/                  # Isolated TypeScript interfaces
│   ├── data-product.ts           # 7-pillar company data schema
│   └── teardown.ts               # Role teardown & battlecard schema
├── tests/                  # 13 isolated test suites
│   ├── financial-translator.test.ts
│   ├── copilot-chat.test.tsx
│   ├── teardown-tab.test.tsx
│   ├── gslides-exporter.test.ts
│   ├── jit-interview-gate.test.ts
│   ├── rapidapi-connectors.test.ts
│   ├── research-worker.test.ts
│   ├── review-scraper.test.ts
│   ├── role-classifier.test.ts
│   ├── semantic-grammar.test.ts
│   ├── swot-voc.test.ts
│   ├── teardown-generator.test.ts
│   └── teardown-persistence.test.ts
└── ui/                     # Archived UI components (NOT compiled in production)
    ├── TeardownTab.tsx           # Tab 3 Intel & Teardown drawer component
    ├── CopilotPanel.tsx          # Cmd+K in-drawer copilot panel
    ├── intel-page/               # Standalone /intel preview pages
    ├── api-intel/                # Standalone /api/intel route handlers
    └── api-copilot/              # Standalone /api/copilot route handlers
```

### Isolation Boundary Guarantees
1. **Compiler Isolation**: `tsconfig.json` explicitly excludes `"sandbox"`. Production typechecking (`npm run typecheck`) ignores this folder entirely.
2. **Build Isolation**: Next.js production builds (`next build`) only scan `src/app/`. Because no routes exist in `src/app/intel` or `src/app/api/intel`, zero experimental bytes enter production bundles.
3. **Database Isolation**: The sandbox operates entirely in-memory with local JSON mocks. It does not write to public Supabase tables (`company_briefs`, `evaluations`).
4. **Standalone Script**: Configured in `package.json` as:
   ```json
   "scripts": {
     "intel:lab": "tsx sandbox/intel-lab/intel-lab.ts"
   }
   ```

---

## 3. How the Detachment Was Executed (Audit Trail)

For future reference, here is the exact sequence used to cleanly remove the module from production:

1. **Restored `src/components/dossier/DossierDrawer.tsx`**:
   - Removed imports of `TeardownTab` and `CopilotPanel`.
   - Removed `isCopilotOpen` state and `Cmd+K` global keyboard listeners.
   - Restored Tab 3 (`activeTab === 'intel'`) back to its lightweight 3-card preview baseline.
2. **Restored `src/engine/teardown.ts`**:
   - Replaced 289 lines of full data product generation with the clean 10-line baseline stub.
3. **Evacuated All Experimental Files**:
   - Moved engines to `sandbox/intel-lab/engine/`.
   - Moved types to `sandbox/intel-lab/types/`.
   - Moved tests to `sandbox/intel-lab/tests/`.
   - Moved experimental UI and API routes to `sandbox/intel-lab/ui/`.
   - Deleted all corresponding files from `src/` and `tests/`.
4. **Purged Cached Next.js Types**:
   - Executed `rm -rf .next` to clear stale route type declarations.
5. **Configured `tsconfig.json`**:
   - Added `"sandbox"` to `"exclude"`.
6. **Production Health Verification**:
   - `npm run typecheck` passed with 0 errors.
   - `npm run test:node` passed 54/54 tests.
   - `npm run test:unit` passed 61/61 tests.
   - `npm run build` compiled 26/26 core production routes.

---

## 4. How to Use the Module Separately (Standalone Guide)

The detached module can be used entirely on its own as a local CLI research engine and testing laboratory without running the Backdoor web application, Supabase, or external paid APIs.

---

### 4.1 CLI Quick Start & Command Reference

The primary entry point is the standalone runner in [`sandbox/intel-lab/intel-lab.ts`](file:///Users/hardijain/backdoor/sandbox/intel-lab/intel-lab.ts). You can run it via `npm run intel:lab` or directly with `npx tsx`:

```bash
# Basic run with defaults (outputs 1-Page Battlecard to sandbox/intel-lab-output.md in ~0.1s)
npm run intel:lab -- --company "Stripe" --role "Staff PM"
```

#### CLI Flag Reference

| Flag | Values / Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--company` | string (e.g. `"Stripe"`, `"Linear"`) | *Required* | Name of the target company. |
| `--role` | string (e.g. `"Staff PM"`) | `"Product Leader"` | Specific role title being targeted. |
| `--format` | `battlecard` \| `case-sparring` \| `raw-signals` | `battlecard` | The output synthesis template to generate. |
| `--live` | flag (boolean) | `false` (fast mock) | Enables live HTTP scrapers (Glassdoor/Reddit/10-K) instead of fast benchmark. |
| `--out` | file path | `sandbox/intel-lab-output.md` | Path where the output markdown report is written. |

---

### 4.2 The Three Output Modes Explained

#### 1. `--format battlecard` (1-Page Pre-Interview Cheat Sheet)
Generates an executive briefing designed to be read 10 minutes before walking into an interview:
- **The 5-Minute Opening Narrative Hook**: A verbatim framing statement bridging company revenue model to operational drag.
- **The Insider Ground Truth**: Real operational bottlenecks, why the role is actually open, and hiring manager psychological pressures.
- **3 "Reverse-Grill" Diagnostic Questions**: Solution-withheld questions that expose internal trade-offs and position the candidate as a peer consultant.
- **Proof Point Alignment (Rule R5)**: Direct mapping between the company's specific leaks and Hardi's verified past metrics.

```bash
npm run intel:lab -- --company "Stripe" --role "Staff PM" --format battlecard
```

#### 2. `--format case-sparring` (Interviewer Trap Predictor)
Prepares the candidate for the exact difficult case questions and trade-off traps the interview panel will probe:
- Identifies the core departmental bottleneck (e.g., enterprise custom requests vs. self-serve platform scale).
- Generates 3 predictive case study scenarios the interviewer is most likely to ask.
- Outlines the recommended strategic framing to avoid common candidate traps.

```bash
npm run intel:lab -- --company "Figma" --role "Product Lead" --format case-sparring
```

#### 3. `--format raw-signals` (Unvarnished Practitioner Intelligence)
Dumps the raw collected customer sentiment, developer complaints, and employee reviews before LLM synthesis:
- Top 3 recurring friction points extracted from Glassdoor/Reddit/Trustpilot.
- Financial unit economics snapshot (revenue streams, margins, funding profile).
- Scoped product division identification.

```bash
npm run intel:lab -- --company "Linear" --role "Director of Product" --format raw-signals
```

---

### 4.3 Running Isolated Unit Tests for the Submodule

The research engines have 13 dedicated test suites located in [`sandbox/intel-lab/tests/`](file:///Users/hardijain/backdoor/sandbox/intel-lab/tests/). You can run them individually using `npx tsx --test`:

```bash
# 1. Test the 6-Archetype Role Classifier
npx tsx --test sandbox/intel-lab/tests/role-classifier.test.ts

# 2. Test Customer Friction & Insider Voice Synthesis
npx tsx --test sandbox/intel-lab/tests/swot-voc.test.ts

# 3. Test 10-K & Financial Translation Engine
npx tsx --test sandbox/intel-lab/tests/financial-translator.test.ts

# 4. Test Semantic Grammar & Executive Output Formatting
npx tsx --test sandbox/intel-lab/tests/semantic-grammar.test.ts

# 5. Test Full Deterministic Teardown Generation
npx tsx --test sandbox/intel-lab/tests/teardown-generator.test.ts

# 6. Test Google Slides Presentation Exporter
npx tsx --test sandbox/intel-lab/tests/gslides-exporter.test.ts
```

---

### 4.4 Using the Multi-Asset Exporters Separately

The detached module contains standalone generator scripts and exporters for presentations, spreadsheets, and documents:

#### 1. Presentation Deck Generator (`.pptx` & Google Slides)
- **Local PowerPoint Deck**: Re-run the standalone XML-based generator to produce an executive interview slide deck:
  ```bash
  python3 /tmp/build_pptx_deck.py  # Outputs Executive_Interview_Teardown_Presentation.pptx
  ```
- **Engine Exporter**: [`sandbox/intel-lab/engine/gslides-exporter.ts`](file:///Users/hardijain/backdoor/sandbox/intel-lab/engine/gslides-exporter.ts) exports a 5-slide deck structure:
  1. *Title Slide*: Candidate name, target company, role, executive positioning.
  2. *Strategic Problem Diagnosis*: Financial translation & unit economics friction.
  3. *Customer Sentiment & Friction*: Real voice-of-customer practitioner pain points.
  4. *3 Reverse-Grill Diagnostic Questions*: Solution-withheld peer questions.
  5. *Dual-Track Roadmap*: 30-60-90 day execution plan anchored to verified metrics.

#### 2. Master Matrix Spreadsheets (`.xlsx` & Google Sheets)
- **Local Excel Workbook**: Re-generate the master company matrix and candidate tracker:
  ```bash
  python3 /tmp/generate_excel.py  # Outputs Company_Research_Master_Template.xlsx
  ```
- **Engine Exporter**: [`sandbox/intel-lab/engine/gsheets-exporter.ts`](file:///Users/hardijain/backdoor/sandbox/intel-lab/engine/gsheets-exporter.ts) exports:
  - *Tab 1 (Company Intelligence Matrix)*: 7 research pillars across competitors, financials, and voice-of-customer.
  - *Tab 2 (Candidate Application Tracker)*: Pipeline tracker with JIT interview status, fit scores, and generated teardown links.

---

### 4.5 How to Customize and Improve Output Quality

All synthesis logic is decoupled and located in two files:

1. **Prompt & Output Template Tuning**:
   - Open [`sandbox/intel-lab/intel-lab.ts`](file:///Users/hardijain/backdoor/sandbox/intel-lab/intel-lab.ts) or [`sandbox/intel-lab/engine/prompt-builder.ts`](file:///Users/hardijain/backdoor/sandbox/intel-lab/engine/prompt-builder.ts).
   - Adjust the `generateBattlecard()` or `generateCaseSparring()` formatting functions.
   - Refine the 3 question templates to ensure they withhold the solution and force the interviewer to disclose internal constraints.

2. **Adding Target Companies & Custom Benchmarks**:
   - Inside [`sandbox/intel-lab/intel-lab.ts`](file:///Users/hardijain/backdoor/sandbox/intel-lab/intel-lab.ts), edit the `MOCK_INTELLIGENCE_VAULT` object to add new test companies with bespoke operational leaks, revenue engines, and hiring manager mindsets.

3. **Evaluating Improvements**:
   - Run: `npm run intel:lab -- --company "<Company>" --role "<Role>"`.
   - Inspect [`sandbox/intel-lab-output.md`](file:///Users/hardijain/backdoor/sandbox/intel-lab-output.md).
   - Check against the **Quality Benchmark Checklist** below before considering re-attachment.

---

### 4.6 Quality Benchmark Checklist (Definition of Ready for Production)
Before this module can be re-attached to production, the output generated in `sandbox/intel-lab-output.md` must pass all five criteria:

- [ ] **1. Zero Generic Fluff**: No textbook definitions of the company or generic SWOT ("Strength: strong brand"). Every bullet must reference a specific operational friction point (e.g., query latency on CSV exports >10k rows, broken multi-subsidiary billing reconciliation).
- [ ] **2. Three "Reverse-Grill" Diagnostic Questions**: Questions must withhold the solution and force the interviewer to expose internal trade-offs (e.g. margin expansion vs. bespoke enterprise commits, ACID ledger integrity vs. OLAP warehouse latency).
- [ ] **3. Candidate Proof Point Transference (Rule R5)**: The output must anchor the company's specific leaks to Hardi's verified past metrics from `HARDI_PROOF_POINTS_LIBRARY` with zero invented numbers.
- [ ] **4. Just-In-Time (JIT) Efficiency**: Research synthesis must only activate when an interview is scheduled (status `IN_CONVERSATION` / `INTERVIEW_SCHEDULED`), avoiding unnecessary LLM tokens on raw leads.
- [ ] **5. Strict Design System (Rule R7)**: If UI components are reintroduced, they must strictly follow Precision Cobalt & Steel palette (blue, sky, emerald, slate, zinc, rose) with **zero** banned colors (indigo, violet, orange, amber, terracotta).

---

## 5. Future Re-Attachment Protocol (Step-by-Step)

When the company research output has been reviewed, refined, and approved, follow this exact procedure to re-attach the module to production.

```
+-------------------------------------------------------------+
|               RE-ATTACHMENT STAGE GATES                     |
+-------------------------------------------------------------+
|  Stage 1: Types & Engine Migration                          |
|  Stage 2: Just-In-Time (JIT) Activation Gate                |
|  Stage 3: API Route Restoration                             |
|  Stage 4: Dossier Drawer UI Re-Connection                   |
|  Stage 5: Test Suite Re-Integration & Color Blacklist Audit |
|  Stage 6: Final Verification & Production Build             |
+-------------------------------------------------------------+
```

### Stage 1: Types & Engine Migration
Copy the refined engine files and types back into production:

```bash
# 1. Copy types
mkdir -p src/types
cp sandbox/intel-lab/types/* src/types/

# 2. Copy core engines
cp sandbox/intel-lab/engine/financial-translator.ts src/engine/
cp sandbox/intel-lab/engine/prompt-builder.ts src/engine/
cp sandbox/intel-lab/engine/role-classifier.ts src/engine/
cp sandbox/intel-lab/engine/swot-voc-synthesizer.ts src/engine/
cp sandbox/intel-lab/engine/review-scraper.ts src/engine/
cp sandbox/intel-lab/engine/rapidapi-connectors.ts src/engine/
cp sandbox/intel-lab/engine/research-queue.ts src/engine/
cp sandbox/intel-lab/engine/gslides-exporter.ts src/engine/
cp sandbox/intel-lab/engine/gsheets-exporter.ts src/engine/
cp sandbox/intel-lab/engine/gdocs-exporter.ts src/engine/
```

### Stage 2: Just-In-Time (JIT) Activation Gate
Update `src/engine/teardown.ts` so that deep synthesis is **only** triggered when an interview exists:

```typescript
// Ensure deep research is gated by interview status:
export function canTriggerDeepResearch(jobStatus: string, hasMeetingNotes: boolean): boolean {
  const JIT_ELIGIBLE_STAGES = ['IN_CONVERSATION', 'INTERVIEW_SCHEDULED', 'OFFER_RECEIVED'];
  return JIT_ELIGIBLE_STAGES.includes(jobStatus) || hasMeetingNotes;
}
```

### Stage 3: API Route Restoration
If API routes are required for asynchronous client polling and export downloads:

```bash
# Copy API routes
mkdir -p src/app/api/intel
cp -r sandbox/intel-lab/ui/api-intel/* src/app/api/intel/
```

### Stage 4: Dossier Drawer UI Re-Connection
1. Copy the drawer components:
   ```bash
   cp sandbox/intel-lab/ui/TeardownTab.tsx src/components/dossier/
   ```
2. In `src/components/dossier/DossierDrawer.tsx`:
   - Import `TeardownTab`:
     ```typescript
     import { TeardownTab } from './TeardownTab';
     ```
   - Replace the Tab 3 preview block with:
     ```tsx
     {activeTab === 'intel' && (
       <TeardownTab
         job={job}
         candidateProofPoints={candidateProofPoints}
       />
     )}
     ```

### Stage 5: Test Suite Re-Integration & Color Blacklist Audit
1. Move the unit tests back to `tests/`:
   ```bash
   cp sandbox/intel-lab/tests/* tests/
   ```
2. Run the Rule R7 AST scanner to verify zero banned colors exist in the re-attached files:
   ```bash
   npm run test:node -- tests/compliance-master-audit.test.ts
   ```

### Stage 6: Final Verification & Production Build
Execute the full continuous-integration verification suite:

```bash
# 1. Typecheck the entire project including the re-attached files
npm run typecheck

# 2. Run backend & compliance test suite
npm run test:node

# 3. Run frontend unit tests
npm run test:unit

# 4. Run Next.js production build
npm run build
```

Only when all 4 checks pass without errors or warnings should the changes be committed to `main`.

---

## 6. Summary of Architectural Invariants

Whenever modifying or re-attaching this module, these rules remain non-negotiable:

| Rule | Invariant | Description |
| :--- | :--- | :--- |
| **R1** | **Zero Auto-Send** | No automated email sending under any circumstances. Drafts must only stage in Gmail. |
| **R2** | **$0 Running Cost** | Deterministic heuristics and free endpoints by default; LLM calls must be opt-in and gated. |
| **R5** | **Zero Metric Hallucination** | Candidate metrics must match `HARDI_PROOF_POINTS_LIBRARY` byte-for-byte. |
| **R7** | **Color Blacklist** | Strict forbidden colors (`indigo`, `violet`, `orange`, `amber`, `terracotta`). Only Cobalt & Steel allowed. |
| **JIT** | **Just-In-Time Gate** | Deep company teardowns run **only** when an interview is scheduled, never for unvetted leads. |
