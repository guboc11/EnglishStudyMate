import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getExpressionsForReview } from '@/services/vocabularyProfile';
import type { VocabularyEntry } from '@/types/vocabularyProfile';
import { splitByExpressionMatch } from '@/utils/highlightExpression';

type ReviewSessionScreenProps = {
  onClose: () => void;
  onComplete: (entries: VocabularyEntry[]) => void;
  onEarlyEnd: (entries: VocabularyEntry[]) => void;
};

type SessionPhase = 'size-select' | 'reading';

const SESSION_SIZES = [5, 10, 20] as const;

const FAMILIARITY_LABEL: Record<string, string> = {
  known: '확실히 알겠어',
  fuzzy: '흐릿해',
  unknown: '모르겠어',
};

export function ReviewSessionScreen({ onClose, onComplete, onEarlyEnd }: ReviewSessionScreenProps) {
  const [phase, setPhase] = useState<SessionPhase>('size-select');
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Reset on each focus so user sees fresh data
      setPhase('size-select');
      setCurrentIndex(0);
      // Load total count for display
      void getExpressionsForReview(1000).then((all) => setAvailableCount(all.length));
    }, [])
  );

  const handleSizeSelect = async (size: number) => {
    const loaded = await getExpressionsForReview(size);
    if (loaded.length === 0) return; // shouldn't happen since size-select hides button
    setEntries(loaded);
    setCurrentIndex(0);
    setPhase('reading');
  };

  const handleNext = () => {
    if (currentIndex + 1 >= entries.length) {
      onComplete(entries);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (phase === 'size-select') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F2' }}>
        <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 4 }}>
          <Button size="sm" variant="link" action="secondary" onPress={onClose}>
            <ButtonText size="xl">X</ButtonText>
          </Button>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <VStack className="w-full max-w-[360px] gap-4">
            <Text size="xl" bold style={{ textAlign: 'center' }}>
              복습하기
            </Text>

            {availableCount === 0 ? (
              <>
                <Text size="md" style={{ textAlign: 'center' }}>
                  아직 복습할 표현이 없습니다.
                </Text>
                <Text size="sm" style={{ textAlign: 'center', color: '#6b7280' }}>
                  표현을 검색하면 복습 목록에 추가됩니다.
                </Text>
                <Button
                  size="lg"
                  action="secondary"
                  onPress={onClose}
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D97706' }}
                >
                  <ButtonText style={{ color: '#D97706' }}>홈으로 이동</ButtonText>
                </Button>
              </>
            ) : (
              <>
                <Text size="md" style={{ textAlign: 'center' }}>
                  {`복습 가능한 표현: ${availableCount}개`}
                </Text>
                <Text size="sm" style={{ textAlign: 'center', color: '#6b7280' }}>
                  몇 개 복습할까요?
                </Text>
                <VStack className="gap-3">
                  {SESSION_SIZES.map((size) => (
                    <Button
                      key={size}
                      size="lg"
                      action={size === 10 ? 'primary' : 'secondary'}
                      isDisabled={availableCount === 0}
                      onPress={() => void handleSizeSelect(Math.min(size, availableCount))}
                    >
                      <ButtonText>{`${size}개 복습`}</ButtonText>
                    </Button>
                  ))}
                  <Button
                    size="lg"
                    action="secondary"
                    onPress={() => void handleSizeSelect(availableCount)}
                  >
                    <ButtonText>{`전체 ${availableCount}개 복습`}</ButtonText>
                  </Button>
                </VStack>
              </>
            )}
          </VStack>
        </View>
      </SafeAreaView>
    );
  }

  // phase === 'reading'
  const entry = entries[currentIndex];
  if (!entry) return null;

  const progress = `${currentIndex + 1} / ${entries.length}`;
  const highlightedStory = splitByExpressionMatch(entry.reviewStory, entry.expression);
  const familiarityLabel = entry.familiarity ? FAMILIARITY_LABEL[entry.familiarity] : null;
  const isLast = currentIndex + 1 >= entries.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F2' }}>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 }}>
        <Text size="sm" style={{ color: '#6b7280' }}>
          {progress}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Button
            size="sm"
            variant="link"
            action="secondary"
            onPress={() => onEarlyEnd(entries.slice(0, currentIndex + 1))}
          >
            <ButtonText style={{ color: '#D97706' }}>종료</ButtonText>
          </Button>
          <Button size="sm" variant="link" action="secondary" onPress={onClose}>
            <ButtonText size="xl">X</ButtonText>
          </Button>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        <VStack className="w-full max-w-[360px] gap-4">
          <Text size="xl" bold>
            {entry.expression}
          </Text>

          {familiarityLabel ? (
            <Text size="sm" style={{ color: '#6b7280' }}>
              {`이전 평가: ${familiarityLabel}`}
            </Text>
          ) : null}

          <Text size="sm" style={{ color: '#6b7280' }}>
            {entry.meaningKo}
          </Text>

          <View style={{ height: 4 }} />

          <Text size="md">
            {highlightedStory.map((segment, index) => (
              <Text
                key={`${segment.text}-${index}`}
                size="md"
                bold={segment.isMatch}
                style={segment.isMatch ? { color: '#D97706' } : undefined}
              >
                {segment.text}
              </Text>
            ))}
          </Text>

          <View style={{ height: 8 }} />

          <Button
            size="lg"
            action={isLast ? 'secondary' : 'primary'}
            onPress={handleNext}
            style={isLast
              ? { backgroundColor: '#FFFFFF', borderColor: '#D97706' }
              : { backgroundColor: '#D97706' }
            }
          >
            <ButtonText style={isLast ? { color: '#D97706' } : undefined}>
              {isLast ? '복습 완료' : '다음'}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
