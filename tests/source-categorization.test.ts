import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  VERIFIED_SOURCES,
  passesNegativeFilters,
  buildAggregatorQuery,
} from '../src/engine/scraper';
import {
  unwrapLinkedInJobUrl,
  parseLinkedInEmailDigest,
  parseNaukriJobAlert,
  parseIndianCtcCompensation,
  normalizeIndianMetro,
  parseSlackMessage,
  parseTwitterHiringTweet,
  extractJobFromSnippet,
} from '../src/engine/safe-fetch';
import {
  getSettingsWorkspace,
  updateMonitoredTwitterHandles,
  updateMonitoredSubreddits,
  toggleSlackChannel,
  addSlackCommunityChannel,
  toggleAllAtsSources,
  addCustomAtsSource,
  addCustomPlatformSource,
  addCommunityContributedApi,
  removeCustomSource,
  searchRegionalJobApis,
  integratePaidJobApi,
  resetSettingsStore,
} from '../src/engine/settings';

test('UT-SRC-01: 35-Source Fleet Tri-Segmentation & Role Classification', () => {
  assert.strictEqual(VERIFIED_SOURCES.length, 35, 'Fleet must contain exactly 35 verified sources');

  const sectionCounts: Record<string, number> = {
    ATS: 0,
    PLATFORM_API: 0,
    SOCIAL_INBOUND: 0,
  };

  const validRoles = new Set(['all', 'product', 'engineering', 'design', 'legal', 'finance']);

  for (const src of VERIFIED_SOURCES) {
    assert.ok(src.section in sectionCounts, `Invalid section ${src.section} for source ${src.id}`);
    sectionCounts[src.section]++;

    assert.ok(Array.isArray(src.applicableRoles), `Source ${src.id} must define applicableRoles array`);
    assert.ok(src.applicableRoles.length > 0, `Source ${src.id} must define at least one applicable role`);

    for (const r of src.applicableRoles) {
      assert.ok(validRoles.has(r), `Invalid role tag "${r}" in source ${src.id}`);
    }
  }

  // Verify exact tri-segmented distribution
  assert.strictEqual(sectionCounts['ATS'], 9, 'Section ATS must contain exactly 9 sources (8 direct + 1 JSON-LD)');
  assert.strictEqual(sectionCounts['PLATFORM_API'], 23, 'Section PLATFORM_API must contain exactly 23 platform sources');
  assert.strictEqual(sectionCounts['SOCIAL_INBOUND'], 3, 'Section SOCIAL_INBOUND must contain exactly 3 inbound/clipper sources');
  assert.strictEqual(
    sectionCounts['ATS'] + sectionCounts['PLATFORM_API'] + sectionCounts['SOCIAL_INBOUND'],
    35,
    'Sum of all 3 sections must equal 35'
  );
});

test('UT-SRC-02: Multi-Role Dynamic Track Query Interpolation on BYOK Aggregators', () => {
  // Test RapidAPI JSearch interpolation
  const jsearch = buildAggregatorQuery('rapidapi_jsearch', ['Product Designer', 'Design Lead'], 'Remote');
  assert.ok(jsearch.query.includes('"Product Designer" OR "Design Lead"'));
  assert.ok(jsearch.params.query.includes('in Remote'));

  // Test SerpApi Google Jobs interpolation
  const serp = buildAggregatorQuery('serpapi_jobs', ['Legal Counsel', 'Chief Compliance Officer'], 'San Francisco, CA');
  assert.ok(serp.query.includes('"Legal Counsel" OR "Chief Compliance Officer"'));
  assert.strictEqual(serp.params.engine, 'google_jobs');
  assert.ok(serp.params.q.includes('San Francisco, CA'));

  // Test Apollo Jobs interpolation
  const apollo = buildAggregatorQuery('apollo_jobs', ['Staff Accountant', 'VP Finance'], 'New York, NY');
  assert.strictEqual(apollo.params.job_titles, 'Staff Accountant,VP Finance');
  assert.strictEqual(apollo.params.person_locations, 'New York, NY');

  // Test fallback when empty array provided
  const fallback = buildAggregatorQuery('rapidapi_jsearch', [], 'Remote');
  assert.ok(fallback.query.includes('"Product Manager"'));
});

test('UT-SRC-03: Dynamic Negative Filter Evaluation', () => {
  // Default PM negative filters
  const defaultPass = passesNegativeFilters({
    title: 'Staff Product Manager',
    company: 'Stripe',
  });
  assert.strictEqual(defaultPass.passed, true);

  const defaultFail = passesNegativeFilters({
    title: 'Engineering Manager, Core Systems',
    company: 'Linear',
  });
  assert.strictEqual(defaultFail.passed, false);
  assert.ok(defaultFail.reason?.includes('Excluded title keyword'));

  // Custom multi-role negative patterns (e.g. for a Design candidate who wants to exclude "junior" and "frontend")
  const customPatterns = ['junior', 'intern', 'frontend engineer', 'sales'];
  const designCandidatePass = passesNegativeFilters(
    { title: 'Senior Product Designer', company: 'Figma' },
    customPatterns
  );
  assert.strictEqual(designCandidatePass.passed, true);

  const designCandidateFail = passesNegativeFilters(
    { title: 'Junior UI Designer', company: 'Canva' },
    customPatterns
  );
  assert.strictEqual(designCandidateFail.passed, false);
  assert.ok(designCandidateFail.reason?.includes('Excluded title keyword'));
});

test('UT-SRC-04: Inbound Stream Parsers (LinkedIn, Naukri, Slack, Twitter/X)', () => {
  // 1. LinkedIn Tracking URL Unwrapper
  const trackingUrl = 'https://www.linkedin.com/jobs/view/3948572019/?trk=eml-job-alert-member-&refId=ab12cd34&trackingId=xyz';
  const cleanUrl = unwrapLinkedInJobUrl(trackingUrl);
  assert.strictEqual(cleanUrl, 'https://www.linkedin.com/jobs/view/3948572019');

  // 2. LinkedIn Email Digest Parser
  const emailHtml = `
    <div>
      <h3>Jobs you might be interested in</h3>
      <p>Staff Product Manager at Stripe - San Francisco, CA</p>
      <a href="https://www.linkedin.com/jobs/view/3948572019/?trk=eml-alert">View Job</a>
    </div>
  `;
  const parsedLinkedIn = parseLinkedInEmailDigest(emailHtml);
  assert.strictEqual(parsedLinkedIn.length, 1);
  assert.strictEqual(parsedLinkedIn[0].applyUrl, 'https://www.linkedin.com/jobs/view/3948572019');
  assert.strictEqual(parsedLinkedIn[0].source, 'linkedin_digest');

  // 3. Naukri India CTC & Metro Hub Normalizer
  const ctcRange = parseIndianCtcCompensation('Package: ₹25 - 40 Lacs P.A. plus performance bonus');
  assert.strictEqual(ctcRange, '₹25L - ₹40L PA');

  const singleCtc = parseIndianCtcCompensation('Salary: 35 LPA');
  assert.strictEqual(singleCtc, '₹35L PA');

  assert.strictEqual(normalizeIndianMetro('Bangalore / Bengaluru'), 'Bengaluru, KA');
  assert.strictEqual(normalizeIndianMetro('Gurgaon / Gurugram / Noida'), 'Delhi NCR, India');
  assert.strictEqual(normalizeIndianMetro('Hyderabad, Telangana'), 'Hyderabad, TS');

  const naukriAlertText = `
    Job 1: Lead Technical Product Manager at Flipkart
    Location: Bangalore / Bengaluru
    Salary: ₹35 - 55 Lacs P.A.
    Recruiter: Priya Sharma | Lead Recruiter at Flipkart
    View Job: https://www.naukri.com/job-listings-lead-pm-flipkart-12345
  `;
  const parsedNaukri = parseNaukriJobAlert(naukriAlertText);
  assert.strictEqual(parsedNaukri.length, 1);
  assert.strictEqual(parsedNaukri[0].location, 'Bengaluru, KA');
  assert.strictEqual(parsedNaukri[0].salary, '₹35L - ₹55L PA');
  assert.strictEqual(parsedNaukri[0].source, 'naukri_webhook');
  assert.strictEqual(parsedNaukri[0].recruiterInfo?.name, 'Priya Sharma');

  // 4. Slack Message Parser
  const slackMsg = `
    <@U048291> Hey team! We're hiring a Principal Product Manager at Datadog.
    Remote friendly. Apply here: <https://www.datadoghq.com/careers/pm|Datadog Careers>
  `;
  const parsedSlack = parseSlackMessage(slackMsg, '#jobs', "Lenny's Community");
  assert.strictEqual(parsedSlack.source, 'slack_community');
  assert.strictEqual(parsedSlack.company, 'Datadog');
  assert.ok(parsedSlack.description.includes("[Slack: Lenny's Community #jobs]"));

  // 5. Twitter / X Hiring Tweet Parser
  const hiringTweet = `We're looking for a Staff AI Product Manager @OpenAI to lead research agents! Remote friendly. Apply: https://openai.com/careers`;
  const parsedTweet = parseTwitterHiringTweet(hiringTweet, '@sama');
  assert.ok(parsedTweet !== null);
  assert.strictEqual(parsedTweet?.source, 'twitter_x');
  assert.strictEqual(parsedTweet?.company, 'OpenAI');
  assert.ok(parsedTweet?.description.includes('@sama'));

  const nonHiringTweet = 'Just had coffee in SF. Beautiful day!';
  const ignoredTweet = parseTwitterHiringTweet(nonHiringTweet, '@sama');
  assert.strictEqual(ignoredTweet, null);
});

test('UT-SRC-05: Settings Workspace Tri-Segmented State & Inbound Stream Mutations', () => {
  resetSettingsStore();
  const state = getSettingsWorkspace();

  // Verify initial state defaults
  assert.strictEqual(state.inboundEmailAddress, 'jobs+hardi@inbound.backdoor.app');
  assert.deepStrictEqual(state.monitoredTwitterHandles, ['@levelsio', '@sama']);
  assert.strictEqual(state.slackCommunityChannels.length, 3);
  assert.strictEqual(state.sources.length, 35);

  // Test Twitter handle mutation
  const updatedTwitter = updateMonitoredTwitterHandles(['@levelsio', 'paulg', '@elonmusk']);
  assert.deepStrictEqual(updatedTwitter, ['@levelsio', '@paulg', '@elonmusk']);

  // Test Slack channel toggle
  const updatedSlack = toggleSlackChannel('slack-1', false);
  const ch1 = updatedSlack.find((c) => c.id === 'slack-1');
  assert.strictEqual(ch1?.enabled, false);

  // Test Add Slack community channel
  const withNewChannel = addSlackCommunityChannel({
    name: 'product-jobs',
    workspace: 'Techstars Alumni',
    enabled: true,
  });
  assert.strictEqual(withNewChannel.length, 4);
  assert.ok(withNewChannel.some((c) => c.name === '#product-jobs' && c.workspace === 'Techstars Alumni'));

  // Test Master Toggle All ATS
  toggleAllAtsSources(false);
  const disabledAtsState = getSettingsWorkspace();
  const atsSources = disabledAtsState.sources.filter((s) => s.section === 'ATS');
  assert.ok(atsSources.every((s) => !s.enabled), 'All 9 ATS sources must be disabled');

  toggleAllAtsSources(true);
  const enabledAtsState = getSettingsWorkspace();
  const reenabledAts = enabledAtsState.sources.filter((s) => s.section === 'ATS');
  assert.ok(reenabledAts.every((s) => s.enabled), 'All 9 ATS sources must be enabled');
});

test('UT-SRC-06: Rule R7 Strict Color Blacklist Audit across Scraper & Inbound Stream Files', () => {
  const filesToCheck = [
    path.join(process.cwd(), 'src/engine/scraper.ts'),
    path.join(process.cwd(), 'src/engine/safe-fetch.ts'),
    path.join(process.cwd(), 'src/engine/settings.ts'),
    path.join(process.cwd(), 'src/app/settings/page.tsx'),
    path.join(process.cwd(), 'src/components/settings/SettingsWorkspace.tsx'),
    path.join(process.cwd(), 'src/app/api/settings/route.ts'),
  ];

  const forbiddenHues = [
    'orange',
    'amber',
    'indigo',
    'violet',
    'terracotta',
    '#f97316',
    '#f59e0b',
    '#6366f1',
    '#8b5cf6',
  ];

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');

    for (const hue of forbiddenHues) {
      const regex = new RegExp(`\\b${hue}\\b`, 'i');
      assert.strictEqual(
        regex.test(content),
        false,
        `Rule R7 Violation: Forbidden color "${hue}" detected in ${path.basename(file)}`
      );
    }
  }
});

test('UT-SRC-07: Custom ATS & Feed Addition with SSRF Protection and Deletion', () => {
  resetSettingsStore();

  // Test 1: SSRF Rejection of loopback
  assert.throws(
    () => {
      addCustomAtsSource({
        name: 'Malicious Internal Source',
        endpointUrl: 'http://127.0.0.1:8080/jobs',
        feedType: 'REST_API',
      });
    },
    /SSRF Rule R6/,
    'Must reject 127.0.0.1 loopback URL'
  );

  // Test 2: SSRF Rejection of AWS metadata IP
  assert.throws(
    () => {
      addCustomAtsSource({
        name: 'AWS Metadata Probe',
        endpointUrl: 'http://169.254.169.254/latest/meta-data',
        feedType: 'REST_API',
      });
    },
    /SSRF Rule R6/,
    'Must reject 169.254.169.254 link-local URL'
  );

  // Test 3: Valid custom ATS REST API addition
  const customApi = addCustomAtsSource({
    name: 'Acme Careers API',
    endpointUrl: 'https://boards-api.greenhouse.io/v1/boards/acme/jobs',
    feedType: 'REST_API',
    applicableRole: 'engineering',
  });
  assert.ok(customApi.id.startsWith('custom_ats_'));
  assert.strictEqual(customApi.name, 'Acme Careers API');
  assert.strictEqual(customApi.section, 'ATS');
  assert.strictEqual(customApi.isCustom, true);
  assert.strictEqual(customApi.endpointUrl, 'https://boards-api.greenhouse.io/v1/boards/acme/jobs');
  assert.deepStrictEqual(customApi.applicableRoles, ['engineering']);

  // Test 4: Valid custom RSS Feed addition
  const customRss = addCustomAtsSource({
    name: 'Tech Jobs RSS Feed',
    endpointUrl: 'https://news.ycombinator.com/jobsrss',
    feedType: 'RSS_FEED',
    applicableRole: 'all',
  });
  assert.strictEqual(customRss.name, 'Tech Jobs RSS Feed');
  assert.strictEqual(customRss.feedType, 'RSS_FEED');
  assert.strictEqual(customRss.isCustom, true);

  // Verify state contains both custom sources in ATS section
  const state = getSettingsWorkspace();
  const atsList = state.sources.filter((s) => s.section === 'ATS');
  assert.strictEqual(atsList.length, 11, 'Should have 9 default + 2 custom ATS sources');

  // Test 5: Custom source deletion
  removeCustomSource(customApi.id);
  const stateAfterDelete = getSettingsWorkspace();
  assert.strictEqual(stateAfterDelete.sources.some((s) => s.id === customApi.id), false);
  assert.strictEqual(stateAfterDelete.sources.filter((s) => s.section === 'ATS').length, 10);

  // Test 6: Attempting to delete a built-in verified source must throw
  assert.throws(
    () => {
      removeCustomSource('greenhouse');
    },
    /Cannot delete built-in verified source/,
    'Must forbid deleting default verified sources'
  );

  // Cleanup
  resetSettingsStore();
});

test('UT-SRC-08: Platform Category Mapping, Dynamic Role Scoping & Regional Job API Directory', () => {
  resetSettingsStore();

  // Test 1: Category Mapping verification across all 23 platform sources
  const platformSources = VERIFIED_SOURCES.filter((s) => s.section === 'PLATFORM_API');
  assert.strictEqual(platformSources.length, 23);

  const remote = platformSources.filter((s) => s.platformCategory === 'remote');
  const startup = platformSources.filter((s) => s.platformCategory === 'startup');
  const productDynamic = platformSources.filter((s) => s.platformCategory === 'product_dynamic');
  const aggregator = platformSources.filter((s) => s.platformCategory === 'aggregator');

  assert.strictEqual(remote.length, 6, 'Remote category must contain 6 verified boards');
  assert.strictEqual(startup.length, 4, 'Startup category must contain 4 hubs (YC, Wellfound, HN, Product Hunt)');
  assert.ok(startup.some((s) => s.id === 'yc_startup') && startup.some((s) => s.id === 'wellfound'), 'YC and Wellfound must be mapped under startup');
  assert.strictEqual(productDynamic.length, 7, 'Product dynamic category must contain 7 sources');
  assert.strictEqual(aggregator.length, 6, 'Aggregators must contain 6 BYOK engines');

  // Test 2: Regional Job API Search by region (India)
  const indiaApis = searchRegionalJobApis('', 'all', 'India');
  assert.ok(indiaApis.length >= 4, 'Must return popular APIs covering India');
  assert.ok(indiaApis.some((a) => a.id === 'jooble_api'));
  assert.ok(indiaApis.some((a) => a.id === 'serpapi_google_jobs'));

  // Test 3: Regional Job API Search by role (Product)
  const pmApis = searchRegionalJobApis('JSearch', 'product', 'all');
  assert.strictEqual(pmApis.length, 1);
  assert.strictEqual(pmApis[0].id, 'rapidapi_jsearch');

  // Test 4: Integrate Paid Job API
  const integrated = integratePaidJobApi('adzuna_api', 'adzuna_secret_token_123', 'https://api.adzuna.com/v1/api/jobs');
  assert.strictEqual(integrated.id, 'adzuna_api');
  assert.strictEqual(integrated.requiresKey, true);
  assert.strictEqual(integrated.enabled, true);

  const state = getSettingsWorkspace();
  const adzunaInFleet = state.sources.find((s) => s.id === 'adzuna_api');
  assert.ok(adzunaInFleet, 'Adzuna must be registered in candidate active fleet');
  assert.ok(state.byokKeys.some((k) => k.id === 'key_adzuna_api' && k.hasKey), 'Adzuna API key must be saved in BYOK vault');

  resetSettingsStore();
});

test('UT-SRC-09: Add Custom Platform API, Community GitHub Marketplace Feeds & Monitored Subreddits', () => {
  resetSettingsStore();

  // Test 1: Add Custom Platform Source with SSRF Validation
  assert.throws(
    () => {
      addCustomPlatformSource({
        name: 'Malicious Internal Hook',
        endpointUrl: 'http://127.0.0.1:8080/jobs',
        feedType: 'REST_API',
        applicableRole: 'all',
        platformCategory: 'remote',
      });
    },
    /loopback|disallowed|prohibited/i,
    'Must block loopback URLs under Rule R6 SSRF protection'
  );

  const customPlatform = addCustomPlatformSource({
    name: 'DevJob EU Feed',
    endpointUrl: 'https://devjob.eu/api/feed.json',
    feedType: 'REST_API',
    applicableRole: 'engineering',
    platformCategory: 'remote',
  });
  assert.strictEqual(customPlatform.name, 'DevJob EU Feed');
  assert.strictEqual(customPlatform.section, 'PLATFORM_API');
  assert.strictEqual(customPlatform.platformCategory, 'remote');
  assert.strictEqual(customPlatform.enabled, true);

  const state1 = getSettingsWorkspace();
  assert.ok(state1.sources.some((s) => s.id === customPlatform.id));

  // Test 2: Add Community Contributed API with GitHub URL
  assert.throws(
    () => {
      addCommunityContributedApi({
        name: 'Internal Metadata Sniffer',
        provider: 'Attacker',
        description: 'Attempts to read cloud metadata',
        endpointUrl: 'http://169.254.169.254/latest/meta-data',
        regions: ['Global Remote'],
        roleAffinity: ['all'],
        pricingTier: 'Free / Open Source (GitHub)',
      });
    },
    /unsafe|disallowed|prohibited|invalid/i,
    'Must block AWS/Cloud link-local metadata IP'
  );

  const contribApi = addCommunityContributedApi({
    name: 'Open Tech Salaries & Jobs',
    provider: 'OpenTech Community',
    description: 'Crowdsourced jobs and salary bands maintained on GitHub.',
    githubUrl: 'https://github.com/opentech/jobs',
    regions: ['Global Remote'],
    roleAffinity: ['all'],
    pricingTier: 'Free / Open Source (GitHub)',
  });
  assert.strictEqual(contribApi.name, 'Open Tech Salaries & Jobs');
  assert.strictEqual(contribApi.githubUrl, 'https://github.com/opentech/jobs');
  assert.strictEqual(contribApi.isCommunityContributed, true);

  const searched = searchRegionalJobApis('Open Tech', 'all', 'all');
  assert.ok(searched.some((a) => a.id === contribApi.id));

  // Test 3: Monitored Subreddits Management
  const initialSubs = getSettingsWorkspace().monitoredSubreddits;
  assert.ok(initialSubs.includes('r/ProductManagement'));
  assert.ok(initialSubs.includes('r/jobbit'));

  const updatedSubs = updateMonitoredSubreddits([...initialSubs, 'r/MachineLearning', 'r/startups']);
  assert.ok(updatedSubs.includes('r/MachineLearning'));
  assert.ok(updatedSubs.includes('r/startups'));

  const state2 = getSettingsWorkspace();
  assert.ok(state2.monitoredSubreddits.includes('r/MachineLearning'));

  resetSettingsStore();
});
