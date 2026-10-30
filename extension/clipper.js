/**
 * BACKDOOR v1.0 - CHROME EXTENSION 1-CLICK JOB CLIPPER
 * Path: extension/clipper.js
 * Subsystem: @extension/clipper (Runbook §5.2.3 & PRD M2-FR3)
 *
 * Responsibilities:
 * 1. High-fidelity DOM parsers for LinkedIn, Greenhouse, Lever, Workday, and Indeed.
 * 2. Generic JSON-LD schema.org and OpenGraph fallback for any career site.
 * 3. Ingests extracted job to Backdoor API (/api/ingest/universal) with immediate Tier 1 & 2 scoring.
 * 4. Displays floating toast notification with fit score and direct link to Backdoor Dossier.
 * 5. Rule R7 Compliant (strictly zero forbidden color palettes per Rule R7).
 */

(function () {
  'use strict';

  // ============================================================================
  // 1. DOM Extractor Implementations
  // ============================================================================

  /**
   * LinkedIn Job Page Extractor
   */
  function extractLinkedInJob(doc) {
    // Title
    const titleEl =
      doc.querySelector('.job-details-jobs-unified-top-card__job-title') ||
      doc.querySelector('.top-card-layout__title') ||
      doc.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // Company
    const companyEl =
      doc.querySelector('.job-details-jobs-unified-top-card__company-name') ||
      doc.querySelector('.topcard__flavor--black-link') ||
      doc.querySelector('.top-card-layout__first-sub-headline a');
    const company = companyEl ? companyEl.textContent.trim() : '';

    // Location
    const locationEl =
      doc.querySelector('.job-details-jobs-unified-top-card__bullet') ||
      doc.querySelector('.topcard__flavor--bullet') ||
      doc.querySelector('.top-card-layout__second-sub-headline');
    const location = locationEl ? locationEl.textContent.trim() : 'Remote';

    // Description
    const descEl =
      doc.querySelector('#job-details') ||
      doc.querySelector('.show-more-less-html__markup') ||
      doc.querySelector('.description__text');
    const description = descEl ? descEl.textContent.trim() : '';

    return { title, company, location, description, source: 'linkedin' };
  }

  /**
   * Greenhouse ATS Extractor
   */
  function extractGreenhouseJob(doc) {
    const titleEl = doc.querySelector('.app-title') || doc.querySelector('h1.job-name') || doc.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim() : '';

    const companyEl = doc.querySelector('.company-name') || doc.querySelector('.company') || doc.querySelector('title');
    let company = companyEl ? companyEl.textContent.trim() : '';
    if (company.includes('at ')) company = company.split('at ')[1].split(' - ')[0].trim();

    const locationEl = doc.querySelector('.location') || doc.querySelector('.body--metadata');
    const location = locationEl ? locationEl.textContent.trim() : 'Remote';

    const descEl = doc.querySelector('#content') || doc.querySelector('#job-description') || doc.querySelector('.body');
    const description = descEl ? descEl.textContent.trim() : '';

    return { title, company, location, description, source: 'greenhouse' };
  }

  /**
   * Lever ATS Extractor
   */
  function extractLeverJob(doc) {
    const titleEl = doc.querySelector('.posting-headline h2') || doc.querySelector('h2');
    const title = titleEl ? titleEl.textContent.trim() : '';

    const companyEl = doc.querySelector('.main-header-logo img') || doc.querySelector('.posting-headline h2');
    let company = companyEl && companyEl.alt ? companyEl.alt.replace(/logo/i, '').trim() : '';
    if (!company && doc.title) {
      const parts = doc.title.split('-');
      if (parts.length > 1) company = parts[parts.length - 1].trim();
    }

    const locationEl = doc.querySelector('.posting-categories .location') || doc.querySelector('.sort-by-time');
    const location = locationEl ? locationEl.textContent.trim() : 'Remote';

    const descEl = doc.querySelector('.section-page') || doc.querySelector('.posting-page');
    const description = descEl ? descEl.textContent.trim() : '';

    return { title, company, location, description, source: 'lever' };
  }

  /**
   * Workday Extractor
   */
  function extractWorkdayJob(doc) {
    const titleEl = doc.querySelector('[data-automation-id="jobPostingHeader"]') || doc.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim() : '';

    const companyEl = doc.querySelector('[data-automation-id="companyName"]') || doc.querySelector('title');
    let company = companyEl ? companyEl.textContent.trim() : '';
    if (company.includes('-')) company = company.split('-')[0].trim();

    const locationEl = doc.querySelector('[data-automation-id="locations"]') || doc.querySelector('[data-automation-id="jobPostingLocation"]');
    const location = locationEl ? locationEl.textContent.trim() : 'Remote';

    const descEl = doc.querySelector('[data-automation-id="jobPostingDescription"]') || doc.querySelector('.css-12v9p');
    const description = descEl ? descEl.textContent.trim() : '';

    return { title, company, location, description, source: 'workday' };
  }

  /**
   * Indeed Extractor
   */
  function extractIndeedJob(doc) {
    const titleEl = doc.querySelector('.jobsearch-JobInfoHeader-title') || doc.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim() : '';

    const companyEl = doc.querySelector('[data-company-name="true"]') || doc.querySelector('.jobsearch-CompanyInfoContainer a');
    const company = companyEl ? companyEl.textContent.trim() : '';

    const locationEl = doc.querySelector('[data-testid="job-location"]') || doc.querySelector('.jobsearch-JobInfoHeader-companyLocation');
    const location = locationEl ? locationEl.textContent.trim() : 'Remote';

    const descEl = doc.querySelector('#jobDescriptionText');
    const description = descEl ? descEl.textContent.trim() : '';

    return { title, company, location, description, source: 'indeed' };
  }

  /**
   * Generic Schema.org JSON-LD / OpenGraph Fallback Extractor
   */
  function extractGenericJob(doc) {
    // 1. Try JSON-LD
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'JobPosting') {
          return {
            title: data.title || '',
            company: data.hiringOrganization?.name || '',
            location: data.jobLocation?.address?.addressLocality || 'Remote',
            description: (data.description || '').replace(/<[^>]*>?/gm, ' '),
            source: 'json_ld',
          };
        }
      } catch {
        // ignore malformed JSON-LD
      }
    }

    // 2. Try OpenGraph / Document Headings
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || doc.title || '';
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

    let title = ogTitle;
    let company = 'Company';
    if (ogTitle.includes(' at ')) {
      const parts = ogTitle.split(' at ');
      title = parts[0].trim();
      company = parts[1].split(' - ')[0].trim();
    }

    return {
      title: title || 'Product Manager',
      company: company || 'Company',
      location: 'Remote',
      description: ogDesc || doc.body?.textContent?.slice(0, 1000) || '',
      source: 'web_generic',
    };
  }

  /**
   * Universal Extractor Dispatcher
   */
  function extractJobFromPage(url, doc = document) {
    const href = (url || window.location.href).toLowerCase();

    if (href.includes('linkedin.com')) {
      return extractLinkedInJob(doc);
    }
    if (href.includes('greenhouse.io') || href.includes('gh_jid')) {
      return extractGreenhouseJob(doc);
    }
    if (href.includes('lever.co')) {
      return extractLeverJob(doc);
    }
    if (href.includes('myworkdayjobs.com') || href.includes('workday.com')) {
      return extractWorkdayJob(doc);
    }
    if (href.includes('indeed.com')) {
      return extractIndeedJob(doc);
    }

    return extractGenericJob(doc);
  }

  // ============================================================================
  // 2. Ingestion Toast Notification (Rule R7 Compliant)
  // ============================================================================

  function showClipperToast({ message, fitScore, jobUrl, isError = false }) {
    if (typeof document === 'undefined') return;

    const existingToast = document.getElementById('backdoor-clipper-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'backdoor-clipper-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '2147483647';
    toast.style.backgroundColor = '#0F1523';
    toast.style.border = isError ? '1px solid #E11D48' : '1px solid #2563EB';
    toast.style.borderRadius = '12px';
    toast.style.padding = '14px 20px';
    toast.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.color = '#F8FAFC';
    toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    toast.style.fontSize = '13px';
    toast.style.maxWidth = '400px';

    const badgeColor = isError ? '#E11D48' : fitScore && fitScore >= 70 ? '#10B981' : '#38BDF8';
    const scoreBadge = fitScore
      ? `<span style="background: rgba(16, 185, 129, 0.15); color: ${badgeColor}; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px; font-family: monospace;">${fitScore}% FIT</span>`
      : '';

    toast.innerHTML = `
      <div style="width: 24px; height: 24px; border-radius: 6px; background: #2563EB; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; color: white; flex-shrink: 0;">B</div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="color: #FFFFFF;">${isError ? 'Clipper Error' : 'Backdoor Clipper'}</strong>
          ${scoreBadge}
        </div>
        <div style="color: #94A3B8; font-size: 12px; margin-top: 2px;">${message}</div>
      </div>
      ${
        jobUrl
          ? `<a href="${jobUrl}" target="_blank" style="padding: 6px 12px; background: #2563EB; color: white; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 600; flex-shrink: 0;">Open Role</a>`
          : ''
      }
      <button id="backdoor-toast-close" style="background: transparent; border: none; color: #64748B; cursor: pointer; font-size: 16px; margin-left: 4px;">✕</button>
    `;

    document.body.appendChild(toast);

    toast.querySelector('#backdoor-toast-close').addEventListener('click', () => {
      toast.remove();
    });

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 7000);
  }

  // ============================================================================
  // 3. Clip Execution Pipeline
  // ============================================================================

  async function clipCurrentJob(apiBase = 'http://localhost:3001') {
    try {
      const extracted = extractJobFromPage(window.location.href, document);
      if (!extracted.title || !extracted.company) {
        showClipperToast({
          message: 'Could not automatically detect job title or company on this page.',
          isError: true,
        });
        return { success: false, error: 'Incomplete extraction' };
      }

      const payload = {
        mode: 'clipper',
        title: extracted.title,
        company: extracted.company,
        location: extracted.location,
        description: extracted.description,
        applyUrl: window.location.href,
        source: extracted.source || 'chrome_clipper',
      };

      const res = await fetch(`${apiBase}/api/ingest/universal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showClipperToast({
          message: `${extracted.title} at ${extracted.company}`,
          fitScore: data.fitScore,
          jobUrl: `${apiBase}/discover/${data.job.id}`,
        });
        return { success: true, fitScore: data.fitScore, job: data.job };
      } else {
        showClipperToast({
          message: data.error || 'Ingestion failed',
          isError: true,
        });
        return { success: false, error: data.error };
      }
    } catch (err) {
      showClipperToast({
        message: 'Network error connecting to Backdoor app. Make sure app is running on localhost:3001.',
        isError: true,
      });
      return { success: false, error: err.message };
    }
  }

  // Export module for both browser content script and Node.js unit testing
  const BackdoorClipper = {
    extractLinkedInJob,
    extractGreenhouseJob,
    extractLeverJob,
    extractWorkdayJob,
    extractIndeedJob,
    extractGenericJob,
    extractJobFromPage,
    clipCurrentJob,
    showClipperToast,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackdoorClipper;
  } else if (typeof window !== 'undefined') {
    window.BackdoorClipper = BackdoorClipper;
  }
})();
