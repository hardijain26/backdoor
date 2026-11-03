import { NextRequest, NextResponse } from 'next/server';
import { evaluateJobSuitability } from '@/engine/scorer';
import {
  WebhookJobItem,
  getWebhookIngestedJobs,
  addWebhookIngestedJob
} from '@/engine/webhook-ingest';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ingest/webhook
 * Returns documentation and status for webhook integrations (Browse.ai, Apify, Zapier).
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3001';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/ingest/webhook`;
  const storedJobs = getWebhookIngestedJobs();

  return NextResponse.json({
    status: 'ACTIVE',
    service: 'Backdoor Inbound Webhook Receiver',
    webhookUrl,
    supportedPlatforms: ['Browse.ai', 'Apify', 'Zapier', 'Make.com', 'Custom Scrapers'],
    browseAiInstructions: {
      step1: 'In Browse.ai dashboard, open your YC Robot (e.g. "Extract job postings from Y Combinator")',
      step2: 'Click on the "Integrate" tab in the robot navigation bar',
      step3: 'Select "Webhooks" and click "Add Webhook"',
      step4: `Set Webhook URL to: ${webhookUrl}`,
      step5: 'Select Event: "Task Finished" or "Captured Data"',
      step6: 'Save webhook. Whenever the robot runs, all extracted jobs are scored and staged onto your Morning Radar automatically.'
    },
    samplePayloadAccepted: {
      task: {
        capturedLists: {
          job_postings: [
            {
              "Job Title": "Staff Product Manager",
              "Company": "PostHog",
              "Job URL": "https://www.workatastartup.com/companies/posthog",
              "Location": "Remote",
              "Salary": "$160,000 - $210,000"
            }
          ]
        }
      }
    },
    currentlyStoredCount: storedJobs.length,
    jobs: storedJobs
  });
}

/**
 * POST /api/ingest/webhook
 * Accepts incoming webhooks from Browse.ai, Apify, or custom crawlers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for ping / verification event
    if (body.event === 'test' || body.ping || body.challenge) {
      return NextResponse.json({
        success: true,
        message: 'Backdoor webhook handshake verified.',
        challenge: body.challenge
      });
    }

    // 1. Extract raw job items from various platform schemas
    let rawItems: any[] = [];

    // Browse.ai schema: body.task.capturedLists[listName]
    if (body.task && body.task.capturedLists) {
      const lists = body.task.capturedLists;
      for (const key of Object.keys(lists)) {
        if (Array.isArray(lists[key])) {
          rawItems.push(...lists[key]);
        }
      }
    } else if (body.capturedLists) {
      for (const key of Object.keys(body.capturedLists)) {
        if (Array.isArray(body.capturedLists[key])) {
          rawItems.push(...body.capturedLists[key]);
        }
      }
    } else if (Array.isArray(body.data)) {
      rawItems = body.data;
    } else if (Array.isArray(body.jobs)) {
      rawItems = body.jobs;
    } else if (Array.isArray(body.items)) {
      rawItems = body.items;
    } else if (Array.isArray(body)) {
      rawItems = body;
    } else if (body.title || body.jobTitle || body['Job Title']) {
      rawItems = [body];
    }

    if (rawItems.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Webhook received successfully, but no job items found in payload.'
      });
    }

    // Determine source from query params or payload (default to yc_startup)
    const { searchParams } = new URL(req.url);
    const sourceParam = searchParams.get('source') || body.source || 'yc_startup';

    const ingested: WebhookJobItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];

      // Flexible key extraction across Browse.ai, Apify, and custom fields
      const title =
        item.title ||
        item.jobTitle ||
        item['Job Title'] ||
        item['job_title'] ||
        item.role ||
        item.position ||
        'Product Manager';

      const company =
        item.company ||
        item.companyName ||
        item['Company'] ||
        item['Company Name'] ||
        item['company_name'] ||
        item.startup ||
        'YC Startup';

      const applyUrl =
        item.url ||
        item.link ||
        item.applyUrl ||
        item['Job URL'] ||
        item['job_url'] ||
        item['Link'] ||
        `https://www.workatastartup.com/companies?role=product`;

      const location =
        item.location ||
        item['Location'] ||
        item.city ||
        item.workplace ||
        'Remote (US/Global)';

      const salary =
        item.salary ||
        item['Salary'] ||
        item.compensation ||
        item['Compensation'] ||
        '$160,000 - $220,000 + Equity';

      const description =
        item.description ||
        item['Description'] ||
        item.snippet ||
        `${title} at ${company}. Lead core product vision, user workflows, roadmaps, and cross-functional execution.`;

      let normLocation = location;
      if (
        /san francisco|new york|seattle|austin|chicago|boston|los angeles|california|\bca\b|\bny\b|\btx\b|\bwa\b/i.test(
          location
        ) &&
        !/us\b|usa\b|united states/i.test(location)
      ) {
        normLocation = `${location} (US)`;
      }

      // Evaluate suitability score
      const evalResult = evaluateJobSuitability({
        title,
        company,
        locations: [normLocation],
        descriptionText: description
      });

      const workplaceType = location.toLowerCase().includes('remote')
        ? ('remote' as const)
        : location.toLowerCase().includes('hybrid')
        ? ('hybrid' as const)
        : ('onsite' as const);

      const job: WebhookJobItem = {
        id: `webhook-${Date.now()}-${i}`,
        company,
        title,
        fitScore: evalResult.fitScore,
        stage: 'DISCOVERED',
        location,
        workplace: workplaceType,
        salary,
        source: sourceParam,
        postedHoursAgo: 1,
        door1: { name: 'Founder & CEO', title: `${company} Executive` },
        door2: { name: 'Talent Acquisition', title: 'Hiring Lead' },
        door3: { name: 'Lead Product Manager', title: 'Product Team' },
        applyUrl
      };

      ingested.push(job);
      addWebhookIngestedJob(job);
    }

    return NextResponse.json({
      success: true,
      count: ingested.length,
      source: sourceParam,
      message: `Successfully ingested ${ingested.length} roles from ${sourceParam} webhook.`,
      jobs: ingested
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Webhook processing error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
