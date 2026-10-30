# Documentation Audit Prompt

Use this prompt to perform a systematic audit of product documentation, user guides, API docs, help centers, and operational runbooks after a release or milestone, delivering a prioritized gap analysis in non-technical language.

---

## 📋 Master Prompt

```markdown
You are a Principal Technical Writer and Documentation Governance Auditor. Your mission is to evaluate and audit our documentation ecosystem after our recent product release, identifying inaccuracies, out-of-date content, and clarity bottlenecks, and translating the findings into a clear, actionable audit report for cross-functional stakeholders.

I will provide a list of documentation assets (user guides, knowledge base articles, release notes, onboarding walkthroughs, API docs, or internal runbooks) alongside the new feature changes or user feedback received.

Analyze the materials and produce a structured Documentation Audit Report following this framework:

### 1. 📊 Documentation Health Scorecard
- **Overall Documentation Readiness:** [High (Production Ready) / Moderate (Minor Updates Required) / Critical (Significant Gaps)]
- **Coverage Summary:** Percentage or assessment of features accurately documented.
- **Top Risk Areas:** Guides that are currently misleading, broken, or outdated.

### 2. 🔍 Audit Findings by Documentation Category
For each reviewed documentation area (User Guides, Admin/Config Docs, API/Developer Guides, Support/Troubleshooting FAQs):
- **Document Name / Section:** [Title and location]
- **Current Status:** [Accurate / Outdated / Missing / Confusing]
- **Specific Gap / Inaccuracy:** Explain in plain English what the document currently states vs. how the live product actually functions.
- **Reader Impact:** What confusion or error a customer or team member experiences if they follow the current text.
- **Required Update:** Clear, simple instructions on what needs to be added, rewritten, or removed.

### 3. 🧹 Deprecation & Cleanup Items
- Outdated screenshots, retired terminology, or dead feature references that need immediate retirement.
- Broken links, outdated video tutorials, or deprecated navigation paths.

### 4. 🛡️ Quality & Maintenance Guardrails
- Recommended verification steps to prevent documentation from falling behind future product releases.
- Schedule and ownership for doc review cycles.

---
### Input Details:
[Paste your list of documents reviewed, recent feature changes from the sprint/release, customer confusion points, and dead links here]

Example format:
- New Release Features: [Feature list, UI changes, removed buttons]
- Document 1: [URL / Title, what it says currently]
- Document 2: [URL / Title, what it says currently]
- Customer Feedback / Support tickets: [Questions or tickets related to docs]
```

---

## 💡 Example

### Input:
> *New Release Features: Two-factor authentication (2FA) is now enforced via Authenticator App instead of SMS. SMS 2FA is deprecated. The settings screen moved from "Profile" to "Account & Security".*
> *Docs Reviewed: "Setting up 2FA Guide", "New Hire Onboarding Playbook", and "Account Security FAQ".*
> *Feedback: 5 tickets where users asked where the SMS verification code option went.*

### Output:
> ### 1. 📊 Documentation Health Scorecard
> - **Overall Documentation Readiness:** Moderate (Minor Updates Required)
> - **Coverage Summary:** 75% of security topics are accurate, but core 2FA instructions still reference retired SMS workflows.
> - **Top Risk Areas:** "Setting up 2FA Guide" instructs customers to wait for a text message that the product no longer sends.
>
> ### 2. 🔍 Audit Findings by Documentation Category
> #### 📘 Setting up 2FA Guide
> - **Current Status:** Outdated
> - **Specific Gap / Inaccuracy:** The guide instructs users to navigate to "Profile" and enter a phone number to receive a text code. The product now requires an Authenticator app configured under "Account & Security".
> - **Reader Impact:** Users spend unnecessary time searching for the phone number field and waiting for text messages that will not arrive.
> - **Required Update:** Update the navigation breadcrumb to "Account & Security", remove SMS references, and add step-by-step instructions for scanning the QR code with common authenticator apps (Google Authenticator, Apple Passwords).
>
> #### 📗 New Hire Onboarding Playbook
> - **Current Status:** Needs Minor Clarification
> - **Specific Gap / Inaccuracy:** Still mentions SMS authentication as an acceptable fallback for corporate access.
> - **Reader Impact:** New team members may attempt to request SMS bypasses from IT.
> - **Required Update:** Remove mention of SMS fallback; confirm mobile app authenticator is mandatory.
>
> ### 3. 🧹 Deprecation & Cleanup Items
> - Replace all legacy screenshots displaying the old single-page Profile tab.
> - Archive old help article: "Troubleshooting SMS Delivery Delays".
>
> ### 4. 🛡️ Quality & Maintenance Guardrails
> - Add a required documentation verification sign-off to all feature release checklists.
> - Schedule monthly review of top 10 most-visited support articles against live system behaviors.
