import { useState } from 'react';
import { View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LearningFlowLayout } from '@/screens/layouts/LearningFlowLayout';
import { setFamiliarity } from '@/services/vocabularyProfile';
import type { LearningBundle } from '@/types/learning';
import type { FamiliarityLevel } from '@/types/vocabularyProfile';

type MeaningScreenProps = {
  expression: string;
  bundle: LearningBundle;
  onClose: () => void;
  onDone: () => void;
};

const FAMILIARITY_OPTIONS: { level: FamiliarityLevel; label: string; action: 'positive' | 'secondary' | 'negative' }[] = [
  { level: 'known', label: '확실히 알겠어', action: 'positive' },
  { level: 'fuzzy', label: '흐릿해', action: 'secondary' },
  { level: 'unknown', label: '모르겠어', action: 'negative' },
];

export function MeaningScreen({ expression, bundle, onClose, onDone }: MeaningScreenProps) {
  const meaning = bundle.meaning;
  const [selected, setSelected] = useState<FamiliarityLevel | null>(null);

  const handleFamiliaritySelect = async (level: FamiliarityLevel) => {
    setSelected(level);
    await setFamiliarity(expression, level);
    onDone();
  };

  return (
    <LearningFlowLayout onClose={onClose}>
      <VStack className="w-full max-w-[360px] gap-4">
        <Text size="xl" bold>
          뜻 보기
        </Text>
        <Text size="sm">{`표현: ${expression}`}</Text>

        <Text size="sm" bold>
          뜻
        </Text>
        <Text size="md">{meaning.literalMeaningKo}</Text>

        <Text size="sm" bold>
          실제 의미
        </Text>
        <Text size="md">{meaning.realUsageKo}</Text>

        <Text size="sm" bold>
          어원
        </Text>
        <Text size="md">{meaning.etymologyKo}</Text>

        <Text size="sm" bold>
          뉘앙스
        </Text>
        <Text size="md">{meaning.nuanceKo}</Text>

        <Text size="sm" bold>
          아주 짧은 예문
        </Text>
        <Text size="md">{meaning.shortExampleEn}</Text>
        <Text size="sm">{meaning.shortExampleKo}</Text>

        <View style={{ height: 8 }} />

        <Text size="sm" bold style={{ textAlign: 'center' }}>
          이 표현, 어느 정도 알겠나요?
        </Text>
        <VStack className="gap-2">
          {FAMILIARITY_OPTIONS.map(({ level, label, action }) => (
            <Button
              key={level}
              size="lg"
              action={action}
              isDisabled={selected !== null}
              onPress={() => void handleFamiliaritySelect(level)}
            >
              <ButtonText>{label}</ButtonText>
            </Button>
          ))}
        </VStack>
      </VStack>
    </LearningFlowLayout>
  );
}
