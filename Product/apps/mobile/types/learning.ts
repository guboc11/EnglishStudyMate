export type LearningPageKey =
  | 'example1'
  | 'example2'
  | 'example3'
  | 'review1'
  | 'review2'
  | 'review3';

export type GeneratedPageContent = {
  story: string;
  topicTag: string;
  moodTag: string;
  usedExpressionVariants: string[];
};

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
  example1: GeneratedPageContent;
  example2: GeneratedPageContent;
  example3: GeneratedPageContent;
  review1: GeneratedPageContent;
  review2: GeneratedPageContent;
  review3: GeneratedPageContent;
  meaning: ExpressionMeaning;
};
