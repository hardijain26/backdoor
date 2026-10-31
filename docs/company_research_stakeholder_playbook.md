# How to Have a Conversation with Different Kinds of People: The 0–30–60–90 Day Value Blueprint

**Document Title:** The Stakeholder Conversation Playbook & Dual-Track Blueprint  
**Subsystem:** Module 5 (`@intel/teardown`) Candidate Strategy Guide  
**Target Roles:** Universal (All 11 Functional Archetypes)  
**Version:** 2.0.0 (Comprehensive Master Edition)  

---

## 1. The Core Philosophy: The "Problem-First" Principle

Most candidates interview from a position of deference:
> *"Here is my resume. Please like me. Tell me what this role does."*

A **High-Value Business Problem Solver** leads with empathy for the company's real operational pain:
> *"I noticed your recent feature rollout is experiencing a 28% drop-off on G2 and Reddit due to data export timeouts. Here is the 0–30–60–90 day execution plan I built to fix that."*

When you lead with **their problem**, the interview ceases to be an interrogation of your past and becomes a **collaborative working session on their future**.

---

## 2. The Universal Dual-Track 30–60–90 Day Framework

Instead of prescribing a single rigid roadmap, high-value candidates present a **Dual-Track Menu of Options**. This proves strategic maturity: you acknowledge that you don't know internal constraints yet, and invite the manager to choose the track that fits their quarterly OKRs:

```
┌────────────────────────────────────────────────────────────────────────┐
│ THE DUAL-TRACK 30-60-90 DAY ENGINE                                     │
├────────────────────────────────────────────────────────────────────────┤
│ DAYS 0–30: THE AUDIT & LISTENING HORIZON (Common to both tracks)       │
│ • Audit top 10 customer escalations + interview 5 cross-functional leads│
├────────────────────────────────────────────────────────────────────────┤
│ DAYS 30–60: THE DIVERGENT MULTIPLIER HORIZON                           │
│ • Track A (Velocity Path): Deploy immediate tactical patch / playbook  │
│ • Track B (Scalability Path): Refactor core data model / process flow  │
├────────────────────────────────────────────────────────────────────────┤
│ DAYS 60–90: THE STRATEGIC IMPACT HORIZON                               │
│ • Track A (Velocity Path): Harvest quick-win departmental KPI uplift   │
│ • Track B (Scalability Path): Package new scalable asset / enterprise tier│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The 5 Stakeholder Conversation Playbooks

Every person in an interview loop has a different incentive, fear, and day-to-day pressure. Tailor your conversation to their specific reality:

---

### Playbook 1: The Recruiter / Talent Partner (The Gatekeeper)

* **Their Secret Fear:** Passing a weak candidate to the hiring manager and getting reprimanded for wasting executive time.
* **Their Currency:** Domain fit, role alignment, and knowing the candidate won't fail the technical screen.
* **The Goal:** Bypass the ATS black hole and secure an immediate screening interview.

#### The 90-Second Pain-Point Cold Pitch
> **Subject:** Solution to [Company]’s [Specific Customer Pain Point] – [Candidate Role]
> 
> *"Hi [Recruiter Name],*
> 
> *I saw you are leading the search for the [Role Title] position. Looking through recent user feedback on [G2 / App Store], a recurring challenge users are flagging is **[Specific Friction: e.g., onboarding setup taking 3+ weeks]**, which directly impacts Day-30 retention.*
> 
> *In my previous role at [Past Company], I tackled this exact challenge by **[Verified Proof Point: e.g., introducing self-serve validation templates, cutting onboarding time by 28%]**.*
> 
> *I’ve put together a 1-page overview of how this can be applied directly to [Company]’s current setup. Would it make sense to connect for 10 minutes to see if this aligns with what [Hiring Manager Name] is prioritizing right now?"*

---

### Playbook 2: The Peer / Future Teammate (The Internal Ally)

* **Their Secret Fear:** Hiring someone who creates technical debt, slacks off, or dumps more on-call/grunt work on them.
* **Their Currency:** Workload relief, camaraderie, and shared craft empathy.
* **The Goal:** Transform an informational chat into an internal referral champion.

#### The "Workflow Empathy" Coffee Chat Script
> *"I noticed from recent GitHub PRs / Reddit threads that the team has been wrestling with **[Specific Bottleneck: e.g., flaky CI/CD test pipelines causing 45-minute deployment delays / high customer churn after the v4.0 UI redesign]**.*
> 
> *In my current role, our team was drowning in that exact issue last quarter. We ended up **[Action Taken: e.g., sharding the test suite / implementing a self-serve fallback UI]**, which saved our team ~10 hours of wasted sprint time a week.*
> 
> *How is the team internally handling that trade-off right now? I'm interviewing with [Hiring Manager] next week and want to make sure my proposals directly help take pressure off your sprint deliverables."*

---

### Playbook 3: The Senior / Tech Lead / Staff Lead (The Bar-Raiser)

* **Their Secret Fear:** A candidate who talks a big game in theory but breaks production, writes unmaintainable code, or lacks architectural rigor.
* **Their Currency:** Depth of craft, handling edge cases, and knowing *why* systems break.
* **The Goal:** Earn an unequivocal "Strong Hire" rating on the technical evaluation scorecard.

#### The "Root-Cause Technical Audit" Script
> *"While researching [Company]’s customer feedback on [Trustpilot / GitHub Issues], I noticed several users report that **[Problem: e.g., large CSV exports time out at the 30-second mark]**.*
> 
> *That usually indicates **[Root Cause: e.g., synchronous worker execution blocking the main event thread rather than an asynchronous message broker like Redis/RabbitMQ with presigned S3 URLs]**.*
> 
> *At [Past Company], we had this exact failure during peak load. Here is how we architected the queue with exponential backoff and idempotency keys to ensure zero dropped jobs.*
> 
> *How is the team currently architecting that data export boundary?"*

---

### Playbook 4: The Hiring Manager / Director (The Direct Boss)

* **Their Secret Fear:** Making a bad hire they have to micromanage or fire in 6 months while their quarterly OKRs fall behind.
* **Their Currency:** Fast time-to-productivity, hitting quarterly metrics, and taking problems off their desk.
* **The Goal:** Position yourself as the turnkey solution who requires zero handholding.

#### The Dual-Track Roadmap Presentation Script
> *"I know your priority this quarter is **[Departmental OKR: e.g., accelerating Time-to-Value or cutting pipeline slip]**. However, reviewing recent G2 and Capterra reviews, the #1 friction users report is **[Problem: e.g., ticket automation taking 14 days to set up]**.*
> 
> *Instead of assuming a single rigid solution, I see **two distinct ways we could stage my first 90 days**:
> 
> * **Path 1 (The Velocity Track — Speed Focus):**
>   * *Days 0–30:* Audit customer support escalations; deploy self-serve configuration recipes.
>   * *Days 30–60:* Patch the top 2 data-mapping failure points in the onboarding flow.
>   * *Days 60–90:* Recover 15% of dropped trials before the quarter ends.
> 
> * **Path 2 (The Scalability Track — Structural Focus):**
>   * *Days 0–30:* Instrument deep funnel telemetry to identify the exact code/process breakages.
>   * *Days 30–60:* Refactor the core permission model to eliminate the root cause permanently.
>   * *Days 60–90:* Package advanced capabilities into a new tier for enterprise accounts.
> 
> *Given your current quarterly priorities, which of these two paths would take more pressure off your desk right now?"*

---

### Playbook 5: The Head of Department / VP / Founder (The Ultimate Decision Maker)

* **Their Secret Fear:** Hiring someone who thinks small, cannot see the competitive landscape, and burns company cash without impacting EBITDA or valuation.
* **Their Currency:** Market share, gross margin defense, competitive differentiation, and long-term moat.
* **The Goal:** Secure top-of-band compensation and executive sponsorship.

#### The "Executive Strategic Memo" Conversation
> *"I’ve been tracking [Company]’s positioning against [Competitor A] and [Competitor B]. While [Competitor A] is aggressively advertising their cheaper pricing on LinkedIn, their reviews on GetApp reveal significant platform instability and poor support SLAs.*
> 
> *The big strategic risk for us isn't price—it's that our **[Problem: e.g., customer onboarding takes 3 weeks longer than theirs, dampening our Net Revenue Retention]**.*
> 
> *If we solve this onboarding drag, we can defend our premium pricing and increase our LTV:CAC ratio by 20%. In this role, that is the exact economic lever I intend to own."*

---

## 4. Role-Specific Variations Across All 11 Archetypes

| Target Role | Diagnosed Departmental Problem | Track A: Velocity Focus (0–30d) | The Core Pitch Hook |
| :--- | :--- | :--- | :--- |
| **Product Manager** | High Day-1 drop-off during self-serve workspace configuration. | Deploy 1-click preset templates in onboarding. | *"I will cut Time-to-Value by 30% to restore your PLG activation loop."* |
| **Finance / FP&A** | Gross margin compressed by 800 bps due to unbudgeted cloud compute. | Audit variable AWS and vendor SaaS cost drivers. | *"I will eliminate \$45k in monthly OpEx waste and stabilize your burn multiple."* |
| **Corporate Strategy**| Core market saturated; enterprise buyers stalling on pricing cliffs. | Model an unbundled modular add-on pricing tier. | *"I will unlock \$2.4M in stalled enterprise pipeline through modular packaging."* |
| **Founder's Office** | Silent onboarding failures flooding support, burning founder hours. | Embed with Product Ops to patch top 3 silent import bugs. | *"I will eliminate 60% of manual import tickets and free up 10h/week of founder time."* |
| **Software Engineer** | Flaky CI/CD pipelines causing 45m PR wait times and outage spikes. | Shard test suite and implement automated rollback alarms. | *"I will cut deploy cycle time by 40% and stabilize p99 latency."* |
| **Product Design** | Clunky multi-step forms causing a 35% user drop-off in setup. | Redesign the 3 highest-friction configuration screens. | *"I will redesign the 3 high-friction screens to eliminate 30% of support tickets."* |
| **Sales (AE)** | Stalled mid-market deals due to pricing cliffs on G2. | Audit dormant pipeline; launch modular add-on cadence. | *"I will resurrect \$150k in stalled pipeline without discounting."* |
| **Growth Marketing** | Spiking CAC; competitor outranking on 14 high-intent search terms. | Launch 3 bottom-of-funnel competitor comparison landing pages. | *"I will recapture lost organic pipeline without expanding your ad budget."* |
| **Customer Success** | Support ticket SLA response times increasing from 2h to 24h. | Deploy automated macro recipes for top 3 billing inquiries. | *"I will restore resolution SLAs and protect Gross Revenue Retention (GRR)."* |
| **Legal / Compliance**| Deals stalled 45+ days in procurement due to contract redlines. | Build a modular MSA playbook with pre-approved fallbacks. | *"I will turn legal from a deal-blocker into a 14-day sales velocity engine."* |
| **Talent & People** | Candidate drop-offs during final round debrief loops. | Standardize same-day interviewer debrief scorecards. | *"I will cut time-to-hire by 18 days and eliminate final-round candidate ghosting."* |

---

## 5. Three Zero-Solution Diagnostic Questions (The Closing Hook)

Ask these questions at the end of your interviews to reverse-interview the hiring manager:

1. **Macro / Financial Dilemma:** *"I noticed in the latest reports that revenue expanded while gross margins experienced slight compression. At the department level, how is leadership balancing the pressure to release new capabilities quickly against the mandate to protect operational unit economics?"*
2. **Competitor / Product Dilemma:** *"Looking at how competitors like [Rival X] are positioning their lighter-weight features against our platform, is the bigger strategic priority simplifying adoption for mid-market teams, or building deeper capabilities for complex enterprise accounts?"*
3. **Internal Execution Dilemma:** *"When roadmap milestones experience friction, does the bottleneck usually emerge from cross-functional alignment between teams, or bandwidth constraints on technical execution?"*
