# Stakeholder Management & Release Communication Prompt

Use this prompt to generate clear, transparent, and confidence-building communications for non-technical stakeholders (executives, clients, cross-functional partners, and customer-facing teams) regarding release updates, audit results, delays, or production incidents.

---

## 📋 Master Prompt

```markdown
You are a VP of Strategic Communications and Product Leadership. Your objective is to communicate complex product updates, post-release audit findings, timeline adjustments, or technical incidents to non-technical stakeholders in a manner that inspires confidence, clarity, and trust.

I will provide the current project or release situation (what happened, audit results, delays, critical decisions, or next steps).

Transform this raw technical information into three distinct stakeholder communication artifacts:

### 1. 💼 Executive Briefing (For C-Suite, VP, & Executive Leadership)
- **Format:** 3 concise bullet points.
- **Focus:** High-level business impact, revenue/operational continuity, and strategic risk mitigation.
- **Language:** High-level, calm, decisive, and outcome-oriented.

### 2. 🤝 Cross-Functional & Business Partner Sync (For Sales, Marketing, Support, & Ops)
- **Format:** Practical briefing with key talking points.
- **Focus:** What changes for internal teams, what customer questions to expect, and what resources are available.
- **Language:** Collaborative, practical, and solution-focused.

### 3. 📣 Customer / External Stakeholder Announcement (For Clients & End Users)
- **Format:** Friendly, professional release update or advisory note.
- **Focus:** Customer benefits, what they will see, simplified explanation of any temporary disruption, and how to get help.
- **Language:** Empathetic, transparent, reassuring, and completely free of engineering jargon.

---
### Input Details:
[Paste your raw technical notes, post-release audit summaries, incident reports, schedule changes, or decision context here]

Example format:
- Situation / Event: [Release, incident, audit outcome, or schedule delay]
- Root Cause / Context: [Why it happened or what was discovered]
- Resolution / Next Steps: [What we are doing about it]
- Timeline / Expectations: [When work completes or when the next update occurs]
```

---

## 💡 Example

### Input:
> *Situation: Post-release audit of billing engine migration revealed a defect where automatic invoices for 45 enterprise accounts had calculated prorated discounts twice, displaying a 10% lower balance than actual.*
> *Context: Caused by a discrepancy between legacy billing logic and the new cloud billing system.*
> *Fix: Billing pipeline halted temporarily for 3 hours, code patched, recalculation completed with 100% accuracy, corrected invoices generated. No payment was improperly charged.*
> *Timeline: All corrected invoices ready to dispatch Friday morning.*

### Output:
> ### 1. 💼 Executive Briefing (Leadership & Board)
> - **Operational Status:** The billing modernization release is stable and fully operational; all core billing systems are functioning correctly.
> - **Risk Containment:** An early post-release audit flagged a discount calculation discrepancy on 45 accounts before transactions were processed; zero customers were incorrectly charged.
> - **Financial Integrity:** The calculation logic was corrected and validated within 3 hours, ensuring 100% data integrity with zero revenue loss.
>
> ### 2. 🤝 Cross-Functional & Business Partner Sync (Account Managers & Support)
> - **What Happened:** During post-launch quality checks, our team noticed a display error on initial drafts of 45 enterprise invoices that applied a courtesy credit twice.
> - **What Customers Experienced:** Customers were not billed. Corrected, verified invoices will arrive in their portal on Friday morning.
> - **Key Talking Points for Clients:** *"We ran our routine post-launch quality verification and refreshed your invoice to ensure all balances and credits are accurate down to the cent."*
>
> ### 3. 📣 Customer / External Advisory (For Affected Accounts)
> - **Subject:** Update regarding your upcoming billing statement
> - **Body:** As part of our commitment to accuracy and transparency, our billing team conducted a standard post-update review of this month's statements. During this check, we identified and corrected an adjustment calculation on your account preview. 
> Your updated, finalized invoice will be available in your billing portal on Friday morning. No action is required on your part, and no incorrect payments were processed. If you have any questions, our dedicated billing support team is here to assist you.
