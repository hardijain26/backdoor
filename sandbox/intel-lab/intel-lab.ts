#!/usr/bin/env tsx
/**
 * ==============================================================================
 * BACKDOOR INTEL LAB (External Standalone Research & Output Prototyping Harness)
 * ==============================================================================
 * 
 * Purpose:
 * An isolated playground to experiment with company intelligence, prompt engineering,
 * and executive interview battle cards WITHOUT touching Supabase, Next.js, or Google Drive.
 * 
 * Usage:
 *   npx tsx scripts/intel-lab.ts --company "Stripe" --role "Staff PM"
 *   npx tsx scripts/intel-lab.ts --company "Figma" --role "Product Lead" --format case-sparring
 *   npx tsx scripts/intel-lab.ts --company "Linear" --role "Senior PM" --live --out ./sandbox/linear.md
 * 
 * Formats:
 *   - battlecard: 1-Page Pre-Interview Cheat Sheet (Operational leaks, 3 killer questions, proof points)
 *   - case-sparring: Interviewer Trap Predictor (The 3 case questions they will grill you on)
 *   - raw-signals: Unvarnished raw data collected from Reddit, Hacker News & filings
 */

import fs from 'node:fs';
import path from 'node:path';

// Parse CLI Arguments
interface LabArgs {
  company: string;
  role: string;
  format: 'battlecard' | 'case-sparring' | 'raw-signals';
  live: boolean;
  outFile: string;
}

function parseArgs(): LabArgs {
  const args = process.argv.slice(2);
  let company = 'Stripe';
  let role = 'Staff Product Manager';
  let format: 'battlecard' | 'case-sparring' | 'raw-signals' = 'battlecard';
  let live = false;
  let outFile = path.join(process.cwd(), 'sandbox', 'intel-lab-output.md');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--company' || arg === '-c') && args[i + 1]) {
      company = args[++i];
    } else if ((arg === '--role' || arg === '-r') && args[i + 1]) {
      role = args[++i];
    } else if ((arg === '--format' || arg === '-f') && args[i + 1]) {
      const f = args[++i].toLowerCase();
      if (f === 'battlecard' || f === 'case-sparring' || f === 'raw-signals') {
        format = f;
      }
    } else if (arg === '--live' || arg === '-l') {
      live = true;
    } else if ((arg === '--out' || arg === '-o') && args[i + 1]) {
      outFile = path.resolve(args[++i]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Backdoor Intel Lab - Standalone CLI Harness
Options:
  -c, --company <name>    Target Company Name (default: "Stripe")
  -r, --role <title>      Target Role Title (default: "Staff Product Manager")
  -f, --format <format>   Output format: battlecard | case-sparring | raw-signals (default: battlecard)
  -l, --live              Fetch live public Reddit & Hacker News data (default: false / fast catalog)
  -o, --out <filepath>    Output markdown file path (default: ./sandbox/intel-lab-output.md)
  -h, --help              Show this help message
      `);
      process.exit(0);
    }
  }

  return { company, role, format, live, outFile };
}

// Interfaces
interface RawSignal {
  source: string;
  snippet: string;
  sentiment: 'critical' | 'neutral' | 'positive';
  url: string;
}

interface CompanyIntelligenceProfile {
  company: string;
  scopedProduct: string;
  businessModel: string;
  revenueRunRate: string;
  burnOrMarginHealth: string;
  leadershipQuote: string;
  realOperationalMess: string[];
  whyRoleIsOpen: string;
  hiringManagerPersona: string;
  threeDiagnosticQuestions: {
    targetConstraint: string;
    questionText: string;
    whyItHitsHard: string;
  }[];
  predictedCaseQuestions: {
    prompt: string;
    theTrap: string;
    recommendedAngle: string;
  }[];
  candidateProofMapping: {
    companyFriction: string;
    candidateProofMetric: string;
    immediateActionDay0To30: string;
  }[];
}

// Built-in High-Signal Curated Benchmarks for Instant Iteration
const CURATED_PROFILES: Record<string, CompanyIntelligenceProfile> = {
  stripe: {
    company: 'Stripe',
    scopedProduct: 'Billing, Invoicing & Multi-Currency Settlement',
    businessModel: 'Transaction Take-Rate (2.9% + 30¢) + SaaS Subscriptions (Billing & Radar tiers)',
    revenueRunRate: '$1.4B+ Net Revenue (Publicly disclosed >$1T Total Payment Volume)',
    burnOrMarginHealth: 'Strongly Free Cash Flow Positive (Expanding operating margin toward IPO profile)',
    leadershipQuote: '"We are relentlessly focused on reducing the GDP of the internet to simple API calls."',
    realOperationalMess: [
      'Query latency spikes and silent timeouts on large CSV reporting exports (>10k transactions).',
      'Complex multi-entity billing reconciliation requires enterprise customers to write custom glue scripts.',
      'Customer support SLA times for developer integration issues have degraded from hours to 2-3 business days.'
    ],
    whyRoleIsOpen: 'The enterprise sales team is closing >$100k ACV deals, but churn risk is rising because large finance teams cannot easily reconcile multi-subsidiary invoices across custom billing cadences.',
    hiringManagerPersona: 'VP of Product / Head of Billing: Under pressure from CFO and Sales to protect 115% Net Dollar Retention (NDR) without ballooning engineering headcount.',
    threeDiagnosticQuestions: [
      {
        targetConstraint: 'Margin Defense vs. Bespoke Enterprise Demands',
        questionText: 'With enterprise clients demanding custom ERP reconciliation workflows while leadership pushes for operating margin expansion, how are you balancing bespoke engineering commitments against self-serve platform abstractions?',
        whyItHitsHard: 'Exposes whether the billing team is acting as an outsourced software shop for large accounts or actually building scalable software.'
      },
      {
        targetConstraint: 'Analytical Query Speed vs. Transaction Integrity',
        questionText: 'Given the practitioner complaints around high-volume batch reporting latency, how is the architecture partitioned right now between real-time ledger settlement and analytical reporting data pipelines?',
        whyItHitsHard: 'Proves you immediately understand the technical trade-off between ACID transactions and analytical OLAP warehouses.'
      },
      {
        targetConstraint: 'Internal Friction & Bottlenecks',
        questionText: 'When your team ships critical billing primitives, where does velocity stall most—navigating multi-jurisdiction compliance regulations, or untangling legacy monolithic dependencies?',
        whyItHitsHard: 'Forces the interviewer to share their real daily frustration instead of giving you scripted marketing fluff.'
      }
    ],
    predictedCaseQuestions: [
      {
        prompt: '"How would you redesign our multi-currency invoice reconciliation to cut customer churn by 15%?"',
        theTrap: 'Bad PMs jump to wireframing a new UI table or adding filters. Executive PMs diagnose whether the data pipeline is async and evaluate automated dispute detection.',
        recommendedAngle: 'Propose an asynchronous background report worker with webhook notifications, coupled with an automated anomaly flagging service for billing discrepancies.'
      },
      {
        prompt: '"We have a backlog of 40 custom ERP connector requests from enterprise accounts. How do you prioritize them?"',
        theTrap: 'Saying you will use RICE scoring or ask sales who has the biggest contract.',
        recommendedAngle: 'Standardize a unified Webhook & Export Schema (CSV/Parquet via S3/Snowflake) and partner with 3P integration platforms rather than building 40 bespoke in-house pipes.'
      }
    ],
    candidateProofMapping: [
      {
        companyFriction: 'Query latency spikes and silent timeouts on large reporting exports.',
        candidateProofMetric: 'Architected multi-agent prompt evaluation pipeline reducing query latency by 42% across 1.2M monthly prompts.',
        immediateActionDay0To30: 'Audit p99 query latency across batch reporting jobs and deploy async worker queue to eliminate timeout 504 errors.'
      },
      {
        companyFriction: 'Enterprise onboarding drop-off due to permission complexity.',
        candidateProofMetric: 'Redesigned self-serve onboarding flow increasing trial-to-paid conversion by 18.4% across 45,000 monthly active workspaces.',
        immediateActionDay0To30: 'Map permission friction points and introduce guided interactive role templates for finance administrators.'
      }
    ]
  },
  linear: {
    company: 'Linear',
    scopedProduct: 'Core Issue Tracking, Insights & Enterprise Workflows',
    businessModel: 'Per-Seat Tiered SaaS ($8-$14/seat/mo + Enterprise custom)',
    revenueRunRate: 'Estimated $25M-$40M ARR (High capital efficiency, small ~50 person team)',
    burnOrMarginHealth: 'Exceptionally capital efficient; minimal burn, high gross margins (>85%)',
    leadershipQuote: '"Software should feel like an instrument—instant, keyboard-first, and opinionated."',
    realOperationalMess: [
      'Cross-functional teams (Legal, HR, Marketing) struggle with Linear because it lacks customizable Jira-style workflow state machines.',
      'Executive leadership at scaleups complains that cross-departmental portfolio reporting still requires exporting to Google Sheets.',
      'Enterprise permissions (RBAC) are rigid compared to legacy enterprise ticketing systems.'
    ],
    whyRoleIsOpen: 'Linear dominates startups and technical teams, but hitting the next growth phase ($50M+ ARR) requires expanding into non-technical teams and enterprise procurement without destroying the beloved minimalist speed.',
    hiringManagerPersona: 'Head of Product / Co-Founder (Karri Saarinen): Fiercely protective of craft, speed, and aesthetic minimalism; suspicious of enterprise PMs who bring bureaucratic Jira habits.',
    threeDiagnosticQuestions: [
      {
        targetConstraint: 'Enterprise Features vs. Craft & Minimalism',
        questionText: 'As Linear pushes upstream into 1,000+ seat organizations, how do you guard against product bloat when enterprise procurement demands complex approval matrices that clash with your opinionated, minimalist ethos?',
        whyItHitsHard: 'Directly acknowledges the founder’s deepest fear: turning Linear into the very Jira tool it set out to replace.'
      },
      {
        targetConstraint: 'Self-Serve PLG vs. Sales-Led Expansion',
        questionText: 'Where does expansion velocity break down today when a technical team loves Linear, but the non-technical departments (support, operations) refuse to adopt it?',
        whyItHitsHard: 'Proves you understand the exact commercial boundary between grassroots developer love and enterprise-wide licensing.'
      },
      {
        targetConstraint: 'Ecosystem & APIs',
        questionText: 'Given the hesitation to add custom workflow complexity natively, how much of enterprise extensibility are you delegating to GraphQL API automations vs. first-party capabilities?',
        whyItHitsHard: 'Shows you think about platform architecture and partner ecosystems as a release valve for product bloat.'
      }
    ],
    predictedCaseQuestions: [
      {
        prompt: '"Enterprise customers want custom issue fields and approval workflows. How would you handle this in Linear?"',
        theTrap: 'Adding a bunch of dropdowns, forms, and custom state settings that slow down the UI.',
        recommendedAngle: 'Keep the core issue card pristine; introduce modular metadata chips and keyboard-accessible custom attributes that remain invisible unless explicitly invoked.'
      }
    ],
    candidateProofMapping: [
      {
        companyFriction: 'Non-technical cross-functional adoption barriers.',
        candidateProofMetric: 'Redesigned self-serve onboarding flow increasing trial-to-paid conversion by 18.4% across 45,000 monthly active workspaces.',
        immediateActionDay0To30: 'Design frictionless workflow presets tailored for Design and Operations teams without altering engineering defaults.'
      }
    ]
  }
};

// Generic Fallback Generator for any target company
function generateDynamicProfile(company: string, role: string): CompanyIntelligenceProfile {
  return {
    company,
    scopedProduct: `${company} Core Platform & Growth`,
    businessModel: 'B2B Tiered SaaS / Enterprise Licensing',
    revenueRunRate: 'Growth-Stage Scale ($50M - $200M ARR estimate)',
    burnOrMarginHealth: 'Disciplined Capital Allocation (Focus on runway extension & unit economics)',
    leadershipQuote: `"Our objective is accelerating customer value while scaling platform reliability."`,
    realOperationalMess: [
      'Customer support response times and ticket resolution SLAs have extended as customer volume outpaced tooling.',
      'Legacy architectural debt creates intermittent feature delivery delays on quarterly roadmaps.',
      'Feature discovery drops sharply after initial onboarding, with power-user capabilities underutilized.'
    ],
    whyRoleIsOpen: `The ${company} product organization needs an experienced leader in the ${role} position who can cut through technical debt, establish clear delivery metrics, and align engineering velocity with sales ARR goals.`,
    hiringManagerPersona: `VP of Product / Director: Focused on accelerating quarterly feature velocity while reducing cross-functional churn and customer escalations.`,
    threeDiagnosticQuestions: [
      {
        targetConstraint: 'Growth vs. Infrastructure Debt',
        questionText: `With ${company} focusing on top-line expansion, how is the leadership team currently dividing engineering bandwidth between new customer-facing revenue features and foundational architectural refactoring?`,
        whyItHitsHard: 'Shows you immediately recognize the constant tension between sales demands and engineering health.'
      },
      {
        targetConstraint: 'Departmental Velocity Drag',
        questionText: `When high-priority initiatives miss their target sprint milestones, where does friction typically occur—ambiguous requirements, cross-team API dependencies, or shifting executive priorities?`,
        whyItHitsHard: 'Positions you as a pragmatic operator who diagnoses root-cause operational friction.'
      },
      {
        targetConstraint: 'Customer Retention Leakage',
        questionText: `What is the #1 reason paying accounts cite when evaluating alternative platforms or downgrading at annual renewal?`,
        whyItHitsHard: 'Moves the conversation straight to revenue retention and customer truth.'
      }
    ],
    predictedCaseQuestions: [
      {
        prompt: `"You have 3 months to improve our core product activation rate by 20%. What is your playbook?"`,
        theTrap: 'Proposing cosmetic UI redesigns without telemetry.',
        recommendedAngle: 'Step 1: Instrument funnels to find the drop-off drop-point; Step 2: Eliminate mandatory setup steps; Step 3: Implement guided contextual onboarding.'
      }
    ],
    candidateProofMapping: [
      {
        companyFriction: 'Feature delivery latency and unmeasured telemetry.',
        candidateProofMetric: 'Architected multi-agent prompt evaluation pipeline reducing query latency by 42% across 1.2M monthly prompts.',
        immediateActionDay0To30: 'Audit performance bottlenecks and establish clean baseline telemetry dashboards for sprint KPIs.'
      }
    ]
  };
}

// Live Public Signal Harvester (Zero API Key Required)
async function harvestLiveSignals(company: string): Promise<RawSignal[]> {
  const signals: RawSignal[] = [];
  console.log(`[Intel Lab] Crawling live public web signals for "${company}"...`);

  try {
    // 1. Reddit Public Search JSON
    const redditQuery = encodeURIComponent(`${company} issue OR bug OR complaint OR alternative`);
    const redditRes = await fetch(`https://www.reddit.com/search.json?q=${redditQuery}&limit=4`, {
      headers: { 'User-Agent': 'BackdoorIntelLab/1.0' }
    });

    if (redditRes.ok) {
      const data = await redditRes.json();
      const posts = data?.data?.children || [];
      for (const p of posts) {
        const title = p?.data?.title || '';
        const selftext = p?.data?.selftext || '';
        const combined = `${title}: ${selftext}`.slice(0, 180);
        signals.push({
          source: `Reddit (r/${p?.data?.subreddit || 'all'})`,
          snippet: combined.replace(/\n/g, ' '),
          sentiment: 'critical',
          url: `https://reddit.com${p?.data?.permalink || ''}`
        });
      }
    }
  } catch (err) {
    console.warn(`[Intel Lab] Reddit live crawl skipped: ${(err as Error).message}`);
  }

  try {
    // 2. Hacker News Algolia API
    const hnQuery = encodeURIComponent(company);
    const hnRes = await fetch(`https://hn.algolia.com/api/v1/search?query=${hnQuery}&tags=comment&hitsPerPage=3`);
    if (hnRes.ok) {
      const data = await hnRes.json();
      const hits = data?.hits || [];
      for (const h of hits) {
        const text = (h?.comment_text || '').replace(/<[^>]*>/g, '').slice(0, 180);
        signals.push({
          source: 'Hacker News Comment',
          snippet: text.replace(/\n/g, ' '),
          sentiment: 'neutral',
          url: `https://news.ycombinator.com/item?id=${h?.story_id || h?.objectID}`
        });
      }
    }
  } catch (err) {
    console.warn(`[Intel Lab] HN live crawl skipped: ${(err as Error).message}`);
  }

  return signals;
}

// Format Renderers
function renderBattleCard(profile: CompanyIntelligenceProfile, role: string, signals: RawSignal[]): string {
  const questionsMd = profile.threeDiagnosticQuestions.map((q, idx) => `
### Question ${idx + 1}: ${q.targetConstraint}
> **"${q.questionText}"**
* **Why it hits hard:** ${q.whyItHitsHard}
`).join('');

  const proofMd = profile.candidateProofMapping.map((p) => `
* **Target Problem:** *"${p.companyFriction}"*
  * **Your Verified Proof Point:** \`${p.candidateProofMetric}\`
  * **Day 0–30 Action:** ${p.immediateActionDay0To30}
`).join('');

  const signalsMd = signals.length > 0 ? `
---

## 📡 Live Practitioner Signals (Freshly Audited)
${signals.map(s => `- **[${s.source}]**: *"${s.snippet}..."* ([Source](${s.url}))`).join('\n')}
` : '';

  return `# 🎯 Executive Interview Battle Card: ${profile.company}
**Target Role:** ${role}  
**Scoped Division:** ${profile.scopedProduct}  
**Generated At:** ${new Date().toISOString().split('T')[0]} | *Backdoor Intel Lab*

---

## ⚡ The 5-Minute Opening Narrative Hook
> *"While ${profile.company}'s leadership is publicly accelerating on ${profile.businessModel}, real-world operational drag around ${profile.realOperationalMess[0].toLowerCase()} is creating retention friction. My mandate in this ${role} position is fixing that exact operational leak in the first 60 days to protect customer expansion."*

---

## 🔍 The Insider Ground Truth (What's Actually Broken)
* **The Business Engine:** ${profile.businessModel} (${profile.revenueRunRate})
* **Financial Stance:** ${profile.burnOrMarginHealth}
* **Real Operational Leaks:**
${profile.realOperationalMess.map(m => `  1. ⚠️ **${m}**`).join('\n')}
* **Why This Role Is Open:** ${profile.whyRoleIsOpen}
* **Hiring Manager Mindset:** ${profile.hiringManagerPersona}

---

## 🥊 3 "Reverse-Grill" Diagnostic Questions (Solution Withheld)
*Ask these during the interview to expose their internal constraints and position yourself as a peer consultant:*
${questionsMd}

---

## 🛡️ Candidate Proof Point Alignment (The Transference Formula)
*How to directly anchor your verified past track record to their immediate operational leaks:*
${proofMd}
${signalsMd}
`;
}

function renderCaseSparring(profile: CompanyIntelligenceProfile, role: string): string {
  const casesMd = profile.predictedCaseQuestions.map((c, idx) => `
### Case ${idx + 1}: ${c.prompt}
* 🪤 **The Trap to Avoid:** ${c.theTrap}
* 💡 **The Staff/Principal PM Angle:** ${c.recommendedAngle}
`).join('\n---\n');

  return `# 🥋 Case Interview & Trap Predictor: ${profile.company}
**Target Role:** ${role} | **Scoped Product:** ${profile.scopedProduct}

---

## 🎯 What the Interviewer is Really Testing
Hiring managers at ${profile.company} do not want generic framework recitations. They want to know if you understand **${profile.whyRoleIsOpen}**.

---

${casesMd}
`;
}

function renderRawSignals(profile: CompanyIntelligenceProfile, signals: RawSignal[]): string {
  return `# 📊 Raw Audited Intelligence Signals: ${profile.company}
**Harvested At:** ${new Date().toISOString()}

## Curated Baseline
* **Business Model:** ${profile.businessModel}
* **Revenue Estimate:** ${profile.revenueRunRate}
* **Operational Leaks:**
${profile.realOperationalMess.map(m => `  - ${m}`).join('\n')}

## Live Web Signals (Count: ${signals.length})
${signals.map(s => `### [${s.source}]
* **Snippet:** ${s.snippet}
* **Sentiment:** ${s.sentiment.toUpperCase()}
* **URL:** ${s.url}
`).join('\n')}
`;
}

// Main Runner
async function main() {
  const args = parseArgs();
  console.log(`\n======================================================`);
  console.log(`🧪 BACKDOOR INTEL LAB: Standalone Research Harness`);
  console.log(`======================================================`);
  console.log(`Target Company : ${args.company}`);
  console.log(`Target Role    : ${args.role}`);
  console.log(`Format         : ${args.format.toUpperCase()}`);
  console.log(`Live Scraping  : ${args.live ? 'ENABLED (Reddit + HN)' : 'FAST BENCHMARK (0.1s)'}`);
  console.log(`------------------------------------------------------\n`);

  // 1. Resolve Profile (Curated or Dynamic)
  const normKey = args.company.trim().toLowerCase();
  const profile = CURATED_PROFILES[normKey] || generateDynamicProfile(args.company, args.role);

  // 2. Optional Live Harvesting
  let signals: RawSignal[] = [];
  if (args.live) {
    signals = await harvestLiveSignals(args.company);
  }

  // 3. Render Desired Output Format
  let markdownOutput = '';
  if (args.format === 'battlecard') {
    markdownOutput = renderBattleCard(profile, args.role, signals);
  } else if (args.format === 'case-sparring') {
    markdownOutput = renderCaseSparring(profile, args.role);
  } else {
    markdownOutput = renderRawSignals(profile, signals);
  }

  // 4. Save to Disk
  fs.writeFileSync(args.outFile, markdownOutput, 'utf-8');

  // 5. Preview in Terminal
  console.log(markdownOutput);
  console.log(`\n======================================================`);
  console.log(`✅ Saved standalone output to: ${args.outFile}`);
  console.log(`💡 You can open and inspect this file directly in your editor.`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('[Intel Lab Error]:', err);
  process.exit(1);
});
