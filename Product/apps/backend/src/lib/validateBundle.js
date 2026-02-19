const { PAGE_KEYS } = require('./constants');

const MAX_PAIR_SIMILARITY = 0.62;

function sentenceCount(text) {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 0;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function validatePageStory(story) {
  const count = sentenceCount(story);
  if (count < 3 || count > 4) return 'story_sentence_count_invalid';
  return null;
}

function validateMeaning(bundle) {
  const meaning = bundle.meaning;
  if (!meaning) return 'meaning_missing';
  if (!String(meaning.literalMeaningKo || '').trim()) return 'meaning_literal_missing';
  if (!String(meaning.realUsageKo || '').trim()) return 'meaning_real_usage_missing';
  if (!String(meaning.etymologyKo || '').trim()) return 'meaning_etymology_missing';
  if (!String(meaning.nuanceKo || '').trim()) return 'meaning_nuance_missing';
  if (!String(meaning.shortExampleEn || '').trim()) return 'meaning_short_example_en_missing';
  if (!String(meaning.shortExampleKo || '').trim()) return 'meaning_short_example_ko_missing';
  return null;
}

function validateSelectionMeta(bundle) {
  const meta = bundle.selectionMeta;
  if (!meta) return 'selection_meta_missing';
  if (!String(meta.selectedPhrase || '').trim()) return 'selection_meta_phrase_missing';
  if (!String(meta.selectedSenseLabelKo || '').trim()) return 'selection_meta_sense_missing';
  if (!String(meta.selectedDomain || '').trim()) return 'selection_meta_domain_missing';
  return null;
}

function validateLearningBundle(bundle) {
  const stories = [];

  for (const key of PAGE_KEYS) {
    const story = String(bundle?.[key]?.story || '').trim();
    if (!story) return { valid: false, reason: `missing_story_${key}` };

    const pageIssue = validatePageStory(story);
    if (pageIssue) return { valid: false, reason: `${pageIssue}_${key}` };

    stories.push(story);
  }

  for (let i = 0; i < stories.length; i += 1) {
    for (let j = i + 1; j < stories.length; j += 1) {
      const score = jaccardSimilarity(stories[i], stories[j]);
      if (score > MAX_PAIR_SIMILARITY) {
        return { valid: false, reason: 'stories_too_similar' };
      }
    }
  }

  const meaningIssue = validateMeaning(bundle);
  if (meaningIssue) return { valid: false, reason: meaningIssue };

  const metaIssue = validateSelectionMeta(bundle);
  if (metaIssue) return { valid: false, reason: metaIssue };

  return { valid: true };
}

module.exports = {
  validateLearningBundle,
};
