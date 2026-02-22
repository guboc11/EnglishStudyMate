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
  // step1: exactly 1 sentence
  const step1Sentence = String(bundle?.step1?.sentence || '').trim();
  if (!step1Sentence) return { valid: false, reason: 'step1_sentence_missing' };
  if (sentenceCount(step1Sentence) !== 1) return { valid: false, reason: 'step1_sentence_count_invalid' };

  // step2: exactly 2 sentences
  const step2Story = String(bundle?.step2?.story || '').trim();
  if (!step2Story) return { valid: false, reason: 'step2_story_missing' };
  if (sentenceCount(step2Story) !== 2) return { valid: false, reason: 'step2_sentence_count_invalid' };

  // step3: 3-4 sentences
  const step3Story = String(bundle?.step3?.story || '').trim();
  if (!step3Story) return { valid: false, reason: 'step3_story_missing' };
  const step3Count = sentenceCount(step3Story);
  if (step3Count < 3 || step3Count > 4) return { valid: false, reason: 'step3_sentence_count_invalid' };

  // diversity check between step2 and step3
  const score = jaccardSimilarity(step2Story, step3Story);
  if (score > MAX_PAIR_SIMILARITY) {
    return { valid: false, reason: 'stories_too_similar' };
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
