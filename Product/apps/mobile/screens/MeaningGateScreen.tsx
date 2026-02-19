import { useEffect, useMemo, useState } from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import {
  buildFallbackLearningBundle,
  generateLearningBundle,
  type GenerateBundleParams,
} from '@/services/gemini';
import { resolveExpression } from '@/services/resolveExpression';
import { addSearchHistory } from '@/services/searchHistory';
import type { LearningBundle } from '@/types/learning';
import type { DomainTag, ExpressionResolution, SenseCandidate } from '@/types/selection';

type MeaningGateScreenProps = {
  rawInput: string;
  onClose: () => void;
  onResolved: (expression: string, bundle: LearningBundle) => void;
};

const DOMAIN_LABEL: Record<DomainTag, string> = {
  general: 'General',
  tech: 'Tech',
  art: 'Art',
  business: 'Business',
  science: 'Science',
  daily: 'Daily',
};

export function MeaningGateScreen({ rawInput, onClose, onResolved }: MeaningGateScreenProps) {
  const [resolution, setResolution] = useState<ExpressionResolution | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<DomainTag>('general');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsResolving(true);
      try {
        const result = await resolveExpression(rawInput);
        if (cancelled) return;
        setResolution(result);
        if (result.status === 'valid' && result.candidates.length > 0) {
          const first = result.candidates[0];
          setSelectedCandidateId(first.id);
          setSelectedDomain(first.domains[0] ?? 'general');
        }
      } catch (error) {
        if (cancelled) return;
        setResolution({
          status: 'invalid',
          reasonKo: '표현 의미를 판별하는 중 오류가 발생했습니다.',
          retryHintKo: '잠시 후 다시 시도해 주세요.',
        });
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [rawInput]);

  const selectedCandidate = useMemo(() => {
    if (!resolution || resolution.status !== 'valid') return null;
    return resolution.candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;
  }, [resolution, selectedCandidateId]);

  const handleCandidateSelect = (candidate: SenseCandidate) => {
    setSelectedCandidateId(candidate.id);
    setSelectedDomain(candidate.domains[0] ?? 'general');
  };

  const handleStart = async () => {
    if (!selectedCandidate || isGenerating) return;

    const params: GenerateBundleParams = {
      expression: rawInput,
      phrase: selectedCandidate.phrase,
      senseLabelKo: selectedCandidate.senseLabelKo,
      domain: selectedDomain,
    };

    setIsGenerating(true);
    try {
      await addSearchHistory(selectedCandidate.phrase);
      const bundle = await generateLearningBundle(params);
      onResolved(selectedCandidate.phrase, bundle);
    } catch {
      const fallback = buildFallbackLearningBundle(params);
      onResolved(selectedCandidate.phrase, fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack className="w-full max-w-[360px] gap-4">
        <Text size="xl" bold>
          의미 선택
        </Text>
        <Text size="sm">{`입력: ${rawInput}`}</Text>

        {isResolving ? (
          <Text size="md">의미를 판별하는 중...</Text>
        ) : resolution?.status === 'invalid' ? (
          <>
            <Text size="md">{resolution.reasonKo}</Text>
            <Text size="sm">{resolution.retryHintKo}</Text>
            <Button size="lg" action="primary" onPress={onClose}>
              <ButtonText>다시 입력하기</ButtonText>
            </Button>
          </>
        ) : (
          <>
            <Text size="md">어떤 것과 관련된 의미인가요?</Text>
            <VStack className="gap-2">
              {resolution?.candidates.map((candidate) => (
                <Button
                  key={candidate.id}
                  size="md"
                  action={selectedCandidateId === candidate.id ? 'primary' : 'secondary'}
                  onPress={() => handleCandidateSelect(candidate)}
                >
                  <ButtonText>{`${candidate.phrase} - ${candidate.senseLabelKo}`}</ButtonText>
                </Button>
              ))}
            </VStack>

            {selectedCandidate ? (
              <>
                <Text size="sm">{selectedCandidate.shortHintKo}</Text>
                <Text size="sm" bold>
                  도메인 선택
                </Text>
                <VStack className="gap-2">
                  {selectedCandidate.domains.map((domain) => (
                    <Button
                      key={domain}
                      size="sm"
                      action={selectedDomain === domain ? 'primary' : 'secondary'}
                      onPress={() => setSelectedDomain(domain)}
                    >
                      <ButtonText>{DOMAIN_LABEL[domain]}</ButtonText>
                    </Button>
                  ))}
                </VStack>
              </>
            ) : null}

            <Button size="lg" action="primary" onPress={handleStart} isDisabled={isGenerating}>
              <ButtonText>{isGenerating ? '생성 중...' : '이 의미로 시작'}</ButtonText>
            </Button>
          </>
        )}
      </VStack>
    </LearningFlowLayout>
  );
}
