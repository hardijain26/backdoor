export interface ScrapedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
}

export async function runScraper(sourceName: string): Promise<ScrapedJob[]> {
  return [];
}
