export type DomainTag = 'general' | 'tech' | 'art' | 'business' | 'science' | 'daily';

export type SenseCandidate = {
  id: string;
  phrase: string;
  senseLabelKo: string;
  shortHintKo: string;
  domains: DomainTag[];
};

export type ExpressionResolution =
  | {
      status: 'invalid';
      reasonKo: string;
      retryHintKo: string;
    }
  | {
      status: 'valid';
      normalizedInput: string;
      candidates: SenseCandidate[];
      autoResolvedCandidateId?: string;
    };

export type SelectedMeaning = {
  phrase: string;
  senseId: string;
  senseLabelKo: string;
  domain: DomainTag;
};

export type ResolveAndGenerateResult =
  | {
      status: 'invalid';
      reasonKo: string;
      retryHintKo: string;
    }
  | {
      status: 'needs_selection';
      normalizedInput: string;
      candidates: SenseCandidate[];
    }
  | {
      status: 'ready';
      expression: string;
      bundle: import('@/types/learning').LearningBundle;
    };
