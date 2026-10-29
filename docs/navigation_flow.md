# Three Doors (backdoorv.1): Navigation Flow Specification

**Document Version:** backdoorv.1  
**Target:** User Navigation Flows, Screen State Transitions & Modal Overlays  
**Status:** Approved for Implementation  

---

## 1. Top-Level Workspace Navigation Flow

The candidate navigates between 4 primary workspaces on the left navigation rail, plus system configuration pages:

```mermaid
flowchart TD
    Start([User Opens Three Doors]) --> AuthCheck{Google / Supabase Session Valid?}
    AuthCheck -- No --> LoginView["Login Screen (Google OAuth / Supabase Auth)"]
    LoginView --> AppSession["Initialize User Session"]
    AuthCheck -- Yes --> AppSession

    AppSession --> NavRail{"Left Navigation Rail"}
    
    NavRail -->|1. Discover| W1["Workspace 1: Discover (Morning Radar & All Roles)"]
    NavRail -->|2. Dossiers| W2["Workspace 2: Dossiers (Track Profiles & Proof Points)"]
    NavRail -->|3. Outreach| W3["Workspace 3: Outreach (Cadence Board & Drafts)"]
    NavRail -->|4. Notes| W4["Workspace 4: Notes (Interviews, Meet Audio & Action Items)"]
    NavRail -->|Source Health| W5["System View: Source Health (35 Ingest Sources)"]
    NavRail -->|Settings| W6["System View: Settings (Filters, BYOK Keys, Google OAuth)"]
```

---

## 2. Morning Discovery & Triage Navigation Flow

```mermaid
flowchart TD
    W1["Workspace 1: Discover"] --> ViewMode{"Select View Mode (M9-FR2)"}
    
    ViewMode -->|Bento View| Bento["1:1 Bento Cards Grid"]
    ViewMode -->|Table View| Table["Dense Command Table (100+ Roles)"]
    
    Table --> KeyNav{"Keyboard Input (M9-FR3)"}
    KeyNav -->|j / k| RowHighlight["Navigate Next / Prev Row"]
    KeyNav -->|s| SkipJob["Mark Job as SKIPPED (Disappears from Active Feed)"]
    KeyNav -->|c| ChooseJob["Mark Job as CHOSEN (Promote to Outreach Pipeline)"]
    KeyNav -->|/| SearchFocus["Focus Filter Search Input"]
    KeyNav -->|Enter / Click| OpenDrawer["Slide-Out Dossier Drawer (640px)"]
    
    Bento -->|Click Card| OpenDrawer
```

---

## 3. Slide-Out Dossier Drawer In-Depth Navigation

The slide-out drawer operates as a persistent, zero-reload inspection surface:

```mermaid
flowchart TD
    OpenDrawer["Open Dossier Drawer (640px)"] --> DrawerTabs{"Drawer Tab Navigation"}
    
    DrawerTabs -->|Tab 1: Spec| JobSpec["Job Spec (Markdown, Original Apply Links)"]
    DrawerTabs -->|Tab 2: Match| MatchEval["3-Tier Breakdown (Tiers 1, 2, 3 + Booster Gaps)"]
    DrawerTabs -->|Tab 3: Intel| TeardownTab["Company Brief + 3 Opportunities Teardown"]
    DrawerTabs -->|Tab 4: Doors| DoorsTab["Door 1 (HM), Door 2 (Recruiter), Door 3 (Peer)"]
    DrawerTabs -->|Tab 5: Draft| DraftTab["Tailored CV PDF Link + Gmail Draft Body Preview"]
    
    OpenDrawer --> KeyCycle{"Drawer Keyboard Controls"}
    KeyCycle -->|↑ Arrow| PrevJob["Instantly Load Previous Job (No Page Reload)"]
    KeyCycle -->|↓ Arrow| NextJob["Instantly Load Next Job (No Page Reload)"]
    KeyCycle -->|Esc / [X]| CloseDrawer["Close Drawer (Return to Active Table Row)"]

    DraftTab --> StartOutreachBtn{"Click 'Start Outreach'"}
    StartOutreachBtn --> RunM7["Trigger M4 PDF Export + M7 Gmail Draft Creation"]
    RunM7 --> DrawerFeedback["Status Updates to 'Draft Ready in Gmail'"]
```

---

## 4. Multi-Channel Cadence & Human Send Flow

```mermaid
flowchart TD
    W3["Workspace 3: Outreach Board"] --> InspectDraft["Inspect 'Draft Ready' Cadence Card"]
    InspectDraft --> CopyLinkedIn["Click 'Copy LinkedIn Connection Note' (<= 300 chars)"]
    CopyLinkedIn --> ManualLinkedIn["Hardi Pastes Note into LinkedIn (Human Interaction)"]
    
    InspectDraft --> OpenGmail["Open Draft in Gmail (Desktop or Mobile App)"]
    OpenGmail --> HardiReview["Hardi Reviews Subject, Body, and PDF Attachment"]
    HardiReview --> HumanSend["Hardi Clicks SEND in Gmail (D1, R1)"]
    
    HumanSend --> M4Detect["M4 Background Worker Detects Message with SENT Label"]
    M4Detect --> CadenceState["Cadence Status Advances to 'SENT'"]
    
    CadenceState --> PollingWait["Thread Watcher Monitors Inbound Replies"]
    PollingWait --> InboundReply{"Inbound Reply Detected?"}
    InboundReply -- Yes --> HaltCadence["Auto-Stop All Future Follow-Ups -> Mark 'IN_CONVERSATION'"]
    InboundReply -- No --> Day3Check{"Day 3 Reached (3 Business Days)?"}
    
    Day3Check -- Yes --> Day3Draft["Generate Follow-Up Draft 1 in Same Gmail Thread"]
    Day3Draft --> HardiReview
    Day3Check -- No --> PollingWait
```

---

## 5. Universal Ingest Modal Navigation Flow

The Universal Ingest Modal (M2-FR8) can be summoned from anywhere in the application via the top navigation bar or the global keyboard shortcut `Shift + I`:

```mermaid
flowchart TD
    GlobalTrigger["Press Shift + I or Click '+ Add Job'"] --> IngestModal["Universal Ingest Modal Overlay"]
    
    IngestModal --> InputType{"Input Channel"}
    InputType -->|URL| UrlInput["Paste Job Board or Careers URL"]
    InputType -->|Raw Text| TextInput["Paste Slack message / WhatsApp forward / Tweet text"]
    InputType -->|Manual| ManualInput["Fill Structured Fields Manually"]
    
    UrlInput --> UrlParser["Extract JSON-LD Schema / OpenGraph"]
    TextInput --> LLMParser["Regex / LLM Extraction into Structured Job Fields"]
    
    UrlParser & LLMParser & ManualInput --> PreviewCard["Render Structured Ingest Preview Card"]
    PreviewCard --> DedupCheck{"Match Key Already Exists in Database?"}
    
    DedupCheck -- Yes --> MergeNotice["Notice: Role Exists -> Append Link to job_sources"]
    DedupCheck -- No --> NewRoleNotice["Notice: New Canonical Role Identified"]
    
    MergeNotice & NewRoleNotice --> ConfirmSave["Click 'Confirm & Save'"]
    ConfirmSave --> CloseModal["Modal Closes -> New Job Opens in Dossier Drawer"]
```
