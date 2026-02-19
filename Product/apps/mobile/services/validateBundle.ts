import type { LearningBundle, LearningPageKey } from '@/types/learning';
import { splitByExpressionMatch } from '@/utils/highlightExpression';

const PAGE_KEYS: LearningPageKey[] = [
  'example1',
  'example2',
  'example3',
  'review1',
  'review2',
  'review3',
];

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

function hasExpressionMatch(text: string, expression: string): boolean {
  return splitByExpressionMatch(text, expression).some((segment) => segment.isMatch);
}

function validatePageStory(story: string, expression: string): string | null {
  const count = sentenceCount(story);
  if (count < 3 || count > 4) return 'story_sentence_count_invalid';
  if (!hasExpressionMatch(story, expression)) return 'story_expression_missing';
  return null;
}

export function validateLearningBundle(
  bundle: LearningBundle,
  expression: string
): { valid: true } | { valid: false; reason: string } {
  const stories: string[] = [];

  for (const key of PAGE_KEYS) {
    const story = bundle[key]?.story?.trim() ?? '';
    if (!story) {
      return { valid: false, reason: `missing_story_${key}` };
    }

    const pageIssue = validatePageStory(story, expression);
    if (pageIssue) {
      return { valid: false, reason: `${pageIssue}_${key}` };
    }

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

  return { valid: true };
}
