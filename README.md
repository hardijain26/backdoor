# Backdoor (v1.0)

Career acceleration command center based on the **Three Doors** thesis:
1. **Door 1:** Decision Maker (Founder, VP of Product, Head of Product)
2. **Door 2:** Gatekeeper (Technical Recruiter, Talent Partner)
3. **Door 3:** Ally (Peer PM, Tech Lead, Ex-Employee Referral)

## Project Structure
- `docs/`: PRD, Design System (Cobalt & Steel), Database Schema, and Sprint Plans
- `database/`: PostgreSQL 16 / Supabase Schema and Seed scripts
- `src/app/`: Next.js 15 App Router views (Morning Radar, Jobs Table, Outreach Board, Notes)
- `src/components/`: Bento cards, Table view, 640px slide-out drawer, Door chips
- `src/engine/`: 35-Source scraper, deduplication, fit scoring, CV builder, teardown, cadences
- `extension/`: Chrome extension for Google Meet audio capture and 1-click job clipping

## Getting Started
1. Run SQL schema in Supabase: `database/schema.sql`
2. Configure `.env.local` based on `.env.example`
3. Run `npm install` and `npm run dev`
