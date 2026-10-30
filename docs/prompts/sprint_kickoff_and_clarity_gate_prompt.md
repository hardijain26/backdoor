# Sprint Kickoff & Requirements Clarity Gate Prompt

Use this prompt as soon as the **Master Audit Report** (`docs/sprints/sprint_audit_and_completion_report.md`) is finalized. It acts as an autonomous gatekeeper that intakes the next sprint's tasks, conducts a rigorous requirements review against the PRD, resolves ambiguities with the PM, automatically synchronizes documentation, and transitions into execution via the Build Instructions Runbook.

---

## 🚦 Kickoff & Clarity Gate Architecture

```
[Audit Report Finalized & Closed]
               │
               ▼
   [Step 1: Next Sprint Scope Intake]
   • Pull planned sprint tasks from docs/sprints/sprint_[N]_plan.md
   • Ingest CARRIED_FORWARD tasks from sprint_audit_and_completion_report.md
               │
               ▼
   [Step 2: The Requirements Clarity Gate]
   • Cross-examine tasks against docs/prd.md, docs/ui_requirements.md, & docs/database-schema.md
   • Check 4 dimensions: Edge Cases, Data Contracts, UI States, Cardinal Rules (R1–R8)
               │
      ┌────────┴────────┐
      ▼                 ▼
[Ambiguities Found]  [100% Clarity / No Issues]
      │                 │
      ▼                 ▼
[Ask PM Structured Qs] [Read Build Runbook (docs/build_instructions_runbook.md)]
      │                 │
      ▼                 ▼
[Auto-Update PRD,      [Checkout feature branch & begin vertical slice]
 UI Docs & Sprint Plan]
      │
      ▼
[Proceed to Runbook & Build]
```

---

## 📋 The Master Kickoff & Clarity Gate Prompt

```markdown
You are my Lead Technical Architect and Principal Product Manager. We have just audited and closed our previous sprint in `docs/sprints/sprint_audit_and_completion_report.md`.

Your objective is to kick off the next sprint with zero ambiguity, ensuring that all specifications match before any code is written.

---

### INPUTS FOR KICKOFF:
- **Next Sprint Number:** [e.g., Sprint 3]
- **Target Sprint Plan File:** `docs/sprints/sprint_{{SPRINT_NUMBER}}_plan.md`
- **Master Audit Report:** `docs/sprints/sprint_audit_and_completion_report.md`
- **Authoritative Docs to Check:**
  - `docs/prd.md`
  - `docs/ui_requirements.md`
  - `docs/database-schema.md`
  - `docs/build_instructions_runbook.md`

---

### EXECUTION STAGES:

#### STAGE 1: INTAKE & CARRY-FORWARD HARVESTING
1. Read `docs/sprints/sprint_audit_and_completion_report.md` and identify all tasks designated as `CARRIED_FORWARD` into Sprint {{SPRINT_NUMBER}}.
2. Open `docs/sprints/sprint_{{SPRINT_NUMBER}}_plan.md` and verify that the carried-forward tasks are merged with the planned tasks in Section 2.
3. List the complete active roster of tasks for this sprint in a summary table.

#### STAGE 2: THE REQUIREMENTS CLARITY GATE
Review every task in the roster against `docs/prd.md`, `docs/ui_requirements.md`, and `docs/database-schema.md`. Audit each task against these 4 clarity standards:
1. **Functional Boundaries & Edge Cases:** Are the inputs, outputs, error conditions, and negative filters unambiguously defined?
2. **Data Contracts & DB Schema:** Are all required columns, enums, foreign keys, and RLS policies already present in `database/schema.sql`?
3. **UI / Interaction Specification:** Are visual tokens, responsive breakpoints (down to 380px), empty states, and single-key keyboard shortcuts (`j`/`k`/`Enter`/`Esc`) specified?
4. **Cardinal Rule Adherence:** Does the task violate any of Rules R1–R8 (e.g. zero automated outbound emails, free-tier cost, zero forbidden colors)?

---

#### STAGE 3: BRANCHING DECISION

### 🔴 IF AMBIGUITIES, GAPS, OR QUESTIONS EXIST:
1. Do NOT begin writing implementation code.
2. Present a concise list of 1–3 structured questions to the PM with recommended options:
   - Question: [Specific ambiguity, e.g. fallback behavior when Apollo key is missing]
   - Options:
     - (Recommended) [Option A: Graceful UI badge showing 'Skipped: no key' per Rule R3]
     - [Option B: Prompt user to enter key in drawer settings]
3. **AUTOMATED SYNC ONCE CLARIFIED:** As soon as the PM replies with their decision:
   - Update `docs/sprints/sprint_{{SPRINT_NUMBER}}_plan.md` under the specific task's Acceptance Criteria.
   - Update `docs/prd.md` under Section 10 (*Specification Change & Clarification Log*).
   - Update `docs/ui_requirements.md` if UI states were clarified.
   - Run: `node scripts/sync-sprint-clarity.js --sprint {{SPRINT_NUMBER}} --taskId [TASK-ID] --decisionTitle "[Title]" --decisionDetails "[Details]"`

### 🟢 IF REQUIREMENTS ARE 100% CLEAR (ZERO ISSUES):
1. State: *"✅ Requirements Clarity Gate Passed: All tasks, data contracts, and UI states are 100% unambiguous."*
2. Consult the primary build instructions in `docs/build_instructions_runbook.md` for the corresponding Subsystem section.
3. Check out the dedicated feature branch matching the naming convention:
   `git checkout -b feature/p{{SPRINT_NUMBER}}-[subsystem]-[slug]`
4. Begin vertical-slice implementation (DDL migration -> backend engine -> UI component -> preflight test verification).
```

---

## 💻 Automated Helper: Instant Clarity Synchronization Script

When a question is clarified during kickoff, you or your agent can update all 3 core documents in a single command:

```bash
node scripts/sync-sprint-clarity.js \
  --sprint 3 \
  --taskId "S3-T03" \
  --decisionTitle "Apollo BYOK Graceful Fallback" \
  --decisionDetails "When user provides no Apollo key, contact discovery falls back to Hunter.io; if neither provided, displays manual LinkedIn search query button with zero cost." \
  --uiComponent "ThreeDoorsContactCard"
```

This ensures:
- `docs/sprints/sprint_3_plan.md` gains the new Acceptance Criterion.
- `docs/prd.md` records the permanent specification decision.
- `docs/ui_requirements.md` gains the updated component state.
