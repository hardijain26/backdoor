# Release Notes Prompt

Use this prompt to generate clear, customer-friendly, and value-driven Release Notes from raw git commit logs, merged pull requests, or sprint tickets.

---

## 📋 Master Prompt

```markdown
You are a Principal Product Marketing Manager and Lead Technical Communicator. Your goal is to transform technical commit logs, pull request titles, and engineering tickets into engaging, professional, and customer-centric Release Notes.

I will provide the raw release details (commit log, closed PRs, feature bullet points, bug fixes, version number, and preview links).

Generate a complete Release Notes document formatted according to this structure:

---

# 🚀 What's New in [App Name] [Version / Release Name]
*Released on [Date] • [Build / Commit Short Hash]*

### 🌟 Release Highlights
[A 2–3 sentence executive summary explaining the primary user value delivered in this release — focus on speed, simplicity, or newly unlocked capabilities.]

---

### ✨ New Features & Enhancements
For each major feature or improvement:
- **[Feature Name]**
  - **What it does:** Plain-English description of the feature and what problem it solves.
  - **Why it matters to you:** The practical benefit (e.g., saves time, eliminates manual steps, clearer insights).
  - **How to try it:** Brief instruction on where to find it in the UI with a clickable link: [Try [Feature Name]](https://preview-or-prod-url).

---

### 🛠️ Improvements & Performance Polish
- **[Area]:** [Brief description of speed, reliability, visual refinements, or responsive design polish.]
- **[Area]:** [Brief description of workflow streamline.]

---

### 🐞 Resolved Issues & Bug Fixes
Translate raw bug reports into reassuring customer-focused fixes:
- **[Feature / Screen]:** [What was happening and how it is now corrected in simple terms.]
- **[Feature / Screen]:** [What was happening and how it is now corrected in simple terms.]

---

### 🔮 What's Coming Next
- A teaser of 1–2 upcoming features in development so customers and stakeholders know what to anticipate.

---

### 💬 We’d Love Your Feedback
- A short closing invitation encouraging users to report any feedback or reach out to support.

---
### Input Details:
[Paste your raw git log, closed PR titles, Jira ticket numbers, release tags, and staging/preview links here]

Example format:
- Version: [e.g., v1.4.0]
- Date: [e.g., October 30, 2026]
- Commits / PRs:
  - feat: add keyboard navigation j/k in job feed table (#12)
  - fix: prevent CORS error on public dossier exports (#14)
  - perf: index company canonical titles to speed up search (#15)
- Preview URL: [https://preview.app.com]
```

---

## 💡 Example

### Input:
> *Version: v1.1.0*
> *Commits:*
> *- `feat(feed): implement j/k keyboard shortcuts for dense table navigation (#12)`*
> *- `feat(ui): add precision cobalt status badge token (#13)`*
> *- `fix(dossier): resolve missing company location for remote postings (#14)`*
> *- `perf(db): add composite index on role_canonical and match_score (#15)`*
> *Preview URL: https://backdoor.app/jobs*

### Output:

> # 🚀 What's New in Backdoor v1.1.0
> *Released on October 30, 2026 • Build `0b13c56`*
>
> ### 🌟 Release Highlights
> This update introduces lightning-fast keyboard navigation across your job feeds and refines company location tracking for remote opportunities. Reviewing your radar is now quicker, smoother, and keyboard-friendly.
>
> ---
>
> ### ✨ New Features & Enhancements
> - **Keyboard Quick Navigation (`J` / `K`)**
>   - **What it does:** You can now move up and down through job listings effortlessly using the `J` and `K` keys on your keyboard, just like in your favorite developer tools.
>   - **Why it matters to you:** Browse through dozens of opportunities in seconds without needing to switch between your keyboard and trackpad.
>   - **How to try it:** Open the [Job Feed](https://backdoor.app/jobs) and press `J` to start browsing.
>
> ---
>
> ### 🛠️ Improvements & Performance Polish
> - **Search & Feed Speed:** Optimized internal catalog indexing, resulting in instant feed loading even with thousands of active roles.
> - **Visual Clarity:** Updated our high-contrast status badges to make top-tier recommendations stand out at a glance.
>
> ---
>
> ### 🐞 Resolved Issues
> - **Remote Opportunity Locations:** Resolved an issue where some fully remote postings displayed blank location tags. All remote opportunities now clearly display their geographic boundaries.
>
> ---
>
> ### 🔮 What's Coming Next
> - One-click export of verified hiring manager dossiers directly into your outreach queue.
>
> ---
>
> ### 💬 We’d Love Your Feedback
> Have thoughts on our new keyboard shortcuts? Click **Feedback** in the bottom navigation bar or reply to this update.
