/**
 * Backdoor Inbound Bulk Opportunity Upload Engine (Sprint 6 / M2-FR14)
 * Subsystem: @ingest/scout
 * 
 * Responsibilities:
 * 1. Enforces strict 6-column schema:
 *    [company_name, job_title, apply_url, location, workplace_type, raw_description]
 * 2. 50-row hard cap per batch to prevent batch abuse and scraping saturation.
 * 3. Pre-validation syntax & schema checking returning row-by-row diagnostics.
 * 4. Deduplication via canonical match key (normalized_company + normalized_title).
 * 5. Immediate pass-through to Module 3 deterministic scoring & decision audit logging.
 */

import { generateDedupMatchKey } from './dedup';
import { evaluateJobSuitability } from './scorer';
import { logDecisionEvent } from './sheet-mirror';

export const BULK_UPLOAD_COLUMNS = [
  'company_name',
  'job_title',
  'apply_url',
  'location',
  'workplace_type',
  'raw_description',
] as const;

export type BulkUploadColumn = (typeof BULK_UPLOAD_COLUMNS)[number];

export const VALID_WORKPLACE_TYPES = ['remote', 'hybrid', 'on-site'] as const;
export type WorkplaceType = (typeof VALID_WORKPLACE_TYPES)[number];

export const MAX_BULK_UPLOAD_ROWS = 50;

export interface BulkUploadRow {
  company_name: string;
  job_title: string;
  apply_url: string;
  location: string;
  workplace_type: WorkplaceType;
  raw_description: string;
}

export interface ValidationErrorItem {
  row: number;
  column: string;
  message: string;
}

export interface IngestedBulkJob {
  id: string;
  company: string;
  title: string;
  fitScore: number;
  stage: 'DISCOVERED';
  location: string;
  workplace: WorkplaceType;
  source: 'bulk_upload';
  postedHoursAgo: number;
  salary: string;
  description: string;
  sourceUrl: string;
  door1: { name: string; title: string; confidence: number };
  door2: { name: string; title: string; confidence: number };
  door3: { name: string; title: string; confidence: number };
  dedupMatchKey: string;
  track: string;
  createdAt: string;
}

export interface BulkUploadValidationResult {
  valid: boolean;
  errors: ValidationErrorItem[];
  rows: BulkUploadRow[];
  totalRows: number;
}

export interface BulkUploadExecutionResult {
  success: boolean;
  total: number;
  imported: number;
  deduplicated: number;
  jobs: IngestedBulkJob[];
  errors?: ValidationErrorItem[];
}

/**
 * Standard CSV template content with headers and sample valid row.
 */
export const BULK_UPLOAD_TEMPLATE_CSV = `company_name,job_title,apply_url,location,workplace_type,raw_description
Anthropic,Senior Product Manager,https://jobs.lever.co/anthropic/sample-pm,San Francisco CA,hybrid,Lead product development for next-generation frontier reasoning systems and developer APIs. Partner cross-functionally with research teams to optimize latency and unit economics.
`;

// Shared in-memory catalog store for deduplication
const IN_MEMORY_BULK_STORE = new Map<string, IngestedBulkJob>();

/**
 * Reset in-memory bulk upload store (used for clean testing).
 */
export function resetBulkUploadStore(): void {
  IN_MEMORY_BULK_STORE.clear();
}

/**
 * Parse an RFC 4180 compliant CSV string into a 2D array of string cells.
 * Supports quoted fields, escaped double quotes (""), embedded commas, and CRLF/LF newlines.
 */
export function parseRFC4180Csv(csvString: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = csvString.length;

  while (i < len) {
    const char = csvString[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && csvString[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (i + 1 < len && csvString[i + 1] === '\n') {
          i++;
        }
        row.push(field);
        field = '';
        if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
          result.push(row);
        }
        row = [];
        i++;
        continue;
      } else if (char === '\n') {
        row.push(field);
        field = '';
        if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
          result.push(row);
        }
        row = [];
        i++;
        continue;
      } else {
        field += char;
        i++;
        continue;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Validates parsed raw 2D grid against the 6-column schema and guardrails.
 */
export function validateBulkUploadGrid(grid: string[][]): BulkUploadValidationResult {
  const errors: ValidationErrorItem[] = [];
  const rows: BulkUploadRow[] = [];

  if (grid.length === 0) {
    return {
      valid: false,
      errors: [{ row: 0, column: 'file', message: 'Uploaded file is completely empty.' }],
      rows: [],
      totalRows: 0,
    };
  }

  const rawHeaders = grid[0].map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'));
  const headerMap = new Map<string, number>();
  rawHeaders.forEach((h, idx) => headerMap.set(h, idx));

  // Verify all 6 mandatory columns exist in header
  for (const col of BULK_UPLOAD_COLUMNS) {
    if (!headerMap.has(col)) {
      errors.push({
        row: 1,
        column: col,
        message: `Missing mandatory column "${col}" in header row.`,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, rows: [], totalRows: 0 };
  }

  const dataRows = grid.slice(1).filter((r) => r.some((c) => c.trim() !== ''));

  // 50-Row Hard Cap
  if (dataRows.length > MAX_BULK_UPLOAD_ROWS) {
    return {
      valid: false,
      errors: [
        {
          row: 0,
          column: 'batch_limit',
          message: `Upload exceeds maximum batch limit of ${MAX_BULK_UPLOAD_ROWS} rows`,
        },
      ],
      rows: [],
      totalRows: dataRows.length,
    };
  }

  const colIdx = {
    company_name: headerMap.get('company_name')!,
    job_title: headerMap.get('job_title')!,
    apply_url: headerMap.get('apply_url')!,
    location: headerMap.get('location')!,
    workplace_type: headerMap.get('workplace_type')!,
    raw_description: headerMap.get('raw_description')!,
  };

  dataRows.forEach((rowCells, i) => {
    const rowNum = i + 1; // 1-based data row index

    const company = (rowCells[colIdx.company_name] || '').trim();
    const title = (rowCells[colIdx.job_title] || '').trim();
    const applyUrl = (rowCells[colIdx.apply_url] || '').trim();
    const location = (rowCells[colIdx.location] || '').trim();
    const rawWorkplace = (rowCells[colIdx.workplace_type] || '').trim().toLowerCase();
    const description = (rowCells[colIdx.raw_description] || '').trim();

    // 1. company_name
    if (!company) {
      errors.push({ row: rowNum, column: 'company_name', message: 'Company name is required' });
    }

    // 2. job_title
    if (!title) {
      errors.push({ row: rowNum, column: 'job_title', message: 'Job title is required' });
    }

    // 3. apply_url
    if (!applyUrl) {
      errors.push({ row: rowNum, column: 'apply_url', message: 'Apply URL is required' });
    } else {
      try {
        const u = new URL(applyUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          errors.push({
            row: rowNum,
            column: 'apply_url',
            message: 'Apply URL must be a valid HTTP or HTTPS URL',
          });
        }
      } catch {
        errors.push({
          row: rowNum,
          column: 'apply_url',
          message: 'Apply URL must be a valid HTTP or HTTPS URL',
        });
      }
    }

    // 4. location
    if (!location) {
      errors.push({ row: rowNum, column: 'location', message: 'Location is required' });
    }

    // 5. workplace_type
    const normalizedWorkplace = rawWorkplace.replace(/\s+/g, '-');
    if (!VALID_WORKPLACE_TYPES.includes(normalizedWorkplace as WorkplaceType)) {
      errors.push({
        row: rowNum,
        column: 'workplace_type',
        message: 'Workplace type must be one of: remote, hybrid, on-site',
      });
    }

    // 6. raw_description (min 20 chars)
    if (!description || description.length < 20) {
      errors.push({
        row: rowNum,
        column: 'raw_description',
        message: 'Raw description must be at least 20 characters',
      });
    }

    if (errors.length === 0 || !errors.some((e) => e.row === rowNum)) {
      rows.push({
        company_name: company,
        job_title: title,
        apply_url: applyUrl,
        location,
        workplace_type: (normalizedWorkplace as WorkplaceType) || 'hybrid',
        raw_description: description,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    rows: errors.length === 0 ? rows : [],
    totalRows: dataRows.length,
  };
}

/**
 * Ingests validated bulk rows, performs deduplication, executes Module 3 scoring,
 * and appends to decision audit logs.
 */
export function executeBulkUpload(rows: BulkUploadRow[]): BulkUploadExecutionResult {
  let importedCount = 0;
  let deduplicatedCount = 0;
  const processedJobs: IngestedBulkJob[] = [];

  for (const [idx, row] of rows.entries()) {
    const dedupMatchKey = generateDedupMatchKey(row.company_name, row.job_title);
    const existing = IN_MEMORY_BULK_STORE.get(dedupMatchKey);

    if (existing) {
      deduplicatedCount++;
      // Append unique location and keep earliest record
      if (!existing.location.includes(row.location)) {
        existing.location = `${existing.location}, ${row.location}`;
      }
      processedJobs.push(existing);
      continue;
    }

    // Module 3 Deterministic Suitability Evaluation
    const evalResult = evaluateJobSuitability({
      title: row.job_title,
      company: row.company_name,
      locations: [row.location],
      descriptionText: row.raw_description,
    });

    const newJob: IngestedBulkJob = {
      id: `bulk-${Date.now()}-${idx}`,
      company: row.company_name,
      title: row.job_title,
      fitScore: evalResult.fitScore,
      stage: 'DISCOVERED',
      location: row.location,
      workplace: row.workplace_type,
      source: 'bulk_upload',
      postedHoursAgo: 0,
      salary: '$180,000 - $240,000 + Equity',
      description: row.raw_description,
      sourceUrl: row.apply_url,
      door1: { name: 'Executive Leader', title: 'VP / Head of Department', confidence: 92 },
      door2: { name: 'Talent Acquisition', title: 'Lead Recruiter', confidence: 88 },
      door3: { name: 'Staff Peer', title: 'Senior Practitioner', confidence: 84 },
      dedupMatchKey,
      track: 'Senior / Staff PM',
      createdAt: new Date().toISOString(),
    };

    IN_MEMORY_BULK_STORE.set(dedupMatchKey, newJob);
    processedJobs.push(newJob);
    importedCount++;

    // Immutable Decision Event Log
    logDecisionEvent({
      eventType: 'BULK_OPPORTUNITY_IMPORTED',
      jobId: newJob.id,
      company: newJob.company,
      actorType: 'CANDIDATE',
      details: `Bulk ingested opportunity: ${newJob.title} (${newJob.fitScore}% FIT) via standardized inbound file.`,
    });
  }

  return {
    success: true,
    total: rows.length,
    imported: importedCount,
    deduplicated: deduplicatedCount,
    jobs: processedJobs,
  };
}
