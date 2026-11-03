import { NextRequest, NextResponse } from 'next/server';
import {
  WebhookJobItem,
  getWebhookIngestedJobs,
} from '@/engine/webhook-ingest';
import { ingestBatchJobs, RawJobInput } from '@/engine/ingestion-service';

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

    const rawJobInputs: RawJobInput[] = rawItems.map((item, i) => {
      const title =
        item.title ||
        item.jobTitle ||
        item['Job Title'] ||
        item['job_title'] ||
        item.role ||
        item.position ||
        'Senior Practitioner';

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
        'https://backdoor.app';

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
        item['Compensation'];

      const description =
        item.description ||
        item['Description'] ||
        item.snippet;

      return {
        externalId: `webhook-${Date.now()}-${i}`,
        title,
        company,
        applyUrl,
        location,
        salary,
        description,
        source: sourceParam,
      };
    });

    const batchResult = ingestBatchJobs(rawJobInputs);

    return NextResponse.json({
      success: true,
      count: batchResult.jobs.length,
      source: sourceParam,
      message: `Successfully ingested ${batchResult.jobs.length} roles from ${sourceParam} webhook.`,
      jobs: batchResult.jobs
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Webhook processing error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
