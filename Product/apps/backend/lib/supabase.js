'use strict';

const { createClient } = require('@supabase/supabase-js');

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let _client = null;

/**
 * Supabase 클라이언트 싱글턴 반환
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function createSupabaseClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  _client = createClient(url, key);
  return _client;
}

/**
 * phrase로 expression + story 한 쌍 조회.
 * expressions.phrase = $1 인 행에서 스토리를 랜덤 1개 JOIN해 반환.
 *
 * @param {string} phrase - 정규화된 표현 (lowercase trim)
 * @returns {Promise<{ expression: object; story: object } | null>}
 */
async function findExpressionByPhrase(phrase) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('expressions')
    .select(`
      id, phrase, sense_label_ko, domain, meaning, selection_meta, created_at,
      stories ( id, expression_id, step1_sentence, step2_story, step3_story, topic_tag, mood_tag, created_at )
    `)
    .eq('phrase', phrase)
    .limit(1)
    .single();

  if (error || !data) return null;

  const stories = data.stories;
  if (!stories || stories.length === 0) return null;

  // 랜덤 스토리 선택
  const story = stories[Math.floor(Math.random() * stories.length)];

  return { expression: data, story };
}

/**
 * DB row 한 쌍을 LearningBundle 형태로 조립.
 *
 * @param {object} expression - expressions 테이블 행
 * @param {object} story - stories 테이블 행
 * @returns {object} LearningBundle
 */
function rowsToBundle(expression, story) {
  return {
    expression: expression.phrase,
    step1: {
      sentence: story.step1_sentence,
    },
    step2: {
      story: story.step2_story,
      topicTag: story.topic_tag ?? '',
      moodTag: story.mood_tag ?? '',
    },
    step3: {
      story: story.step3_story,
      topicTag: story.topic_tag ?? '',
      moodTag: story.mood_tag ?? '',
    },
    meaning: expression.meaning,
    selectionMeta: expression.selection_meta,
  };
}

/**
 * expressions + stories 테이블에 번들 저장.
 * expressions: ON CONFLICT (id) DO NOTHING (중복 무시)
 * stories: 항상 INSERT (스토리 누적 가능)
 *
 * @param {object} bundle - LearningBundle
 * @returns {Promise<void>}
 */
async function insertExpressionAndStory(bundle) {
  const supabase = createSupabaseClient();

  const expressionId = bundle.selectionMeta?.selectedPhrase
    ? bundle.selectionMeta.selectedPhrase.replace(/\s+/g, '-').toLowerCase() + '_inserted'
    : 'unknown';

  // expressions upsert (conflict 무시)
  const { error: exprError } = await supabase
    .from('expressions')
    .upsert(
      {
        id: expressionId,
        phrase: bundle.selectionMeta?.selectedPhrase ?? bundle.expression,
        sense_label_ko: bundle.selectionMeta?.selectedSenseLabelKo ?? '',
        domain: bundle.selectionMeta?.selectedDomain ?? 'general',
        meaning: bundle.meaning,
        selection_meta: bundle.selectionMeta,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (exprError) {
    console.error('[Supabase] insertExpression error:', exprError.message);
    return;
  }

  // stories insert
  const { error: storyError } = await supabase.from('stories').insert({
    expression_id: expressionId,
    step1_sentence: bundle.step1?.sentence ?? '',
    step2_story: bundle.step2?.story ?? '',
    step3_story: bundle.step3?.story ?? '',
    topic_tag: bundle.step2?.topicTag ?? null,
    mood_tag: bundle.step2?.moodTag ?? null,
  });

  if (storyError) {
    console.error('[Supabase] insertStory error:', storyError.message);
  }
}

/**
 * phrase LIKE 검색으로 후보 expression 목록 반환.
 *
 * @param {string} phrase - 검색어 (lowercase trim)
 * @returns {Promise<Array<{ id: string; phrase: string; sense_label_ko: string; domain: string; meaning: object }>>}
 */
async function findExpressionsByPhraseLike(phrase) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('expressions')
    .select('id, phrase, sense_label_ko, domain, meaning')
    .filter('phrase', '~*', `\\m${phrase}\\M`)
    .limit(10);

  if (error || !data) return [];
  return data;
}

module.exports = {
  createSupabaseClient,
  findExpressionByPhrase,
  findExpressionsByPhraseLike,
  rowsToBundle,
  insertExpressionAndStory,
};
