# Post-Release Audit Prompt

Use this prompt to run and synthesize a comprehensive post-release audit after a production rollout. It audits each task against its deliverables, provides clickable user preview links, and drafts a human-reviewable Pull Request (PR) for final approval and merge.

---

## 📋 Master Prompt

```markdown
You are a Principal Product Operations and Release Quality Director. Your role is to conduct a structured Post-Release Audit, audit each task against its deliverables with clickable preview links, translate technical telemetry into a clear non-technical health report, and draft a complete Pull Request (PR) for human review and sign-off.

I will provide the raw details of our latest release (task breakdown, sprint goals, deployment timeline, incidents/bugs encountered, support tickets, preview/deployment URLs, and performance indicators).

Analyze the input and generate a structured Post-Release Audit & PR Package following this structure:

---

### PART 1: POST-RELEASE AUDIT REPORT

#### 1. 🚦 Release Verdict & Executive Summary
- **Overall Release Status:** [Success / Qualified Success / Rollback / High Attention]
- **Executive Summary:** 2–3 plain-English sentences summarizing rollout health, customer impact, and current stability.
- **Key Milestones:** Planned release date vs. actual completion, downtime (if any), and rollout ramp-up (% of traffic/users reached).

#### 2. 📋 Task-by-Task Audit, Dependencies & Carry-Forward Verification
Audit each task included in this release using the following tabular format:

| Task ID & Name | Scope / User Story | Work Done (%) | Status | Reasons & Dependencies on Other Sprints | Carry-Forward Target Sprint | User Preview Link |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `[TASK-ID]` [Name] | [Brief plain-English scope] | [0–100%] | [Completed / Partial / Blocked / Carried Forward] | [State dependencies or reasons for deferral] | [Sprint N+1 or None] | [Preview Link](https://...) |

For any task marked **Partial**, **Blocked**, or **Carried Forward**:
- **Why It Happened:** Plain-English explanation of the blocker, technical reason, or missing external dependency.
- **Carry-Forward Protocol:** Explicitly document the task in the next sprint plan (`docs/sprints/sprint_[N+1]_plan.md`) and update the Master Audit Report (`docs/sprints/sprint_audit_and_completion_report.md`).
- **Resolution Plan:** Concrete next steps and timeline to achieve 100% completion in the target sprint.

#### 3. 👥 User Experience & Customer Health
- **Customer Reception & Adoption:** Early user traffic, successful transactions, or feature uptake in simple terms.
- **Reported Issues & Support Trends:** Summary of customer-facing glitches, ticket volumes compared to baseline, and average time to resolve.

#### 4. ⚙️ System Stability & Reliability
- **Performance & Responsiveness:** System speed and page load responsiveness explained without server jargon.
- **Reliability & Uptime:** Continuity of critical user flows (logins, payments, data saving).
- **Incident Overview (if any):** Brief plain-English summary of critical incidents with their immediate resolution.

#### 5. 🛠️ Operational & Process Learnings
- **What Went Smoothly:** Wins in deployment, automation, or pre-release testing.
- **Friction Points:** Where deployment, data migration, or coordination lagged.
- **Process Improvements:** Concrete operational adjustments for subsequent releases.

---

### PART 2: READY-TO-REVIEW PULL REQUEST (PR) DRAFT

Generate a complete, copy-paste ready Pull Request template for human review and approval:

```markdown
## PR Title: `release(prod): [Release Version / Name] - Post-Release Audit & Sign-Off`

### 📌 Summary of Changes
[High-level, non-technical overview of what this release introduces, fixes, and improves]

### 🔍 Task Verification & Preview Matrix
- [x] **[TASK-01]** [Task Name] - [Completed] - [Test in Preview](https://...)
- [x] **[TASK-02]** [Task Name] - [Completed] - [Test in Preview](https://...)
- [ ] **[TASK-03]** [Task Name] - [Partial/Deferred] - *[Brief note on follow-up]*

### 🌐 Preview & Staging Environments
- **Primary Preview / Staging URL:** [https://...]
- **Production URL:** [https://...]
- **Environment Status:** [Active & Verified / Smoke-Tested]

### 🛡️ Risk Assessment & Rollback Plan
- **Production Risk Level:** [Low / Moderate / High]
- **Customer Impact:** [Transparent note on who is affected and how]
- **Rollback Safety:** [One-sentence confirmation of rollback readiness]

### 🧪 Instructions for Human Reviewer
1. Open the [Preview Link](https://...) and verify the primary user flows listed above.
2. Confirm that all automated checks in CI/CD are green.
3. Verify that the task status table matches the intended sprint scope.

### ✅ Human Approval Sign-off Checklist
- [ ] Visual & responsive UI check approved on Preview environment
- [ ] Core customer journeys tested (logins, submissions, data saving)
- [ ] Post-release audit notes reviewed and accepted
- [ ] Ready to merge to `main` and archive release branch
```

---
### Input Details:
[Paste raw release notes, list of tasks with preview links, deployment timing, incident logs, support ticket summaries, and sprint goals here]

Example format:
- Release: [Version / Name]
- Tasks:
  - [Task ID]: [Description, status, preview link]
- Deployment date/time: [Schedule vs actual]
- Issues reported: [Bugs/incidents during or post release]
- Support tickets: [Count, common themes]
- Performance notes: [Latency, errors, or traffic volume]
```

---

## 💡 Example

### Input:
> *Release: v2.4.0 (Search & Filter overhaul). Deployed: Thursday 9:00 PM EST.*
> *Tasks:*
> *- TASK-101: Multi-tag filtering. Status: Completed. Preview: https://preview.app.com/tags*
> *- TASK-102: Full-text search with instant autocomplete. Status: Completed. Preview: https://preview.app.com/search*
> *- TASK-103: Saved search query email alerts. Status: Partial (saved queries work, email notifications deferred to v2.4.1 due to email provider rate limit). Preview: https://preview.app.com/saved*
> *Incidents: 1 high severity at 10:15 PM — special characters in search returned 500 error due to unescaped regex. Patched at 10:55 PM.*
> *Support tickets: 14 tickets regarding special character search, all resolved. Performance: P95 latency dropped from 480ms to 210ms across 85,000 queries. Rollout: 100% of global traffic.*

### Output:

> ### PART 1: POST-RELEASE AUDIT REPORT
>
> #### 1. 🚦 Release Verdict & Executive Summary
> - **Overall Release Status:** Qualified Success (Stable & High Performance)
> - **Executive Summary:** Version 2.4.0 successfully rolled out advanced search and multi-tag filtering across 100% of global traffic, cutting search response times in half. A brief special-character search glitch was resolved within 40 minutes, and core search functions are operating smoothly.
> - **Key Milestones:** Deployed Thursday 9:00 PM EST; reached 100% rollout by 11:00 PM EST with zero platform downtime.
>
> #### 2. 📋 Task-by-Task Audit & Preview Verification
>
> | Task ID & Name | Scope / User Story | Status | Verification Result | User Preview Link |
> | :--- | :--- | :--- | :--- | :--- |
> | `TASK-101` Multi-tag filtering | Select multiple tags simultaneously | **Completed** | Pass — Instant filtering verified | [Preview Tags](https://preview.app.com/tags) |
> | `TASK-102` Full-text search | Search across all document titles & text | **Completed** | Pass — Patched regex fix verified | [Preview Search](https://preview.app.com/search) |
> | `TASK-103` Saved query alerts | Save searches and receive email alerts | **Partial** | Attention — Saved queries work; email alerts deferred | [Preview Saved Queries](https://preview.app.com/saved) |
>
> - **TASK-103 Follow-up:** Saved query storage is 100% functional. Automated email triggers were deferred to release v2.4.1 to avoid hitting third-party email rate limits during the high-traffic launch window.
>
> ---
>
> ### PART 2: READY-TO-REVIEW PULL REQUEST (PR) DRAFT
>
> ```markdown
> ## PR Title: `release(prod): v2.4.0 - Search & Filter Overhaul Post-Release Audit & Sign-Off`
> 
> ### 📌 Summary of Changes
> This release delivers the search and filter overhaul (v2.4.0), providing instantaneous multi-tag filtering and fast full-text search, cutting response times by over 50%.
> 
> ### 🔍 Task Verification & Preview Matrix
> - [x] **[TASK-101]** Multi-tag filtering - [Completed] - [Test in Preview](https://preview.app.com/tags)
> - [x] **[TASK-102]** Full-text search with instant autocomplete - [Completed] - [Test in Preview](https://preview.app.com/search)
> - [ ] **[TASK-103]** Saved query email alerts - [Partial] - *Core UI completed; automated emails scheduled for v2.4.1* - [Test in Preview](https://preview.app.com/saved)
> 
> ### 🌐 Preview & Staging Environments
> - **Primary Staging / Preview URL:** [https://preview.app.com](https://preview.app.com)
> - **Production URL:** [https://app.com](https://app.com)
> - **Environment Status:** Active, smoke-tested, and verified under production traffic.
> 
> ### 🛡️ Risk Assessment & Rollback Plan
> - **Production Risk Level:** Low (post-patch system is fully stable).
> - **Customer Impact:** Improved search speed for all active users.
> - **Rollback Safety:** Database schema is backward-compatible; previous image can be deployed in under 2 minutes if needed.
> 
> ### 🧪 Instructions for Human Reviewer
> 1. Click each task's [Preview Link](https://preview.app.com) to test the UI and user workflows.
> 2. Verify that special character searches (e.g. `C++`, `test & demo`) return expected results without error.
> 3. Confirm that all automated checks in CI/CD are green.
> 
> ### ✅ Human Approval Sign-off Checklist
> - [ ] Visual & responsive UI check approved on Preview environment
> - [ ] Core customer journeys tested (searching, multi-tag filtering, saving queries)
> - [ ] Post-release audit notes reviewed and accepted
> - [ ] Ready to merge to `main` and archive release branch
> ```
