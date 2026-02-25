'use strict';

/**
 * CLI: Generate step2 and step3 images for a single learning bundle.
 *
 * Usage:
 *   node gen-image.js --input output/bundles/<id>.json
 *   node gen-image.js --id <bundle-id>
 *
 * Output (stdout): JSON result { success, id, images } or { success, error }
 * Progress logs:   stderr
 */

require('dotenv').config({ path: `${__dirname}/.env` });

const fs = require('fs');
const path = require('path');

const { generateImage } = require('./lib/gemini');
const { getBundle, uploadImage } = require('./lib/supabase');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) result.input = args[++i];
    else if (args[i] === '--id' && args[i + 1]) result.id = args[++i];
  }
  return result;
}

async function main() {
  const { input, id } = parseArgs();

  if (!input && !id) {
    process.stderr.write('[gen-image] Error: --input <json-path> or --id <bundle-id> required\n');
    process.stdout.write(JSON.stringify({ success: false, error: '--input or --id required' }) + '\n');
    process.exit(1);
  }

  try {
    let bundle;
    let bundleId;

    if (input) {
      const filePath = path.resolve(process.cwd(), input);
      if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
      bundle = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      bundleId = bundle.id;
      if (!bundleId) throw new Error('Bundle JSON is missing "id" field');
    } else {
      bundle = await getBundle(id);
      bundleId = id;
    }

    const expression = bundle.expression || bundle.selectionMeta?.selectedPhrase || 'expression';
    process.stderr.write(`[gen-image] Processing bundle: ${bundleId} (${expression})\n`);

    const images = {};
    for (const step of ['step2', 'step3']) {
      const story = bundle[step]?.story;
      if (!story) {
        process.stderr.write(`[gen-image] Skipping ${step}: no story found\n`);
        continue;
      }

      process.stderr.write(`[gen-image] Generating image for ${step}...\n`);
      const { buffer, mimeType } = await generateImage(story, step, expression);
      const imagePath = await uploadImage(bundleId, step, buffer, mimeType);
      images[step] = imagePath;
      process.stderr.write(`[gen-image] Saved ${step} → ${imagePath}\n`);
    }

    process.stdout.write(JSON.stringify({ success: true, id: bundleId, images }) + '\n');
    process.stderr.write('[gen-image] Done.\n');
  } catch (err) {
    process.stderr.write(`[gen-image] Error: ${err.message}\n`);
    process.stdout.write(JSON.stringify({ success: false, error: err.message }) + '\n');
    process.exit(1);
  }
}

main();
