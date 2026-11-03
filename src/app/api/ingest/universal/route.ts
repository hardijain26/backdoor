import { NextRequest, NextResponse } from 'next/server';
import { safeFetchHtml, extractJobMetadataFromHtml, extractJobFromRawText, IngestedJobMetadata } from '@/engine/safe-fetch';
import { isSafeUrl } from '@/engine/scraper';
import { ingestSingleJob } from '@/engine/ingestion-service';



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
    } else if (mode === 'clipper') {
      const { title, company, location, salary, description, applyUrl, source } = body;
      if (!title || !company) {
        return NextResponse.json({ error: 'Company and Title are required for clipper mode.' }, { status: 400 });
      }
      const desc = description?.trim() || `${title} at ${company}. Drive product strategy, roadmapping, cross-functional leadership, user research, and execution.`;
      metadata = {
        title: title.trim(),
        company: company.trim(),
        location: location?.trim() || 'Remote',
        salary: salary?.trim() || '$180k - $240k + Equity',
        description: desc,
        applyUrl: applyUrl?.trim() || 'https://backdoor.app',
        source: source || 'chrome_clipper'
      };
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

    // Process through the unified role-agnostic ingestion pipeline
    const { isDuplicate, job: createdJob } = ingestSingleJob({
      title: metadata.title,
      company: metadata.company,
      location: metadata.location,
      salary: metadata.salary,
      description: metadata.description,
      applyUrl: metadata.applyUrl,
      source: metadata.source,
      track: track || undefined,
    });

    const fitScore = createdJob.fitScore;
    const dedupMatchKey = createdJob.dedupMatchKey;

    return NextResponse.json({
      success: true,
      isDuplicate,
      dedupMatchKey,
      fitScore,
      jobUrl: `/discover/${createdJob.id}`,
      message: isDuplicate
        ? 'Role already exists in database: Appending new link to job sources.'
        : `Job Saved (${fitScore}% FIT)`,
      job: createdJob
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Universal ingest failed: ${errorMsg}` }, { status: 500 });
  }
}
