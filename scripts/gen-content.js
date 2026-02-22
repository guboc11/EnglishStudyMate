'use strict';

/**
 * CLI: Generate step1/step2/step3 content for a single English expression.
 *
 * Usage:
 *   node gen-content.js --phrase "take off" --sense "이륙하다" --domain general
 *
 * Output (stdout): JSON result { success, id, path } or { success, error }
 * Progress logs:   stderr
 */

require('dotenv').config({ path: `${__dirname}/.env` });

const { generateBundle } = require('./lib/gemini');
const { upsertBundle } = require('./lib/supabase');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--phrase' && args[i + 1]) result.phrase = args[++i];
    else if (args[i] === '--sense' && args[i + 1]) result.sense = args[++i];
    else if (args[i] === '--domain' && args[i + 1]) result.domain = args[++i];
  }
  return result;
}

async function main() {
  const { phrase, sense, domain = 'general' } = parseArgs();

  if (!phrase || !sense) {
    process.stderr.write('[gen-content] Error: --phrase and --sense are required\n');
    process.stdout.write(JSON.stringify({ success: false, error: '--phrase and --sense are required' }) + '\n');
    process.exit(1);
  }

  process.stderr.write(`[gen-content] phrase="${phrase}" sense="${sense}" domain="${domain}"\n`);

  try {
    const bundle = await generateBundle(phrase, sense, domain);
    const saved = await upsertBundle(bundle);
    const result = { success: true, id: saved.id, path: saved.path };
    process.stdout.write(JSON.stringify(result) + '\n');
    process.stderr.write(`[gen-content] Done. Saved to: ${saved.path}\n`);
  } catch (err) {
    process.stderr.write(`[gen-content] Error: ${err.message}\n`);
    process.stdout.write(JSON.stringify({ success: false, error: err.message }) + '\n');
    process.exit(1);
  }
}

main();
