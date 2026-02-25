import { apiPost } from '@/services/apiClient';
import type { ExpressionResolution } from '@/types/selection';

export async function resolveExpression(input: string): Promise<ExpressionResolution> {
  const result = await apiPost<
    | {
        status: 'invalid';
        reasonKo: string;
        retryHintKo: string;
      }
    | {
        status: 'needs_selection';
        normalizedInput: string;
        candidates: import('@/types/selection').SenseCandidate[];
      }
    | {
        status: 'ready';
      }
  >('/api/v1/learning/resolve-and-generate', { input });

  if (result.status === 'invalid') {
    return result;
  }

  if (result.status === 'needs_selection') {
    return {
      status: 'valid',
      normalizedInput: result.normalizedInput,
      candidates: result.candidates,
    };
  }

  return {
    status: 'invalid',
    reasonKo: '표현 의미를 판별할 수 없습니다.',
    retryHintKo: '의미 선택 화면에서 다시 시도해 주세요.',
  };
}
