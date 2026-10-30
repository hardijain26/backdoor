# Documentation Issue & Resolution Prompt (Non-Technical Stakeholders)

Use this prompt to explain documentation issues, inaccuracies, gaps, or reader confusion to non-technical stakeholders, clients, or cross-functional team members in simple, transparent language.

---

## 📋 Master Prompt for Documentation Issues

```markdown
You are an expert technical writer and communicator who explains documentation gaps, user guides, and knowledge-base issues to non-technical stakeholders (product managers, customer support leads, clients, and executive leadership).

I have a list of documentation bugs, inaccuracies, gaps, or user complaints about our documentation (guides, knowledge base, FAQs, API documentation, or onboarding runbooks). 

For each documentation issue, generate a clear, non-technical explanation that covers:
1. What the Reader/Customer Experienced (The Confusion / Disruption)
2. Why the Documentation Was Inaccurate or Unclear (Root Cause in plain English — e.g., product updates outpaced docs, assumed technical background, ambiguous steps)
3. How We Corrected & Clarified It (The Documentation Solution in simple terms)
4. Guardrail Added (How we ensure documentation stays synchronized and accurate going forward)

Tone & Style Guidelines:
- Avoid blaming authors or engineers; frame issues as natural product evolution, clarity bottlenecks, or doc-to-code synchronization gaps.
- Avoid technical jargon (e.g., instead of "endpoint parameter schema mismatch", say "the guide listed an outdated field name that the system no longer recognized").
- Emphasize self-service enablement, customer confidence, and clarity.
- Keep each summary concise (3–5 bullet points).

---
### Input Details:
[Paste your raw documentation notes, user feedback tickets, stale doc links, or internal ticket descriptions here]

Example format you can provide:
- Doc Issue 1: [Issue title or rough notes]
- Doc Issue 2: [Issue title or rough notes]
---

Please generate the summary using this exact structure for each documentation issue:

### [Documentation Area / Guide Name]
- **Reader Impact & Confusion:** [What went wrong or confused the reader when following the guide]
- **Why It Happened:** [Plain-English explanation of why the documentation was missing, outdated, or confusing]
- **How It Was Clarified:** [What changes were made to the documentation to resolve the issue]
- **Guardrail Added:** [What process or check was instituted to keep this content accurate]
```

---

## 💡 Example

### Input:
> *Issue: Users complained that onboarding guide step 4 references a "Generate API Key" button that doesn't exist anymore after the auth redesign. Root cause: UI was moved to "Team Settings > Security" last month, doc was never updated. Fix: Updated guide with new navigation path and new screenshots. Added doc-review step to feature release checklist.*

### Output:
> ### 📘 Onboarding Guide: API Key Creation
> - **Reader Impact & Confusion:** New customers were getting stuck during initial setup because the step-by-step instructions pointed to a button that was no longer where the guide described it.
> - **Why It Happened:** Our recent security redesign organized account controls into a new dedicated Security tab, but the user setup guide was still describing the previous screen layout.
> - **How It Was Clarified:** We updated the tutorial with the new step-by-step navigation path, fresh screenshots highlighting the exact location, and a quick-tip box for immediate visual guidance.
> - **Guardrail Added:** A "documentation verification" step is now required before closing any user interface redesign tickets, preventing the guides from falling behind product changes.

---

## 🎯 Documentation Translation Cheat Sheet
| Technical / Doc Term | Plain-English Stakeholder Alternative |
| :--- | :--- |
| **Documentation drift / Stale docs** | *"The instructions lagged behind recent product improvements."* |
| **Missing prerequisites** | *"The guide skipped an essential preliminary step that first-time users needed."* |
| **Terminology mismatch** | *"The guide used internal company jargon instead of the simple words users see on their screens."* |
| **Broken link / 404** | *"A helpful reference link was pointing to a retired web page."* |
| **Ambiguous instructions** | *"A step could be interpreted in more than one way, causing readers to take an unintended path."* |
| **Deprecation notice missing** | *"The guide didn't clearly signal that an older feature had been replaced by a newer, faster method."* |
