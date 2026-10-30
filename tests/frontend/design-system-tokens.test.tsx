import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// WCAG Luminance and Contrast Ratio helper
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Score badge classifier specification from Artifact 3
export function getScoreBadgeStyle(score: number): { token: string; hex: string; label: string } {
  if (score >= 70) {
    return { token: 'status-top', hex: '#10B981', label: 'Top Fit' };
  } else if (score >= 40) {
    return { token: 'status-mid', hex: '#0284C7', label: 'Exploratory' };
  } else {
    return { token: 'status-low', hex: '#64748B', label: 'Stretch' };
  }
}

test('UT-FE-01: Strict Color Blacklist AST Scanner (Zero Indigo, Violet, Orange, Amber, Terracotta)', () => {
  const bannedKeywords = [
    'indigo',
    'violet',
    'orange',
    'amber',
    'terracotta',
    '#4F46E5', '#6366F1',
    '#7C3AED', '#8B5CF6',
    '#EA580C', '#F97316',
    '#D97706', '#F59E0B',
    '#C85A32', '#C2410C'
  ];

  const filesToScan: string[] = [
    path.resolve(process.cwd(), 'src/app/globals.css'),
    path.resolve(process.cwd(), 'tailwind.config.ts')
  ];

  // Recursively collect all frontend source files
  function collectSourceFiles(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectSourceFiles(fullPath);
      } else if (/\.(css|ts|tsx|js|jsx)$/.test(entry.name)) {
        filesToScan.push(fullPath);
      }
    }
  }

  collectSourceFiles(path.resolve(process.cwd(), 'src'));

  const violations: { file: string; match: string }[] = [];

  for (const filePath of filesToScan) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

    // Strip single-line and multi-line comments so comments discussing the policy are not false positives
    content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    for (const keyword of bannedKeywords) {
      // Create regex matching whole word or hex code
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'gi');
      if (regex.test(content)) {
        violations.push({ file: path.relative(process.cwd(), filePath), match: keyword });
      }
    }
  }

  assert.strictEqual(
    violations.length,
    0,
    `Banned color keywords or hex codes found: ${JSON.stringify(violations, null, 2)}`
  );
});

test('UT-FE-02: Text Contrast Verification (WCAG AAA >= 7.0:1 for primary text)', () => {
  const canvasHex = '#080B11';
  const primaryTextHex = '#F8FAFC';
  const secondaryTextHex = '#94A3B8';

  const primaryContrast = getContrastRatio(canvasHex, primaryTextHex);
  const secondaryContrast = getContrastRatio(canvasHex, secondaryTextHex);

  // Assert primary text achieves WCAG AAA standard (>= 7.0:1)
  assert.ok(
    primaryContrast >= 7.0,
    `Primary text contrast on canvas must be >= 7.0:1. Computed: ${primaryContrast.toFixed(2)}:1`
  );

  // Assert secondary text achieves WCAG AA standard (>= 4.5:1)
  assert.ok(
    secondaryContrast >= 4.5,
    `Secondary text contrast on canvas must be >= 4.5:1. Computed: ${secondaryContrast.toFixed(2)}:1`
  );
});

test('UT-FE-03: Score Badge Semantic Mappings', () => {
  const topHigh = getScoreBadgeStyle(95);
  assert.strictEqual(topHigh.token, 'status-top');
  assert.strictEqual(topHigh.hex, '#10B981');

  const topBoundary = getScoreBadgeStyle(70);
  assert.strictEqual(topBoundary.token, 'status-top');
  assert.strictEqual(topBoundary.hex, '#10B981');

  const midUpper = getScoreBadgeStyle(69);
  assert.strictEqual(midUpper.token, 'status-mid');
  assert.strictEqual(midUpper.hex, '#0284C7');

  const midBoundary = getScoreBadgeStyle(40);
  assert.strictEqual(midBoundary.token, 'status-mid');
  assert.strictEqual(midBoundary.hex, '#0284C7');

  const lowUpper = getScoreBadgeStyle(39);
  assert.strictEqual(lowUpper.token, 'status-low');
  assert.strictEqual(lowUpper.hex, '#64748B');

  const lowZero = getScoreBadgeStyle(0);
  assert.strictEqual(lowZero.token, 'status-low');
  assert.strictEqual(lowZero.hex, '#64748B');
});

test('UT-FE-04: Precision Cobalt & Steel Surface & Accent Tokens defined', () => {
  const globalsCssPath = path.resolve(process.cwd(), 'src/app/globals.css');
  const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

  const requiredTokens = [
    '--bg-canvas: #080B11;',
    '--bg-card: #0F1523;',
    '--bg-drawer: #161F33;',
    '--border-subtle: rgba(255, 255, 255, 0.08);',
    '--border-elevated: rgba(255, 255, 255, 0.14);',
    '--accent-primary: #2563EB;',
    '--accent-hover: #1D4ED8;',
    '--accent-active: #1E40AF;',
    '--accent-ring: #3B82F6;',
    '--status-top: #10B981;',
    '--status-mid: #0284C7;',
    '--status-mid-alt: #38BDF8;',
    '--status-low: #64748B;',
    '--status-action: #0D9488;',
    '--status-action-alt: #14B8A6;',
    '--status-danger: #EF4444;',
    '--text-primary: #F8FAFC;',
    '--text-secondary: #94A3B8;',
    '--text-muted: #475569;'
  ];

  for (const token of requiredTokens) {
    assert.ok(
      cssContent.includes(token),
      `Token "${token}" must be defined in src/app/globals.css`
    );
  }
});
