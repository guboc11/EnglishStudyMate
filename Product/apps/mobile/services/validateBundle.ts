import type { LearningBundle } from '@/types/learning';

const MAX_PAIR_SIMILARITY = 0.62;

function sentenceCount(text: string): number {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 0;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function jaccardSimilarity(a: string, b: string): number {
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

function validateMeaning(bundle: LearningBundle): string | null {
  const meaning = bundle.meaning;
  if (!meaning) return 'meaning_missing';

  if (!meaning.literalMeaningKo?.trim()) return 'meaning_literal_missing';
  if (!meaning.realUsageKo?.trim()) return 'meaning_real_usage_missing';
  if (!meaning.etymologyKo?.trim()) return 'meaning_etymology_missing';
  if (!meaning.nuanceKo?.trim()) return 'meaning_nuance_missing';
  if (!meaning.shortExampleEn?.trim()) return 'meaning_short_example_en_missing';
  if (!meaning.shortExampleKo?.trim()) return 'meaning_short_example_ko_missing';

  return null;
}

function validateSelectionMeta(bundle: LearningBundle): string | null {
  const meta = bundle.selectionMeta;
  if (!meta) return 'selection_meta_missing';
  if (!meta.selectedPhrase?.trim()) return 'selection_meta_phrase_missing';
  if (!meta.selectedSenseLabelKo?.trim()) return 'selection_meta_sense_missing';
  if (!meta.selectedDomain?.trim()) return 'selection_meta_domain_missing';
  return null;
}

export function validateLearningBundle(
  bundle: LearningBundle,
  expression: string
): { valid: true } | { valid: false; reason: string } {
  // step1: exactly 1 sentence
  const step1Sentence = bundle.step1?.sentence?.trim() ?? '';
  if (!step1Sentence) return { valid: false, reason: 'step1_sentence_missing' };
  if (sentenceCount(step1Sentence) !== 1) return { valid: false, reason: 'step1_sentence_count_invalid' };

  // step2: exactly 2 sentences
  const step2Story = bundle.step2?.story?.trim() ?? '';
  if (!step2Story) return { valid: false, reason: 'step2_story_missing' };
  if (sentenceCount(step2Story) !== 2) return { valid: false, reason: 'step2_sentence_count_invalid' };

  // step3: 3-4 sentences
  const step3Story = bundle.step3?.story?.trim() ?? '';
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
