import { apiPost } from '@/services/apiClient';
import type { LearningBundle } from '@/types/learning';
import type { DomainTag, ResolveAndGenerateResult } from '@/types/selection';

const BASE_FALLBACK_STORY = `A rainy afternoon, I saw a small cat outside and decided to take it in.
I gave it warm food and a dry towel, and it slowly relaxed near the window.
The next day, the cat followed me around the house like we had known each other for a long time.
That simple moment helped me understand what it means to take something in with care.`;

export type GenerateBundleParams = {
  expression: string;
  phrase: string;
  senseLabelKo: string;
  domain: DomainTag;
};

export type ResolveAndGenerateParams = {
  input: string;
};

export async function resolveAndGenerateLearning(
  params: ResolveAndGenerateParams
): Promise<ResolveAndGenerateResult> {
  return apiPost<ResolveAndGenerateResult>('/api/v1/learning/resolve-and-generate', params);
}

export async function generateLearningBundle(params: GenerateBundleParams): Promise<LearningBundle> {
  return apiPost<LearningBundle>('/api/v1/learning/generate-bundle', params);
}

export function buildFallbackLearningBundle(params: GenerateBundleParams): LearningBundle {
  return {
    expression: params.phrase,
    example1: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_home',
      moodTag: 'warm',
      usedExpressionVariants: [params.phrase],
    },
    example2: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_street',
      moodTag: 'calm',
      usedExpressionVariants: [params.phrase],
    },
    example3: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_social',
      moodTag: 'reflective',
      usedExpressionVariants: [params.phrase],
    },
    review1: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review1',
      moodTag: 'calm',
      usedExpressionVariants: [params.phrase],
    },
    review2: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review2',
      moodTag: 'encouraging',
      usedExpressionVariants: [params.phrase],
    },
    review3: {
      story: BASE_FALLBACK_STORY,
      topicTag: 'fallback_review3',
      moodTag: 'warm',
      usedExpressionVariants: [params.phrase],
    },
    meaning: {
      literalMeaningKo: `"${params.phrase}"는 문맥 안으로 받아들이거나 이해한다는 뜻으로 자주 쓰입니다.`,
      realUsageKo:
        '실제 대화에서는 정보, 사람, 감정, 변화를 받아들이는 상황에서 자연스럽게 사용됩니다.',
      etymologyKo:
        '기본적으로 안으로 들이다라는 이미지에서 출발해, 물리적 수용과 추상적 이해 의미로 확장되었습니다.',
      nuanceKo:
        '단순히 본다보다 더 적극적으로 받아들여 이해하거나 수용하는 느낌이 있습니다.',
      shortExampleEn: `I needed time to ${params.phrase} what she said.`,
      shortExampleKo: '그녀가 한 말을 이해해서 받아들이는 데 시간이 필요했다.',
    },
    selectionMeta: {
      selectedPhrase: params.phrase,
      selectedSenseLabelKo: params.senseLabelKo,
      selectedDomain: params.domain,
    },
  };
}
