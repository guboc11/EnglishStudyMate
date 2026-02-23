import type { LearningBundle } from '@/types/learning';
import type { FamiliarityLevel, VocabularyEntry, VocabularyProfile } from '@/types/vocabularyProfile';

const PROFILE_KEY = 'english_study_mate_vocab_profile_v1';

function normalizeExpression(expression: string): string {
  return expression.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasWebStorage(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
}

function readProfile(): VocabularyProfile {
  if (!hasWebStorage()) return {};
  try {
    const raw = globalThis.localStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as VocabularyProfile)
      : {};
  } catch {
    return {};
  }
}

function writeProfile(profile: VocabularyProfile): void {
  if (!hasWebStorage()) return;
  try {
    globalThis.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore write errors; in-memory state is still intact
  }
}

let inMemoryProfile: VocabularyProfile = {};

function getProfile(): VocabularyProfile {
  return hasWebStorage() ? readProfile() : inMemoryProfile;
}

function saveProfile(profile: VocabularyProfile): void {
  if (hasWebStorage()) {
    writeProfile(profile);
  } else {
    inMemoryProfile = profile;
  }
}

export async function getVocabularyProfile(): Promise<VocabularyProfile> {
  return getProfile();
}

export async function addExpressionToProfile(
  expression: string,
  bundle: LearningBundle
): Promise<void> {
  const key = normalizeExpression(expression);
  if (!key) return;

  const profile = getProfile();
  const existing = profile[key];
  const now = new Date().toISOString();

  profile[key] = {
    expression: key,
    familiarity: existing?.familiarity ?? null,
    searchedAt: existing?.searchedAt ?? now,
    lastUpdatedAt: now,
    reviewStory: bundle.step3.story,
    meaningKo: bundle.meaning.realUsageKo,
  };

  saveProfile(profile);
}

export async function setFamiliarity(
  expression: string,
  level: FamiliarityLevel
): Promise<void> {
  const key = normalizeExpression(expression);
  if (!key) return;

  const profile = getProfile();
  const existing = profile[key];
  if (!existing) return;

  profile[key] = {
    ...existing,
    familiarity: level,
    lastUpdatedAt: new Date().toISOString(),
  };

  saveProfile(profile);
}

// Priority: fuzzy > unknown > unrated > known
function reviewPriority(entry: VocabularyEntry): number {
  if (entry.familiarity === 'fuzzy') return 0;
  if (entry.familiarity === 'unknown') return 1;
  if (entry.familiarity === null) return 2;
  return 3;
}

export async function getExpressionsForReview(limit: number): Promise<VocabularyEntry[]> {
  const profile = getProfile();
  return Object.values(profile).sort((a, b) => reviewPriority(a) - reviewPriority(b)).slice(0, limit);
}
