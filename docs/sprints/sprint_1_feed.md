# Sprint 1: 35 Job Sources & Morning Radar Feed

**Status:** `VERIFIED`  
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
| Bug ID | Description | Severity | Root Cause | Resolution | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | — | — | — | — | `RESOLVED` |
