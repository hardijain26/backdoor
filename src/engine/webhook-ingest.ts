/**
 * Webhook Ingestion Store & Types (Browse.ai, Apify, Zapier)
 */

export interface WebhookJobItem {
  id: string;
  company: string;
  title: string;
  fitScore: number;
  stage: 'DISCOVERED' | 'CHOSEN' | 'SKIPPED';
  location: string;
  workplace: 'remote' | 'hybrid' | 'onsite';
  salary?: string;
  source: string;
  postedHoursAgo: number;
  door1?: { name: string; title: string };
  door2?: { name: string; title: string };
  door3?: { name: string; title: string };
  applyUrl?: string;
}

let webhookJobStore: WebhookJobItem[] = [];

export function getWebhookIngestedJobs(): WebhookJobItem[] {
  return [...webhookJobStore];
}

export function clearWebhookIngestedJobs(): void {
  webhookJobStore = [];
}

export function addWebhookIngestedJob(job: WebhookJobItem): void {
  webhookJobStore.unshift(job);
}
