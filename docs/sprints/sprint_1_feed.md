# Sprint 1: 35 Job Sources & Morning Radar Feed

**Status:** `CLOSED & ARCHIVED`  
**Owner:** Hardi Jain  
**Objective:** Ingest jobs across 35 verified sources, deduplicate, calculate Tiers 1 & 2 match scores, and display the Morning Radar.

## Tasks
- [x] Implement M2 35-source crawler runners (`src/engine/scraper.ts`)
- [x] Implement normalized `company + title` deduplication (`src/engine/dedup.ts`, UT-DB-04)
- [x] Implement Tiers 1 and 2 deterministic match scoring (`src/engine/scorer.ts`)
- [x] Connect Morning Radar UI screen (`src/app/radar/page.tsx`)
- [x] Implement dense table keyboard navigation hook (`src/components/useTableKeyboardNav.ts`)
- [x] Implement Three Doors indicator chips (`src/components/ThreeDoorsChips.tsx`)
- [x] Verify test suite: unit tests and integration tests passing (`bash scripts/preflight.sh`)

## Production Bug Log

### [BUG-S1-01] Outdated Brand Terminology on Opportunity Pipeline
- **Customer / Business Impact:** Users navigating to the Opportunity Pipeline (`/jobs`) saw legacy internal terminology ("Three Doors triage") that did not match the updated product language.
- **Why It Happened:** A placeholder descriptive subtitle from earlier prototype designs was carried over into the live interface.
- **How It Was Resolved:** We updated the page copy to clear, standard business terminology: *"Active jobs, application stages, and triage."*
- **Guardrail Added:** User-facing labels are now cataloged alongside design system tokens and covered by static frontend build verification to ensure clean terminology across all routes.

### [BUG-S1-02] Preflight Script Synchronization Conflict in Morning Radar Feed PR
- **Customer / Business Impact:** Pull Request #5 (`feature/p1-morning-radar-feed`) was temporarily marked as having merge conflicts with `main`, delaying integration of the radar UI.
- **Why It Happened:** The feature branch diverged prior to the landing of defensive database check fallbacks in `scripts/preflight.sh`.
- **How It Was Resolved:** We merged `origin/main` into `feature/p1-morning-radar-feed`, preserved the defensive conditional file check for SQL tests, and verified all 7 preflight gates locally before pushing.
- **Guardrail Added:** All feature branches now run automated branch sync and preflight validation prior to PR creation.
