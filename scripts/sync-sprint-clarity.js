#!/usr/bin/env node

/**
 * sync-sprint-clarity.js
 * Automatically updates Sprint Plan, PRD, and UI Requirements when
 * a requirement clarity decision is made during sprint kickoff.
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    sprint: '3',
    taskId: '',
    decisionTitle: '',
    decisionDetails: '',
    prdSection: 'M9',
    uiComponent: ''
  };

  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1];
    if (key in options && val !== undefined) {
      options[key] = val;
      i++;
    }
  }
  return options;
}

function syncClarity() {
  const opts = parseArgs();
  const sprintFile = path.join(process.cwd(), 'docs', 'sprints', `sprint_${opts.sprint}_plan.md`);
  const prdFile = path.join(process.cwd(), 'docs', 'prd.md');
  const uiFile = path.join(process.cwd(), 'docs', 'ui_requirements.md');
  const timestamp = new Date().toISOString().split('T')[0];

  // 1. Update Sprint Plan
  if (fs.existsSync(sprintFile) && opts.decisionTitle) {
    let sprintContent = fs.readFileSync(sprintFile, 'utf8');
    const clarityNote = `\n> **[PM Clarity Decision - ${timestamp}]** ${opts.decisionTitle}: ${opts.decisionDetails}\n`;
    
    if (opts.taskId && sprintContent.includes(opts.taskId)) {
      sprintContent = sprintContent.replace(
        new RegExp(`(### Task \`${opts.taskId}\`[^\n]*\n)`),
        `$1${clarityNote}`
      );
    } else {
      sprintContent += `\n## 9. Sprint Clarity & Specification Decisions\n- **${opts.decisionTitle} (${timestamp}):** ${opts.decisionDetails}\n`;
    }
    fs.writeFileSync(sprintFile, sprintContent, 'utf8');
    console.log(`[Success] Updated Sprint Plan: ${sprintFile}`);
  }

  // 2. Update PRD
  if (fs.existsSync(prdFile) && opts.decisionTitle) {
    let prdContent = fs.readFileSync(prdFile, 'utf8');
    const prdEntry = `\n- **Clarification (${timestamp} - ${opts.taskId || 'Sprint ' + opts.sprint}):** ${opts.decisionTitle} — ${opts.decisionDetails}\n`;
    
    if (prdContent.includes('## 10. Specification Change & Clarification Log')) {
      prdContent = prdContent.replace(
        /(## 10\. Specification Change & Clarification Log\n)/,
        `$1${prdEntry}`
      );
    } else {
      prdContent += `\n---\n\n## 10. Specification Change & Clarification Log\n${prdEntry}`;
    }
    fs.writeFileSync(prdFile, prdContent, 'utf8');
    console.log(`[Success] Updated PRD: ${prdFile}`);
  }

  // 3. Update UI Requirements (if UI component mentioned)
  if (fs.existsSync(uiFile) && opts.uiComponent) {
    let uiContent = fs.readFileSync(uiFile, 'utf8');
    const uiEntry = `\n- **[Clarification - ${opts.uiComponent}]:** ${opts.decisionDetails} *(Adopted: ${timestamp})*\n`;
    
    if (uiContent.includes('## Clarifications & Edge Case Specs')) {
      uiContent = uiContent.replace(
        /(## Clarifications & Edge Case Specs\n)/,
        `$1${uiEntry}`
      );
    } else {
      uiContent += `\n---\n\n## Clarifications & Edge Case Specs\n${uiEntry}`;
    }
    fs.writeFileSync(uiFile, uiContent, 'utf8');
    console.log(`[Success] Updated UI Requirements: ${uiFile}`);
  }
}

syncClarity();
