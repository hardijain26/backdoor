# Three Doors (backdoorv.1): System Architecture Maps

**Document Version:** backdoorv.1  
**Target:** Monorepo System Architecture, Data Flow & State Transitions  
**Status:** Approved for Implementation  

---

## 1. End-to-End Subsystem Architecture Map

```mermaid
flowchart TD
    subgraph INGESTION["Module 2: @ingest/scout"]
        A1["04:00 AM User-Time Cron"] --> A2["35-Source Ingest Engine"]
        A3["Universal Webhooks & Clipper"] --> A2
        A2 --> A4["Deduplicator Engine (Company + Title Key)"]
    end

    subgraph DATABASE["Module 1: @core/db (PostgreSQL 16)"]
        A4 --> B1[("Global Jobs & Companies")]
        B2[("User Profiles, Tracks & Bullets")]
        B3[("User Evaluations & Cadences")]
        B4[("decision_events (Append-Only Audit)")]
        B1 & B3 -.->|Async Push Mirror| B5["Google Sheets Downstream Mirror"]
    end

    subgraph EVALUATION["Module 3: @eval/brain"]
        B1 & B2 --> C1["Tier 1: Eligibility Gate (No AI, <100ms)"]
        C1 --> C2["Tier 2: Formula Match Score 0-100 (No AI)"]
        C2 -->|Score >= 70 & BYOK Key| C3["Tier 3: Dossier Synthesis (AI BYOK)"]
        C3 --> B3
    end

    subgraph INTEL["Module 5: @intel/teardown"]
        B1 --> D1["Complaint Collector (Reddit/AppStore)"]
        D1 --> D2["Friction Tagger"]
        D2 --> D3["3 Product Opportunities (1-Pager Doc)"]
    end

    subgraph PEOPLE["Module 6: @people/enrichment"]
        B1 --> E1["Public Team & Founder Scraper"]
        E1 --> E2["Door 1: Decision Maker"]
        E1 --> E3["Door 2: Recruiter"]
        E1 --> E4["Door 3: Peer / Referral"]
        E2 & E3 & E4 --> E5["Activity Scorer (0-100)"]
        E5 --> B3
    end

    subgraph GOOGLE["Module 4: @workspace/google"]
        B2 & B3 --> F1["Deterministic CV Doc Builder"]
        F1 --> F2["Zero-Cost Drive PDF Export"]
        G1["Chrome Extension Audio Clipper"] --> G2["Groq Free Whisper API"]
        G2 --> G3["Action Items Parser"]
        G3 --> B3
    end

    subgraph CADENCE["Module 7: @cadence/engine"]
        B3 & F2 & D3 --> H1["Timezone Geocoder (9:15 AM Window)"]
        H1 --> H2["Gmail API: users.drafts.create"]
        H2 --> H3["Drafts in ThreeDoors/Drafts"]
        H3 --> H4["Thread Watcher (Auto-Stop on Reply)"]
    end

    subgraph COMMAND["Module 9: @ui/command-center"]
        B1 & B3 <--> J1["Command Center Interface"]
        J1 --> J2["Morning Radar (>= 70 Top Fit)"]
        J1 --> J3["Dense Command Table (j/k/Enter/s/c)"]
        J1 --> J4["Zero-Reload Drawer (640px)"]
    end
```

---

## 2. Level 1 Data Flow Diagram (DFD)

```mermaid
flowchart LR
    Candidate([Hardi / User]) -->|Uploads Bullets & Side Projects| M8["@dossier/identity"]
    M8 -->|Stores Tracks & Proof Points| DB[(PostgreSQL 16 DB)]

    Sources([35 Web Sources & Inbound Mails]) -->|Raw Postings| M2["@ingest/scout"]
    M2 -->|Deduplicated Canonical Jobs| DB

    DB -->|Jobs + Active Tracks| M3["@eval/brain"]
    M3 -->|Tier 1 & 2 Match Scores 0-100| DB

    DB -->|Score >= 70 Jobs| M4["@workspace/google"]
    M4 -->|Builds Tailored CV Doc & Exports PDF| GDrive([Google Drive])

    PublicReviews([Reddit JSON / App Store RSS]) -->|Raw Complaints| M5["@intel/teardown"]
    M5 -->|Teardown 1-Pager Doc| GDrive

    PublicWeb([Company Team Pages & YC]) -->|Founders & Leads| M6["@people/enrichment"]
    M6 -->|Door 1, 2, 3 Contacts| DB

    DB -->|Contacts + PDF Link + Teardown| M7["@cadence/engine"]
    M7 -->|Inserts Suggested Drafts @ 9:15 AM| Gmail([Gmail Drafts Folder])

    Candidate -->|Reviews Draft & Clicks Send| Gmail
    Gmail -->|Inbound Reply Detected| M7
    M7 -->|Halts Follow-ups & Marks In Conversation| DB

    MeetAudio([Google Meet Call]) -->|Audio Chunks| Clipper["Chrome Clipper Ext"]
    Clipper -->|Transcribes Audio| Groq["Groq Whisper API"]
    Groq -->|Action Items| DB
    DB -.->|Async Mirror| GSheet([Downstream Google Sheet])
```

---

## 3. Multi-Channel Cadence & Decision State Machine

```mermaid
stateDiagram-v2
    [*] --> Discovered: Job Ingested & Scored >= 70
    Discovered --> Chosen: User Marks Role as Chosen (c key)
    Chosen --> DraftsCreated: Click 'Start Outreach' (M7-FR1)
    
    state DraftsCreated {
        [*] --> GenResumePDF: M4 Clones Doc & Exports Zero-Cost PDF
        GenResumePDF --> InsertGmailDraft: Insert Draft to ThreeDoors/Drafts
        InsertGmailDraft --> PrepareLinkedInNote: Format <= 300 char Note
    }

    DraftsCreated --> SuggestedTimeQueue: Display 09:15 Recipient Local Time
    SuggestedTimeQueue --> HumanSendAction: Hardi Reviews Draft & Clicks Send in Gmail

    HumanSendAction --> ThreadWatched: M4 Detects Message with SENT Label
    
    state ThreadWatched {
        [*] --> WaitDay3: Wait 3 Business Days
        WaitDay3 --> CheckReplyDay3: Trigger Check
        
        state ReplyDecisionDay3 <<choice>>
        CheckReplyDay3 --> ReplyDecisionDay3
        ReplyDecisionDay3 --> InConversation: Inbound Reply Detected
        ReplyDecisionDay3 --> CreateFollowUpDraft1: No Reply Detected
        
        CreateFollowUpDraft1 --> WaitDay5: Wait 2 Business Days
        WaitDay5 --> CheckReplyDay5: Trigger Check
        
        state ReplyDecisionDay5 <<choice>>
        CheckReplyDay5 --> ReplyDecisionDay5
        ReplyDecisionDay5 --> InConversation: Inbound Reply Detected
        ReplyDecisionDay5 --> CreateFinalTeardownDraft: No Reply Detected
    }

    InConversation --> MeetingScheduled: 1-Click Google Calendar Invite Accepted
    MeetingScheduled --> MeetingAudioCaptured: Chrome Clipper Captures Meet Tab Audio
    MeetingAudioCaptured --> NotesSaved: Groq Whisper -> Action Items -> Supabase & Sheet
    NotesSaved --> [*]
```
