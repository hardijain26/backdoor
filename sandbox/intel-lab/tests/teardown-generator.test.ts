/**
 * Test Suite: tests/teardown-generator.test.ts
 * Verifies SCR-T07: Headless Google Docs Executive 1-Pager Exporter
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  buildExecutive1PagerText,
  exportTeardownToGoogleDoc,
} from '../src/engine/gdocs-exporter';
import { getOrFetchCompanyDataProduct, getOrGenerateRoleTeardown } from '../src/engine/teardown';
import { HARDI_PROOF_POINTS_LIBRARY } from '../src/engine/cv-builder';

test('SCR-T07-01: Formats complete Executive 1-Pager plain text with all 5 core sections', async () => {
  const companyId = 'comp-gdoc-01';
  const proofPoints = HARDI_PROOF_POINTS_LIBRARY.slice(0, 2).map((pp) => ({
    id: pp.id,
    metricText: pp.statement,
  }));

  const { dataProduct } = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Stripe',
    scopedProduct: 'Stripe Connect',
  });

  const { synthesis } = await getOrGenerateRoleTeardown({
    userId: 'user-gdoc',
    jobId: 'job-gdoc',
    companyId,
    companyName: 'Stripe',
    roleTitle: 'Principal Product Manager',
    scopedProduct: 'Stripe Connect',
    candidateProofPoints: proofPoints,
  });

  const docText = buildExecutive1PagerText({
    candidateName: 'Hardi Jain',
    roleTitle: 'Principal Product Manager',
    companyName: 'Stripe',
    scopedProduct: 'Stripe Connect',
    synthesis,
    dataProduct,
  });

  assert.match(docText, /EXECUTIVE TEARDOWN & VALUE BLUEPRINT/);
  assert.match(docText, /1\. CORPORATE SNAPSHOT & LEADERSHIP COMPASS/);
  assert.match(docText, /2\. THE STRATEGIC DISCREPANCY/);
  assert.match(docText, /3\. TOP 5 CUSTOMER FRICTION POINTS/);
  assert.match(docText, /4\. THREE ZERO-SOLUTION DIAGNOSTIC QUESTIONS/);
  assert.match(docText, /5\. DUAL-TRACK 30-60-90 DAY/);
  assert.match(docText, /PATH A: VELOCITY & TRIAGE/);
  assert.match(docText, /PATH B: SCALABILITY & ARCHITECTURE/);
  assert.match(docText, /COLLABORATIVE CLOSING PROMPT/);
});

test('SCR-T07-02: Generates valid Google Doc URL and persists into company_briefs.funding_details', async () => {
  const companyId = 'comp-gdoc-02';
  const proofPoints = HARDI_PROOF_POINTS_LIBRARY.slice(0, 2).map((pp) => ({
    id: pp.id,
    metricText: pp.statement,
  }));

  const { dataProduct } = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Datadog',
  });

  const { synthesis } = await getOrGenerateRoleTeardown({
    userId: 'user-gdoc-2',
    jobId: 'job-gdoc-2',
    companyId,
    companyName: 'Datadog',
    roleTitle: 'Staff Engineer',
    candidateProofPoints: proofPoints,
  });

  const exportResult = await exportTeardownToGoogleDoc({
    candidateName: 'Hardi Jain',
    roleTitle: 'Staff Engineer',
    companyName: 'Datadog',
    scopedProduct: 'Datadog APM',
    companyId,
    synthesis,
    dataProduct,
  });

  assert.strictEqual(exportResult.success, true);
  assert.match(exportResult.googleDocUrl, /^(\/intel\/teardown\/preview|https:\/\/docs\.google\.com\/document\/d\/)/i);
  assert.strictEqual(exportResult.persistedToBrief, true);
  assert.match(exportResult.title, /Executive Teardown: Staff Engineer/);
});

test('SCR-T07-03: Mock Google Docs API interaction handles docs.create and batchUpdate', async () => {
  const companyId = 'comp-gdoc-03';
  const proofPoints = HARDI_PROOF_POINTS_LIBRARY.slice(0, 2).map((pp) => ({
    id: pp.id,
    metricText: pp.statement,
  }));

  const { dataProduct } = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Uber',
    scopedProduct: 'Uber Freight',
  });

  const { synthesis } = await getOrGenerateRoleTeardown({
    userId: 'user-gdoc-3',
    jobId: 'job-gdoc-3',
    companyId,
    companyName: 'Uber',
    roleTitle: 'Product Lead',
    candidateProofPoints: proofPoints,
  });

  // Mock Google API fetcher
  const apiCalls: string[] = [];
  const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = url.toString();
    apiCalls.push(urlStr);

    if (urlStr === 'https://docs.googleapis.com/v1/documents') {
      return new Response(JSON.stringify({ documentId: 'google-doc-12345' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (urlStr.includes(':batchUpdate')) {
      return new Response(JSON.stringify({ replies: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({}), { status: 200 });
  };

  const exportResult = await exportTeardownToGoogleDoc({
    candidateName: 'Hardi Jain',
    roleTitle: 'Product Lead',
    companyName: 'Uber',
    scopedProduct: 'Uber Freight',
    companyId,
    synthesis,
    dataProduct,
    googleAccessToken: 'mock-oauth-token-1234567890',
    fetchFn: mockFetch as unknown as typeof fetch,
  });

  assert.strictEqual(exportResult.success, true);
  assert.strictEqual(exportResult.documentId, 'google-doc-12345');
  assert.strictEqual(exportResult.googleDocUrl, 'https://docs.google.com/document/d/google-doc-12345/edit');
  assert.strictEqual(exportResult.batchUpdateApplied, true);
  assert.strictEqual(apiCalls.length, 2, 'Must invoke docs.create and documents:batchUpdate');
});

