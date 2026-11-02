# System Requirements: Multi-Channel Feedback & Review Sourcing Engine

**Document Identifier:** `SYS-ENG-SOURCING-V2`  
**Subsystem:** Module 5 (`@intel/teardown` / Data Product Layer)  
**Target Repository:** `backdoor`  
**Version:** 2.0.0 (Zero-Migration System Architecture)  
**Database Decision:** Zero-Migration (Stores payload in `public.company_briefs.recent_news` JSONB)  

---

## 1. System Mission & Operating Architecture

The Feedback & Review Sourcing Engine is an asynchronous, zero-cost web crawling and NLP pipeline engineered to discover, clean, and cluster customer friction, product bugs, and churn triggers from public internet channels across the globe.

### Architectural Core Flow

```
[ Domain + Company Name + Scoped Product ] ──> [ Geo & Modality Classifier ]
                                                              │
                 ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
                 ▼                                            ▼                                            ▼
      [ Stream A: B2B Review ]                    [ Stream B: Mobile ]                         [ Stream C: Developer/Gov ]
      GetApp, Capterra, G2,                       Apple RSS, Play Store,                       GitHub, StackOverflow,
      Trustpilot, PissedConsumer                  Huawei AppGallery                            Downdetector, CFPB/BBB
                 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                              ▼
                                            [ In-Memory Cleaning & NLP Filter ]
                                            (Removes trolls, fluff, sponsored ads)
                                                              ▼
                                            [ Embedding & K-Means Clustering ]
                                            (Groups 200 reviews into Top 5 Friction)
                                                              ▼
                                  [ ZERO-MIGRATION PERSISTENCE: 2.5 KB JSONB ]
                                  (public.company_briefs.recent_news with 30-Day TTL)
```

---

## 2. Product-Line Scoped Ingestion (Preventing Generic Noise)

When a candidate applies to a specific division of a large company (e.g., *Uber Freight* vs. *Uber Rides*, or *HubSpot Service Hub* vs. *HubSpot CRM*), the query builder automatically appends the scoped product line:

```typescript
export function buildScopedReviewQueries(companyName: string, scopedProduct?: string) {
  const targetEntity = scopedProduct || companyName;
  const sanitized = targetEntity.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    getApp: `site:getapp.com/p/${sanitized} "cons" OR "disadvantages"`,
    capterra: `site:capterra.com/p/${sanitized} "cons" OR "difficult" OR "missing"`,
    g2: `site:g2.com/products/${sanitized}/reviews "what do you dislike"`,
    trustpilot: `site:trustpilot.com/review/${sanitized} "stars 1" OR "stars 2"`,
    pissedConsumer: `site:pissedconsumer.com "${targetEntity}" ("complaint" OR "refund" OR "terrible")`
  };
}
```

---

## 3. Multi-Channel Feedback Taxonomy

Feedback is categorized into 3 operational layers to feed the downstream Discrepancy Engine:

```
  [ LAYER 1: Stated Intent ]                [ LAYER 2: Ground Truth ]
  • Website, Vision & Mission               • GetApp & Capterra (B2B features)
  • Blogs & Release Notes                   • G2 (Enterprise switch triggers)
  • LinkedIn / Twitter / Instagram          • Trustpilot (Billing / SLAs)
  • YouTube Demos & PR                      • PissedConsumer (Worst-case churn)
               │                                         │
               └───────────────────┬─────────────────────┘
                                   ▼
                   [ THE DISCREPANCY ENGINE ]
             "You promised X on LinkedIn, but users 
              on GetApp/PissedConsumer are stuck on Y"
                                   │
                                   ▼
              [ LAYER 3: Product Form Factor Routing ]
             • Web App: Google Reviews + YouTube Teardowns
             • Mobile App: iOS App Store + Google Play
```

---

## 4. Signal-to-Noise Extraction Matrix

The ingestion pipeline applies strict extraction and rejection heuristics:

| Source | Signal to Extract | Noise to Filter Out | Ingestion Method |
| :--- | :--- | :--- | :--- |
| **GetApp & Capterra** | Feature comparison gaps, missing tools | Sponsored top-placement listings | Google Search Dork |
| **G2 Crowd** | Detailed B2B dislikes, contract cliffs | Paid reviewer incentive campaigns | Google Search Dork |
| **Trustpilot** | Billing disputes, customer support SLAs | Fake bot reviews (filter for verified badges) | Search Dork / HTML parse |
| **PissedConsumer** | Critical churn escalations, broken features | One-off outlier rants (require $\ge 3$ hits) | Direct search dork |
| **App Stores (iOS/Android)**| Crash reports, post-update bugs | *"Great app!"* 5-star generic reviews | Apple RSS JSON / Play scraper |
| **GitHub Issues** | Verified open bugs, breaking SDK changes | Closed questions resolved $\le 24$h | GitHub Public API |
| **Downdetector** | Real-time incident spikes, user outage logs | Normal background baseline chatter | Incident RSS feed |

---

## 5. The Global Source Catalog

```
                      [ GLOBAL CUSTOMER COMPLAINT ECOSYSTEM ]
 ┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
 │  1. Developer & Infra    │  2. Enterprise B2B SaaS  │  3. Global App Stores    │
 │  GitHub Issues, StackO,  │  Gartner Peer Insights,  │  Huawei AppGallery,      │
 │  HackerNews, NPM issues  │  PeerSpot, TrustRadius   │  Samsung Galaxy, Regional│
 ├──────────────────────────┼──────────────────────────┼──────────────────────────┤
 │  4. Regional Portals     │  5. Real-Time Outages    │  6. Official Escalation  │
 │  Reclame Aqui, Feefo,    │  Downdetector Comments,  │  BBB, CFPB, India        │
 │  Reviews.io, SiteJabber  │  Twitter Support Tags    │  Consumer Complaints     │
 └──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

* **Developer & Infra Products:** GitHub Issues, Stack Overflow unanswered tags, Hacker News launch post critiques.
* **Enterprise B2B SaaS (\$50k+ ACV):** Gartner Peer Insights, PeerSpot, TrustRadius.
* **Global Mobile Ecosystems:** Localized Apple App Store RSS (`country={code}`), Google Play Scraper, Huawei AppGallery.
* **Regional Dispute Hubs:** Reclame Aqui (LatAm), BBB / CFPB (US), Reviews.io / Feefo (UK/EU), NCH / Voxya (India).

---

## 6. Zero-Migration Storage Architecture (Solo-Founder Cost Optimization)

Under the **Zero-Migration decision**, no new database tables or columns are created. The cleaned 2.5 KB Data Product payload is stored in the existing `public.company_briefs` table:

```
[ Raw Multi-Channel Scrape: 5 MB in RAM ] 
         │
         ▼ (LLM Extraction & Deduplication)
[ Distilled Payload: 2.5 KB JSON ] 
         │
         ▼ (Written via Supabase Upsert)
[ public.company_briefs.recent_news (JSONB) with 30-Day TTL ]
```

### Zero-Migration Database Mapping:
* **`public.company_briefs.one_sentence_summary`:** Holds the Discrepancy Statement.
* **`public.company_briefs.funding_details`:** Holds the generated Google Doc URL (`S4-T03`).
* **`public.company_briefs.recent_news` (JSONB):** Holds the entire Data Product payload (VoC survey, top 5 friction points, competitor SWOT, financial translation).
* **`public.company_briefs.fetched_at`:** Acts as the cache timestamp for the 30-day TTL check.

---

## 7. Solo-Founder Telemetry & Quality Flywheel

```mermaid
flowchart LR
    Scrape["Raw Scrape"] --> Clean["NLP Clustering"]
    Clean --> LLMJudge["LLM-as-a-Judge Eval Suite"]
    LLMJudge -->|Pass (Score >= 85)| Briefs[("public.company_briefs")]
    LLMJudge -->|Fail (Hallucination/Low SNR)| Fallback["Trigger Alternate Source Dork"]
    Candidate["Candidate Thumbs Feedback"] --> Telemetry["Dynamic Source Weighting"]
```

### 7.1 Automated Quality SLAs
* **Signal-to-Noise Ratio (SNR) $\ge 85\%$:** Automated LLM judge verifies that extracted complaints represent actual product or operational flaws.
* **Source Grounding Rate (Rule R4) = 100.0%:** Regex check ensures every friction point has an active URL and verbatim quote.
* **Metric Hallucination Rate (Rule R5) = 0.0%:** Rejects any numbers not found in candidate proof points.
* **End-to-End Latency $\le 20\text{ seconds}$:** Total pipeline execution from trigger to complete drawer render.

### 7.2 Solo-Founder Telemetry & Improvement Flow
1. **Cache Hit Ratio Monitoring:** Target $\ge 65\%$ cache hit rate across active users to keep API and scraper compute costs at \$0.
2. **Scraper 403 Fallback Logging:** If G2 or Trustpilot blocks requests via Cloudflare, log the fallback event to `decision_events` and automatically elevate Reddit and Capterra without crashing the pipeline.
3. **Candidate Invalidation Telemetry:** When a candidate clicks 👎 (*"This was fixed 6 months ago"*), the system updates `company_briefs.fetched_at` to trigger a re-crawl on the next request, biasing search dorks to reviews from the last 60 days.
