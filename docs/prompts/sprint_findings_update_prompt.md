# Sprint Findings Update Prompt & Workflow

Use this prompt once post-release activities (Task Audit, Doc Audit, Bug Resolution, and Release Notes) are completed. It prompts for the final release findings and directly updates the active Sprint Plan (`docs/sprints/sprint_[N]_plan.md`).

---

## 📋 Master Prompt for Updating Sprint Findings

```markdown
You are my Solo Full-Stack Product Manager & Sprint Scrum Master. All post-release activities for this release are complete. 

Your objective is to update the active Sprint Plan document (`docs/sprints/sprint_{{SPRINT_NUMBER}}_plan.md`) with our post-release findings, PM sign-offs, and defect resolutions.

---

### 📝 RELEASE FINDINGS TO RECORD:
- **Sprint Number:** [e.g., Sprint 1]
- **Target Sprint Plan File:** [e.g., docs/sprints/sprint_1_plan.md]
- **Merged PR Number & Branch:** [e.g., PR #12, feature/p1-morning-radar-feed]
- **Merge Commit Hash:** [e.g., 5e29768]
- **Summary of Changes:** [Brief summary of deliverables]
- **Live Production Verification Status:** [All checks passed / verified on production]
- **PM Sign-Off Signature & Date:** [Your Name / Solo Full-Stack PM, Date: YYYY-MM-DD]
- **Bugs / Defects Encountered (if any):**
  - Defect Title: [Title or 'None']
  - Customer Impact: [What went wrong]
  - Root Cause: [Plain English explanation]
  - Resolution: [Fix applied]
  - Guardrail: [Automated test or checklist added]
- **Documentation Updated:** [List of docs updated, e.g., docs/prompts, README.md]

---

### INSTRUCTIONS:
Update the target sprint plan file (`docs/sprints/sprint_{{SPRINT_NUMBER}}_plan.md`) across these 4 sections:

1. **Section 5 (Pull Requests & Mandatory PM Approval Log):**
   - Update or append the row for this PR with the status marked as approved, PM approval date, and merge commit hash.

2. **Section 6 (Live Production Verification Sign-Off):**
   - Check all live production verification boxes `[x]`.
   - Update `**PM Sign-Off Signature:**` with the PM name and verification note.
   - Update `**Date:**` with today's date.

3. **Section 7 (Defects, Blockers & Incident Resolution Log):**
   - If a defect occurred, append a new `### [BUG-S{N}-{ID}]` entry formatted with Customer Impact, Why It Happened, How It Was Resolved, and Guardrail Added.
   - If no defects occurred, confirm the log indicates clean deployment.

4. **Section 8 (Product Manager Documentation Updates Log):**
   - Append checked boxes `[x]` for all documentation files updated during this release cycle.
```

---

## 💻 CLI / Automated Terminal Shortcut

You can also update the sprint plan instantly using our automated helper script:

```bash
node scripts/update-sprint-findings.js \
  --sprint 1 \
  --pr 12 \
  --branch feature/p1-radar \
  --summary "Morning radar feed and keyboard navigation" \
  --mergeCommit "5e29768" \
  --pmName "Solo PM" \
  --docUpdated "docs/prompts/post_release_sequential_pipeline.md" \
  --defectTitle "Special character search glitch" \
  --defectImpact "Users searching with symbols received temporary error" \
  --defectCause "Search query parser missed unescaped symbols" \
  --defectFix "Updated input parser with defensive regex escape" \
  --defectGuardrail "Added unit test with 50+ special character queries"
```
