import type { DomainTag } from '@/types/selection';

export type LearningPageKey = 'step1' | 'step2' | 'step3';

export type ExpressionMeaning = {
  literalMeaningKo: string;
  realUsageKo: string;
  etymologyKo: string;
  nuanceKo: string;
  shortExampleEn: string;
  shortExampleKo: string;
};

export type LearningBundle = {
  expression: string;
  step1: { sentence: string };
  step2: { story: string; imageUrl?: string };
  step3: { story: string; imageUrl?: string; videoUrl?: string };
  meaning: ExpressionMeaning;
  selectionMeta: {
    selectedPhrase: string;
    selectedSenseLabelKo: string;
    selectedDomain: DomainTag;
  };
};
