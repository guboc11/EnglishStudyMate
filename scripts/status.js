#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const TASKS_PATH = path.join(__dirname, 'data', 'tasks.json');

function main() {
  if (!fs.existsSync(TASKS_PATH)) {
    console.error('tasks.json not found. Run add-expressions.js first.');
    process.exit(1);
  }

  const { meta, expressions } = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));

  // Domain counts (for expressions in the list)
  const domainTotal = {};
  const domainDone = {};
  const domainPending = {};
  const domainError = {};

  // Type counts
  const typeTotal = {};

  // Status counts
  let totalDone = 0;
  let totalPending = 0;
  let totalError = 0;

  for (const e of expressions) {
    domainTotal[e.domain] = (domainTotal[e.domain] || 0) + 1;
    typeTotal[e.type] = (typeTotal[e.type] || 0) + 1;

    if (e.status === 'content_done') {
      totalDone++;
      domainDone[e.domain] = (domainDone[e.domain] || 0) + 1;
    } else if (e.status === 'error') {
      totalError++;
      domainError[e.domain] = (domainError[e.domain] || 0) + 1;
    } else {
      totalPending++;
      domainPending[e.domain] = (domainPending[e.domain] || 0) + 1;
    }
  }

  const total = expressions.length;
  const pctDone = total ? ((totalDone / total) * 100).toFixed(1) : '0.0';
  const pctPending = total ? ((totalPending / total) * 100).toFixed(1) : '0.0';
  const pctError = total ? ((totalError / total) * 100).toFixed(1) : '0.0';

  const lastUpdated = meta.last_updated
    ? meta.last_updated.replace('T', ' ').replace('Z', ' UTC')
    : 'unknown';

  console.log('');
  console.log('=== EnglishStudyMate Progress ===');
  console.log(`Last updated: ${lastUpdated}`);
  console.log('');

  // Domain table
  console.log('Expressions (도메인별):');
  const domains = ['general', 'daily', 'business', 'tech', 'art', 'science'];
  for (const d of domains) {
    if (domainTotal[d]) {
      const cnt = String(domainTotal[d]).padStart(5);
      const done = domainDone[d] || 0;
      const pending = domainPending[d] || 0;
      console.log(`  ${d.padEnd(10)}: ${cnt}  (done: ${done}, pending: ${pending})`);
    }
  }
  // Any other domains not in the list above
  for (const d of Object.keys(domainTotal)) {
    if (!domains.includes(d)) {
      const cnt = String(domainTotal[d]).padStart(5);
      const done = domainDone[d] || 0;
      const pending = domainPending[d] || 0;
      console.log(`  ${d.padEnd(10)}: ${cnt}  (done: ${done}, pending: ${pending})`);
    }
  }
  console.log(`  ${'TOTAL'.padEnd(10)}: ${String(total).padStart(5)}`);
  console.log('');

  // Type table
  console.log('Expressions (타입별):');
  for (const [t, cnt] of Object.entries(typeTotal)) {
    console.log(`  ${t.padEnd(15)}: ${String(cnt).padStart(5)}`);
  }
  console.log('');

  // Content status
  console.log('Content Status:');
  console.log(`  ✅ content_done: ${String(totalDone).padStart(5)} / ${total}  (${pctDone}%)`);
  console.log(`  ⏳ pending:      ${String(totalPending).padStart(5)} / ${total}  (${pctPending}%)`);
  console.log(`  ❌ errors:       ${String(totalError).padStart(5)} / ${total}  (${pctError}%)`);
  console.log('');

  // Next batch suggestion
  if (totalPending > 0) {
    // Find domain with most pending
    const topDomain = Object.entries(domainPending).sort((a, b) => b[1] - a[1])[0];
    if (topDomain) {
      console.log('Next batch suggestion:');
      console.log(`  → "${topDomain[0]} 도메인 pending ${Math.min(50, topDomain[1])}개 처리해줘"`);
    }
  } else {
    console.log('All expressions have content! 🎉');
  }
  console.log('');
}

main();
