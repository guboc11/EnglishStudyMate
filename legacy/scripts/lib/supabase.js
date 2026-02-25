'use strict';

/**
 * scripts/lib/supabase.js
 * 로컬 번들 파일을 Supabase expressions + stories 테이블에 upsert.
 * 이미지는 Supabase Storage 'images' 버킷에 업로드.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const BUNDLES_DIR = path.join(__dirname, '..', 'output', 'bundles');

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let _client = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in scripts/.env');
  _client = createClient(url, key);
  return _client;
}

/**
 * 번들을 expressions + stories 테이블에 upsert.
 * expressions: ON CONFLICT (id) DO NOTHING
 * stories: 항상 INSERT
 *
 * @param {object} bundle
 * @returns {Promise<{ id: string; path: string }>}
 */
async function upsertBundle(bundle) {
  const supabase = getClient();
  const id = bundle.id;

  const { error: exprError } = await supabase
    .from('expressions')
    .upsert(
      {
        id,
        phrase: bundle.selectionMeta?.selectedPhrase ?? bundle.expression,
        sense_label_ko: bundle.selectionMeta?.selectedSenseLabelKo ?? '',
        domain: bundle.selectionMeta?.selectedDomain ?? 'general',
        meaning: bundle.meaning,
        selection_meta: bundle.selectionMeta,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (exprError) throw new Error(`expressions upsert failed: ${exprError.message}`);

  const { error: storyError } = await supabase.from('stories').insert({
    expression_id: id,
    step1_sentence: bundle.step1?.sentence ?? '',
    step2_story: bundle.step2?.story ?? '',
    step3_story: bundle.step3?.story ?? '',
    topic_tag: bundle.step2?.topicTag ?? null,
    mood_tag: bundle.step2?.moodTag ?? null,
  });

  if (storyError) throw new Error(`stories insert failed: ${storyError.message}`);

  return { id, path: `bundles/${id}.json` };
}

/**
 * ID로 번들 조회 (expressions + stories JOIN)
 * @param {string} id
 * @returns {Promise<object | null>}
 */
async function getBundle(id) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('expressions')
    .select('*, stories(*)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * 이미지를 Supabase Storage 'images' 버킷에 업로드.
 * 경로: images/{bundleId}/{step}.png
 *
 * @param {string} bundleId
 * @param {'step2' | 'step3'} step
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>} Storage path
 */
async function uploadImage(bundleId, step, buffer, mimeType = 'image/png') {
  const supabase = getClient();
  const storagePath = `${bundleId}/${step}.png`;

  const { error } = await supabase.storage
    .from('images')
    .upload(storagePath, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return storagePath;
}

/**
 * step2 또는 step3 이미지가 Storage에 없는 번들 목록 반환.
 * 로컬 bundles/ 디렉토리 파일을 기준으로, Storage에 없는 것을 찾는다.
 *
 * @returns {Promise<object[]>}
 */
async function listBundlesWithoutImages() {
  const supabase = getClient();
  const files = fs.readdirSync(BUNDLES_DIR).filter((f) => f.endsWith('.json'));
  const result = [];

  for (const file of files) {
    const bundle = JSON.parse(fs.readFileSync(path.join(BUNDLES_DIR, file), 'utf8'));
    const id = bundle.id;

    const { data: step2 } = await supabase.storage.from('images').list(id, { search: 'step2.png' });
    const { data: step3 } = await supabase.storage.from('images').list(id, { search: 'step3.png' });

    const hasStep2 = Array.isArray(step2) && step2.length > 0;
    const hasStep3 = Array.isArray(step3) && step3.length > 0;

    if (!hasStep2 || !hasStep3) result.push(bundle);
  }

  return result;
}

module.exports = { upsertBundle, getBundle, uploadImage, listBundlesWithoutImages };
