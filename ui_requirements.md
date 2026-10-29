# Three Doors (backdoorv.1): UI Requirements Document

**Document Version:** backdoorv.1  
**Module Identifier:** `@ui/command-center` (M9)  
**Target:** Desktop Command Center & Responsive Mobile Views  
**Status:** Approved for Implementation  

---

## 1. Workspace Layout & Navigation Rail

The interface is structured as a single-page application with a fixed $220\text{px}$ left navigation rail and a responsive main command viewport:

```
┌──────────────┬────────────────────────────────────────────────────────┐
│ Three Doors  │ Top Bar: Search (/), Track Selector, Daily Run Status  │
│ [v1.0]       ├────────────────────────────────────────────────────────┤
│              │                                                        │
│ 1. Discover  │                                                        │
│ 2. Dossiers  │                   MAIN COMMAND VIEW                    │
│ 3. Outreach  │        (Morning Radar / Bento Cards / Table)           │
│ 4. Notes     │                                                        │
│ ──────────── │                                                        │
│ • Health     │                                                        │
│ • Settings   │                                                        │
└──────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Screen Specifications & Functional Requirements

### 2.1 Morning Radar (M9-FR1)
*   **Purpose:** The default view upon opening Three Doors each morning. Shows high-signal opportunities discovered in the 04:00 AM run.
*   **Filter Logic:** Automatically filters to postings where `posted_at >= last_visit_timestamp` (or last 24 hours) and `fit_score >= 70`.
*   **Surface Cap:** Displays top 20 roles by default (M2-FR13) to prevent cognitive overload, with a persistent *"See all (N) roles"* toggle.
*   **Card Anatomy:** Company name, normalized job title, location pill, work model chip (`Remote`, `Hybrid`, `On-site`), score pill (`92% FIT`), source chips (`Greenhouse`, `Remotive`), and Door chip (`3 Doors Found`).

### 2.2 Dual-View Switcher (M9-FR2)
*   **View Toggle:** Top-right pill switch between:
    *   **Square 1:1 Bento Cards:** Visual cards optimized for visual triage and high-signal scanning.
    *   **Dense Command Table:** Ultra-compact tabular spreadsheet view for scanning 100+ rows.
*   **Shared State:** Switching views maintains all active filters, text searches, selection states, and scroll positions without reloading data.

### 2.3 Keyboard Navigation in Table View (M9-FR3)
The Dense Command Table is fully operable via keyboard shortcuts without touching a mouse:
*   `j`: Navigate to the next row (moves active selection down).
*   `k`: Navigate to the previous row (moves active selection up).
*   `Enter`: Open the selected role's slide-out dossier drawer.
*   `s`: Mark role as `SKIPPED` (removes from active view, logged to `decision_events`).
*   `c`: Mark role as `CHOSEN` (promotes role and queues for outreach).
*   `/`: Focus global filter input box.
*   `Esc`: Clear search / close open drawer.

### 2.4 Zero-Reload Slide-Out Dossier Drawer (M9-FR5)
*   **Behavior:** A $640\text{px}$ drawer slides smoothly from the right viewport edge upon clicking a card or pressing `Enter`. Full-page reloads are strictly prevented.
*   **Internal Drawer Structure:**
    1. **Header:** Company name, job title, live stage selector (`Discovered` $\to$ `Chosen` $\to$ `Outreach Started`), and keyboard cue (`[↑] Prev  [↓] Next  [Esc] Close`).
    2. **Job Description Tab:** Clean markdown rendering of original job post, salary range, workplace type, and original apply links (`Also Listed`).
    3. **3-Tier Match Breakdown:**
       * *Tier 1 Eligibility:* Location, remote boundary, visa status check.
       * *Tier 2 Mathematical Score:* Exact formula score (0–100), matched skills chips, missing skills chips, years gap, title level gap.
       * *Tier 3 Synthesis (if $\ge 70$):* 3 bullet points citing exact M8 proof point IDs and 1 positioning angle.
       * *Score Booster Gaps:* Missing skills or portfolio artifacts worth $\ge 5$ formula points.
    4. **Company Intelligence & Teardown 1-Pager:** Company summary, funding details, founder profiles, sentiment audit, and 3 actionable product opportunities (Quick Win, Growth Loop, Monetization Feature) with a link to open the generated Google Doc.
    5. **The Three Doors (Contacts):** Displays Door 1 (Hiring Manager), Door 2 (Recruiter), and Door 3 (Peer). Shows name, headline, verified email, LinkedIn search query link, and public activity score ($0 - 100$).
    6. **Outreach & CV Preview:**
       * Tailored CV Google Doc link + zero-cost Drive PDF link.
       * Preview of the generated Gmail draft body customized to the chosen door.
       * Suggested send time display (e.g., *"Tue 09:15 London (14:45 IST)"*).
       * One-click *"Copy LinkedIn Note"* button ($\le 300$ chars).
*   **In-Drawer Cycling:** Pressing `↑` or `↓` arrow keys advances immediately to the previous/next job without closing the drawer.

### 2.5 Outreach & Cadence Board (M9-FR7)
*   **View Layout:** Columns / Groups organized by cadence state:
    *   *Draft Ready in Gmail* (waiting for user review in Gmail).
    *   *Sent (Awaiting Reply)* (monitored by thread watcher).
    *   *Follow-Up Due (Day 3 / Day 5)* (new draft ready in thread).
    *   *In Conversation* (reply received, cadences halted).
    *   *Bounced / Cancelled*.
*   **Card Data:** Contact name, Door chip, company, channel (`GMAIL`, `LINKEDIN`), suggested send time, thread status, and last activity date.

### 2.6 Source Health Page (M9-FR9, M2-FR10)
*   **Purpose:** Complete observability across all 35 ingestion sources.
*   **Columns:** Source Name, Group (`ATS`, `Remote Board`, `Manual`, `BYOK`), Status (`HEALTHY`, `FAILED`, `SKIPPED: NO KEY`), Last Success Timestamp, Last Error Message (raw stack/error text), and 7-day job discovery volume graph.
*   **Alert Banner:** Automatically displays an alert on the Morning Radar if any enabled source failed in the last run.

### 2.7 Settings Workspace (M9-FR8)
*   **Sections:**
    1. *Source Toggles & Keys:* On/off switches for sources 1–35, BYOK key fields (Apify, Hunter, Apollo, AI models).
    2. *Filter Rules:* Title inclusion/exclusion regex, excluded companies, excluded industries (`FinTech`, `Payments`).
    3. *Dynamic Tracks Manager:* Add, edit, or archive persona tracks (*AI-Native PM*, *Growth PM*, *UX PM*).
    4. *Google Connection:* OAuth connection status, connected email address, token refresh status.
    5. *Safety Caps:* Draft creation daily limits (default: 40/day) and pacing reminders (45 min break reminder).

### 2.8 Responsive Mobile Breakpoint (M9-FR13)
*   Maintains full responsiveness down to $380\text{px}$ width:
    *   Left rail collapses into a slide-over mobile drawer.
    *   Morning Radar transitions into a single-column card list.
    *   Slide-out dossier drawer occupies 100% viewport width with a top back button.
