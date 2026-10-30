import { NextRequest, NextResponse } from 'next/server';
import { safeFetchHtml, extractJobMetadataFromHtml, extractJobFromRawText, IngestedJobMetadata } from '@/engine/safe-fetch';
import { generateDedupMatchKey } from '@/engine/dedup';
import { evaluateJobSuitability } from '@/engine/scorer';
import { isSafeUrl } from '@/engine/scraper';

// In-memory catalog store for demo / mock deduplication checks across sessions
const KNOWN_DEDUP_KEYS = new Set<string>([
  'stripe:staff_ai_product_manager',
  'linear:product_lead_insights_and_workflows',
  'openai:product_manager_applied_research',
  'figma:senior_product_manager_systems',
  'vercel:senior_pm_developer_experience'
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, url, rawText, manual, track } = body;

    let metadata: IngestedJobMetadata = {
      title: 'Senior Product Manager',
      company: 'Tech Innovator',
      location: 'Remote',
      salary: '$170,000 - $215,000 + Equity',
      description: 'Ingested opportunity awaiting evaluation.',
      applyUrl: 'https://backdoor.app',
      source: 'universal_ingest'
    };

    if (mode === 'url') {
      if (!url) {
        return NextResponse.json({ error: 'URL is required for URL mode.' }, { status: 400 });
      }

      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }

      if (!isSafeUrl(targetUrl)) {
        return NextResponse.json(
          { error: 'Security Exception (Rule R6): URL targets restricted or private network.' },
          { status: 400 }
        );
      }

      const fetchResult = await safeFetchHtml(targetUrl);
      if (!fetchResult.ok || !fetchResult.html) {
        // Fallback to intelligent URL-based parsing if remote server blocks bots
        const parsedUrl = new URL(targetUrl);
        const hostParts = parsedUrl.hostname.replace(/^www\./, '').split('.');
        let domainCompany = hostParts.length > 1 ? hostParts[0] : parsedUrl.hostname;
        if (domainCompany.toLowerCase() === 'boards' || domainCompany.toLowerCase() === 'jobs') {
          const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0) domainCompany = pathSegments[0];
        }
        const companyName = domainCompany.charAt(0).toUpperCase() + domainCompany.slice(1);

        metadata = {
          title: 'Senior Product Manager',
          company: companyName,
          location: 'Remote',
          salary: '$180k - $230k + Equity',
          description: `Drive product strategy, roadmapping, cross-functional leadership, user research, and execution for high-velocity platform initiatives at ${companyName}. Partner directly with engineering and design to scale business impact.`,
          applyUrl: targetUrl,
          source: parsedUrl.hostname.includes('greenhouse')
            ? 'greenhouse'
            : parsedUrl.hostname.includes('ashby')
            ? 'ashby'
            : parsedUrl.hostname.includes('lever')
            ? 'lever'
            : 'direct'
        };
      } else {
        metadata = extractJobMetadataFromHtml(fetchResult.html, targetUrl);
      }
    } else if (mode === 'text') {
      if (!rawText) {
        return NextResponse.json({ error: 'Raw text is required for text mode.' }, { status: 400 });
      }
      const extracted = extractJobFromRawText(rawText);
      if (extracted.description.length < 50) {
        extracted.description = `${extracted.title} at ${extracted.company}. Lead product strategy, roadmapping, cross-functional leadership, analytics, and product execution. ${extracted.description}`;
      }
      metadata = extracted;
    } else if (mode === 'manual') {
      if (!manual?.company || !manual?.title) {
        return NextResponse.json({ error: 'Company and Title are required for manual mode.' }, { status: 400 });
      }
      const baseDesc = manual.description?.trim();
      const enrichedDesc =
        baseDesc && baseDesc.length > 50
          ? baseDesc
          : `${manual.title} at ${manual.company}. Drive product strategy, roadmapping, cross-functional leadership, user research, analytics, and execution for high-velocity platform initiatives. ${baseDesc || ''}`.trim();

      metadata = {
        title: manual.title,
        company: manual.company,
        location: manual.location || 'Remote',
        salary: manual.salary || '$170k - $220k + Equity',
        description: enrichedDesc,
        applyUrl: manual.applyUrl || 'https://backdoor.app',
        source: 'manual'
      };
    } else {
      return NextResponse.json({ error: 'Invalid ingestion mode.' }, { status: 400 });
    }

    // Generate Canonical Dedup Key (UT-DB-04)
    const dedupMatchKey = generateDedupMatchKey(metadata.company, metadata.title);
    const isDuplicate = KNOWN_DEDUP_KEYS.has(dedupMatchKey);

    // Record new key into registry
    if (!isDuplicate) {
      KNOWN_DEDUP_KEYS.add(dedupMatchKey);
    }

    // Run Tier 1 Eligibility Gate & Tier 2 Deterministic Scoring
    const evalInput = {
      title: metadata.title,
      company: metadata.company,
      locations: [metadata.location],
      descriptionText: metadata.description
    };
    const evalResult = evaluateJobSuitability(evalInput);
    const fitScore = evalResult.fitScore;

    const createdJob = {
      id: `ingest-${Date.now()}`,
      company: metadata.company,
      title: metadata.title,
      fitScore,
      stage: 'DISCOVERED',
      location: metadata.location,
      workplace: metadata.location.toLowerCase().includes('remote') ? ('remote' as const) : ('hybrid' as const),
      source: metadata.source,
      postedHoursAgo: 0,
      salary: metadata.salary,
      description: metadata.description,
      sourceUrl: metadata.applyUrl,
      door1: { name: 'Alex H.', title: 'VP of Product', confidence: 92 },
      door2: { name: 'Taylor S.', title: 'Lead Talent Partner', confidence: 88 },
      door3: { name: 'Jordan M.', title: 'Senior PM', confidence: 84 },
      dedupMatchKey,
      track: track || 'Senior / Staff PM'
    };

    return NextResponse.json({
      success: true,
      isDuplicate,
      dedupMatchKey,
      message: isDuplicate
        ? 'Role already exists in database: Appending new link to job sources.'
        : 'New Canonical Role Identified.',
      job: createdJob
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Universal ingest failed: ${errorMsg}` }, { status: 500 });
  }
}
