# Solo Full-Stack PM Master Release & Audit Prompt

Designed specifically for **solo founders, independent full-stack engineers, and 1-person product companies**. 

When you wear all the hats (Engineering, QA, Product, Docs, and Client Relations), this prompt acts as your **AI Chief of Staff and Release Quality Partner**. You paste your rough commit notes once, and it handles the entire post-release lifecycle for you.

---

## 📋 The Solo PM Master Prompt

```markdown
You are my Lead QA Director, Technical Writer, and Client Communications Partner. I am a solo full-stack founder and product manager. I just shipped a new release to production.

I will provide my raw git commits, rough bug notes, tickets closed, and preview URLs. 

From this single input, generate a complete, publication-ready Solo Release Package containing the following 5 sections:

---

### 1. 🔍 Solo Verification & Preview Checklist (For Me)
A fast, scannable table so I can test and self-verify my deployment in 3 minutes:
| Task / Feature | Preview URL | What to Click / Test | Self-Signoff |
| :--- | :--- | :--- | :--- |
| [Feature Name] | [Preview Link] | [1-sentence exact test action] | [ ] Verified |

---

### 2. 🐞 Bug Post-Mortems (Plain-English & Blame-Free)
If any bugs or glitches occurred during or right after deployment, write a non-technical summary ready to paste to clients or users:
- **What Happened:** [Customer symptom in simple terms]
- **Why It Happened:** [Simple root cause — no complex tech jargon]
- **How I Fixed It:** [The fix in business terms]
- **Permanent Guardrail:** [Automated test or check added so it never happens again]

---

### 3. 📘 5-Minute Doc Update Checklist (Preventing Doc Drift)
Tell me exactly what documentation or README files I need to update so my guides don't get out of sync with my code:
- **Doc File / Section to Edit:** [e.g., README.md, User Guide, API docs]
- **Exact Line / Concept to Change:** [What needs to be added, modified, or removed]

---

### 4. 🚀 Customer-Facing Release Notes
A clean, friendly, value-focused changelog ready to publish to users, clients, or product channels:
- **Title:** What's New in [Version / App Name]
- **Highlights:** 2 sentences on the primary benefit delivered (saved time, speed, new superpower).
- **Key Enhancements:** 2–3 bullet points with clickable links to the live features.
- **Bug Fixes:** Clear, reassuring notes explaining resolved issues.

---

### 5. 💬 Ready-to-Send Chat & Client Updates
Copy-paste messages ready to send right now:
- **Quick Chat / Slack / Discord message:** (Short, energetic, 3 bullets with preview link).
- **Client / Investor Email:** (Professional, reassuring, highlighting stability and continuous delivery).

---
### Input Details:
[Paste your raw git commit logs, feature changes, resolved bugs, and preview/production URLs here]

Example format:
- Version: [e.g., v1.2.0]
- Commits / Changes:
  - added keyboard shortcuts j/k on table
  - fixed CORS issue on dossier export
  - updated database schema for company locations
- Preview / App URL: [https://myapp.com]
- Known bugs / edge cases: [e.g., momentary 500 error on special characters, patched in 15 mins]
```

---

## 💡 Example

### Input:
> *Version: v1.1.0*  
> *Commits: added j/k navigation to job table; fixed remote jobs missing location badge; added database index to speed up match scoring.*  
> *Preview URL: https://backdoor.app/jobs*  
> *Bug: remote postings were briefly showing blank locations because the frontend expected an array but received null for older records. Patched with fallback empty array.*

### Output:

> ### 1. 🔍 Solo Verification & Preview Checklist (For Me)
> | Task / Feature | Preview URL | What to Click / Test | Self-Signoff |
> | :--- | :--- | :--- | :--- |
> | **Keyboard Navigation** | [backdoor.app/jobs](https://backdoor.app/jobs) | Click into table and press `J` then `K` to move through rows | [ ] Verified |
> | **Remote Job Locations** | [backdoor.app/jobs](https://backdoor.app/jobs) | Check remote jobs to ensure `Remote` badge appears | [ ] Verified |
> | **Search Speed** | [backdoor.app/jobs](https://backdoor.app/jobs) | Filter by match score and ensure table renders instantly | [ ] Verified |
>
> ---
>
> ### 2. 🐞 Bug Post-Mortem (Plain-English & Blame-Free)
> #### 🏷️ Remote Location Display Glitch
> - **What Happened:** For a brief window, some remote job listings displayed a blank location tag instead of the "Remote" label.
> - **Why It Happened:** Older job listings in our database were formatted slightly differently than newly imported ones, causing the screen to skip displaying the tag.
> - **How I Fixed It:** Updated the display logic so both older and newer listings automatically default to a clean "Remote" badge.
> - **Permanent Guardrail:** Added a fallback check and automated unit test covering legacy job data formats.
>
> ---
>
> ### 3. 📘 5-Minute Doc Update Checklist
> - **`README.md` or `docs/navigation_flow.md`:** Add a note under user controls: *"Press J / K to navigate rows in the dense job table."*
> - **User Guide / FAQ:** Remove any note advising users that remote listings don't display regions.
>
> ---
>
> ### 4. 🚀 Customer-Facing Release Notes
> # 🚀 What's New in Backdoor v1.1.0
> *Lightning-fast keyboard browsing and clearer job details.*
> 
> ### Highlights
> You can now navigate your entire job feed without ever touching your mouse, and remote job details are now crystal clear.
> 
> ### Key Enhancements
> - **`J` / `K` Keyboard Shortcuts:** Press `J` to move down and `K` to move up in the [Job Feed](https://backdoor.app/jobs).
> - **Faster Filtering:** Searches and ranking calculations now load instantly, even across thousands of opportunities.
> - **Clear Remote Tags:** Every remote opportunity now clearly indicates its location and boundaries.
> 
> ---
>
> ### 5. 💬 Ready-to-Send Chat & Client Updates
> 
> #### 📱 Quick Chat / Slack Update (Copy & Paste)
> > 🚀 **Shipped Backdoor v1.1.0 to production!**
> > • Added `J`/`K` keyboard navigation for quick table browsing
> > • Instant search loading and performance polish
> > • Fixed location tags on remote opportunities
> > 🔗 Test it live: https://backdoor.app/jobs
>
> #### ✉️ Client / Stakeholder Email (Copy & Paste)
> > **Subject:** Product Update: Faster navigation and refined job tracking in Backdoor
> >
> > Hi [Name],
> >
> > I’ve just released update v1.1.0 to production. This update focuses on speed and daily usability:
> >
> > 1. **Keyboard-First Browsing:** You can now jump through job feeds instantly using your keyboard (`J`/`K`).
> > 2. **Instant Performance:** Feed filtering is now significantly faster.
> > 3. **Data Accuracy:** Remote job listings now accurately highlight location boundaries.
> >
> > All systems are verified and running smoothly. You can test the latest version here: https://backdoor.app/jobs
> >
> > Best regards,  
> > [Your Name]
