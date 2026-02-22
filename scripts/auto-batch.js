#!/usr/bin/env node
'use strict';

/**
 * auto-batch.js — pending 표현을 하나씩 꺼내 `claude -p`로 bundle 생성
 *
 * 사용법:
 *   node auto-batch.js [max_count]
 *
 * 예시:
 *   node auto-batch.js 2        # 테스트 (2개만)
 *   node auto-batch.js 500      # 야간 자동 실행
 *
 * 백그라운드 실행:
 *   nohup caffeinate -i node auto-batch.js 500 > /tmp/auto-batch.log 2>&1 &
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPTS_DIR = __dirname;
const TASKS_PATH = path.join(SCRIPTS_DIR, 'data', 'tasks.json');
const BUNDLES_DIR = path.join(SCRIPTS_DIR, 'output', 'bundles');
const CLAUDE_BIN = '/Users/taewonpark/.local/bin/claude';

const SLEEP_MS = 5_000;       // 정상 처리 후 대기
const FAIL_SLEEP_MS = 10_000; // 실패 후 대기
const CLAUDE_TIMEOUT_MS = 120_000;

// ─── helpers ──────────────────────────────────────────────────────────────────

function timestamp() {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getNextPending() {
  const tasks = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
  return tasks.expressions.find(e => e.status === 'pending') || null;
}

function buildPrompt(expr) {
  const { id, phrase, senseLabelKo, type, domain, level } = expr;
  const bundleRelPath = `output/bundles/${id}.json`;

  return `Working directory: ${SCRIPTS_DIR}

Generate an English learning bundle for this expression and save it directly to disk.

Expression:
- phrase: "${phrase}"
- senseLabelKo: "${senseLabelKo}"
- type: ${type} / domain: ${domain} / level: ${level}
- id: ${id}

STEP 1: Write the bundle JSON to this exact file path:
${path.join(SCRIPTS_DIR, 'output', 'bundles', id + '.json')}

The JSON must follow this exact structure:
{
  "id": "${id}",
  "expression": "${phrase}",
  "selectionMeta": {
    "selectedPhrase": "${phrase}",
    "selectedSenseLabelKo": "${senseLabelKo}",
    "selectedDomain": "${domain}"
  },
  "step1": {
    "sentence": "<single natural sentence using the expression in context>"
  },
  "step2": {
    "story": "<2-3 sentence short story using the expression naturally>",
    "topicTag": "<topic in English, e.g. 'work stress'>",
    "moodTag": "<mood in English, e.g. 'determined'>"
  },
  "step3": {
    "story": "<4-6 sentence longer immersive story using the expression naturally>",
    "topicTag": "<topic in English>",
    "moodTag": "<mood in English>"
  },
  "meaning": {
    "literalMeaningKo": "<literal meaning in Korean, 1 sentence>",
    "realUsageKo": "<how it is actually used in Korean, 1-2 sentences>",
    "etymologyKo": "<word origin/etymology in Korean, 1-2 sentences>",
    "nuanceKo": "<nuance/tone notes in Korean, 1-2 sentences>",
    "shortExampleEn": "<short example sentence in English>",
    "shortExampleKo": "<translation of shortExampleEn in Korean>"
  }
}

STEP 2: Update ${TASKS_PATH}
- Find the expression with id "${id}"
- Set status to "content_done"
- Set bundle_path to "${bundleRelPath}"
- Set done_at to current ISO timestamp
- Recalculate meta: increment content_done by 1, decrement pending by 1, set last_updated to now

Execute both steps completely. No clarifying questions. When done, output exactly: OK`;
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const maxCount = parseInt(process.argv[2], 10) || 10;

  if (!fs.existsSync(TASKS_PATH)) {
    console.error('tasks.json not found. Run add-expressions.js first.');
    process.exit(1);
  }

  if (!fs.existsSync(CLAUDE_BIN)) {
    console.error(`claude CLI not found at ${CLAUDE_BIN}`);
    process.exit(1);
  }

  fs.mkdirSync(BUNDLES_DIR, { recursive: true });

  console.log(`[${timestamp()}] auto-batch started. max=${maxCount}`);
  console.log(`[${timestamp()}] BUNDLES_DIR: ${BUNDLES_DIR}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= maxCount; i++) {
    const expr = getNextPending();

    if (!expr) {
      console.log(`[${timestamp()}] No pending expressions left. Done early.`);
      break;
    }

    const bundlePath = path.join(BUNDLES_DIR, `${expr.id}.json`);
    const prompt = buildPrompt(expr);

    process.stdout.write(`[${timestamp()}] [${i}/${maxCount}] "${expr.phrase}" (${expr.senseLabelKo}) → `);

    const result = spawnSync(
      CLAUDE_BIN,
      ['--dangerously-skip-permissions', '-p', prompt],
      {
        encoding: 'utf8',
        timeout: CLAUDE_TIMEOUT_MS,
        cwd: SCRIPTS_DIR,
      }
    );

    const ok = fs.existsSync(bundlePath);

    if (ok) {
      successCount++;
      console.log('✓ OK');
    } else {
      failCount++;
      console.log('✗ FAIL');

      if (result.error) {
        console.error(`  [error] ${result.error.message}`);
      }
      if (result.stderr) {
        const errSnip = result.stderr.trim().slice(0, 300);
        if (errSnip) console.error(`  [stderr] ${errSnip}`);
      }
      if (result.stdout) {
        const outSnip = result.stdout.trim().slice(0, 300);
        if (outSnip) console.error(`  [stdout] ${outSnip}`);
      }
    }

    // Rate-limit sleep (skip after last iteration)
    if (i < maxCount) {
      const waitMs = ok ? SLEEP_MS : FAIL_SLEEP_MS;
      await sleep(waitMs);
    }
  }

  console.log('');
  console.log(`[${timestamp()}] Done. success=${successCount} fail=${failCount}`);
}

main().catch(err => {
  console.error('[auto-batch] Fatal error:', err.message);
  process.exit(1);
});
