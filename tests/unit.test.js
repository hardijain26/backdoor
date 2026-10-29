const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Database schema exists and contains RLS policies', () => {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  assert.strictEqual(fs.existsSync(schemaPath), true, 'database/schema.sql must exist');
  
  const content = fs.readFileSync(schemaPath, 'utf8');
  assert.match(content, /ENABLE ROW LEVEL SECURITY/i, 'schema.sql must enforce Row Level Security (RLS)');
});

test('Project configuration and documentation sanity', () => {
  const prdPath = path.join(__dirname, '..', 'docs', 'prd.md');
  assert.strictEqual(fs.existsSync(prdPath), true, 'docs/prd.md must exist');
  
  const pkgPath = path.join(__dirname, '..', 'package.json');
  assert.strictEqual(fs.existsSync(pkgPath), true, 'package.json must exist');
});
