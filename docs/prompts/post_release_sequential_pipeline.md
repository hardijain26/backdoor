# Sequential Post-Release Pipeline Prompt

This prompt is a **sequential execution pipeline** designed for solo full-stack product managers. Instead of guessing what to do next, it executes a strict, ordered chain of post-release activities where each stage feeds into the next.

---

## 🚦 Pipeline Overview

```
[PR Merged & Live]
       │
       ▼
[Task 1: Production & Task Audit] ──► (Generates verification checklist & preview checks)
       │
       ▼
[Task 2: Documentation Audit]     ──► (Flags outdated guides & dead UI links)
       │
       ▼
[Task 3: Bug & Drift Resolution]  ──► (Translates glitches into plain-English root causes)
       │
       ▼
[Task 4: Release Notes]           ──► (Produces customer-friendly changelog)
       │
       ▼
[Task 5: Stakeholder Broadcast]   ──► (Generates 1-click updates for chat, email, & clients)
```

---

## 📋 The Master Sequential Orchestrator Prompt

```markdown
You are my Solo Full-Stack Release Orchestrator and Quality Partner. A pull request has just been merged and deployed live to production. 

Execute the following 5 tasks in strict sequential order. Complete each task thoroughly before proceeding to the next.

---

### 🚀 INPUT DATA FOR THIS RELEASE:
- **PR Title / Version:** {{PR_TITLE}}
- **Merged PR URL / Number:** {{PR_URL}}
- **Commit History & Changes:** 
{{COMMIT_LOG}}
- **Production / Preview URL:** {{PREVIEW_URL}}
- **Known issues / Glitches during deploy (if any):** {{INCIDENTS}}

---

## ⚡ TASK 1: PRODUCTION DEPLOYMENT & TASK AUDIT
Run this prompt first to verify deliverables and customer impact:

"Audit every task shipped in this PR. Output a self-verification table for me:
1. Table Columns: | Task Name | Status (Completed/Partial) | Exact Test Step on Preview URL | Self-Verification [ ] |
2. Operational Stability: In 2 sentences, summarize rollout health, downtime (if any), and system responsiveness in non-technical terms.
3. Attention Flags: List any partial deliverable that needs follow-up in the next PR."

---

## ⚡ TASK 2: DOCUMENTATION SYNCHRONIZATION AUDIT
Using the output from Task 1, run this prompt to prevent documentation rot:

"Inspect our project guides (README, user walkthroughs, setup playbooks, or API docs) against the changes deployed in Task 1.
1. Identification: Name specific documents and sections that are now outdated or misleading due to these changes.
2. Exact Changes: For each outdated section, provide the exact wording or step that must be replaced.
3. Cleanup: List any deprecated screenshots, retired buttons, or dead links to delete."

---

## ⚡ TASK 3: NON-TECHNICAL BUG & INCIDENT RESOLUTION
If any glitches, errors, or unexpected edge cases occurred during or after deploy:

"Translate any issues into a plain-English, customer-ready explanation using this 4-part structure:
- Customer Symptom: What did the user see or experience?
- Why It Happened: Root cause in simple English without technical jargon or blame.
- How We Resolved It: The fix in functional business terms.
- Permanent Guardrail: The automated test or verification check added so it cannot happen again.
(If zero bugs occurred, output: '✅ Deployment clean: Zero customer disruptions or regressions.')"

---

## ⚡ TASK 4: VALUE-DRIVEN RELEASE NOTES
Using the verified deliverables from Task 1 and resolved items from Task 3:

"Generate engaging, customer-facing release notes formatted as:
- Header: 🚀 What's New in [App Name] [Version]
- Executive Highlight: 2 sentences on the primary user superpower or speed boost unlocked.
- New Capabilities: Bullet points with clickable links to the live features on {{PREVIEW_URL}}.
- Polish & Fixes: Reassuring summary of performance improvements and bug fixes.
- Next Up: 1-line preview of the next milestone."

---

## ⚡ TASK 5: 3-TIER STAKEHOLDER BROADCAST
Using the release notes from Task 4, produce 3 copy-paste ready communication artifacts:

1. 📱 Internal / Team Chat (Slack/Discord): 3 bullet points with direct preview link.
2. ✉️ Client / External User Update: Friendly, reassuring update emphasizing continuous delivery and reliability.
3. 💼 Executive / Investor One-Liner: High-level metric and milestone progress summary.
```
