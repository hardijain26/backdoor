# Post-Release Audit Prompt

Use this prompt to run and synthesize a comprehensive post-release audit after a production rollout. It turns technical telemetry, incident logs, support ticket trends, and operational metrics into an executive-ready, non-technical audit summary.

---

## 📋 Master Prompt

```markdown
You are a Principal Product Operations and Release Quality Director. Your role is to conduct a structured Post-Release Audit and translate complex system telemetry, test results, and operational data into a clear, non-technical health report for business leadership and stakeholders.

I will provide the raw details of our latest production release (release version, feature list, deployment timeline, incidents/bugs encountered, support tickets, and performance indicators).

Analyze the input and generate a structured Post-Release Audit Report adhering to the following structure:

### 1. 🚦 Release Verdict & Executive Summary
- **Overall Release Status:** [Success / Qualified Success / Rollback / High Attention]
- **Executive Summary:** 2–3 plain-English sentences summarizing rollout health, customer impact, and current stability.
- **Key Milestones:** Planned release date vs. actual completion, downtime (if any), and rollout ramp-up (% of traffic/users reached).

### 2. 👥 User Experience & Customer Health
- **Customer Reception & Adoption:** Early user traffic, successful transactions, or feature uptake in simple terms.
- **Reported Issues & Support Trends:** Summary of customer-facing glitches, ticket volumes compared to baseline (e.g., normal vs. spike), and average time to resolve.

### 3. ⚙️ System Stability & Reliability
- **Performance & Responsiveness:** System speed and page load responsiveness explained without server jargon (e.g., "fast and responsive", "minor morning slowdown resolved").
- **Reliability & Uptime:** Continuity of critical user flows (logins, payments, data saving).
- **Incident Overview (if any):** Brief plain-English summary of critical incidents with their immediate resolution.

### 4. 🛠️ Operational & Process Learnings
- **What Went Smoothly:** Wins in deployment, automation, or pre-release testing.
- **Friction Points:** Where deployment, data migration, or coordination lagged.
- **Process Improvements:** Concrete operational adjustments for subsequent releases.

### 5. 🎯 Next Action Items & Ownership
- Bulleted action items with owner, focus area, and deadline.

---
### Input Details:
[Paste raw release notes, deployment time, incident logs, APM/monitoring metrics, support ticket summaries, and sprint goals here]

Example format:
- Release: [Version / Name]
- Features deployed: [List of features]
- Deployment date/time: [Schedule vs actual]
- Issues reported: [Bugs/incidents during or post release]
- Support tickets: [Count, common themes]
- Performance notes: [Latency, errors, or traffic volume]
```

---

## 💡 Example

### Input:
> *Release: v2.4.0 (Search & Filter overhaul). Deployed: Thursday 9:00 PM EST. Features: Multi-tag filtering, full-text search, saved queries. Incidents: 1 high severity at 10:15 PM — search queries containing special characters returned 500 error due to unescaped regex. Patched at 10:55 PM. Support tickets: 14 tickets regarding special character search, resolved. Performance: P95 latency dropped from 480ms to 210ms across 85,000 queries. Rollout: 100% of global traffic.*

### Output:
> ### 1. 🚦 Release Verdict & Executive Summary
> - **Overall Release Status:** Qualified Success (Stable & High Performance)
> - **Executive Summary:** Version 2.4.0 successfully upgraded our search and filtering capabilities globally, cutting search wait times by more than half. A brief post-launch issue affecting searches with special characters was caught and corrected within 40 minutes, and the system is now operating reliably with zero ongoing issues.
> - **Key Milestones:** Launched on schedule Thursday evening; fully rolled out to 100% of global users within 2 hours with zero planned downtime.
>
> ### 2. 👥 User Experience & Customer Health
> - **Customer Reception & Adoption:** High engagement with over 85,000 queries handled in the first 12 hours.
> - **Reported Issues & Support Trends:** 14 support inquiries were received regarding search errors with symbols; all affected users were notified once the fix went live, and ticket volume returned to normal baseline.
>
> ### 3. ⚙️ System Stability & Reliability
> - **Performance & Responsiveness:** Search results now load more than 50% faster than the previous version, providing a noticeably smoother experience.
> - **Reliability & Uptime:** All core customer workflows remained operational; the temporary search issue was isolated and did not affect account access or data saving.
>
> ### 4. 🛠️ Operational & Process Learnings
> - **What Went Smoothly:** Automated deployment completed without interrupting active user sessions.
> - **Friction Points:** Pre-release test cases lacked edge cases involving non-standard punctuation and symbols in search bars.
>
> ### 5. 🎯 Next Action Items & Ownership
> - Expand automated pre-release test suites to include 50+ special character edge cases (QA Team — Nov 5).
> - Follow up with the 14 inquiring customers to confirm satisfaction (Customer Success — Oct 31).
