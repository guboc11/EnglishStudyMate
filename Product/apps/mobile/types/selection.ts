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
    };

export type SelectedMeaning = {
  phrase: string;
  senseId: string;
  senseLabelKo: string;
  domain: DomainTag;
};
