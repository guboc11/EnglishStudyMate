'use strict';

/**
 * Phase 1: Local file system storage (replaces Supabase).
 * Phase 2: Replace with @supabase/supabase-js real client.
 *
 * Output layout:
 *   scripts/output/bundles/<id>.json   — bundle data
 *   scripts/output/images/<id>_<step>.<ext>  — image files
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const BUNDLES_DIR = path.join(OUTPUT_DIR, 'bundles');
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

function ensureDirs() {
  for (const dir of [OUTPUT_DIR, BUNDLES_DIR, IMAGES_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function makeBundleId(bundle) {
  const phrase = String(bundle.selectionMeta?.selectedPhrase || bundle.expression || 'unknown');
  const sense = String(bundle.selectionMeta?.selectedSenseLabelKo || 'unknown');
  const hash = crypto
    .createHash('md5')
    .update(`${phrase}_${sense}`)
    .digest('hex')
    .slice(0, 8);
  const slug = phrase.replace(/\s+/g, '-').toLowerCase();
  return `${slug}_${hash}`;
}

/**
 * Upsert a learning bundle to local storage.
 * @param {object} bundle
 * @returns {Promise<{id: string, path: string}>}
 */
async function upsertBundle(bundle) {
  ensureDirs();
  const id = makeBundleId(bundle);
  const record = { id, ...bundle, savedAt: new Date().toISOString() };
  const filePath = path.join(BUNDLES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
  return { id, path: filePath };
}

/**
 * Read a bundle from local storage by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
async function getBundle(id) {
  const filePath = path.join(BUNDLES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Bundle not found: ${id}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Save an image buffer to local storage and update the bundle JSON with the path.
 * @param {string} bundleId
 * @param {string} step - 'step2' or 'step3'
 * @param {Buffer} buffer
 * @param {string} mimeType - e.g. 'image/png'
 * @returns {Promise<string>} Absolute path to saved image
 */
async function uploadImage(bundleId, step, buffer, mimeType = 'image/png') {
  ensureDirs();
  const ext = (mimeType.split('/')[1] || 'png').split(';')[0];
  const fileName = `${bundleId}_${step}.${ext}`;
  const filePath = path.join(IMAGES_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  // Update bundle JSON to record image path
  const bundlePath = path.join(BUNDLES_DIR, `${bundleId}.json`);
  if (fs.existsSync(bundlePath)) {
    const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    if (!bundle[step]) bundle[step] = {};
    bundle[step].imageUrl = filePath;
    fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), 'utf8');
  }

  return filePath;
}

/**
 * List all bundles that are missing step2 or step3 images.
 * @returns {Promise<object[]>}
 */
async function listBundlesWithoutImages() {
  ensureDirs();
  const files = fs.readdirSync(BUNDLES_DIR).filter((f) => f.endsWith('.json'));
  const result = [];
  for (const file of files) {
    const bundle = JSON.parse(fs.readFileSync(path.join(BUNDLES_DIR, file), 'utf8'));
    const hasStep2 = Boolean(bundle.step2?.imageUrl);
    const hasStep3 = Boolean(bundle.step3?.imageUrl);
    if (!hasStep2 || !hasStep3) result.push(bundle);
  }
  return result;
}

module.exports = { upsertBundle, getBundle, uploadImage, listBundlesWithoutImages };
