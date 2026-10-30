import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATION_PATH = path.resolve(process.cwd(), 'supabase', 'migrations', '00000000000000_init_schema.sql');
const SCHEMA_PATH = path.resolve(process.cwd(), 'database', 'schema.sql');

test('UT-DB-01: Ground-Zero DDL schema file existence and transaction boundary', () => {
  assert.strictEqual(fs.existsSync(MIGRATION_PATH), true, 'Canonical migration file must exist');
  assert.strictEqual(fs.existsSync(SCHEMA_PATH), true, 'Database schema file must exist');

  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  assert.match(content, /BEGIN;/i, 'Migration must wrap in a single transactional BEGIN boundary');
  assert.match(content, /COMMIT;/i, 'Migration must commit the transaction');
});

test('UT-DB-01: Canonical 5 Custom Enums definition', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const requiredEnums = [
    'posting_status_enum',
    'application_stage_enum',
    'outreach_door_enum',
    'cadence_step_status_enum',
    'contact_confidence_enum'
  ];

  for (const enumName of requiredEnums) {
    const enumRegex = new RegExp(`CREATE\\s+TYPE\\s+${enumName}\\s+AS\\s+ENUM`, 'i');
    assert.match(content, enumRegex, `Enum ${enumName} must be defined in canonical DDL`);
  }
});

test('UT-DB-01: Canonical 18 Relational Tables across 11 Sections', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const requiredTables = [
    'public.profiles',
    'public.tracks',
    'public.proof_points',
    'public.side_projects',
    'public.companies',
    'public.company_briefs',
    'public.complaints',
    'public.jobs',
    'public.sources',
    'public.source_runs',
    'public.job_sources',
    'public.evaluations',
    'public.contacts',
    'public.cadences',
    'public.resume_bullets',
    'public.cv_builds',
    'public.meeting_notes',
    'public.decision_events'
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+${table.replace('.', '\\.')}\\b`, 'i');
    assert.match(content, tableRegex, `Table ${table} must be defined in canonical DDL`);
  }

  // Verify public.profiles is defined first among tables to satisfy FK requirements
  const firstTableMatch = content.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_\.]+)/i);
  assert.ok(firstTableMatch, 'At least one table must be created');
  assert.strictEqual(firstTableMatch[1].toLowerCase(), 'public.profiles', 'public.profiles must be created first to satisfy user ownership foreign keys');
});

test('UT-DB-01: All 9 Performance and Deduplication Indexes are defined', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const requiredIndexes = [
    'idx_jobs_company_id',
    'idx_jobs_posting_status',
    'idx_jobs_posted_at',
    'idx_evaluations_user_stage',
    'idx_evaluations_fit_score',
    'idx_contacts_company_door',
    'idx_cadences_user_status',
    'idx_cadences_suggested_send',
    'idx_decision_events_aggregate'
  ];

  for (const idx of requiredIndexes) {
    const indexRegex = new RegExp(`CREATE\\s+INDEX\\s+${idx}\\b`, 'i');
    assert.match(content, indexRegex, `Index ${idx} must be defined in canonical DDL`);
  }
});

test('UT-DB-02: Row Level Security (RLS) is enabled on all 18 tables', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const allTables = [
    'public.profiles',
    'public.tracks',
    'public.proof_points',
    'public.side_projects',
    'public.companies',
    'public.company_briefs',
    'public.complaints',
    'public.jobs',
    'public.sources',
    'public.source_runs',
    'public.job_sources',
    'public.evaluations',
    'public.contacts',
    'public.cadences',
    'public.resume_bullets',
    'public.cv_builds',
    'public.meeting_notes',
    'public.decision_events'
  ];

  for (const table of allTables) {
    const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+${table.replace('.', '\\.')}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY;`, 'i');
    assert.match(content, rlsRegex, `Table ${table} must have ENABLE ROW LEVEL SECURITY`);
  }
});

test('UT-DB-02: All 11 user-owned tables enforce auth.uid() = user_id explicitly scoped TO authenticated', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const userOwnedTables = [
    'profiles',
    'tracks',
    'proof_points',
    'side_projects',
    'evaluations',
    'contacts',
    'cadences',
    'resume_bullets',
    'cv_builds',
    'meeting_notes',
    'decision_events'
  ];

  for (const tbl of userOwnedTables) {
    const policyRegex = new RegExp(
      `CREATE\\s+POLICY\\s+"[^"]+"\\s+ON\\s+public\\.${tbl}\\s+FOR\\s+ALL\\s+TO\\s+authenticated\\s+USING\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\);`,
      'i'
    );
    assert.match(content, policyRegex, `Table public.${tbl} must have FOR ALL TO authenticated USING (auth.uid() = user_id) policy`);
  }
});

test('UT-DB-02: All 7 shared intelligence tables have read-only TO authenticated policies', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const sharedTables = [
    'companies',
    'company_briefs',
    'complaints',
    'jobs',
    'job_sources',
    'sources',
    'source_runs'
  ];

  for (const tbl of sharedTables) {
    const policyRegex = new RegExp(
      `CREATE\\s+POLICY\\s+"[^"]+"\\s+ON\\s+public\\.${tbl}\\s+FOR\\s+SELECT\\s+TO\\s+authenticated\\s+USING\\s*\\(\\s*true\\s*\\);`,
      'i'
    );
    assert.match(content, policyRegex, `Table public.${tbl} must have FOR SELECT TO authenticated USING (true) policy`);
  }
});

test('UT-DB-03: Immutability of decision_events audit trail via hard revoke', () => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  assert.match(
    content,
    /REVOKE\s+UPDATE,\s*DELETE\s+ON\s+public\.decision_events\s+FROM\s+PUBLIC,\s*authenticated,\s*anon;/i,
    'decision_events must enforce append-only semantics by revoking UPDATE and DELETE from PUBLIC, authenticated, anon'
  );
});
