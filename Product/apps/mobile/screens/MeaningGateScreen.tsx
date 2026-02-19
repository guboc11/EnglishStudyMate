import { useEffect, useMemo, useState } from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import {
  buildFallbackLearningBundle,
  generateLearningBundle,
  resolveAndGenerateLearning,
  type GenerateBundleParams,
} from '@/services/gemini';
import { addSearchHistory } from '@/services/searchHistory';
import type { LearningBundle } from '@/types/learning';
import type { DomainTag, ResolveAndGenerateResult, SenseCandidate } from '@/types/selection';

type MeaningGateScreenProps = {
  rawInput: string;
  initialResult?: ResolveAndGenerateResult;
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

export function MeaningGateScreen({
  rawInput,
  initialResult,
  onClose,
  onResolved,
}: MeaningGateScreenProps) {
  const [result, setResult] = useState<ResolveAndGenerateResult | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<DomainTag>('general');

  useEffect(() => {
    const handleReadyResult = async (readyResult: Extract<ResolveAndGenerateResult, { status: 'ready' }>) => {
      await addSearchHistory(readyResult.expression);
      onResolved(readyResult.expression, readyResult.bundle);
    };

    if (initialResult) {
      if (initialResult.status === 'ready') {
        void handleReadyResult(initialResult);
        setIsResolving(false);
        return;
      }

      setResult(initialResult);
      if (initialResult.status === 'needs_selection' && initialResult.candidates.length > 0) {
        const first = initialResult.candidates[0];
        setSelectedCandidateId(first.id);
        setSelectedDomain(first.domains[0] ?? 'general');
      }
      setIsResolving(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsResolving(true);
      try {
        const nextResult = await resolveAndGenerateLearning({
          input: rawInput,
        });
        if (cancelled) return;

        if (nextResult.status === 'ready') {
          await handleReadyResult(nextResult);
          return;
        }

        setResult(nextResult);
        if (nextResult.status === 'needs_selection' && nextResult.candidates.length > 0) {
          const first = nextResult.candidates[0];
          setSelectedCandidateId(first.id);
          setSelectedDomain(first.domains[0] ?? 'general');
        }
      } catch {
        if (cancelled) return;
        setResult({
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
  }, [initialResult, onResolved, rawInput]);

  const selectedCandidate = useMemo(() => {
    if (!result || result.status !== 'needs_selection') return null;
    return result.candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;
  }, [result, selectedCandidateId]);

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
        ) : result?.status === 'invalid' ? (
          <>
            <Text size="md">{result.reasonKo}</Text>
            <Text size="sm">{result.retryHintKo}</Text>
            <Button size="lg" action="primary" onPress={onClose}>
              <ButtonText>다시 입력하기</ButtonText>
            </Button>
          </>
        ) : result?.status !== 'needs_selection' ? (
          <Text size="md">결과 페이지로 이동하는 중...</Text>
        ) : (
          <>
            <Text size="md">어떤 것과 관련된 의미인가요?</Text>
            <VStack className="gap-2">
              {result.candidates.map((candidate) => (
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
