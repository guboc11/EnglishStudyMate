#!/usr/bin/env node
'use strict';

/**
 * save-bundle.js — Claude가 생성한 bundle을 output/bundles/에 저장하고
 *                  tasks.json의 status를 content_done으로 업데이트합니다.
 *
 * 사용법:
 *   node save-bundle.js --id <expression-id> --input <bundle.json>
 *
 * Bundle JSON 형식:
 * {
 *   "id": "take-off_b6a3e3bc",
 *   "phrase": "take off",
 *   "senseLabelKo": "이륙하다",
 *   "domain": "general",
 *   "type": "phrasal_verb",
 *   "level": "B1",
 *   "meaning": {
 *     "ko": "이륙하다",
 *     "en": "to leave the ground and begin to fly"
 *   },
 *   "step1": {
 *     "scene": "...",
 *     "sentence": "The plane takes off from the runway.",
 *     "sentenceKo": "비행기가 활주로에서 이륙합니다."
 *   },
 *   "step2": {
 *     "scene": "...",
 *     "sentence": "...",
 *     "sentenceKo": "..."
 *   },
 *   "step3": {
 *     "scene": "...",
 *     "sentence": "...",
 *     "sentenceKo": "..."
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const TASKS_PATH = path.join(__dirname, 'data', 'tasks.json');
const BUNDLES_DIR = path.join(__dirname, 'output', 'bundles');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      result.id = args[i + 1];
      i++;
    } else if (args[i] === '--input' && args[i + 1]) {
      result.input = args[i + 1];
      i++;
    }
  }
  return result;
}

function main() {
  const { id, input } = parseArgs();

  if (!id || !input) {
    console.error('Usage: node save-bundle.js --id <expression-id> --input <bundle.json>');
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(1);
  }

  if (!fs.existsSync(TASKS_PATH)) {
    console.error('tasks.json not found.');
    process.exit(1);
  }

  const bundle = JSON.parse(fs.readFileSync(input, 'utf8'));
  const tasks = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));

  const entry = tasks.expressions.find(e => e.id === id);
  if (!entry) {
    console.error(`Expression id "${id}" not found in tasks.json`);
    process.exit(1);
  }

  // Save bundle file
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
  const bundleFilename = `${id}.json`;
  const bundlePath = path.join(BUNDLES_DIR, bundleFilename);
  fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));

  // Update tasks.json
  const now = new Date().toISOString();
  entry.status = 'content_done';
  entry.bundle_path = `output/bundles/${bundleFilename}`;
  entry.done_at = now;

  tasks.meta.content_done = tasks.expressions.filter(e => e.status === 'content_done').length;
  tasks.meta.pending = tasks.expressions.filter(e => e.status === 'pending').length;
  tasks.meta.errors = tasks.expressions.filter(e => e.status === 'error').length;
  tasks.meta.last_updated = now;

  fs.writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2));

  console.log(`✅ Bundle saved: ${bundlePath}`);
  console.log(`   tasks.json updated: ${id} → content_done`);
  console.log(`   Progress: ${tasks.meta.content_done} / ${tasks.meta.total} done`);
}

main();
