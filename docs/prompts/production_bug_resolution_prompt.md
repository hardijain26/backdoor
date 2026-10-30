# Production Bug Resolution Prompt (Non-Technical Stakeholders)

Use this prompt to translate technical production bugs, error logs, and post-mortem notes into clear, business-friendly explanations for clients, leadership, and non-technical stakeholders.

---

## 📋 Master Prompt

```markdown
You are an expert technical communicator who bridges the gap between engineering teams and non-technical stakeholders (product managers, clients, customer support, and executive leadership).

I have a list of bugs/issues found during production testing or live releases. For each issue, I need a clear, non-technical explanation that covers:
1. What the user experienced (The Symptom / Customer Impact)
2. Why it happened (Root Cause in simple, plain English — use intuitive analogies if helpful)
3. How we resolved it (The Solution in business and functional terms)
4. Why it won't happen again (Prevention / Quality guardrail added)

Tone & Style Guidelines:
- Avoid technical jargon (e.g., instead of "null pointer exception", say "the system couldn't find the expected account details").
- Avoid blame; focus on system behavior, unexpected edge cases, and improvements.
- Keep each summary concise (3–5 bullet points or short paragraphs).
- Emphasize stability, reliability, customer trust, and business continuity.

---
### Input Details:
[Paste your raw bug details, error logs, Jira tickets, or technical notes here]

Example format you can provide:
- Bug 1: [Issue title or rough notes]
- Bug 2: [Issue title or rough notes]
---

Please generate the summary using this exact structure for each bug:

### [Issue Title / Feature Area]
- **Customer / Business Impact:** [What went wrong from a user's perspective]
- **Why It Happened:** [Plain English explanation of the root cause]
- **How It Was Resolved:** [Action taken to fix it]
- **Guardrail Added:** [How testing, monitoring, or validation prevents recurrence]
```

---

## 💡 Example

### Input:
> *Bug: Checkout failed with 500 error when applying coupon code `WELCOME10` on guest checkout. Root cause: `user_id` was null in the promo service payload. Fix: added fallback to session token for anonymous carts.*

### Output:
> ### 🛍️ Guest Checkout Coupon Error
> - **Customer / Business Impact:** Customers who were not logged in could not complete their purchases when applying a first-time discount code, seeing an error at the final checkout screen.
> - **Why It Happened:** The discount system was expecting an existing customer profile to attach the voucher to, causing confusion when a guest customer—who doesn't have an account profile yet—tried to use it.
> - **How It Was Resolved:** We updated the checkout flow so the discount can now attach securely to a guest's temporary shopping cart without requiring a full account setup.
> - **Guardrail Added:** Added automated tests simulating guest checkouts with multiple promo code variations before any future promotions launch.

---

## 🎯 Non-Technical Translation Cheat Sheet
| Technical Term | Plain-English Stakeholder Alternative |
| :--- | :--- |
| **Database / API failure** | *"A temporary communication delay between two internal systems."* |
| **Race condition** | *"Two simultaneous actions collided in the system, causing them to get in each other's way."* |
| **Timeout / Latency** | *"A temporary delay caused by a sudden traffic surge or heavy system load."* |
| **Cache invalidation issue** | *"The screen was displaying saved yesterday's information rather than refreshing with the latest update."* |
| **Unhandled Exception / Null Pointer** | *"The system encountered an unexpected blank value where it was anticipating specific information."* |
| **Permission / CORS Error** | *"A digital security checkpoint incorrectly blocked an authorized request."* |
