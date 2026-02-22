#!/usr/bin/env node
'use strict';

/**
 * add-expressions.js — tasks.json에 신규 표현을 추가합니다 (중복 제거)
 *
 * 사용법:
 *   node add-expressions.js --input /path/to/new-batch.json
 *
 * 입력 JSON 형식 (배열):
 * [
 *   {
 *     "phrase": "take off",
 *     "senseLabelKo": "이륙하다",
 *     "domain": "general",
 *     "type": "phrasal_verb",
 *     "level": "B1"
 *   },
 *   ...
 * ]
 *
 * ID는 md5(phrase + "_" + senseLabelKo).slice(0, 8) 으로 자동 생성됩니다.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TASKS_PATH = path.join(__dirname, 'data', 'tasks.json');

function makeId(phrase, senseLabelKo) {
  const slug = phrase.replace(/\s+/g, '-');
  const hash = crypto.createHash('md5').update(phrase + '_' + senseLabelKo).digest('hex').slice(0, 8);
  return `${slug}_${hash}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      result.input = args[i + 1];
      i++;
    }
  }
  return result;
}

function main() {
  const { input } = parseArgs();

  if (!input) {
    console.error('Usage: node add-expressions.js --input <path-to-json>');
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(1);
  }

  if (!fs.existsSync(TASKS_PATH)) {
    console.error('tasks.json not found. Create it first.');
    process.exit(1);
  }

  const newItems = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (!Array.isArray(newItems)) {
    console.error('Input JSON must be an array.');
    process.exit(1);
  }

  const tasks = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
  const existingIds = new Set(tasks.expressions.map(e => e.id));

  const now = new Date().toISOString();
  let added = 0;
  let skipped = 0;

  for (const item of newItems) {
    const { phrase, senseLabelKo, domain, type, level } = item;
    if (!phrase || !senseLabelKo || !domain || !type || !level) {
      console.warn(`Skipping incomplete entry: ${JSON.stringify(item)}`);
      skipped++;
      continue;
    }

    const id = makeId(phrase, senseLabelKo);
    if (existingIds.has(id)) {
      skipped++;
      continue;
    }

    tasks.expressions.push({
      id,
      phrase,
      senseLabelKo,
      domain,
      type,
      level,
      status: 'pending',
      bundle_path: null,
      added_at: now,
      done_at: null,
    });

    existingIds.add(id);
    added++;
  }

  // Recalculate meta
  tasks.meta.total = tasks.expressions.length;
  tasks.meta.content_done = tasks.expressions.filter(e => e.status === 'content_done').length;
  tasks.meta.pending = tasks.expressions.filter(e => e.status === 'pending').length;
  tasks.meta.errors = tasks.expressions.filter(e => e.status === 'error').length;
  tasks.meta.last_updated = now;

  fs.writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2));

  console.log(`✅ Added: ${added}, Skipped (duplicate/invalid): ${skipped}`);
  console.log(`Total expressions: ${tasks.meta.total} (pending: ${tasks.meta.pending})`);
}

main();
