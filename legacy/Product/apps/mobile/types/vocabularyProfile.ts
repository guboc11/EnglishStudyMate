export type FamiliarityLevel = 'known' | 'fuzzy' | 'unknown';

export type VocabularyEntry = {
  expression: string;
  familiarity: FamiliarityLevel | null; // null = searched but not yet rated
  searchedAt: string; // ISO string
  lastUpdatedAt: string; // ISO string
  reviewStory: string; // step3.story from the original bundle
  meaningKo: string; // realUsageKo for quick reference
};

export type VocabularyProfile = Record<string, VocabularyEntry>;
